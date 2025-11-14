import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, decimal } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin", "merchant"]).default("user").notNull(),
  
  // Campos específicos para usuários consumidores
  creditLimit: int("creditLimit").default(0), // Limite de crédito em centavos
  availableCredit: int("availableCredit").default(0), // Crédito disponível em centavos
  totalSavings: int("totalSavings").default(0), // Economia total em centavos
  level: int("level").default(1), // Nível de gamificação
  points: int("points").default(0), // Pontos acumulados
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Merchants (estabelecimentos comerciais)
 */
export const merchants = mysqlTable("merchants", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(), // Referência ao usuário dono
  businessName: varchar("businessName", { length: 255 }).notNull(),
  tradeName: varchar("tradeName", { length: 255 }),
  document: varchar("document", { length: 20 }), // CNPJ
  category: varchar("category", { length: 100 }),
  
  // Configurações de pagamento
  feePercentage: int("feePercentage").default(50), // Taxa em basis points (50 = 0.5%)
  instantSettlement: boolean("instantSettlement").default(true),
  
  // Estatísticas
  totalTransactions: int("totalTransactions").default(0),
  totalVolume: int("totalVolume").default(0), // Volume total em centavos
  
  // Webhooks
  webhookUrl: text("webhookUrl"),
  webhookSecret: varchar("webhookSecret", { length: 128 }),
  
  active: boolean("active").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Merchant = typeof merchants.$inferSelect;
export type InsertMerchant = typeof merchants.$inferInsert;

/**
 * ParcelTokens - Tokens de parcelamento
 */
export const parcelTokens = mysqlTable("parcelTokens", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  tokenHash: varchar("tokenHash", { length: 128 }).notNull().unique(), // Hash do JWT
  
  // Limites e condições
  creditLimit: int("creditLimit").notNull(), // Limite em centavos
  maxInstallments: int("maxInstallments").default(4),
  interestRate: int("interestRate").default(0), // Taxa de juros em basis points
  
  // Status
  status: mysqlEnum("status", ["active", "used", "revoked", "expired"]).default("active").notNull(),
  usedAmount: int("usedAmount").default(0), // Valor já utilizado em centavos
  
  // Validade
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ParcelToken = typeof parcelTokens.$inferSelect;
export type InsertParcelToken = typeof parcelTokens.$inferInsert;

/**
 * SmartQR Codes
 */
export const smartQRs = mysqlTable("smartQRs", {
  id: int("id").autoincrement().primaryKey(),
  merchantId: int("merchantId").notNull(),
  qrCode: text("qrCode").notNull(), // Dados do QR em JSON
  
  // Informações da transação
  amount: int("amount").notNull(), // Valor em centavos
  description: text("description"),
  
  // Opções de parcelamento
  maxInstallments: int("maxInstallments").default(4),
  allowedPaymentMethods: text("allowedPaymentMethods"), // JSON array
  
  // Ofertas especiais
  cashbackPercentage: int("cashbackPercentage").default(0), // Em basis points
  discountPercentage: int("discountPercentage").default(0), // Em basis points
  
  // Status
  status: mysqlEnum("status", ["pending", "paid", "expired", "cancelled"]).default("pending").notNull(),
  sessionId: varchar("sessionId", { length: 128 }),
  
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SmartQR = typeof smartQRs.$inferSelect;
export type InsertSmartQR = typeof smartQRs.$inferInsert;

/**
 * Transactions - Transações de pagamento
 */
export const transactions = mysqlTable("transactions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  merchantId: int("merchantId").notNull(),
  parcelTokenId: int("parcelTokenId"),
  smartQRId: int("smartQRId"),
  
  // Valores
  amount: int("amount").notNull(), // Valor total em centavos
  feeAmount: int("feeAmount").default(0), // Taxa cobrada em centavos
  netAmount: int("netAmount").notNull(), // Valor líquido para o merchant
  savingsAmount: int("savingsAmount").default(0), // Economia do usuário vs cartão tradicional
  
  // Parcelamento
  installments: int("installments").default(1),
  installmentAmount: int("installmentAmount").notNull(), // Valor de cada parcela
  
  // Método de pagamento
  paymentMethod: mysqlEnum("paymentMethod", ["parceltoken", "pix", "card", "other"]).notNull(),
  paymentRail: varchar("paymentRail", { length: 50 }), // PIX, TED, etc
  
  // Status
  status: mysqlEnum("status", ["pending", "processing", "completed", "failed", "refunded"]).default("pending").notNull(),
  
  // Liquidação
  settledAt: timestamp("settledAt"),
  settlementMethod: varchar("settlementMethod", { length: 50 }),
  
  description: text("description"),
  metadata: text("metadata"), // JSON para dados adicionais
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = typeof transactions.$inferInsert;

/**
 * Installment Plans - Planos de parcelamento
 */
export const installmentPlans = mysqlTable("installmentPlans", {
  id: int("id").autoincrement().primaryKey(),
  transactionId: int("transactionId").notNull(),
  tokenId: int("tokenId").notNull(), // Referência ao ParcelToken
  userId: int("userId").notNull(),
  
  totalAmount: int("totalAmount").notNull(), // Valor total em centavos
  totalInstallments: int("totalInstallments").notNull(), // Total de parcelas
  installments: int("installments").notNull(), // Compatibilidade
  installmentAmount: int("installmentAmount").notNull(),
  paidInstallments: int("paidInstallments").default(0),
  paidAmount: int("paidAmount").default(0), // Valor já pago em centavos
  
  status: mysqlEnum("status", ["active", "completed", "defaulted", "cancelled"]).default("active").notNull(),
  
  nextDueDate: timestamp("nextDueDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type InstallmentPlan = typeof installmentPlans.$inferSelect;
export type InsertInstallmentPlan = typeof installmentPlans.$inferInsert;

/**
 * Installment Payments - Pagamentos de parcelas individuais
 */
export const installmentPayments = mysqlTable("installmentPayments", {
  id: int("id").autoincrement().primaryKey(),
  planId: int("planId").notNull(),
  installmentNumber: int("installmentNumber").notNull(),
  
  amount: int("amount").notNull(), // Valor em centavos
  dueDate: timestamp("dueDate").notNull(),
  paidAt: timestamp("paidAt"),
  
  status: mysqlEnum("status", ["pending", "paid", "overdue", "cancelled"]).default("pending").notNull(),
  paymentMethod: varchar("paymentMethod", { length: 50 }),
  pixChargeId: varchar("pixChargeId", { length: 255 }), // ID da cobrança PIX para rastreamento via webhook
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type InstallmentPayment = typeof installmentPayments.$inferSelect;
export type InsertInstallmentPayment = typeof installmentPayments.$inferInsert;

/**
 * Offers - Ofertas e promoções
 */
export const offers = mysqlTable("offers", {
  id: int("id").autoincrement().primaryKey(),
  merchantId: int("merchantId"),
  
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  
  // Tipo de oferta
  offerType: mysqlEnum("offerType", ["cashback", "discount", "extra_installments", "zero_fee"]).notNull(),
  value: int("value").notNull(), // Valor em basis points ou número de parcelas extras
  
  // Condições
  minAmount: int("minAmount"), // Valor mínimo em centavos
  maxAmount: int("maxAmount"), // Valor máximo em centavos
  
  // Validade
  validFrom: timestamp("validFrom").notNull(),
  validUntil: timestamp("validUntil").notNull(),
  
  active: boolean("active").default(true),
  usageCount: int("usageCount").default(0),
  maxUsage: int("maxUsage"), // Limite de uso
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Offer = typeof offers.$inferSelect;
export type InsertOffer = typeof offers.$inferInsert;

/**
 * User Badges - Conquistas dos usuários
 */
export const userBadges = mysqlTable("userBadges", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  badgeType: varchar("badgeType", { length: 50 }).notNull(), // first_transaction, savings_100, level_5, etc
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  iconUrl: varchar("iconUrl", { length: 500 }),
  
  unlockedAt: timestamp("unlockedAt").defaultNow().notNull(),
  viewed: boolean("viewed").default(false),
});

export type UserBadge = typeof userBadges.$inferSelect;
export type InsertUserBadge = typeof userBadges.$inferInsert;

/**
 * Notifications - Sistema de notificações in-app
 */
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  // Conteúdo da notificação
  type: mysqlEnum("type", [
    "transaction_completed",
    "installment_paid",
    "installment_due_soon",
    "installment_overdue",
    "token_created",
    "token_approved",
    "credit_limit_increased",
    "webhook_received",
    "smartqr_generated",
    "new_sale",
    "payment_received",
    "system_announcement"
  ]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  
  // Metadados
  relatedEntityType: varchar("relatedEntityType", { length: 50 }), // transaction, installment, token, etc
  relatedEntityId: int("relatedEntityId"), // ID da entidade relacionada
  actionUrl: varchar("actionUrl", { length: 500 }), // URL para ação (ex: /transactions/123)
  metadata: text("metadata"), // JSON para dados adicionais
  
  // Status
  read: boolean("read").default(false),
  readAt: timestamp("readAt"),
  
  // Prioridade
  priority: mysqlEnum("priority", ["low", "normal", "high", "urgent"]).default("normal").notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

/**
 * Notification Preferences - Preferências de notificação do usuário
 */
export const notificationPreferences = mysqlTable("notificationPreferences", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  
  // Preferências por tipo de notificação (true = ativado)
  transactionCompleted: boolean("transactionCompleted").default(true),
  installmentPaid: boolean("installmentPaid").default(true),
  installmentDueSoon: boolean("installmentDueSoon").default(true),
  installmentOverdue: boolean("installmentOverdue").default(true),
  tokenCreated: boolean("tokenCreated").default(true),
  tokenApproved: boolean("tokenApproved").default(true),
  creditLimitIncreased: boolean("creditLimitIncreased").default(true),
  webhookReceived: boolean("webhookReceived").default(true),
  smartqrGenerated: boolean("smartqrGenerated").default(true),
  newSale: boolean("newSale").default(true),
  paymentReceived: boolean("paymentReceived").default(true),
  systemAnnouncement: boolean("systemAnnouncement").default(true),
  
  // Preferências de canal (para futuro: email, push, SMS)
  emailEnabled: boolean("emailEnabled").default(true),
  pushEnabled: boolean("pushEnabled").default(true),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type NotificationPreference = typeof notificationPreferences.$inferSelect;
export type InsertNotificationPreference = typeof notificationPreferences.$inferInsert;

/**
 * Webhook Logs - Histórico de webhooks enviados
 */
export const webhookLogs = mysqlTable("webhookLogs", {
  id: int("id").autoincrement().primaryKey(),
  merchantId: int("merchantId").notNull(),
  
  eventType: varchar("eventType", { length: 100 }).notNull(), // transaction.completed, installment.paid, etc
  payload: text("payload").notNull(), // JSON do payload enviado
  url: text("url").notNull(), // URL para onde foi enviado
  
  status: mysqlEnum("status", ["pending", "success", "failed"]).default("pending").notNull(),
  responseStatus: int("responseStatus"), // HTTP status code da resposta
  errorMessage: text("errorMessage"),
  retryCount: int("retryCount").default(0),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type WebhookLog = typeof webhookLogs.$inferSelect;
export type InsertWebhookLog = typeof webhookLogs.$inferInsert;


/**
 * Open Finance Connections - Conexões bancárias dos usuários
 */
export const openFinanceConnections = mysqlTable("openFinanceConnections", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  itemId: varchar("itemId", { length: 255 }).notNull(), // ID do item no Pluggy
  connectorId: varchar("connectorId", { length: 255 }), // ID do banco/instituição
  connectorName: varchar("connectorName", { length: 255 }), // Nome do banco
  
  status: mysqlEnum("status", ["connected", "disconnected", "error"]).default("connected").notNull(),
  lastSyncAt: timestamp("lastSyncAt"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type OpenFinanceConnection = typeof openFinanceConnections.$inferSelect;
export type InsertOpenFinanceConnection = typeof openFinanceConnections.$inferInsert;

/**
 * Open Finance Metrics - Métricas calculadas do Open Finance
 */
export const openFinanceMetrics = mysqlTable("openFinanceMetrics", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  // Métricas financeiras (em centavos)
  averageIncome: int("averageIncome").default(0), // Receita média mensal
  averageExpense: int("averageExpense").default(0), // Despesa média mensal
  totalBalance: int("totalBalance").default(0), // Saldo total
  
  // Métricas de comportamento (0-100)
  incomeStability: int("incomeStability").default(0), // Estabilidade de renda (0-100)
  cashFlowPositive: int("cashFlowPositive").default(0), // % meses positivos (0-100)
  
  // Tendência
  cashFlowTrend: mysqlEnum("cashFlowTrend", ["increasing", "stable", "decreasing"]).default("stable"),
  
  // Metadados
  calculatedAt: timestamp("calculatedAt").defaultNow().notNull(),
  dataFrom: timestamp("dataFrom"), // Data inicial dos dados
  dataTo: timestamp("dataTo"), // Data final dos dados
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type OpenFinanceMetric = typeof openFinanceMetrics.$inferSelect;
export type InsertOpenFinanceMetric = typeof openFinanceMetrics.$inferInsert;
