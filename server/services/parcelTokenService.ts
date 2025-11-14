/**
 * ParcelToken Service Avançado
 * Implementa gerenciamento de tokens de parcelamento com:
 * - Tokens em formato JWT com claims estruturados
 * - Suporte a múltiplos tokens simultâneos por usuário
 * - Renovação automática com expiração configurável
 * - Validação de integridade e assinatura
 * - Histórico de uso e revogação
 * - Limites de uso por token
 */

import jwt from "jsonwebtoken";

export type TokenStatus = "ACTIVE" | "EXPIRED" | "REVOKED" | "PENDING_ACTIVATION";
export type TokenTier = "BASIC" | "SILVER" | "GOLD" | "PLATINUM";

export interface ParcelTokenClaims {
  // Identificadores
  tid: string; // Token ID
  uid: string; // User ID
  mid: string; // Merchant ID (se aplicável)

  // Limites
  maxAmount: number; // Valor máximo por transação
  maxInstallments: number; // Máximo de parcelas
  dailyLimit: number; // Limite diário
  monthlyLimit: number; // Limite mensal
  maxTransactions: number; // Máximo de transações

  // Uso
  usedAmount: number; // Valor já utilizado
  usedTransactions: number; // Transações realizadas
  usedDaily: number; // Usado hoje
  usedMonthly: number; // Usado este mês

  // Metadata
  tier: TokenTier; // Nível do token
  createdAt: number; // Timestamp de criação
  expiresAt: number; // Timestamp de expiração
  lastUsedAt?: number; // Último uso
  renewalDate?: number; // Data de renovação automática

  // Restrições
  allowedMerchants?: string[]; // Merchants permitidos (vazio = todos)
  blockedMerchants?: string[]; // Merchants bloqueados
  allowedCategories?: string[]; // Categorias permitidas
  minAmount?: number; // Valor mínimo

  // Segurança
  ipWhitelist?: string[]; // IPs permitidos
  deviceFingerprint?: string; // Fingerprint do dispositivo
  geoRestriction?: {
    countries: string[];
    cities: string[];
  };
}

export interface ParcelToken {
  id: string;
  userId: string;
  token: string;
  claims: ParcelTokenClaims;
  status: TokenStatus;
  createdAt: Date;
  expiresAt: Date;
  renewalDate?: Date;
  lastUsedAt?: Date;
  revokedAt?: Date;
  revokeReason?: string;
  usageHistory: Array<{
    transactionId: string;
    amount: number;
    installments: number;
    timestamp: Date;
    merchantId: string;
    status: "SUCCESS" | "FAILED" | "PENDING";
  }>;
}

export interface TokenRenewalRequest {
  tokenId: string;
  extendDays?: number; // Dias a estender (padrão: 30)
  newLimits?: Partial<ParcelTokenClaims>;
}

export interface TokenValidationResult {
  valid: boolean;
  token?: ParcelToken;
  error?: string;
  reason?: string;
}

class ParcelTokenService {
  private tokens: Map<string, ParcelToken> = new Map();
  private userTokens: Map<string, string[]> = new Map(); // userId -> tokenIds
  private tokenSecretKey: string;
  private tokenExpirationDays: number = 90;

  constructor(secretKey?: string) {
    this.tokenSecretKey = secretKey || process.env.JWT_SECRET || "default-secret-key";
  }

  /**
   * Cria novo ParcelToken
   */
  createToken(
    userId: string,
    tier: TokenTier = "BASIC",
    merchantId?: string,
    customLimits?: Partial<ParcelTokenClaims>
  ): ParcelToken {
    const tokenId = this.generateTokenId();
    const now = Date.now();
    const expiresAt = new Date(now + this.tokenExpirationDays * 24 * 60 * 60 * 1000);

    // Limites padrão por tier
    const defaultLimits = this.getDefaultLimitsByTier(tier);

    const claims: ParcelTokenClaims = {
      tid: tokenId,
      uid: userId,
      mid: merchantId || "",
      maxAmount: customLimits?.maxAmount || defaultLimits.maxAmount || 5000,
      maxInstallments: customLimits?.maxInstallments || defaultLimits.maxInstallments || 2,
      dailyLimit: customLimits?.dailyLimit || defaultLimits.dailyLimit || 1000,
      monthlyLimit: customLimits?.monthlyLimit || defaultLimits.monthlyLimit || 10000,
      maxTransactions: customLimits?.maxTransactions || defaultLimits.maxTransactions || 10,
      usedAmount: 0,
      usedTransactions: 0,
      usedDaily: 0,
      usedMonthly: 0,
      tier,
      createdAt: now,
      expiresAt: expiresAt.getTime(),
      renewalDate: now + (this.tokenExpirationDays - 7) * 24 * 60 * 60 * 1000,
      ...customLimits
    };

    // Gerar JWT
    const jwtToken = jwt.sign(claims, this.tokenSecretKey, {
      expiresIn: `${this.tokenExpirationDays}d`,
      issuer: "parceltoken",
      subject: userId
    });

    const parcelToken: ParcelToken = {
      id: tokenId,
      userId,
      token: jwtToken,
      claims,
      status: "ACTIVE",
      createdAt: new Date(),
      expiresAt,
      usageHistory: []
    };

    // Armazenar
    this.tokens.set(tokenId, parcelToken);
    const userTokenList = this.userTokens.get(userId) || [];
    userTokenList.push(tokenId);
    this.userTokens.set(userId, userTokenList);

    return parcelToken;
  }

