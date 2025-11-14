import { eq, and, desc, sql, gte, lte, isNotNull } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, 
  users, 
  merchants, 
  parcelTokens, 
  transactions, 
  smartQRs, 
  installmentPlans,
  installmentPayments,
  offers,
  userBadges,
  type Merchant,
  type ParcelToken,
  type Transaction,
  type SmartQR,
  type InstallmentPlan,
  type Offer,
  type UserBadge
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ============= USER FUNCTIONS =============

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateUserCredit(userId: number, creditLimit: number, availableCredit: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(users)
    .set({ creditLimit, availableCredit, updatedAt: new Date() })
    .where(eq(users.id, userId));
}

export async function updateUserCreditLimit(userId: number, creditLimit: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(users)
    .set({ creditLimit, updatedAt: new Date() })
    .where(eq(users.id, userId));
}

export async function getUserProfile(userId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function updateUserSavings(userId: number, savingsAmount: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(users)
    .set({ 
      totalSavings: sql`${users.totalSavings} + ${savingsAmount}`,
      updatedAt: new Date() 
    })
    .where(eq(users.id, userId));
}

export async function updateUserLevel(userId: number, level: number, points: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(users)
    .set({ level, points, updatedAt: new Date() })
    .where(eq(users.id, userId));
}

// ============= MERCHANT FUNCTIONS =============

export async function createMerchant(merchant: Omit<Merchant, 'id' | 'createdAt' | 'updatedAt'>) {
  const db = await getDb();
  if (!db) return null;
  await db.insert(merchants).values(merchant);
  const inserted = await db.select().from(merchants).where(eq(merchants.userId, merchant.userId)).orderBy(desc(merchants.id)).limit(1);
  return inserted[0]?.id || null;
}

export async function getMerchantByUserId(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(merchants).where(eq(merchants.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getMerchantById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(merchants).where(eq(merchants.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateMerchantStats(merchantId: number, transactionAmount: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(merchants)
    .set({
      totalTransactions: sql`${merchants.totalTransactions} + 1`,
      totalVolume: sql`${merchants.totalVolume} + ${transactionAmount}`,
      updatedAt: new Date()
    })
    .where(eq(merchants.id, merchantId));
}

// ============= PARCEL TOKEN FUNCTIONS =============

export async function createParcelToken(token: Omit<ParcelToken, 'id' | 'createdAt' | 'updatedAt'>) {
  const db = await getDb();
  if (!db) return null;
  await db.insert(parcelTokens).values(token);
  const inserted = await db.select().from(parcelTokens).where(eq(parcelTokens.tokenHash, token.tokenHash)).limit(1);
  return inserted[0]?.id || null;
}

export async function getParcelTokenByHash(tokenHash: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(parcelTokens).where(eq(parcelTokens.tokenHash, tokenHash)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getActiveParcelTokenByUserId(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select()
    .from(parcelTokens)
    .where(and(
      eq(parcelTokens.userId, userId),
      eq(parcelTokens.status, 'active'),
      gte(parcelTokens.expiresAt, new Date())
    ))
    .orderBy(desc(parcelTokens.createdAt))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateParcelTokenStatus(tokenId: number, status: 'active' | 'used' | 'revoked' | 'expired') {
  const db = await getDb();
  if (!db) return;
  await db.update(parcelTokens)
    .set({ status, updatedAt: new Date() })
    .where(eq(parcelTokens.id, tokenId));
}

export async function updateParcelTokenUsage(tokenId: number, amount: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(parcelTokens)
    .set({ 
      usedAmount: sql`${parcelTokens.usedAmount} + ${amount}`,
      updatedAt: new Date() 
    })
    .where(eq(parcelTokens.id, tokenId));
}

export async function getParcelTokenById(tokenId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(parcelTokens).where(eq(parcelTokens.id, tokenId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateParcelTokenUsedAmount(tokenId: number, newUsedAmount: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(parcelTokens)
    .set({ 
      usedAmount: newUsedAmount,
      updatedAt: new Date() 
    })
    .where(eq(parcelTokens.id, tokenId));
}

export async function getTokenUsageHistory(userId: number, tokenId?: number) {
  const db = await getDb();
  if (!db) return [];
  
  const conditions = [
    eq(transactions.userId, userId),
    isNotNull(transactions.parcelTokenId)
  ];
  
  if (tokenId) {
    conditions.push(eq(transactions.parcelTokenId, tokenId));
  }
  
  const result = await db.select({
    transactionId: transactions.id,
    amount: transactions.amount,
    installments: transactions.installments,
    merchantId: transactions.merchantId,
    createdAt: transactions.createdAt,
    status: transactions.status,
    tokenId: transactions.parcelTokenId
  })
  .from(transactions)
  .where(and(...conditions))
  .orderBy(desc(transactions.createdAt));
  
  return result;
}

// ============= SMART QR FUNCTIONS =============

export async function createSmartQR(qr: Omit<SmartQR, 'id' | 'createdAt' | 'updatedAt'>) {
  const db = await getDb();
  if (!db) return null;
  await db.insert(smartQRs).values(qr);
  const inserted = await db.select().from(smartQRs).where(eq(smartQRs.merchantId, qr.merchantId)).orderBy(desc(smartQRs.id)).limit(1);
  return inserted[0]?.id || null;
}

export async function getSmartQRById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(smartQRs).where(eq(smartQRs.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getSmartQRsByMerchant(merchantId: number, limit = 50) {
  const db = await getDb();
  if (!db) return [];
  return await db.select()
    .from(smartQRs)
    .where(eq(smartQRs.merchantId, merchantId))
    .orderBy(desc(smartQRs.createdAt))
    .limit(limit);
}

export async function updateSmartQRStatus(qrId: number, status: 'pending' | 'paid' | 'expired' | 'cancelled') {
  const db = await getDb();
  if (!db) return;
  await db.update(smartQRs)
    .set({ status, updatedAt: new Date() })
    .where(eq(smartQRs.id, qrId));
}

// ============= TRANSACTION FUNCTIONS =============

export async function createTransaction(transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) {
  const db = await getDb();
  if (!db) return null;
  await db.insert(transactions).values(transaction);
  const inserted = await db.select().from(transactions).where(eq(transactions.userId, transaction.userId)).orderBy(desc(transactions.id)).limit(1);
  return inserted[0]?.id || null;
}

export async function getTransactionById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(transactions).where(eq(transactions.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getTransactionsByUser(userId: number, limit = 50) {
  const db = await getDb();
  if (!db) return [];
  return await db.select()
    .from(transactions)
    .where(eq(transactions.userId, userId))
    .orderBy(desc(transactions.createdAt))
    .limit(limit);
}

export async function getTransactionsByMerchant(merchantId: number, limit = 50) {
  const db = await getDb();
  if (!db) return [];
  return await db.select()
    .from(transactions)
    .where(eq(transactions.merchantId, merchantId))
    .orderBy(desc(transactions.createdAt))
    .limit(limit);
}

export async function updateTransactionStatus(
  transactionId: number, 
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded'
) {
  const db = await getDb();
  if (!db) return;
  await db.update(transactions)
    .set({ status, updatedAt: new Date() })
    .where(eq(transactions.id, transactionId));
}

export async function settleTransaction(transactionId: number, settlementMethod: string) {
  const db = await getDb();
  if (!db) return;
  await db.update(transactions)
    .set({ 
      status: 'completed',
      settledAt: new Date(),
      settlementMethod,
      updatedAt: new Date() 
    })
    .where(eq(transactions.id, transactionId));
}

// ============= INSTALLMENT PLAN FUNCTIONS =============

export async function getInstallmentPaymentById(paymentId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(installmentPayments).where(eq(installmentPayments.id, paymentId)).limit(1);
  return result[0];
}

export async function getInstallmentPlanById(planId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(installmentPlans).where(eq(installmentPlans.id, planId)).limit(1);
  return result[0];
}

export async function updateInstallmentPlan(planId: number, updates: Partial<InstallmentPlan>) {
  const db = await getDb();
  if (!db) return;
  await db.update(installmentPlans)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(installmentPlans.id, planId));
}

export async function createInstallmentPlan(plan: Omit<InstallmentPlan, 'id' | 'createdAt' | 'updatedAt'>) {
  const db = await getDb();
  if (!db) return null;
  await db.insert(installmentPlans).values(plan);
  const inserted = await db.select().from(installmentPlans).where(eq(installmentPlans.transactionId, plan.transactionId)).orderBy(desc(installmentPlans.id)).limit(1);
  return inserted[0]?.id || null;
}

export async function getInstallmentPlansByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select()
    .from(installmentPlans)
    .where(eq(installmentPlans.userId, userId))
    .orderBy(desc(installmentPlans.createdAt));
}

export async function getActiveInstallmentPlans(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select()
    .from(installmentPlans)
    .where(and(
      eq(installmentPlans.userId, userId),
      eq(installmentPlans.status, 'active')
    ))
    .orderBy(installmentPlans.nextDueDate);
}

export async function createInstallmentPayment(payment: Omit<typeof installmentPayments.$inferInsert, 'id' | 'createdAt' | 'updatedAt'>) {
  const db = await getDb();
  if (!db) return null;
  await db.insert(installmentPayments).values(payment);
  const inserted = await db.select().from(installmentPayments)
    .where(and(
      eq(installmentPayments.planId, payment.planId),
      eq(installmentPayments.installmentNumber, payment.installmentNumber)
    ))
    .limit(1);
  return inserted[0]?.id || null;
}

export async function getInstallmentPaymentsByPlanId(planId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(installmentPayments).where(eq(installmentPayments.planId, planId));
}

export async function getInstallmentsByPlanId(planId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(installmentPayments).where(eq(installmentPayments.planId, planId))
    .orderBy(installmentPayments.installmentNumber);
}

export async function getUpcomingInstallments(userId: number, daysAhead: number = 3) {
  const db = await getDb();
  if (!db) return [];
  
  const today = new Date();
  const futureDate = new Date();
  futureDate.setDate(today.getDate() + daysAhead);
  
  // Get all active plans for user
  const plans = await db.select()
    .from(installmentPlans)
    .where(eq(installmentPlans.userId, userId));
  
  if (plans.length === 0) return [];
  
  const planIds = plans.map(p => p.id);
  
  // Get pending installments due within daysAhead
  const upcomingInstallments = await db.select()
    .from(installmentPayments)
    .where(
      and(
        eq(installmentPayments.status, 'pending'),
        lte(installmentPayments.dueDate, futureDate)
      )
    );
  
  // Filter by plan IDs
  return upcomingInstallments.filter(inst => planIds.includes(inst.planId));
}

export async function updateInstallmentPaymentDueDate(paymentId: number, newDueDate: Date) {
  const db = await getDb();
  if (!db) return;
  await db.update(installmentPayments)
    .set({ dueDate: newDueDate })
    .where(eq(installmentPayments.id, paymentId));
}

export async function getAllPendingInstallmentPayments() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(installmentPayments)
    .where(eq(installmentPayments.status, 'pending'));
}

export async function getInstallmentByPixChargeId(pixChargeId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(installmentPayments)
    .where(eq(installmentPayments.pixChargeId, pixChargeId))
    .limit(1);
  return result[0];
}

export async function updateInstallmentPaymentStatus(paymentId: number, status: 'pending' | 'paid' | 'overdue', paidAt?: Date) {
  const db = await getDb();
  if (!db) return;
  await db.update(installmentPayments)
    .set({ 
      status, 
      paidAt: paidAt || null,
      updatedAt: new Date() 
    })
    .where(eq(installmentPayments.id, paymentId));
}

export async function updateInstallmentPlanProgress(planId: number, paidInstallments: number) {
  const db = await getDb();
  if (!db) return;
  
  const plan = await db.select().from(installmentPlans).where(eq(installmentPlans.id, planId)).limit(1);
  if (plan.length === 0) return;
  
  const isCompleted = paidInstallments >= plan[0].installments;
  
  await db.update(installmentPlans)
    .set({ 
      paidInstallments,
      status: isCompleted ? 'completed' : 'active',
      updatedAt: new Date()
    })
    .where(eq(installmentPlans.id, planId));
}

// ============= OFFER FUNCTIONS =============

export async function getActiveOffers(merchantId?: number) {
  const db = await getDb();
  if (!db) return [];
  
  const now = new Date();
  const conditions = [
    eq(offers.active, true),
    lte(offers.validFrom, now),
    gte(offers.validUntil, now)
  ];
  
  if (merchantId) {
    conditions.push(eq(offers.merchantId, merchantId));
  }
  
  return await db.select()
    .from(offers)
    .where(and(...conditions))
    .orderBy(desc(offers.createdAt));
}

// ============= USER BADGE FUNCTIONS =============

export async function createUserBadge(badge: Omit<UserBadge, 'id' | 'unlockedAt'>) {
  const db = await getDb();
  if (!db) return null;
  await db.insert(userBadges).values(badge);
  const inserted = await db.select().from(userBadges).where(eq(userBadges.userId, badge.userId)).orderBy(desc(userBadges.id)).limit(1);
  return inserted[0]?.id || null;
}

export async function getUserBadges(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select()
    .from(userBadges)
    .where(eq(userBadges.userId, userId))
    .orderBy(desc(userBadges.unlockedAt));
}

// ============= ANALYTICS FUNCTIONS =============

export async function getUserStats(userId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const user = await getUserById(userId);
  if (!user) return null;
  
  const userTransactions = await getTransactionsByUser(userId);
  const completedTransactions = userTransactions.filter(t => t.status === 'completed');
  
  return {
    totalSavings: user.totalSavings || 0,
    totalTransactions: completedTransactions.length,
    totalSpent: completedTransactions.reduce((sum, t) => sum + t.amount, 0),
    averageTransaction: completedTransactions.length > 0 
      ? completedTransactions.reduce((sum, t) => sum + t.amount, 0) / completedTransactions.length 
      : 0,
    level: user.level || 1,
    points: user.points || 0,
    creditLimit: user.creditLimit || 0,
    availableCredit: user.availableCredit || 0
  };
}

export async function getMerchantStats(merchantId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const merchant = await getMerchantById(merchantId);
  if (!merchant) return null;
  
  const merchantTransactions = await getTransactionsByMerchant(merchantId);
  const completedTransactions = merchantTransactions.filter(t => t.status === 'completed');
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayTransactions = completedTransactions.filter(t => t.createdAt >= today);
  
  const thisMonth = new Date();
  thisMonth.setDate(1);
  thisMonth.setHours(0, 0, 0, 0);
  const monthTransactions = completedTransactions.filter(t => t.createdAt >= thisMonth);
  
  return {
    totalVolume: merchant.totalVolume || 0,
    totalTransactions: merchant.totalTransactions || 0,
    todayVolume: todayTransactions.reduce((sum, t) => sum + t.netAmount, 0),
    todayTransactions: todayTransactions.length,
    monthVolume: monthTransactions.reduce((sum, t) => sum + t.netAmount, 0),
    monthTransactions: monthTransactions.length,
    averageTicket: completedTransactions.length > 0
      ? completedTransactions.reduce((sum, t) => sum + t.amount, 0) / completedTransactions.length
      : 0,
    conversionRate: merchantTransactions.length > 0
      ? (completedTransactions.length / merchantTransactions.length) * 100
      : 0,
    // **NOVO**: Dados para gráfico de vendas liquidadas vs parceladas
    // **NOVO**: Dados para gráfico de vendas liquidadas vs parceladas
    salesBreakdown: {
      liquidated: completedTransactions.filter(t => t.installments === 1).reduce((sum, t) => sum + t.netAmount, 0),
      installment: completedTransactions.filter(t => t.installments > 1).reduce((sum, t) => sum + t.netAmount, 0),
    },
    // **NOVO**: Volume em PIX instantâneo
    pixInstantVolume: completedTransactions.filter(t => t.paymentMethod === 'PIX').reduce((sum, t) => sum + t.netAmount, 0),
    // **NOVO**: Tempo médio de liquidação
    averageLiquidationTimeHours: completedTransactions.length > 0
      ? completedTransactions.reduce((sum, t) => {
          // Assumindo que a transação tem um campo 'updatedAt' que é a data de conclusão
          const liquidationTimeMs = new Date(t.updatedAt).getTime() - new Date(t.createdAt).getTime();
          return sum + liquidationTimeMs;
        }, 0) / completedTransactions.length / (1000 * 60 * 60) // Converter para horas
      : 0,
  };
}


// ============= NOTIFICATION FUNCTIONS =============

import { notifications, notificationPreferences, type Notification, type NotificationPreference, type InsertNotification, type InsertNotificationPreference } from "../drizzle/schema";

/**
 * Criar uma nova notificação
 */
export async function createNotification(data: InsertNotification): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Verificar preferências do usuário antes de criar
  const prefs = await getNotificationPreferences(data.userId);
  if (prefs) {
    const typeKey = data.type.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase()) as keyof NotificationPreference;
    if (prefs[typeKey] === false) {
      // Usuário desativou este tipo de notificação
      return 0;
    }
  }

  const result = await db.insert(notifications).values(data);
  return result[0].insertId;
}

/**
 * Listar notificações do usuário
 */
export async function getUserNotifications(
  userId: number,
  options: {
    limit?: number;
    offset?: number;
    unreadOnly?: boolean;
  } = {}
): Promise<Notification[]> {
  const db = await getDb();
  if (!db) return [];

  const { limit = 50, offset = 0, unreadOnly = false } = options;

  if (unreadOnly) {
    return db
      .select()
      .from(notifications)
      .where(and(
        eq(notifications.userId, userId),
        eq(notifications.read, false)
      ))
      .orderBy(desc(notifications.createdAt))
      .limit(limit)
      .offset(offset);
  }

  return db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt))
    .limit(limit)
    .offset(offset);
}

/**
 * Contar notificações não lidas
 */
export async function getUnreadNotificationCount(userId: number): Promise<number> {
  const db = await getDb();
  if (!db) return 0;

  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(notifications)
    .where(and(
      eq(notifications.userId, userId),
      eq(notifications.read, false)
    ));

  return result[0]?.count || 0;
}

/**
 * Marcar notificação como lida
 */
export async function markNotificationAsRead(notificationId: number, userId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db
    .update(notifications)
    .set({ read: true, readAt: new Date() })
    .where(and(
      eq(notifications.id, notificationId),
      eq(notifications.userId, userId)
    ));
}

/**
 * Marcar todas as notificações como lidas
 */
export async function markAllNotificationsAsRead(userId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db
    .update(notifications)
    .set({ read: true, readAt: new Date() })
    .where(and(
      eq(notifications.userId, userId),
      eq(notifications.read, false)
    ));
}

/**
 * Deletar notificação
 */
export async function deleteNotification(notificationId: number, userId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db
    .delete(notifications)
    .where(and(
      eq(notifications.id, notificationId),
      eq(notifications.userId, userId)
    ));
}

/**
 * Obter preferências de notificação do usuário
 */
export async function getNotificationPreferences(userId: number): Promise<NotificationPreference | null> {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(notificationPreferences)
    .where(eq(notificationPreferences.userId, userId))
    .limit(1);

  return result[0] || null;
}

/**
 * Criar ou atualizar preferências de notificação
 */
export async function upsertNotificationPreferences(
  userId: number,
  prefs: Partial<InsertNotificationPreference>
): Promise<void> {
  const db = await getDb();
  if (!db) return;

  const existing = await getNotificationPreferences(userId);

  if (existing) {
    await db
      .update(notificationPreferences)
      .set({ ...prefs, updatedAt: new Date() })
      .where(eq(notificationPreferences.userId, userId));
  } else {
    await db.insert(notificationPreferences).values({
      userId,
      ...prefs,
    } as InsertNotificationPreference);
  }
}




// ============= WEBHOOK FUNCTIONS =============

export async function updateMerchantWebhook(merchantId: number, webhookUrl: string, webhookSecret: string) {
  const db = await getDb();
  if (!db) return;

  const { merchants } = await import("../drizzle/schema");
  await db.update(merchants)
    .set({ webhookUrl, webhookSecret, updatedAt: new Date() })
    .where(eq(merchants.id, merchantId));
}

export async function createWebhookLog(data: {
  merchantId: number;
  eventType: string;
  payload: any;
  url: string;
  status: "pending" | "success" | "failed";
  retryCount: number;
  responseStatus?: number;
  errorMessage?: string;
}) {
  const db = await getDb();
  if (!db) return null;

  const { webhookLogs } = await import("../drizzle/schema");
  const result = await db.insert(webhookLogs).values({
    merchantId: data.merchantId,
    eventType: data.eventType,
    payload: JSON.stringify(data.payload),
    url: data.url,
    status: data.status,
    retryCount: data.retryCount,
    responseStatus: data.responseStatus,
    errorMessage: data.errorMessage,
  });

  return result;
}

export async function getWebhookLogs(merchantId: number, limit: number = 50) {
  const db = await getDb();
  if (!db) return [];

  const { webhookLogs } = await import("../drizzle/schema");
  const logs = await db.select()
    .from(webhookLogs)
    .where(eq(webhookLogs.merchantId, merchantId))
    .orderBy(desc(webhookLogs.createdAt))
    .limit(limit);

  return logs.map(log => ({
    ...log,
    payload: JSON.parse(log.payload as string),
  }));
}


// ==================== OPEN FINANCE ====================

export async function createOpenFinanceConnection(data: {
  userId: number;
  itemId: string;
  connectorId?: string;
  connectorName?: string;
}) {
  const db = await getDb();
  if (!db) return null;

  const { openFinanceConnections } = await import("../drizzle/schema");
  const result = await db.insert(openFinanceConnections).values({
    userId: data.userId,
    itemId: data.itemId,
    connectorId: data.connectorId,
    connectorName: data.connectorName,
    status: "connected",
    lastSyncAt: new Date(),
  });

  return result;
}

export async function getOpenFinanceConnection(userId: number) {
  const db = await getDb();
  if (!db) return null;

  const { openFinanceConnections } = await import("../drizzle/schema");
  const connections = await db.select()
    .from(openFinanceConnections)
    .where(eq(openFinanceConnections.userId, userId))
    .orderBy(desc(openFinanceConnections.createdAt))
    .limit(1);

  return connections[0] || null;
}

export async function updateOpenFinanceMetrics(data: {
  userId: number;
  averageIncome: number;
  averageExpense: number;
  totalBalance: number;
  incomeStability: number;
  cashFlowPositive: number;
  cashFlowTrend: "increasing" | "stable" | "decreasing";
}) {
  const db = await getDb();
  if (!db) return null;

  const { openFinanceMetrics } = await import("../drizzle/schema");
  
  // Converter valores de reais para centavos e percentuais para 0-100
  const metricsData = {
    userId: data.userId,
    averageIncome: Math.round(data.averageIncome * 100), // R$ -> centavos
    averageExpense: Math.round(data.averageExpense * 100),
    totalBalance: Math.round(data.totalBalance * 100),
    incomeStability: Math.round(data.incomeStability * 100), // 0-1 -> 0-100
    cashFlowPositive: Math.round(data.cashFlowPositive * 100),
    cashFlowTrend: data.cashFlowTrend,
    calculatedAt: new Date(),
    dataFrom: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 90 dias atrás
    dataTo: new Date(),
  };

  // Verificar se já existe métrica para este usuário
  const existing = await db.select()
    .from(openFinanceMetrics)
    .where(eq(openFinanceMetrics.userId, data.userId))
    .limit(1);

  if (existing.length > 0) {
    // Atualizar
    await db.update(openFinanceMetrics)
      .set(metricsData)
      .where(eq(openFinanceMetrics.userId, data.userId));
  } else {
    // Inserir
    await db.insert(openFinanceMetrics).values(metricsData);
  }

  return metricsData;
}

export async function getOpenFinanceMetrics(userId: number) {
  const db = await getDb();
  if (!db) return null;

  const { openFinanceMetrics } = await import("../drizzle/schema");
  const metrics = await db.select()
    .from(openFinanceMetrics)
    .where(eq(openFinanceMetrics.userId, userId))
    .orderBy(desc(openFinanceMetrics.calculatedAt))
    .limit(1);

  if (metrics.length === 0) return null;

  const metric = metrics[0];
  
  // Converter de volta para formato original
  return {
    ...metric,
    averageIncome: (metric.averageIncome || 0) / 100, // centavos -> R$
    averageExpense: (metric.averageExpense || 0) / 100,
    totalBalance: (metric.totalBalance || 0) / 100,
    incomeStability: (metric.incomeStability || 0) / 100, // 0-100 -> 0-1
    cashFlowPositive: (metric.cashFlowPositive || 0) / 100,
  };
}
