/**
 * SmartQR Service Expandido
 * Implementa geração de QR codes inteligentes com:
 * - Geração de imagem QR real em PNG/SVG
 * - QR estático para impressão em PDV
 * - QR dinâmico com metadados
 * - Analytics de escaneamento
 * - Histórico de scans
 * - Validação de integridade
 */

import QRCode from "qrcode";

export type QRType = "DYNAMIC" | "STATIC" | "PAYMENT";
export type QRFormat = "PNG" | "SVG" | "DATA_URL";

export interface SmartQRPayload {
  type: QRType;
  transactionId: string;
  merchantId: string;
  amount: number;
  installments: number;
  timestamp: Date;
  expiresAt?: Date;
  metadata?: Record<string, unknown>;
}

export interface QRGenerationRequest {
  payload: SmartQRPayload;
  format: QRFormat;
  size?: number; // pixels
  errorCorrection?: "L" | "M" | "Q" | "H";
  margin?: number;
}

export interface QRScanEvent {
  id: string;
  qrId: string;
  timestamp: Date;
  userAgent: string;
  ipAddress: string;
  location?: {
    latitude: number;
    longitude: number;
    city: string;
    country: string;
  };
  deviceType: "MOBILE" | "DESKTOP" | "TABLET" | "UNKNOWN";
  success: boolean;
  errorMessage?: string;
}

export interface QRAnalytics {
  qrId: string;
  totalScans: number;
  uniqueScans: number;
  successfulScans: number;
  failedScans: number;
  conversionRate: number;
  averageTimeToScan: number; // seconds
  topDevices: Array<{ device: string; count: number }>;
  topLocations: Array<{ location: string; count: number }>;
  scansByHour: Array<{ hour: number; count: number }>;
  createdAt: Date;
  expiresAt?: Date;
  isActive: boolean;
}

class SmartQRService {
  private qrDatabase: Map<string, SmartQRPayload> = new Map();
  private scanEvents: Map<string, QRScanEvent[]> = new Map();
  private analytics: Map<string, QRAnalytics> = new Map();

  /**
   * Gera QR code com payload inteligente
   */
  async generateQR(request: QRGenerationRequest): Promise<string> {
    const {
      payload,
      format,
      size = 300,
      errorCorrection = "H",
      margin = 2
    } = request;

    // Serializar payload
    const payloadString = this.serializePayload(payload);

    // Validar tamanho
    if (payloadString.length > 2953) {
      throw new Error("Payload muito grande para QR code");
    }

    try {
      const qrId = this.generateQRId(payload);
      this.qrDatabase.set(qrId, payload);
      this.scanEvents.set(qrId, []);
      this.initializeAnalytics(qrId, payload);

      // Gerar QR code
      let qrData: string;

      if (format === "PNG") {
        qrData = await QRCode.toDataURL(payloadString, {
          width: size,
          margin,
          errorCorrectionLevel: errorCorrection
        });
      } else if (format === "SVG") {
        qrData = await QRCode.toString(payloadString, {
          width: size,
          margin,
          errorCorrectionLevel: errorCorrection,
          type: "svg"
        });
      } else {
        qrData = await QRCode.toDataURL(payloadString, {
          errorCorrectionLevel: errorCorrection
        });
      }

      return qrData;
    } catch (error) {
      throw new Error(`Erro ao gerar QR code: ${(error as Error).message}`);
    }
  }

  /**
   * Gera QR estático para impressão em PDV
   */
  async generateStaticQR(merchantId: string, format: QRFormat = "PNG"): Promise<string> {
    const payload: SmartQRPayload = {
      type: "STATIC",
      transactionId: `STATIC-${merchantId}-${Date.now()}`,
      merchantId,
      amount: 0, // Será preenchido no checkout
      installments: 0,
      timestamp: new Date()
    };

    return this.generateQR({
      payload,
      format,
      size: 400, // Maior para impressão
      errorCorrection: "H",
      margin: 3
    });
  }

