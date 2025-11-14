/**
 * Script de teste para integração PIX com Efi Bank (Gerencianet)
 */

import axios from 'axios';
import fs from 'fs';
import https from 'https';

// Parser de secrets da variável Paceltoken_pay
function parseSecrets() {
  const secretsString = process.env.Paceltoken_pay || '';
  const secrets = {};
  
  const pattern = /([A-Z_]+)=([^=]+?)(?=[A-Z_]+=|$)/g;
  const matches = [...secretsString.matchAll(pattern)];
  
  for (const match of matches) {
    secrets[match[1]] = match[2];
  }
  
  return secrets;
}

const secrets = parseSecrets();

console.log('🔐 Secrets carregadas:');
console.log('- EFI_CLIENT_ID:', secrets.EFI_CLIENT_ID ? '✓' : '✗');
console.log('- EFI_CLIENT_SECRET:', secrets.EFI_CLIENT_SECRET ? '✓' : '✗');
console.log('- EFI_PIX_KEY:', secrets.EFI_PIX_KEY ? '✓' : '✗');
console.log('- PIX_PROVIDER:', secrets.PIX_PROVIDER);
console.log('- EFI_ENVIRONMENT:', secrets.EFI_ENVIRONMENT);
console.log('');

if (!secrets.EFI_CLIENT_ID || !secrets.EFI_CLIENT_SECRET) {
  console.error('❌ Credenciais Efi Bank não encontradas!');
  process.exit(1);
}

// Configuração da API Efi
const isProduction = secrets.EFI_ENVIRONMENT === 'production';
const baseUrl = isProduction 
  ? 'https://api-pix.gerencianet.com.br'
  : 'https://api-pix-h.gerencianet.com.br';

console.log(`🌐 Ambiente: ${isProduction ? 'PRODUÇÃO' : 'SANDBOX'}`);
console.log(`📡 Base URL: ${baseUrl}`);
console.log('');

// Função para obter token de acesso
async function getAccessToken() {
  const auth = Buffer.from(`${secrets.EFI_CLIENT_ID}:${secrets.EFI_CLIENT_SECRET}`).toString('base64');
  
  console.log('🔑 Obtendo token de acesso...');
  
  // Configurar certificado para produção
  const agentOptions = {
    rejectUnauthorized: true
  };
  
  if (isProduction) {
    agentOptions.cert = fs.readFileSync('/home/ubuntu/parceltoken-platform/efi-cert.pem');
    agentOptions.key = fs.readFileSync('/home/ubuntu/parceltoken-platform/efi-key.pem');
    console.log('🔐 Usando certificado digital para mTLS');
  }
  
  try {
    const response = await axios.post(
      `${baseUrl}/oauth/token`,
      { grant_type: 'client_credentials' },
      {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json'
        },
        httpsAgent: new https.Agent(agentOptions)
      }
    );
    
    console.log('✅ Token obtido com sucesso!');
    console.log('- Access Token:', response.data.access_token.substring(0, 20) + '...');
    console.log('- Expires in:', response.data.expires_in, 'segundos');
    console.log('');
    
    return response.data.access_token;
  } catch (error) {
    console.error('❌ Erro ao obter token:', error.response?.data || error.message);
    throw error;
  }
}

