/**
 * Serviço de Integração PIX
 * Suporta Gerencianet e Asaas em modo sandbox
 */

import axios from 'axios';
import fs from 'fs';
import https from 'https';
import path from 'path';

export type PixProvider = 'gerencianet' | 'asaas' | 'mock';

export interface PixChargeRequest {
  amount: number; // Valor em centavos
  description: string;
  payerName?: string;
  payerCpf?: string;
  payerEmail?: string;
  expiresIn?: number; // Segundos até expiração (padrão: 3600)
}

export interface PixChargeResponse {
  chargeId: string;
  qrCode: string; // Código PIX copia e cola
  qrCodeImage: string; // URL da imagem do QR Code
  amount: number;
  status: 'pending' | 'paid' | 'expired' | 'cancelled';
  expiresAt: Date;
}

export interface PixWebhookPayload {
  chargeId: string;
  status: 'paid' | 'expired' | 'cancelled';
  paidAt?: Date;
  amount: number;
}

/**
 * Classe base para integração PIX
 */
abstract class PixGateway {
  abstract createCharge(request: PixChargeRequest): Promise<PixChargeResponse>;
  abstract getChargeStatus(chargeId: string): Promise<PixChargeResponse>;
  abstract cancelCharge(chargeId: string): Promise<void>;
}

/**
 * Implementação Mock (para desenvolvimento)
 */
class MockPixGateway extends PixGateway {
  async createCharge(request: PixChargeRequest): Promise<PixChargeResponse> {
    const chargeId = `MOCK_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const expiresAt = new Date(Date.now() + (request.expiresIn || 3600) * 1000);

    // Gerar QR Code mock (formato PIX padrão)
    const qrCode = `00020126580014br.gov.bcb.pix0136${chargeId}520400005303986540${(request.amount / 100).toFixed(2)}5802BR5913${request.payerName || 'PAGADOR'}6009SAO PAULO62070503***6304`;

    return {
      chargeId,
      qrCode,
      qrCodeImage: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrCode)}`,
      amount: request.amount,
      status: 'pending',
      expiresAt
    };
  }

  async getChargeStatus(chargeId: string): Promise<PixChargeResponse> {
    // Mock: retorna sempre pending
    return {
      chargeId,
      qrCode: 'mock_qr_code',
      qrCodeImage: 'https://via.placeholder.com/300',
      amount: 10000,
      status: 'pending',
      expiresAt: new Date(Date.now() + 3600000)
    };
  }

  async cancelCharge(chargeId: string): Promise<void> {
    console.log(`[MockPIX] Cobrança ${chargeId} cancelada`);
  }
}

/**
 * Implementação Gerencianet (Sandbox)
 */
class GerencianetPixGateway extends PixGateway {
  private clientId: string;
  private clientSecret: string;
  private baseUrl: string;
  private accessToken?: string;
  private tokenExpiresAt?: number;

  constructor() {
    super();
    // Parsear secrets da variável Paceltoken_pay
    const secrets = this.parseSecrets();
    this.clientId = secrets.EFI_CLIENT_ID || process.env.GERENCIANET_CLIENT_ID || '';
    this.clientSecret = secrets.EFI_CLIENT_SECRET || process.env.GERENCIANET_CLIENT_SECRET || '';
    const isProduction = secrets.EFI_ENVIRONMENT === 'production' || process.env.GERENCIANET_SANDBOX !== 'true';
    this.baseUrl = isProduction
      ? 'https://api-pix.gerencianet.com.br'
      : 'https://api-pix-h.gerencianet.com.br';
  }

  private parseSecrets(): Record<string, string> {
    const secretsString = process.env.Paceltoken_pay || '';
    const secrets: Record<string, string> = {};
    const pattern = /([A-Z_]+)=([^=]+?)(?=[A-Z_]+=|$)/g;
    let match;
    while ((match = pattern.exec(secretsString)) !== null) {
      secrets[match[1]] = match[2];
    }
    return secrets;
  }

  private getHttpsAgent(): https.Agent {
    const secrets = this.parseSecrets();
    const isProduction = secrets.EFI_ENVIRONMENT === 'production';
    
    const agentOptions: https.AgentOptions = {
      rejectUnauthorized: true
    };
    
    if (isProduction) {
      const certPath = path.join(process.cwd(), 'efi-cert.pem');
      const keyPath = path.join(process.cwd(), 'efi-key.pem');
      
      if (fs.existsSync(certPath) && fs.existsSync(keyPath)) {
        agentOptions.cert = fs.readFileSync(certPath);
        agentOptions.key = fs.readFileSync(keyPath);
      }
    }
    
    return new https.Agent(agentOptions);
  }

  private async getAccessToken(): Promise<string> {
    if (this.accessToken && this.tokenExpiresAt && Date.now() < this.tokenExpiresAt) {
      return this.accessToken;
    }

    const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
    
    const response = await axios.post(
      `${this.baseUrl}/oauth/token`,
      { grant_type: 'client_credentials' },
      {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json'
        },
        httpsAgent: this.getHttpsAgent()
      }
    );