  /**
   * Registra scan de QR code
   */
  async recordScan(qrId: string, scanEvent: Omit<QRScanEvent, "id" | "timestamp">): Promise<void> {
    const events = this.scanEvents.get(qrId) || [];
    
    const event: QRScanEvent = {
      id: `SCAN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      qrId: qrId,
      timestamp: new Date(),
      userAgent: scanEvent.userAgent,
      ipAddress: scanEvent.ipAddress,
      location: scanEvent.location,
      deviceType: scanEvent.deviceType,
      success: scanEvent.success,
      errorMessage: scanEvent.errorMessage
    };

    events.push(event);
    this.scanEvents.set(qrId, events);

    // Atualizar analytics
    this.updateAnalytics(qrId);
  }

  /**
   * Obtém analytics de um QR code
   */
  getAnalytics(qrCodeId: string): QRAnalytics | null {
    return this.analytics.get(qrCodeId) || null;
  }

  /**
   * Obtém histórico de scans
   */
  getScanHistory(qrId: string, limit: number = 100): QRScanEvent[] {
    const events = this.scanEvents.get(qrId) || [];
    return events.slice(-limit);
  }

  /**
   * Valida QR code
   */
  validateQR(qrId: string): boolean {
    const payload = this.qrDatabase.get(qrId);
    if (!payload) return false;

    // Verificar expiração
    if (payload.expiresAt && new Date() > payload.expiresAt) {
      return false;
    }

    return true;
  }

  /**
   * Obtém payload do QR code
   */
  getPayload(qrId: string): SmartQRPayload | null {
    return this.qrDatabase.get(qrId) || null;
  }

  /**
   * Revoga QR code
   */
  revokeQR(qrId: string): void {
    this.qrDatabase.delete(qrId);
    const analytics = this.analytics.get(qrId);
    if (analytics) {
      analytics.isActive = false;
    }
  }

  /**
   * Gera relatório de QR codes
   */
  generateReport(merchantId: string): {
    totalQRCodes: number;
    totalScans: number;
    totalConversions: number;
    averageConversionRate: number;
    topQRCodes: Array<{
      qrId: string;
      scans: number;
      conversions: number;
      rate: number;
    }>;
  } {
    const merchantQRs = Array.from(this.analytics.values()).filter(
      a => this.qrDatabase.get(a.qrId)?.merchantId === merchantId
    );

    const totalScans = merchantQRs.reduce((sum, a) => sum + a.totalScans, 0);
    const totalConversions = merchantQRs.reduce((sum, a) => sum + a.successfulScans, 0);

    const topQRCodes = merchantQRs
      .map(a => ({
        qrId: a.qrId,
        scans: a.totalScans,
        conversions: a.successfulScans,
        rate: a.conversionRate
      }))
      .sort((a, b) => b.conversions - a.conversions)
      .slice(0, 10);

    return {
      totalQRCodes: merchantQRs.length,
      totalScans,
      totalConversions,
      averageConversionRate: merchantQRs.length > 0
        ? merchantQRs.reduce((sum, a) => sum + a.conversionRate, 0) / merchantQRs.length
        : 0,
      topQRCodes
    };
  }

  /**
   * Serializa payload para QR code
   */
  private serializePayload(payload: SmartQRPayload): string {
    return JSON.stringify({
      t: payload.type,
      tid: payload.transactionId,
      mid: payload.merchantId,
      amt: payload.amount,
      inst: payload.installments,
      ts: payload.timestamp.getTime(),
      exp: payload.expiresAt?.getTime(),
      meta: payload.metadata
    });
  }

  /**
   * Gera ID único para QR code
   */
  private generateQRId(payload: SmartQRPayload): string {
    return `QR-${payload.merchantId}-${payload.transactionId}-${Date.now()}`;
  }

  /**
   * Inicializa analytics para novo QR code
   */
  private initializeAnalytics(qrId: string, payload: SmartQRPayload): void {
    this.analytics.set(qrId, {
      qrId,
      totalScans: 0,
      uniqueScans: 0,
      successfulScans: 0,
      failedScans: 0,
      conversionRate: 0,
      averageTimeToScan: 0,
      topDevices: [],
      topLocations: [],
      scansByHour: Array(24).fill(0).map((_, i) => ({ hour: i, count: 0 })),
      createdAt: new Date(),
      expiresAt: payload.expiresAt,
      isActive: true
    });
  }

  /**
   * Atualiza analytics após novo scan
   */
  private updateAnalytics(qrId: string): void {
    const analytics = this.analytics.get(qrId);
    const events = this.scanEvents.get(qrId) || [];

    if (!analytics) return;

    analytics.totalScans = events.length;
    analytics.uniqueScans = new Set(events.map(e => e.ipAddress)).size;
    analytics.successfulScans = events.filter(e => e.success).length;
    analytics.failedScans = events.filter(e => !e.success).length;
    analytics.conversionRate = analytics.totalScans > 0
      ? (analytics.successfulScans / analytics.totalScans) * 100
      : 0;

    // Atualizar dispositivos
    const deviceCounts: Record<string, number> = {};
    events.forEach(e => {
      deviceCounts[e.deviceType] = (deviceCounts[e.deviceType] || 0) + 1;
    });
    analytics.topDevices = Object.entries(deviceCounts)
      .map(([device, count]) => ({ device, count }))
      .sort((a, b) => b.count - a.count);

    // Atualizar localizações
    const locationCounts: Record<string, number> = {};
    events.forEach(e => {
      if (e.location?.city) {
        const loc = `${e.location.city}, ${e.location.country}`;
        locationCounts[loc] = (locationCounts[loc] || 0) + 1;
      }
    });
    analytics.topLocations = Object.entries(locationCounts)
      .map(([location, count]) => ({ location, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Atualizar scans por hora
    events.forEach(e => {
      const hour = new Date(e.timestamp).getHours();
      const hourData = analytics.scansByHour.find(h => h.hour === hour);
      if (hourData) hourData.count++;
    });
  }
}

export const smartQRService = new SmartQRService();
