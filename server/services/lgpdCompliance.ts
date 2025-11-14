/**
 * LGPD (Lei Geral de Proteção de Dados) Compliance
 * Implementação de conformidade com regulamentações de proteção de dados
 */

export interface ConsentRecord {
  userId: number;
  consentType: 'marketing' | 'analytics' | 'thirdparty' | 'all';
  granted: boolean;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
}

export interface DataExportRequest {
  userId: number;
  requestedAt: Date;
  completedAt?: Date;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  downloadUrl?: string;
}

export interface AuditLog {
  id: number;
  userId: number;
  action: string;
  resource: string;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
  status: 'success' | 'failure';
  details?: Record<string, unknown>;
}

// Simulação de dados (em produção, seria banco de dados)
const consentRecords: ConsentRecord[] = [];
const dataExportRequests: Map<number, DataExportRequest[]> = new Map();
const auditLogs: AuditLog[] = [];
let auditLogIdCounter = 1;

/**
 * Registra consentimento do usuário
 */
export function recordConsent(
  userId: number,
  consentType: ConsentRecord['consentType'],
  granted: boolean,
  ipAddress?: string,
  userAgent?: string
): ConsentRecord {
  const consent: ConsentRecord = {
    userId,
    consentType,
    granted,
    timestamp: new Date(),
    ipAddress,
    userAgent
  };

  consentRecords.push(consent);
  logAudit(userId, 'CONSENT_RECORDED', 'consent', ipAddress, userAgent, 'success', {
    consentType,
    granted
  });

  return consent;
}

/**
 * Obtém histórico de consentimentos do usuário
 */
export function getConsentHistory(userId: number): ConsentRecord[] {
  return consentRecords.filter(c => c.userId === userId);
}

/**
 * Verifica se usuário deu consentimento específico
 */
export function hasConsent(userId: number, consentType: ConsentRecord['consentType']): boolean {
  const userConsents = consentRecords.filter(c => c.userId === userId);
  if (userConsents.length === 0) return false;

  const latestConsent = userConsents[userConsents.length - 1];
  return latestConsent.consentType === consentType && latestConsent.granted;
}

/**
 * Revoga consentimento do usuário
 */
export function revokeConsent(
  userId: number,
  consentType: ConsentRecord['consentType'],
  ipAddress?: string,
  userAgent?: string
): void {
  recordConsent(userId, consentType, false, ipAddress, userAgent);
  logAudit(userId, 'CONSENT_REVOKED', 'consent', ipAddress, userAgent, 'success', {
    consentType
  });
}

/**
 * Cria requisição de exportação de dados pessoais
 */
export function requestDataExport(userId: number): DataExportRequest {
  const request: DataExportRequest = {
    userId,
    requestedAt: new Date(),
    status: 'pending'
  };

  if (!dataExportRequests.has(userId)) {
    dataExportRequests.set(userId, []);
  }
  dataExportRequests.get(userId)!.push(request);

  logAudit(userId, 'DATA_EXPORT_REQUESTED', 'user_data', undefined, undefined, 'success');

  return request;
}

/**
 * Obtém status de requisição de exportação
 */
export function getDataExportStatus(userId: number, requestId: number): DataExportRequest | null {
  const requests = dataExportRequests.get(userId) || [];
  return requests[requestId] || null;
}

/**
 * Simula processamento de exportação de dados
 */
export function processDataExport(userId: number, requestIndex: number): DataExportRequest | null {
  const requests = dataExportRequests.get(userId);
  if (!requests || !requests[requestIndex]) return null;

  const request = requests[requestIndex];
  request.status = 'processing';

  // Simular processamento
  setTimeout(() => {
    request.status = 'completed';
    request.completedAt = new Date();
    request.downloadUrl = `/api/export/user-data-${userId}-${Date.now()}.json`;
    logAudit(userId, 'DATA_EXPORT_COMPLETED', 'user_data', undefined, undefined, 'success');
  }, 2000);

  return request;
}

/**
 * Deleta dados pessoais do usuário (Direito ao Esquecimento)
 */
