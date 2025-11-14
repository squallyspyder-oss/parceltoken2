import QRCode from 'qrcode';

export interface QRGenerationOptions {
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  width?: number;
  margin?: number;
  color?: {
    dark?: string;
    light?: string;
  };
}

/**
 * Gera um QR code em formato PNG (base64)
 */
export async function generateQRCodePNG(
  data: string,
  options: QRGenerationOptions = {}
): Promise<string> {
  const {
    errorCorrectionLevel = 'H',
    width = 300,
    margin = 2,
    color = { dark: '#000000', light: '#FFFFFF' }
  } = options;

  try {
    const dataUrl = await QRCode.toDataURL(data, {
      errorCorrectionLevel,
      width,
      margin,
      color
    });
    return dataUrl;
  } catch (error) {
    console.error('Erro ao gerar QR code PNG:', error);
    throw new Error('Falha ao gerar QR code');
  }
}

/**
 * Gera um QR code em formato SVG
 */
export async function generateQRCodeSVG(
  data: string,
  options: QRGenerationOptions = {}
): Promise<string> {
  const {
    errorCorrectionLevel = 'H',
    width = 300,
    margin = 2
  } = options;

  try {
    const svg = await QRCode.toString(data, {
      errorCorrectionLevel: errorCorrectionLevel as any,
      width,
      margin,
      type: 'svg' as any
    });
    return svg;
  } catch (error) {
    console.error('Erro ao gerar QR code SVG:', error);
    throw new Error('Falha ao gerar QR code SVG');
  }
}

/**
 * Gera um QR code em formato Buffer (PNG binário)
 */
export async function generateQRCodeBuffer(
  data: string,
  options: QRGenerationOptions = {}
): Promise<Buffer> {
  const {
    errorCorrectionLevel = 'H',
    width = 300,
    margin = 2,
    color = { dark: '#000000', light: '#FFFFFF' }
  } = options;

  try {
    const buffer = await QRCode.toBuffer(data, {
      errorCorrectionLevel,
      width,
      margin,
      color
    });
    return buffer;
  } catch (error) {
    console.error('Erro ao gerar QR code Buffer:', error);
    throw new Error('Falha ao gerar QR code');
  }
}

/**
 * Gera um QR code com branding (logo no centro)
 */
export async function generateBrandedQRCode(
  data: string,
  logoUrl?: string,
  options: QRGenerationOptions = {}
): Promise<string> {
  const {
    errorCorrectionLevel = 'H',
    width = 400,
    margin = 2,
    color = { dark: '#10b981', light: '#FFFFFF' }
  } = options;

  try {
    // Gera QR code com nível de correção alto para suportar logo
    const dataUrl = await QRCode.toDataURL(data, {
      errorCorrectionLevel,
      width,
      margin,
      color
    });
    
    // Se houver logo, seria necessário usar canvas para sobrepor
    // Por enquanto, retorna o QR code simples
    return dataUrl;
  } catch (error) {
    console.error('Erro ao gerar QR code com branding:', error);
    throw new Error('Falha ao gerar QR code com branding');
  }
}

/**
 * Valida se um string é um QR code válido
 */
export function isValidQRData(data: string): boolean {
  // QR code pode conter até 4296 caracteres alfanuméricos
  // Validação básica
  return Boolean(data && data.length > 0 && data.length <= 4296);
}

/**
 * Gera payload estruturado para SmartQR
 */
export function generateSmartQRPayload(
  merchantId: number,
  amount: number,
  sessionId: string,
  description: string | null | undefined = ''
): string {
  const payload = {
    v: '1.0', // versão
    mid: merchantId, // merchant ID
    amt: amount, // amount em centavos
    sid: sessionId, // session ID
    desc: description || '', // descrição
    ts: Date.now() // timestamp
  };
  
  return JSON.stringify(payload);
}
