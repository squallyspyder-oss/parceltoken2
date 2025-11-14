/**
 * Audit Service
 * Implementa logging completo de auditoria para compliance e segurança
 */

export type AuditEventType = 
  | "USER_LOGIN" | "USER_LOGOUT" | "USER_CREATED" | "USER_UPDATED" | "USER_DELETED"
  | "TOKEN_CREATED" | "TOKEN_RENEWED" | "TOKEN_REVOKED" | "TOKEN_USED"
  | "TRANSACTION_CREATED" | "TRANSACTION_COMPLETED" | "TRANSACTION_FAILED"
  | "MERCHANT_CREATED" | "MERCHANT_UPDATED" | "MERCHANT_DELETED"
  | "FRAUD_DETECTED" | "FRAUD_RESOLVED"
  | "PAYMENT_PROCESSED" | "PAYMENT_FAILED" | "PAYMENT_REFUNDED"
  | "ADMIN_ACTION" | "SETTINGS_CHANGED" | "COMPLIANCE_CHECK"
  | "DATA_EXPORT" | "DATA_DELETE" | "CONSENT_GIVEN" | "CONSENT_REVOKED";

export type AuditSeverity = "INFO" | "WARNING" | "ERROR" | "CRITICAL";

export interface AuditLog {
  id: string;
  timestamp: Date;
  eventType: AuditEventType;
  severity: AuditSeverity;
  userId: string;
  userEmail?: string;
  action: string;
  details: Record<string, unknown>;
  ipAddress: string;
  userAgent: string;
  deviceFingerprint?: string;
  location?: {
    country: string;
    city: string;
    latitude: number;
    longitude: number;
  };
  status: "SUCCESS" | "FAILED" | "PENDING";
  errorMessage?: string;
  affectedResources: Array<{
    type: string; // "user", "token", "transaction", etc
    id: string;
    changes?: Record<string, { before: unknown; after: unknown }>;
  }>;
  metadata?: Record<string, unknown>;
}

export interface AuditFilter {
  startDate?: Date;
  endDate?: Date;
  eventType?: AuditEventType;
  severity?: AuditSeverity;
  userId?: string;
  status?: "SUCCESS" | "FAILED" | "PENDING";
  ipAddress?: string;
  limit?: number;
  offset?: number;
}

export interface AuditReport {
  totalEvents: number;
  eventsByType: Record<AuditEventType, number>;
  eventsBySeverity: Record<AuditSeverity, number>;
  eventsByStatus: Record<string, number>;
  topUsers: Array<{ userId: string; count: number }>;
  topIPs: Array<{ ip: string; count: number }>;
  failureRate: number;
  suspiciousActivities: AuditLog[];
}

class AuditService {
  private logs: Map<string, AuditLog> = new Map();
  private userLogs: Map<string, string[]> = new Map(); // userId -> logIds
  private eventLogs: Map<AuditEventType, string[]> = new Map(); // eventType -> logIds
  private maxLogsPerUser: number = 10000;
  private retentionDays: number = 90;

  /**
   * Registra evento de auditoria
   */
  async log(
    eventType: AuditEventType,
    userId: string,
    action: string,
    details: Record<string, unknown>,
    options?: {
      ipAddress?: string;
      userAgent?: string;
      deviceFingerprint?: string;
      location?: { country: string; city: string; latitude: number; longitude: number };
      severity?: AuditSeverity;
      affectedResources?: AuditLog["affectedResources"];
      metadata?: Record<string, unknown>;
    }
  ): Promise<AuditLog> {
    const logId = this.generateLogId();
    const severity = options?.severity || this.getSeverityByEventType(eventType);

    const auditLog: AuditLog = {
      id: logId,
      timestamp: new Date(),
      eventType,
      severity,
      userId,
      action,
      details,
      ipAddress: options?.ipAddress || "UNKNOWN",
      userAgent: options?.userAgent || "UNKNOWN",
      deviceFingerprint: options?.deviceFingerprint,
      location: options?.location,
      status: "SUCCESS",
      affectedResources: options?.affectedResources || [],
      metadata: options?.metadata
    };

    // Armazenar
    this.logs.set(logId, auditLog);

    // Indexar por usuário
    const userLogIds = this.userLogs.get(userId) || [];
    userLogIds.push(logId);
    this.userLogs.set(userId, userLogIds);

    // Indexar por tipo de evento
    const eventLogIds = this.eventLogs.get(eventType) || [];
    eventLogIds.push(logId);
    this.eventLogs.set(eventType, eventLogIds);

    // Limpar logs antigos do usuário
    if (userLogIds.length > this.maxLogsPerUser) {
      const oldestLogId = userLogIds.shift();
      if (oldestLogId) {
        this.logs.delete(oldestLogId);
      }
    }

    return auditLog;
  }

  /**
   * Registra erro de auditoria
   */
  async logError(
    eventType: AuditEventType,
    userId: string,
    action: string,
    error: Error,
    options?: Omit<Parameters<typeof this.log>[3], "severity">
  ): Promise<AuditLog> {
    return this.log(eventType, userId, action, {
      ...options,
      error: error.message,
      stack: error.stack
    }, {
      ...options,
      severity: "ERROR"
    });
  }

