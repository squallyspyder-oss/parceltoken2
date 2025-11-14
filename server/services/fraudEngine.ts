/**
 * Fraud & Risk Engine
 * Sistema de detecção de fraudes e análise de risco
 */

export interface FraudCheckResult {
  riskScore: number; // 0-100
  isBlocked: boolean;
  flags: string[];
  recommendations: string[];
  details: {
    velocityCheck: boolean;
    amountCheck: boolean;
    locationCheck: boolean;
    deviceCheck: boolean;
    patternCheck: boolean;
  };
}

export interface TransactionContext {
  userId: number;
  merchantId: number;
  amount: number;
  paymentMethod: string;
  ipAddress?: string;
  deviceId?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  timestamp: Date;
}

// Configurações de risco
const CONFIG = {
  MAX_TRANSACTIONS_PER_HOUR: 10,
  MAX_AMOUNT_PER_DAY: 50000000, // R$ 500.000,00
  MAX_AMOUNT_PER_TRANSACTION: 10000000, // R$ 100.000,00
  VELOCITY_THRESHOLD: 5, // transações em 1 hora
  LOCATION_DISTANCE_KM: 100, // distância máxima entre transações
  BLACKLIST_THRESHOLD: 3, // tentativas falhadas antes de bloquear
};

// Simulação de dados de transações (em produção, seria banco de dados)
const transactionHistory: Map<number, TransactionContext[]> = new Map();
const userBlacklist: Set<number> = new Set();
const merchantBlacklist: Set<number> = new Set();
const deviceBlacklist: Set<string> = new Set();

/**
 * Calcula distância entre dois pontos geográficos (Haversine formula)
 */
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Raio da Terra em km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Verifica se usuário está na blacklist
 */
function checkBlacklist(userId: number, merchantId: number, deviceId?: string): string[] {
  const flags: string[] = [];

  if (userBlacklist.has(userId)) {
    flags.push('USER_BLACKLISTED');
  }

  if (merchantBlacklist.has(merchantId)) {
    flags.push('MERCHANT_BLACKLISTED');
  }

  if (deviceId && deviceBlacklist.has(deviceId)) {
    flags.push('DEVICE_BLACKLISTED');
  }

  return flags;
}

/**
 * Verifica velocity (número de transações em período curto)
 */
function checkVelocity(userId: number, context: TransactionContext): { passed: boolean; count: number } {
  const userTransactions = transactionHistory.get(userId) || [];
  const oneHourAgo = new Date(context.timestamp.getTime() - 60 * 60 * 1000);

  const recentTransactions = userTransactions.filter(t => t.timestamp > oneHourAgo);

  return {
    passed: recentTransactions.length < CONFIG.VELOCITY_THRESHOLD,
    count: recentTransactions.length
  };
}

/**
 * Verifica limites de valor
 */
function checkAmountLimits(userId: number, amount: number, context: TransactionContext): { passed: boolean; reason?: string } {
  // Limite por transação
  if (amount > CONFIG.MAX_AMOUNT_PER_TRANSACTION) {
    return {
      passed: false,
      reason: `Valor excede limite máximo por transação: R$ ${(CONFIG.MAX_AMOUNT_PER_TRANSACTION / 100).toFixed(2)}`
    };
  }

  // Limite diário
  const userTransactions = transactionHistory.get(userId) || [];
  const today = new Date(context.timestamp);
  today.setHours(0, 0, 0, 0);

  const dailyTotal = userTransactions
    .filter(t => {
      const txDate = new Date(t.timestamp);
      txDate.setHours(0, 0, 0, 0);
      return txDate.getTime() === today.getTime();
    })
    .reduce((sum, t) => sum + t.amount, 0);

  if (dailyTotal + amount > CONFIG.MAX_AMOUNT_PER_DAY) {
    return {
      passed: false,
      reason: `Valor excede limite diário: R$ ${(CONFIG.MAX_AMOUNT_PER_DAY / 100).toFixed(2)}`
    };
  }

  return { passed: true };
}

/**
 * Verifica padrões de localização
 */
function checkLocation(userId: number, context: TransactionContext): { passed: boolean; distance?: number } {
  if (!context.location) {
    return { passed: true }; // Sem dados de localização
  }

  const userTransactions = transactionHistory.get(userId) || [];
  if (userTransactions.length === 0) {
    return { passed: true }; // Primeira transação
  }

  const lastTransaction = userTransactions[userTransactions.length - 1];
  if (!lastTransaction.location) {
    return { passed: true };
  }

  const distance = calculateDistance(
    lastTransaction.location.latitude,
    lastTransaction.location.longitude,
    context.location.latitude,
    context.location.longitude
  );

  const timeDiffMinutes = (context.timestamp.getTime() - lastTransaction.timestamp.getTime()) / (1000 * 60);
  const maxSpeedKmPerMinute = 1; // Velocidade máxima: 60 km/h

  const possibleDistance = timeDiffMinutes * maxSpeedKmPerMinute;

  return {
    passed: distance <= possibleDistance + CONFIG.LOCATION_DISTANCE_KM,
    distance
  };
}