    this.accessToken = response.data.access_token;
    this.tokenExpiresAt = Date.now() + (response.data.expires_in * 1000);
    
    return this.accessToken!;
  }

  async createCharge(request: PixChargeRequest): Promise<PixChargeResponse> {
    const token = await this.getAccessToken();
    const txid = `PARCEL${Date.now()}${Math.random().toString(36).substr(2, 9)}`.substr(0, 35);

    const payload = {
      calendario: {
        expiracao: request.expiresIn || 3600
      },
      devedor: request.payerCpf ? {
        cpf: request.payerCpf,
        nome: request.payerName || 'PAGADOR'
      } : undefined,
      valor: {
        original: (request.amount / 100).toFixed(2)
      },
      chave: process.env.GERENCIANET_PIX_KEY || '', // Chave PIX cadastrada
      solicitacaoPagador: request.description
    };

    const response = await axios.put(
      `${this.baseUrl}/v2/cob/${txid}`,
      payload,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        httpsAgent: this.getHttpsAgent()
      }
    );

    const expiresAt = new Date(Date.now() + (request.expiresIn || 3600) * 1000);

    return {
      chargeId: response.data.txid,
      qrCode: response.data.pixCopiaECola,
      qrCodeImage: response.data.imagemQrcode || `data:image/png;base64,${response.data.qrcode}`,
      amount: request.amount,
      status: 'pending',
      expiresAt
    };
  }

  async getChargeStatus(chargeId: string): Promise<PixChargeResponse> {
    const token = await this.getAccessToken();

    const response = await axios.get(
      `${this.baseUrl}/v2/cob/${chargeId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        httpsAgent: this.getHttpsAgent()
      }
    );

    const statusMap: Record<string, 'pending' | 'paid' | 'expired' | 'cancelled'> = {
      'ATIVA': 'pending',
      'CONCLUIDA': 'paid',
      'REMOVIDA_PELO_USUARIO_RECEBEDOR': 'cancelled',
      'REMOVIDA_PELO_PSP': 'expired'
    };

    return {
      chargeId: response.data.txid,
      qrCode: response.data.pixCopiaECola,
      qrCodeImage: response.data.imagemQrcode,
      amount: Math.round(parseFloat(response.data.valor.original) * 100),
      status: statusMap[response.data.status] || 'pending',
      expiresAt: new Date(response.data.calendario.criacao)
    };
  }

  async cancelCharge(chargeId: string): Promise<void> {
    const token = await this.getAccessToken();

    await axios.patch(
      `${this.baseUrl}/v2/cob/${chargeId}`,
      { status: 'REMOVIDA_PELO_USUARIO_RECEBEDOR' },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
  }
}

/**
 * Factory para criar gateway PIX
 */
export function createPixGateway(provider?: PixProvider): PixGateway {
  const selectedProvider = provider || (process.env.PIX_PROVIDER as PixProvider) || 'mock';

  switch (selectedProvider) {
    case 'gerencianet':
      return new GerencianetPixGateway();
    case 'mock':
    default:
      return new MockPixGateway();
  }
}

/**
 * Gera cobrança PIX para parcela
 */
export async function generatePixForInstallment(
  installmentId: number,
  amount: number,
  description: string,
  payerName?: string,
  payerCpf?: string
): Promise<PixChargeResponse> {
  const gateway = createPixGateway();

  const charge = await gateway.createCharge({
    amount,
    description: `${description} - Parcela #${installmentId}`,
    payerName,
    payerCpf,
    expiresIn: 86400 // 24 horas
  });

  console.log(`[PIX] Cobrança gerada para parcela ${installmentId}: ${charge.chargeId}`);
  
  return charge;
}

/**
 * Verifica status de cobrança PIX
 */
export async function checkPixChargeStatus(chargeId: string): Promise<PixChargeResponse> {
  const gateway = createPixGateway();
  return await gateway.getChargeStatus(chargeId);
}

/**
 * Processa webhook de pagamento PIX
 */
export async function processPixWebhook(payload: PixWebhookPayload): Promise<void> {
  console.log('[PIX] Webhook recebido:', payload);

  if (payload.status === 'paid') {
    try {
      const { payInstallment } = await import('./installmentEngine');
      const { getInstallmentByPixChargeId } = await import('./db');
      
      // Buscar parcela pelo pixChargeId
      const installment = await getInstallmentByPixChargeId(payload.chargeId);
      
      if (!installment) {
        console.error(`[PIX] Parcela não encontrada para chargeId: ${payload.chargeId}`);
        throw new Error(`Installment not found for chargeId: ${payload.chargeId}`);
      }
      
      // Marcar parcela como paga
      await payInstallment(installment.id);
      
      console.log(`[PIX] Pagamento confirmado: ${payload.chargeId} - Parcela #${installment.id} - R$ ${(payload.amount / 100).toFixed(2)}`);
    } catch (error) {
      console.error('[PIX] Erro ao processar pagamento:', error);
      throw error;
    }
  }
}
