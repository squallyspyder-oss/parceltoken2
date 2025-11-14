/**
 * Simple In-Memory Cache Service
 * 
 * Cache básico para reduzir queries repetidas ao banco
 * Em produção, usar Redis
 */

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

class CacheService {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Limpar cache expirado a cada 5 minutos
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  /**
   * Armazena valor no cache com TTL (time to live) em segundos
   */
  set<T>(key: string, value: T, ttlSeconds: number = 300): void {
    const expiresAt = Date.now() + (ttlSeconds * 1000);
    this.cache.set(key, { value, expiresAt });
  }

  /**
   * Recupera valor do cache
   * Retorna undefined se não existir ou estiver expirado
   */
  get<T>(key: string): T | undefined {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return undefined;
    }

    // Verificar se expirou
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return undefined;
    }

    return entry.value as T;
  }

  /**
   * Remove valor do cache
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Limpa todo o cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Remove entradas expiradas
   */
  private cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    Array.from(this.cache.entries()).forEach(([key, entry]) => {
      if (now > entry.expiresAt) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach(key => this.cache.delete(key));

    if (keysToDelete.length > 0) {
      console.log(`[Cache] Limpou ${keysToDelete.length} entradas expiradas`);
    }
  }

  /**
   * Retorna estatísticas do cache
   */
  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }

  /**
   * Para o serviço de limpeza automática
   */
  stop(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }
}

// Singleton
export const cache = new CacheService();

/**
 * Helper para cache de funções assíncronas
 * Usa o padrão cache-aside
 */
export async function withCache<T>(
  key: string,
  fn: () => Promise<T>,
  ttlSeconds: number = 300
): Promise<T> {
  // Tentar pegar do cache
  const cached = cache.get<T>(key);
  if (cached !== undefined) {
    return cached;
  }

  // Se não existir, executar função e cachear resultado
  const result = await fn();
  cache.set(key, result, ttlSeconds);
  return result;
}