  /**
   * Valida token
   */
  validateToken(token: string): TokenValidationResult {
    try {
      // Verificar JWT
      const decoded = jwt.verify(token, this.tokenSecretKey) as ParcelTokenClaims;

      // Buscar token no banco
      const parcelToken = this.tokens.get(decoded.tid);
      if (!parcelToken) {
        return {
          valid: false,
          error: "Token not found",
          reason: "TOKEN_NOT_FOUND"
        };
      }

      // Verificar status
      if (parcelToken.status !== "ACTIVE") {
        return {
          valid: false,
          error: `Token is ${parcelToken.status}`,
          reason: parcelToken.status
        };
      }

      // Verificar expiração
      if (new Date() > parcelToken.expiresAt) {
        parcelToken.status = "EXPIRED";
        return {
          valid: false,
          error: "Token expired",
          reason: "EXPIRED"
        };
      }

      // Verificar limites
      if (decoded.usedAmount >= decoded.maxAmount) {
        return {
          valid: false,
          error: "Maximum amount limit reached",
          reason: "LIMIT_EXCEEDED"
        };
      }

      if (decoded.usedTransactions >= decoded.maxTransactions) {
        return {
          valid: false,
          error: "Maximum transactions limit reached",
          reason: "TRANSACTION_LIMIT_EXCEEDED"
        };
      }

      return {
        valid: true,
        token: parcelToken
      };
    } catch (error) {
      return {
        valid: false,
        error: (error as Error).message,
        reason: "INVALID_TOKEN"
      };
    }
  }

  /**
   * Registra uso de token
   */
  recordUsage(
    tokenId: string,
    transactionId: string,
    amount: number,
    installments: number,
    merchantId: string,
    status: "SUCCESS" | "FAILED" | "PENDING" = "SUCCESS"
  ): boolean {
    const parcelToken = this.tokens.get(tokenId);
    if (!parcelToken) return false;

    // Registrar no histórico
    parcelToken.usageHistory.push({
      transactionId,
      amount,
      installments,
      timestamp: new Date(),
      merchantId,
      status
    });

    // Atualizar claims (apenas se sucesso)
    if (status === "SUCCESS") {
      parcelToken.claims.usedAmount += amount;
      parcelToken.claims.usedTransactions += 1;
      parcelToken.claims.usedDaily += amount;
      parcelToken.claims.usedMonthly += amount;
      parcelToken.claims.lastUsedAt = Date.now();
    }

    parcelToken.lastUsedAt = new Date();

    return true;
  }

  /**
   * Renova token
   */
  renewToken(request: TokenRenewalRequest): ParcelToken | null {
    const oldToken = this.tokens.get(request.tokenId);
    if (!oldToken) return null;

    // Criar novo token com mesmas configurações
    const extendDays = request.extendDays || 30;
    const newExpiresAt = new Date(Date.now() + extendDays * 24 * 60 * 60 * 1000);

    const newClaims: ParcelTokenClaims = {
      ...oldToken.claims,
      tid: this.generateTokenId(),
      createdAt: Date.now(),
      expiresAt: newExpiresAt.getTime(),
      usedAmount: 0,
      usedTransactions: 0,
      usedDaily: 0,
      usedMonthly: 0,
      renewalDate: new Date(newExpiresAt.getTime() - 7 * 24 * 60 * 60 * 1000).getTime(),
      ...request.newLimits
    };

    const newJwtToken = jwt.sign(newClaims, this.tokenSecretKey, {
      expiresIn: `${extendDays}d`,
      issuer: "parceltoken",
      subject: oldToken.userId
    });

    const newParcelToken: ParcelToken = {
      id: newClaims.tid,
      userId: oldToken.userId,
      token: newJwtToken,
      claims: newClaims,
      status: "ACTIVE",
      createdAt: new Date(),
      expiresAt: newExpiresAt,
      usageHistory: []
    };

    // Armazenar novo token
    this.tokens.set(newClaims.tid, newParcelToken);
    const userTokenList = this.userTokens.get(oldToken.userId) || [];
    userTokenList.push(newClaims.tid);
    this.userTokens.set(oldToken.userId, userTokenList);

    // Revogar token antigo
    this.revokeToken(request.tokenId, "RENEWED");

    return newParcelToken;
  }

