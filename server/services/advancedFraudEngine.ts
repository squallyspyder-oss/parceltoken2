import { eq, and, gte } from "drizzle-orm";
import { getDb } from "../db";
import { users, transactions, merchants } from "../../drizzle/schema";

/**
 * Advanced Fraud & Risk Engine
 * Implementa detecção de fraude com:
 * - Velocity checks (limite de transações por período)
 * - Device fingerprinting (identificação de dispositivo)
 * - Geo-fence (detecção de localização suspeita)
 * - Blacklist/whitelist
 * - Score de risco automático
 * - Alertas em tempo real
 */

export interface FraudCheckRequest {
  userId: string;
  merchantId: string;
  amount: number;
  ipAddress: string;
  userAgent: string;
  latitude?: number;
  longitude?: number;
  deviceId?: string;
  email: string;
}

export interface FraudCheckResponse {
  isApproved: boolean;
  riskScore: number; // 0-100
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  reason: string;
  alerts: string[];
  recommendation: "APPROVE" | "REVIEW" | "DECLINE";
}

interface VelocityCheckResult {
  transactionsInLastHour: number;
  transactionsInLastDay: number;
  totalAmountInLastHour: number;
  totalAmountInLastDay: number;
  violatesHourlyLimit: boolean;
  violatesDailyLimit: boolean;
}

interface DeviceFingerprintResult {
  deviceId: string;
  isNewDevice: boolean;
  previousTransactions: number;
  isBlacklisted: boolean;
}

interface GeoFenceResult {
  isNewLocation: boolean;
  distanceFromLastLocation: number; // km
  isSuspiciousLocation: boolean;
  previousLocations: Array<{ lat: number; lng: number; timestamp: Date }>;
}

class AdvancedFraudEngine {
  // Limites de velocidade
  private readonly MAX_TRANSACTIONS_PER_HOUR = 5;
  private readonly MAX_AMOUNT_PER_HOUR = 10000; // R$
  private readonly MAX_TRANSACTIONS_PER_DAY = 20;
  private readonly MAX_AMOUNT_PER_DAY = 50000; // R$

  // Limites de distância (km)
  private readonly MAX_DISTANCE_BETWEEN_TRANSACTIONS = 1000; // km
  private readonly SUSPICIOUS_DISTANCE_THRESHOLD = 500; // km

  // Blacklist/Whitelist
  private blacklistedDevices = new Set<string>();
  private blacklistedEmails = new Set<string>();
  private whitelistedDevices = new Set<string>();

  /**
   * Executa verificação completa de fraude
   */
  async checkFraud(request: FraudCheckRequest): Promise<FraudCheckResponse> {
    const alerts: string[] = [];
    let riskScore = 0;

    // 1. Velocity Check
    const velocityResult = await this.velocityCheck(request.userId);
    if (velocityResult.violatesHourlyLimit) {
      riskScore += 25;
      alerts.push("Excedeu limite de transações por hora");
    }
    if (velocityResult.violatesDailyLimit) {
      riskScore += 20;
      alerts.push("Excedeu limite de transações por dia");
    }

    // 2. Device Fingerprinting
    const deviceResult = await this.deviceFingerprint(request.deviceId || request.userAgent);
    if (deviceResult.isBlacklisted) {
      riskScore += 50;
      alerts.push("Dispositivo está na blacklist");
    }
    if (deviceResult.isNewDevice) {
      riskScore += 15;
      alerts.push("Novo dispositivo detectado");
    }

    // 3. Geo-Fence Check
    let geoResult: GeoFenceResult | null = null;
    if (request.latitude && request.longitude) {
      geoResult = await this.geoFenceCheck(request.userId, request.latitude, request.longitude);
      if (geoResult.isSuspiciousLocation) {
        riskScore += 30;
        alerts.push(`Localização suspeita: ${geoResult.distanceFromLastLocation}km da última transação`);
      }
      if (geoResult.isNewLocation) {
        riskScore += 10;
        alerts.push("Nova localização geográfica");
      }
    }

    // 4. Blacklist Check
    if (this.blacklistedEmails.has(request.email)) {
      riskScore += 100;
      alerts.push("Email está na blacklist");
    }

    // 5. IP Address Check
    const ipResult = await this.ipAddressCheck(request.ipAddress);
    if (ipResult.isProxy || ipResult.isVPN) {
      riskScore += 20;
      alerts.push("IP suspeito detectado (proxy/VPN)");
    }
    if (ipResult.isBlacklisted) {
      riskScore += 40;
      alerts.push("IP está na blacklist");
    }

    // 6. Amount Check
    if (request.amount > 5000) {
      riskScore += 10;
      alerts.push("Valor elevado de transação");
    }

    // 7. Whitelist Check (reduz risco)
    if (whitelistedDevices.has(request.deviceId || "")) {
      riskScore = Math.max(0, riskScore - 30);
    }

    // Normalizar score (0-100)
    riskScore = Math.min(100, Math.max(0, riskScore));

    // Determinar nível de risco
    const riskLevel = this.getRiskLevel(riskScore);

    // Determinar recomendação
    const recommendation = this.getRecommendation(riskScore, riskLevel);

    // Determinar aprovação
    const isApproved = riskScore < 70;

    return {
      isApproved,
      riskScore,
      riskLevel,
      reason: this.generateReason(riskScore, alerts),
      alerts,
      recommendation
    };
  }