// Função para criar cobrança PIX
async function createPixCharge(accessToken) {
  const txid = `PARCELTOKEN${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  
  console.log('💰 Criando cobrança PIX...');
  console.log('- TxID:', txid);
  console.log('- Valor: R$ 10,00');
  console.log('');
  
  const payload = {
    calendario: {
      expiracao: 3600 // 1 hora
    },
    devedor: {
      cpf: '12345678909',
      nome: 'João Silva (Teste)'
    },
    valor: {
      original: '10.00'
    },
    chave: secrets.EFI_PIX_KEY, // Chave PIX da conta
    solicitacaoPagador: 'Teste de integração ParcelToken - Pagamento via PIX'
  };
  
  const agentOptions = { rejectUnauthorized: true };
  if (isProduction) {
    agentOptions.cert = fs.readFileSync('/home/ubuntu/parceltoken-platform/efi-cert.pem');
    agentOptions.key = fs.readFileSync('/home/ubuntu/parceltoken-platform/efi-key.pem');
  }
  
  try {
    const response = await axios.put(
      `${baseUrl}/v2/cob/${txid}`,
      payload,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        httpsAgent: new https.Agent(agentOptions)
      }
    );
    
    console.log('✅ Cobrança criada com sucesso!');
    console.log('');
    console.log('📋 Detalhes da cobrança:');
    console.log('- TxID:', response.data.txid);
    console.log('- Status:', response.data.status);
    console.log('- Valor:', response.data.valor.original);
    console.log('- Expira em:', new Date(response.data.calendario.criacao).toLocaleString('pt-BR'));
    console.log('');
    
    if (response.data.pixCopiaECola) {
      console.log('📱 QR Code PIX:');
      console.log('');
      console.log(response.data.pixCopiaECola);
      console.log('');
      console.log('💡 Copie o código acima e cole no app do seu banco para pagar');
      console.log('');
    }
    
    if (response.data.loc?.id) {
      console.log('🔗 Location ID:', response.data.loc.id);
      console.log('');
      
      // Buscar QR Code
      await getQRCode(accessToken, response.data.loc.id);
    }
    
    return response.data;
  } catch (error) {
    console.error('❌ Erro ao criar cobrança:', error.response?.data || error.message);
    throw error;
  }
}

// Função para buscar QR Code
async function getQRCode(accessToken, locationId) {
  console.log('🖼️  Buscando imagem do QR Code...');
  
  const agentOptions = { rejectUnauthorized: true };
  if (isProduction) {
    agentOptions.cert = fs.readFileSync('/home/ubuntu/parceltoken-platform/efi-cert.pem');
    agentOptions.key = fs.readFileSync('/home/ubuntu/parceltoken-platform/efi-key.pem');
  }
  
  try {
    const response = await axios.get(
      `${baseUrl}/v2/loc/${locationId}/qrcode`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        },
        httpsAgent: new https.Agent(agentOptions)
      }
    );
    
    if (response.data.imagemQrcode) {
      const qrCodePath = '/home/ubuntu/parceltoken-platform/qrcode-test.png';
      const base64Data = response.data.imagemQrcode.replace(/^data:image\/png;base64,/, '');
      fs.writeFileSync(qrCodePath, base64Data, 'base64');
      
      console.log('✅ QR Code salvo em:', qrCodePath);
      console.log('');
    }
    
    return response.data;
  } catch (error) {
    console.error('⚠️  Erro ao buscar QR Code:', error.response?.data || error.message);
  }
}

// Função para consultar status da cobrança
async function checkChargeStatus(accessToken, txid) {
  console.log('🔍 Consultando status da cobrança...');
  
  const agentOptions = { rejectUnauthorized: true };
  if (isProduction) {
    agentOptions.cert = fs.readFileSync('/home/ubuntu/parceltoken-platform/efi-cert.pem');
    agentOptions.key = fs.readFileSync('/home/ubuntu/parceltoken-platform/efi-key.pem');
  }
  
  try {
    const response = await axios.get(
      `${baseUrl}/v2/cob/${txid}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        },
        httpsAgent: new https.Agent(agentOptions)
      }
    );
    
    console.log('✅ Status:', response.data.status);
    console.log('');
    
    return response.data;
  } catch (error) {
    console.error('❌ Erro ao consultar status:', error.response?.data || error.message);
    throw error;
  }
}

// Executar teste
async function runTest() {
  try {
    console.log('🚀 Iniciando teste de integração PIX com Efi Bank');
    console.log('='.repeat(60));
    console.log('');
    
    // 1. Obter token
    const accessToken = await getAccessToken();
    
    // 2. Criar cobrança
    const charge = await createPixCharge(accessToken);
    
    // 3. Consultar status
    await checkChargeStatus(accessToken, charge.txid);
    
    console.log('='.repeat(60));
    console.log('✅ Teste concluído com sucesso!');
    console.log('');
    console.log('📝 Próximos passos:');
    console.log('1. Escaneie o QR Code ou copie o código PIX');
    console.log('2. Faça o pagamento no app do seu banco');
    console.log('3. Aguarde o webhook de confirmação');
    console.log('');
    
  } catch (error) {
    console.error('');
    console.error('❌ Teste falhou!');
    console.error('');
    if (error.response?.data) {
      console.error('Detalhes do erro:', JSON.stringify(error.response.data, null, 2));
    }
    process.exit(1);
  }
}

runTest();