export function deleteUserData(userId: number, ipAddress?: string, userAgent?: string): {
  success: boolean;
  deletedRecords: number;
  message: string;
} {
  try {
    // Em produção, isso seria uma operação de banco de dados complexa
    // Aqui simulamos a deleção
    const deletedConsents = consentRecords.filter(c => c.userId === userId).length;
    const deletedExports = dataExportRequests.get(userId)?.length || 0;

    // Remover dados
    const consentIndex = consentRecords.findIndex(c => c.userId === userId);
    if (consentIndex !== -1) {
      consentRecords.splice(consentIndex, 1);
    }
    dataExportRequests.delete(userId);

    logAudit(userId, 'USER_DATA_DELETED', 'user', ipAddress, userAgent, 'success', {
      deletedConsents,
      deletedExports
    });

    return {
      success: true,
      deletedRecords: deletedConsents + deletedExports,
      message: `Dados pessoais do usuário ${userId} foram deletados com sucesso`
    };
  } catch (error) {
    logAudit(userId, 'USER_DATA_DELETION_FAILED', 'user', ipAddress, userAgent, 'failure', {
      error: String(error)
    });

    return {
      success: false,
      deletedRecords: 0,
      message: 'Erro ao deletar dados pessoais'
    };
  }
}

/**
 * Registra ação no log de auditoria
 */
export function logAudit(
  userId: number,
  action: string,
  resource: string,
  ipAddress?: string,
  userAgent?: string,
  status: 'success' | 'failure' = 'success',
  details?: Record<string, unknown>
): AuditLog {
  const log: AuditLog = {
    id: auditLogIdCounter++,
    userId,
    action,
    resource,
    timestamp: new Date(),
    ipAddress,
    userAgent,
    status,
    details
  };

  auditLogs.push(log);
  return log;
}

/**
 * Obtém logs de auditoria de um usuário
 */
export function getAuditLogs(userId: number, limit: number = 100): AuditLog[] {
  return auditLogs
    .filter(log => log.userId === userId)
    .slice(-limit)
    .reverse();
}

/**
 * Obtém todos os logs de auditoria (admin only)
 */
export function getAllAuditLogs(limit: number = 1000): AuditLog[] {
  return auditLogs.slice(-limit).reverse();
}

/**
 * Gera relatório de conformidade LGPD
 */
export function generateLGPDReport(): {
  totalUsers: number;
  usersWithConsent: number;
  consentRate: number;
  dataExportRequests: number;
  auditLogsCount: number;
  lastAuditLog: AuditLog | null;
} {
  const uniqueUsers = new Set(consentRecords.map(c => c.userId));
  const usersWithConsent = consentRecords.filter(c => c.granted).length;

  return {
    totalUsers: uniqueUsers.size,
    usersWithConsent,
    consentRate: uniqueUsers.size > 0 ? (usersWithConsent / uniqueUsers.size) * 100 : 0,
    dataExportRequests: Array.from(dataExportRequests.values()).reduce((sum, reqs) => sum + reqs.length, 0),
    auditLogsCount: auditLogs.length,
    lastAuditLog: auditLogs[auditLogs.length - 1] || null
  };
}

/**
 * Valida conformidade LGPD
 */
export function validateLGPDCompliance(): {
  isCompliant: boolean;
  issues: string[];
  recommendations: string[];
} {
  const issues: string[] = [];
  const recommendations: string[] = [];

  // Verificar se há registros de consentimento
  if (consentRecords.length === 0) {
    issues.push('Nenhum registro de consentimento encontrado');
    recommendations.push('Implementar coleta de consentimento para todos os usuários');
  }

  // Verificar se há logs de auditoria
  if (auditLogs.length === 0) {
    issues.push('Nenhum log de auditoria registrado');
    recommendations.push('Implementar logging de todas as operações de dados pessoais');
  }

  // Verificar taxa de consentimento
  const report = generateLGPDReport();
  if (report.consentRate < 80 && report.totalUsers > 0) {
    recommendations.push('Aumentar taxa de consentimento (atualmente abaixo de 80%)');
  }

  return {
    isCompliant: issues.length === 0,
    issues,
    recommendations
  };
}

/**
 * Exporta dados do usuário em formato JSON
 */
export function exportUserDataAsJSON(userId: number): string {
  const userConsents = consentRecords.filter(c => c.userId === userId);
  const userExports = dataExportRequests.get(userId) || [];
  const userAudits = auditLogs.filter(log => log.userId === userId);

  const exportData = {
    exportDate: new Date().toISOString(),
    userId,
    consents: userConsents,
    dataExportRequests: userExports,
    auditLogs: userAudits,
    summary: {
      totalConsents: userConsents.length,
      totalExportRequests: userExports.length,
      totalAuditLogs: userAudits.length
    }
  };

  return JSON.stringify(exportData, null, 2);
}
