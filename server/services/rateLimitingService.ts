import { eq, and, gt } from "drizzle-orm";
import { getDb } from "../db";

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number; // em milissegundos
  keyPrefix: string;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: Date;
  retryAfter?: number;
}

// Configurações de rate limit por tipo de operação
export const RATE_LIMIT_CONFIG = {
  LOGIN: { maxRequests: 5, windowMs: 15 * 60 * 1000, keyPrefix: "login" }, // 5 tentativas a cada 15 min
  TRANSACTION: { maxRequests: 100, windowMs: 60 * 60 * 1000, keyPrefix: "transaction" }, // 100 transações por hora
  CHECKOUT: { maxRequests: 50, windowMs: 60 * 60 * 1000, keyPrefix: "checkout" }, // 50 checkouts por hora
  API_CALL: { maxRequests: 1000, windowMs: 60 * 60 * 1000, keyPrefix: "api" }, // 1000 chamadas por hora
  PASSWORD_RESET: { maxRequests: 3, windowMs: 60 * 60 * 1000, keyPrefix: "pwd_reset" }, // 3 tentativas por hora
  EMAIL_VERIFICATION: { maxRequests: 5, windowMs: 60 * 60 * 1000, keyPrefix: "email_verify" }, // 5 tentativas por hora
};

class RateLimitStore {
  private store: Map<string, { count: number; resetTime: number }> = new Map();

  check(key: string, config: RateLimitConfig): RateLimitResult {
    const now = Date.now();
    const entry = this.store.get(key);

    if (!entry || now > entry.resetTime) {
      // Criar nova entrada ou resetar se expirou
      const resetTime = now + config.windowMs;
      this.store.set(key, { count: 1, resetTime });
      return {
        allowed: true,
        remaining: config.maxRequests - 1,
        resetTime: new Date(resetTime),
      };
    }

    // Incrementar contador
    entry.count++;

    if (entry.count > config.maxRequests) {
      const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
      return {
        allowed: false,
        remaining: 0,
        resetTime: new Date(entry.resetTime),
        retryAfter,
      };
    }

    return {
      allowed: true,
      remaining: config.maxRequests - entry.count,
      resetTime: new Date(entry.resetTime),
    };
  }

  reset(key: string): void {
    this.store.delete(key);
  }

  cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];
    this.store.forEach((value, key) => {
      if (now > value.resetTime) {
        keysToDelete.push(key);
      }
    });
    keysToDelete.forEach(key => this.store.delete(key));
  }
}

const store = new RateLimitStore();

// Executar limpeza a cada 5 minutos
setInterval(() => store.cleanup(), 5 * 60 * 1000);

export async function checkRateLimit(
  identifier: string, // IP, userId, ou API key
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const key = `${config.keyPrefix}:${identifier}`;
  return store.check(key, config);
}

export async function resetRateLimit(
  identifier: string,
  config: RateLimitConfig
): Promise<void> {
  const key = `${config.keyPrefix}:${identifier}`;
  store.reset(key);
}

export async function getRateLimitStatus(
  identifier: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const key = `${config.keyPrefix}:${identifier}`;
  const storeMap = (store as any).store as Map<string, { count: number; resetTime: number }>;
  const entry = storeMap.get(key);

  if (!entry) {
    return {
      allowed: true,
      remaining: config.maxRequests,
      resetTime: new Date(Date.now() + config.windowMs),
    };
  }

  const now = Date.now();
  if (now > entry.resetTime) {
    return {
      allowed: true,
      remaining: config.maxRequests,
      resetTime: new Date(entry.resetTime),
    };
  }

  const remaining = Math.max(0, config.maxRequests - entry.count);
  return {
    allowed: remaining > 0,
    remaining,
    resetTime: new Date(entry.resetTime),
    retryAfter: remaining === 0 ? Math.ceil((entry.resetTime - now) / 1000) : undefined,
  };
}

// Função auxiliar para extrair IP do request
export function getClientIP(req: any): string {
  return (
    req.headers["x-forwarded-for"]?.split(",")[0].trim() ||
    req.headers["x-real-ip"] ||
    req.socket?.remoteAddress ||
    "unknown"
  );
}