/**
 * Calcula score de risco baseado em múltiplos fatores
 */
function calculateRiskScore(
  blacklistFlags: string[],
  velocityCheck: { passed: boolean; count: number },
  amountCheck: { passed: boolean; reason?: string },
  locationCheck: { passed: boolean; distance?: number }
): number {
  let score = 0;

  // Blacklist (50 pontos)
  if (blacklistFlags.length > 0) {
    score += 50;
  }

  // Velocity (30 pontos)
  if (!velocityCheck.passed) {
    score += 30;
  } else if (velocityCheck.count >= CONFIG.VELOCITY_THRESHOLD - 2) {
    score += 15; // Aviso
  }

  // Valor (20 pontos)
  if (!amountCheck.passed) {
    score += 20;
  }

  // Localização (20 pontos)
  if (!locationCheck.passed) {
    score += 20;
  } else if (locationCheck.distance && locationCheck.distance > CONFIG.LOCATION_DISTANCE_KM) {
    score += 10; // Aviso
  }

  return Math.min(score, 100);
}

/**
 * Executa verificação completa de fraude
 */
export async function checkFraud(context: TransactionContext): Promise<FraudCheckResult> {
  const flags: string[] = [];
  const recommendations: string[] = [];

  // 1. Verificar blacklist
  const blacklistFlags = checkBlacklist(context.userId, context.merchantId, context.deviceId);
  flags.push(...blacklistFlags);

  if (blacklistFlags.length > 0) {
    return {
      riskScore: 100,
      isBlocked: true,
      flags,
      recommendations: ['Transação bloqueada por segurança'],
      details: {
        velocityCheck: false,
        amountCheck: false,
        locationCheck: false,
        deviceCheck: false,
        patternCheck: false
      }
    };
  }

  // 2. Verificar velocity
  const velocityCheck = checkVelocity(context.userId, context);
  if (!velocityCheck.passed) {
    flags.push('HIGH_VELOCITY');
    recommendations.push(`Múltiplas transações detectadas (${velocityCheck.count} em 1 hora)`);
  }

  // 3. Verificar limites de valor
  const amountCheck = checkAmountLimits(context.userId, context.amount, context);
  if (!amountCheck.passed) {
    flags.push('AMOUNT_LIMIT_EXCEEDED');
    recommendations.push(amountCheck.reason || 'Valor excede limite');
  }

  // 4. Verificar localização
  const locationCheck = checkLocation(context.userId, context);
  if (!locationCheck.passed) {
    flags.push('SUSPICIOUS_LOCATION');
    recommendations.push(`Localização suspeita (${locationCheck.distance?.toFixed(1)}km de última transação)`);
  }

  // 5. Calcular score de risco
  const riskScore = calculateRiskScore(
    blacklistFlags,
    velocityCheck,
    amountCheck,
    locationCheck
  );

  // 6. Decidir se bloqueia
  const isBlocked = riskScore >= 70 || flags.some(f => ['HIGH_VELOCITY', 'AMOUNT_LIMIT_EXCEEDED'].includes(f));

  if (isBlocked) {
    recommendations.push('Transação requer verificação adicional');
  }

  // Registrar transação no histórico
  if (!transactionHistory.has(context.userId)) {
    transactionHistory.set(context.userId, []);
  }
  transactionHistory.get(context.userId)!.push(context);

  return {
    riskScore,
    isBlocked,
    flags,
    recommendations,
    details: {
      velocityCheck: velocityCheck.passed,
      amountCheck: amountCheck.passed,
      locationCheck: locationCheck.passed,
      deviceCheck: !context.deviceId || !deviceBlacklist.has(context.deviceId),
      patternCheck: true
    }
  };
}

/**
 * Adiciona usuário à blacklist
 */
export function blacklistUser(userId: number, reason: string): void {
  userBlacklist.add(userId);
  console.log(`[Fraud Engine] Usuário ${userId} adicionado à blacklist: ${reason}`);
}

/**
 * Remove usuário da blacklist
 */
export function whitelistUser(userId: number): void {
  userBlacklist.delete(userId);
  console.log(`[Fraud Engine] Usuário ${userId} removido da blacklist`);
}

/**
 * Adiciona merchant à blacklist
 */
export function blacklistMerchant(merchantId: number, reason: string): void {
  merchantBlacklist.add(merchantId);
  console.log(`[Fraud Engine] Merchant ${merchantId} adicionado à blacklist: ${reason}`);
}

/**
 * Obtém estatísticas de fraude
 */
export function getFraudStats(): {
  totalChecks: number;
  blockedTransactions: number;
  blacklistedUsers: number;
  blacklistedMerchants: number;
} {
  return {
    totalChecks: Array.from(transactionHistory.values()).reduce((sum, txs) => sum + txs.length, 0),
    blockedTransactions: 0, // Seria rastreado em produção
    blacklistedUsers: userBlacklist.size,
    blacklistedMerchants: merchantBlacklist.size
  };
}