  /**
   * Revoga token
   */
  revokeToken(tokenId: string, reason: string = "USER_REQUEST"): boolean {
    const parcelToken = this.tokens.get(tokenId);
    if (!parcelToken) return false;

    parcelToken.status = "REVOKED";
    parcelToken.revokedAt = new Date();
    parcelToken.revokeReason = reason;

    return true;
  }

  /**
   * Obtém tokens do usuário
   */
  getUserTokens(userId: string): ParcelToken[] {
    const tokenIds = this.userTokens.get(userId) || [];
    return tokenIds
      .map(id => this.tokens.get(id))
      .filter((t): t is ParcelToken => t !== undefined);
  }

  /**
   * Obtém detalhes do token
   */
  getTokenDetails(tokenId: string): ParcelToken | null {
    return this.tokens.get(tokenId) || null;
  }

  /**
   * Calcula disponibilidade de token
   */
  getTokenAvailability(tokenId: string): {
    available: boolean;
    remainingAmount: number;
    remainingTransactions: number;
    daysUntilExpiry: number;
    daysUntilRenewal: number;
  } | null {
    const parcelToken = this.tokens.get(tokenId);
    if (!parcelToken) return null;

    const now = Date.now();
    const daysUntilExpiry = Math.ceil((parcelToken.expiresAt.getTime() - now) / (24 * 60 * 60 * 1000));
    const daysUntilRenewal = parcelToken.claims.renewalDate
      ? Math.ceil((parcelToken.claims.renewalDate - now) / (24 * 60 * 60 * 1000))
      : 0;

    return {
      available: parcelToken.status === "ACTIVE" && daysUntilExpiry > 0,
      remainingAmount: parcelToken.claims.maxAmount - parcelToken.claims.usedAmount,
      remainingTransactions: parcelToken.claims.maxTransactions - parcelToken.claims.usedTransactions,
      daysUntilExpiry,
      daysUntilRenewal
    };
  }

  /**
   * Gera relatório de tokens
   */
  generateTokenReport(userId: string): {
    totalTokens: number;
    activeTokens: number;
    expiredTokens: number;
    revokedTokens: number;
    totalUsed: number;
    totalTransactions: number;
    tokens: Array<{
      id: string;
      tier: TokenTier;
      status: TokenStatus;
      createdAt: Date;
      expiresAt: Date;
      usedAmount: number;
      usedTransactions: number;
    }>;
  } {
    const userTokens = this.getUserTokens(userId);

    return {
      totalTokens: userTokens.length,
      activeTokens: userTokens.filter(t => t.status === "ACTIVE").length,
      expiredTokens: userTokens.filter(t => t.status === "EXPIRED").length,
      revokedTokens: userTokens.filter(t => t.status === "REVOKED").length,
      totalUsed: userTokens.reduce((sum, t) => sum + t.claims.usedAmount, 0),
      totalTransactions: userTokens.reduce((sum, t) => sum + t.claims.usedTransactions, 0),
      tokens: userTokens.map(t => ({
        id: t.id,
        tier: t.claims.tier,
        status: t.status,
        createdAt: t.createdAt,
        expiresAt: t.expiresAt,
        usedAmount: t.claims.usedAmount,
        usedTransactions: t.claims.usedTransactions
      }))
    };
  }

  /**
   * Obtém limites padrão por tier
   */
  private getDefaultLimitsByTier(tier: TokenTier): Partial<ParcelTokenClaims> {
    const limits: Record<TokenTier, Partial<ParcelTokenClaims>> = {
      BASIC: {
        maxAmount: 5000,
        maxInstallments: 2,
        dailyLimit: 1000,
        monthlyLimit: 10000,
        maxTransactions: 10
      },
      SILVER: {
        maxAmount: 15000,
        maxInstallments: 4,
        dailyLimit: 5000,
        monthlyLimit: 50000,
        maxTransactions: 50
      },
      GOLD: {
        maxAmount: 50000,
        maxInstallments: 6,
        dailyLimit: 15000,
        monthlyLimit: 150000,
        maxTransactions: 200
      },
      PLATINUM: {
        maxAmount: 100000,
        maxInstallments: 12,
        dailyLimit: 50000,
        monthlyLimit: 500000,
        maxTransactions: 1000
      }
    };

    return limits[tier];
  }

  /**
   * Gera ID único para token
   */
  private generateTokenId(): string {
    return `PT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Limpa tokens expirados
   */
  cleanupExpiredTokens(): number {
    let count = 0;
    const now = new Date();
    const tokenIds = Array.from(this.tokens.keys());

    for (const tokenId of tokenIds) {
      const token = this.tokens.get(tokenId);
      if (token && token.expiresAt < now && token.status !== "REVOKED") {
        token.status = "EXPIRED";
        count++;
      }
    }

    return count;
  }
}

export const parcelTokenService = new ParcelTokenService();