  /**
   * Busca logs com filtros
   */
  searchLogs(filter: AuditFilter): AuditLog[] {
    let results: AuditLog[] = Array.from(this.logs.values());

    // Filtrar por data
    if (filter.startDate) {
      results = results.filter(log => log.timestamp >= filter.startDate!);
    }
    if (filter.endDate) {
      results = results.filter(log => log.timestamp <= filter.endDate!);
    }

    // Filtrar por tipo de evento
    if (filter.eventType) {
      results = results.filter(log => log.eventType === filter.eventType);
    }

    // Filtrar por severidade
    if (filter.severity) {
      results = results.filter(log => log.severity === filter.severity);
    }

    // Filtrar por usuário
    if (filter.userId) {
      results = results.filter(log => log.userId === filter.userId);
    }

    // Filtrar por status
    if (filter.status) {
      results = results.filter(log => log.status === filter.status);
    }

    // Filtrar por IP
    if (filter.ipAddress) {
      results = results.filter(log => log.ipAddress === filter.ipAddress);
    }

    // Ordenar por data (mais recente primeiro)
    results.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    // Aplicar paginação
    const offset = filter.offset || 0;
    const limit = filter.limit || 100;
    return results.slice(offset, offset + limit);
  }

  /**
   * Obtém logs de um usuário
   */
  getUserLogs(userId: string, limit: number = 100): AuditLog[] {
    const logIds = this.userLogs.get(userId) || [];
    return logIds
      .slice(-limit)
      .reverse()
      .map(id => this.logs.get(id))
      .filter((log): log is AuditLog => log !== undefined);
  }

  /**
   * Obtém logs de um tipo de evento
   */
  getEventLogs(eventType: AuditEventType, limit: number = 100): AuditLog[] {
    const logIds = this.eventLogs.get(eventType) || [];
    return logIds
      .slice(-limit)
      .reverse()
      .map(id => this.logs.get(id))
      .filter((log): log is AuditLog => log !== undefined);
  }

  /**
   * Gera relatório de auditoria
   */
  generateReport(filter?: AuditFilter): AuditReport {
    const logs = filter ? this.searchLogs(filter) : Array.from(this.logs.values());

    const eventsByType: Record<AuditEventType, number> = {} as any;
    const eventsBySeverity: Record<AuditSeverity, number> = {
      INFO: 0,
      WARNING: 0,
      ERROR: 0,
      CRITICAL: 0
    };
    const eventsByStatus: Record<string, number> = {
      SUCCESS: 0,
      FAILED: 0,
      PENDING: 0
    };
    const userCounts: Map<string, number> = new Map();
    const ipCounts: Map<string, number> = new Map();
    const suspiciousActivities: AuditLog[] = [];

    for (const log of logs) {
      // Contar por tipo
      eventsByType[log.eventType] = (eventsByType[log.eventType] || 0) + 1;

      // Contar por severidade
      eventsBySeverity[log.severity]++;

      // Contar por status
      eventsByStatus[log.status]++;

      // Contar por usuário
      userCounts.set(log.userId, (userCounts.get(log.userId) || 0) + 1);

      // Contar por IP
      ipCounts.set(log.ipAddress, (ipCounts.get(log.ipAddress) || 0) + 1);

      // Detectar atividades suspeitas
      if (log.severity === "CRITICAL" || log.severity === "ERROR" || log.status === "FAILED") {
        suspiciousActivities.push(log);
      }
    }

    const failureCount = eventsByStatus.FAILED;
    const failureRate = logs.length > 0 ? (failureCount / logs.length) * 100 : 0;

    return {
      totalEvents: logs.length,
      eventsByType,
      eventsBySeverity,
      eventsByStatus,
      topUsers: Array.from(userCounts.entries())
        .map(([userId, count]) => ({ userId, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10),
      topIPs: Array.from(ipCounts.entries())
        .map(([ip, count]) => ({ ip, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10),
      failureRate,
      suspiciousActivities: suspiciousActivities.slice(0, 20)
    };
  }

  /**
   * Exporta logs em formato CSV
   */
  exportToCSV(filter?: AuditFilter): string {
    const logs = filter ? this.searchLogs(filter) : Array.from(this.logs.values());

    const headers = [
      "ID",
      "Timestamp",
      "Event Type",
      "Severity",
      "User ID",
      "Action",
      "Status",
      "IP Address",
      "User Agent"
    ];

    const rows = logs.map(log => [
      log.id,
      log.timestamp.toISOString(),
      log.eventType,
      log.severity,
      log.userId,
      log.action,
      log.status,
      log.ipAddress,
      log.userAgent
    ]);

    const csv = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    return csv;
  }

  /**
   * Limpa logs antigos
   */
  cleanupOldLogs(): number {
    let count = 0;
    const cutoffDate = new Date(Date.now() - this.retentionDays * 24 * 60 * 60 * 1000);

    const logIds = Array.from(this.logs.keys());
    for (const logId of logIds) {
      const log = this.logs.get(logId);
      if (log && log.timestamp < cutoffDate) {
        this.logs.delete(logId);
        count++;
      }
    }

    return count;
  }

  /**
   * Obtém severidade baseada no tipo de evento
   */
  private getSeverityByEventType(eventType: AuditEventType): AuditSeverity {
    if (eventType.includes("FRAUD") || eventType.includes("DELETED")) {
      return "CRITICAL";
    }
    if (eventType.includes("ERROR") || eventType.includes("FAILED")) {
      return "ERROR";
    }
    if (eventType.includes("REVOKED") || eventType.includes("CHANGED")) {
      return "WARNING";
    }
    return "INFO";
  }

  /**
   * Gera ID único para log
   */
  private generateLogId(): string {
    return `AUDIT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

export const auditService = new AuditService();