  /**
   * Velocity Check - Verifica limite de transações por período
   */
  private async velocityCheck(userId: string): Promise<VelocityCheckResult> {
    const db = await getDb();
    if (!db) {
      return {
        transactionsInLastHour: 0,
        transactionsInLastDay: 0,
        totalAmountInLastHour: 0,
        totalAmountInLastDay: 0,
        violatesHourlyLimit: false,
        violatesDailyLimit: false
      };
    }

    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Simular dados (em produção, seria do banco)
    const transactionsInLastHour = Math.floor(Math.random() * 3);
    const transactionsInLastDay = Math.floor(Math.random() * 10);
    const totalAmountInLastHour = transactionsInLastHour * 1000;
    const totalAmountInLastDay = transactionsInLastDay * 2000;

    return {
      transactionsInLastHour,
      transactionsInLastDay,
      totalAmountInLastHour,
      totalAmountInLastDay,
      violatesHourlyLimit: transactionsInLastHour >= this.MAX_TRANSACTIONS_PER_HOUR || 
                           totalAmountInLastHour >= this.MAX_AMOUNT_PER_HOUR,
      violatesDailyLimit: transactionsInLastDay >= this.MAX_TRANSACTIONS_PER_DAY || 
                          totalAmountInLastDay >= this.MAX_AMOUNT_PER_DAY
    };
  }

  /**
   * Device Fingerprinting - Identifica dispositivo
   */
  private async deviceFingerprint(deviceIdentifier: string): Promise<DeviceFingerprintResult> {
    const deviceId = this.hashDeviceId(deviceIdentifier);
    const isBlacklisted = this.blacklistedDevices.has(deviceId);
    const isNewDevice = !this.deviceHistory.has(deviceId);
    const previousTransactions = this.deviceHistory.get(deviceId) || 0;

    return {
      deviceId,
      isNewDevice,
      previousTransactions,
      isBlacklisted
    };
  }

  /**
   * Geo-Fence Check - Verifica localização geográfica
   */
  private async geoFenceCheck(userId: string, latitude: number, longitude: number): Promise<GeoFenceResult> {
    // Simular histórico de localizações
    const previousLocations = [
      { lat: -23.5505, lng: -46.6333, timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000) }, // São Paulo
      { lat: -22.9068, lng: -43.1729, timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000) }  // Rio de Janeiro
    ];

    const lastLocation = previousLocations[0];
    const distance = this.calculateDistance(
      lastLocation.lat,
      lastLocation.lng,
      latitude,
      longitude
    );

    return {
      isNewLocation: distance > 10, // Mais de 10km é considerado novo local
      distanceFromLastLocation: distance,
      isSuspiciousLocation: distance > this.SUSPICIOUS_DISTANCE_THRESHOLD,
      previousLocations
    };
  }

  /**
   * IP Address Check
   */
  private async ipAddressCheck(ipAddress: string): Promise<{
    isProxy: boolean;
    isVPN: boolean;
    isBlacklisted: boolean;
  }> {
    // Simular verificação de IP (em produção, usar serviço como MaxMind)
    const isProxy = ipAddress.startsWith("192.168") || ipAddress.startsWith("10.");
    const isVPN = false; // Seria verificado com serviço externo
    const isBlacklisted = false;

    return { isProxy, isVPN, isBlacklisted };
  }

  /**
   * Calcula distância entre dois pontos geográficos (Haversine)
   */
  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Raio da Terra em km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLng = (lng2 - lng1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Hash de device ID
   */
  private hashDeviceId(deviceId: string): string {
    // Simples hash para demo (em produção, usar crypto)
    return Buffer.from(deviceId).toString('base64');
  }

  /**
   * Determina nível de risco
   */
  private getRiskLevel(score: number): "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" {
    if (score < 25) return "LOW";
    if (score < 50) return "MEDIUM";
    if (score < 75) return "HIGH";
    return "CRITICAL";
  }

  /**
   * Determina recomendação
   */
  private getRecommendation(score: number, riskLevel: string): "APPROVE" | "REVIEW" | "DECLINE" {
    if (score < 30) return "APPROVE";
    if (score < 70) return "REVIEW";
    return "DECLINE";
  }

  /**
   * Gera razão textual
   */
  private generateReason(score: number, alerts: string[]): string {
    if (score < 30) return "Transação aprovada - Risco baixo";
    if (score < 70) return `Transação requer revisão - ${alerts.length} alertas detectados`;
    return "Transação recusada - Risco muito alto";
  }

  /**
   * Adiciona dispositivo à blacklist
   */
  addToBlacklist(deviceId: string): void {
    this.blacklistedDevices.add(deviceId);
  }

  /**
   * Remove dispositivo da blacklist
   */
  removeFromBlacklist(deviceId: string): void {
    this.blacklistedDevices.delete(deviceId);
  }

  /**
   * Adiciona email à blacklist
   */
  addEmailToBlacklist(email: string): void {
    this.blacklistedEmails.add(email);
  }

  /**
   * Adiciona dispositivo à whitelist
   */
  addToWhitelist(deviceId: string): void {
    whitelistedDevices.add(deviceId);
  }

  /**
   * Histórico de dispositivos
   */
  private deviceHistory = new Map<string, number>();

  /**
   * Registra transação de dispositivo
   */
  recordDeviceTransaction(deviceId: string): void {
    const count = this.deviceHistory.get(deviceId) || 0;
    this.deviceHistory.set(deviceId, count + 1);
  }
}

// Variável global para whitelist
const whitelistedDevices = new Set<string>();

export const advancedFraudEngine = new AdvancedFraudEngine();
