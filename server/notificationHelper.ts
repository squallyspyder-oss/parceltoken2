import * as db from "./db";
import type { InsertNotification } from "../drizzle/schema";

/**
 * Helper para criar notificações automaticamente nos eventos da plataforma
 */

export async function notifyTransactionCompleted(
  userId: number,
  transactionId: number,
  amount: number,
  merchantName: string
): Promise<void> {
  await db.createNotification({
    userId,
    type: "transaction_completed",
    title: "Transação Concluída",
    message: `Sua compra de R$ ${(amount / 100).toFixed(2)} na ${merchantName} foi concluída com sucesso!`,
    relatedEntityType: "transaction",
    relatedEntityId: transactionId,
    actionUrl: `/history`,
    priority: "normal",
  });
}

export async function notifyInstallmentPaid(
  userId: number,
  installmentId: number,
  installmentNumber: number,
  amount: number
): Promise<void> {
  await db.createNotification({
    userId,
    type: "installment_paid",
    title: "Parcela Paga",
    message: `Parcela ${installmentNumber} de R$ ${(amount / 100).toFixed(2)} foi paga com sucesso!`,
    relatedEntityType: "installment",
    relatedEntityId: installmentId,
    actionUrl: `/dashboard`,
    priority: "normal",
  });
}

export async function notifyInstallmentDueSoon(
  userId: number,
  installmentId: number,
  installmentNumber: number,
  amount: number,
  dueDate: Date
): Promise<void> {
  const dueDateStr = dueDate.toLocaleDateString("pt-BR");
  await db.createNotification({
    userId,
    type: "installment_due_soon",
    title: "Parcela Vencendo em Breve",
    message: `A parcela ${installmentNumber} de R$ ${(amount / 100).toFixed(2)} vence em ${dueDateStr}. Não esqueça de pagar!`,
    relatedEntityType: "installment",
    relatedEntityId: installmentId,
    actionUrl: `/dashboard`,
    priority: "high",
  });
}

export async function notifyInstallmentOverdue(
  userId: number,
  installmentId: number,
  installmentNumber: number,
  amount: number,
  dueDate: Date
): Promise<void> {
  const dueDateStr = dueDate.toLocaleDateString("pt-BR");
  await db.createNotification({
    userId,
    type: "installment_overdue",
    title: "Parcela Vencida",
    message: `A parcela ${installmentNumber} de R$ ${(amount / 100).toFixed(2)} venceu em ${dueDateStr}. Pague agora para evitar juros!`,
    relatedEntityType: "installment",
    relatedEntityId: installmentId,
    actionUrl: `/dashboard`,
    priority: "urgent",
  });
}

export async function notifyTokenCreated(
  userId: number,
  tokenId: number,
  creditLimit: number
): Promise<void> {
  await db.createNotification({
    userId,
    type: "token_created",
    title: "ParcelToken Solicitado",
    message: `Sua solicitação de ParcelToken com limite de R$ ${(creditLimit / 100).toFixed(2)} foi recebida e está em análise.`,
    relatedEntityType: "token",
    relatedEntityId: tokenId,
    actionUrl: `/dashboard`,
    priority: "normal",
  });
}

export async function notifyTokenApproved(
  userId: number,
  tokenId: number,
  creditLimit: number
): Promise<void> {
  await db.createNotification({
    userId,
    type: "token_approved",
    title: "ParcelToken Aprovado! 🎉",
    message: `Seu ParcelToken foi aprovado! Você tem R$ ${(creditLimit / 100).toFixed(2)} disponíveis para usar.`,
    relatedEntityType: "token",
    relatedEntityId: tokenId,
    actionUrl: `/dashboard`,
    priority: "high",
  });
}

export async function notifyCreditLimitIncreased(
  userId: number,
  tokenId: number,
  newLimit: number,
  increase: number
): Promise<void> {
  await db.createNotification({
    userId,
    type: "credit_limit_increased",
    title: "Limite de Crédito Aumentado! 📈",
    message: `Parabéns! Seu limite foi aumentado em R$ ${(increase / 100).toFixed(2)}. Novo limite: R$ ${(newLimit / 100).toFixed(2)}.`,
    relatedEntityType: "token",
    relatedEntityId: tokenId,
    actionUrl: `/dashboard`,
    priority: "high",
  });
}

export async function notifyWebhookReceived(
  userId: number,
  webhookId: number,
  eventType: string
): Promise<void> {
  await db.createNotification({
    userId,
    type: "webhook_received",
    title: "Webhook Recebido",
    message: `Um webhook do tipo "${eventType}" foi processado com sucesso.`,
    relatedEntityType: "webhook",
    relatedEntityId: webhookId,
    actionUrl: `/webhooks`,
    priority: "low",
  });
}

export async function notifySmartQRGenerated(
  userId: number,
  qrId: number,
  amount: number
): Promise<void> {
  await db.createNotification({
    userId,
    type: "smartqr_generated",
    title: "SmartQR Gerado",
    message: `Um novo SmartQR de R$ ${(amount / 100).toFixed(2)} foi criado com sucesso.`,
    relatedEntityType: "smartqr",
    relatedEntityId: qrId,
    actionUrl: `/merchant`,
    priority: "normal",
  });
}

export async function notifyNewSale(
  userId: number,
  transactionId: number,
  amount: number,
  customerName?: string
): Promise<void> {
  const customer = customerName || "Um cliente";
  await db.createNotification({
    userId,
    type: "new_sale",
    title: "Nova Venda! 🛒",
    message: `${customer} realizou uma compra de R$ ${(amount / 100).toFixed(2)}.`,
    relatedEntityType: "transaction",
    relatedEntityId: transactionId,
    actionUrl: `/merchant`,
    priority: "high",
  });
}

export async function notifyPaymentReceived(
  userId: number,
  transactionId: number,
  amount: number
): Promise<void> {
  await db.createNotification({
    userId,
    type: "payment_received",
    title: "Pagamento Recebido! 💰",
    message: `Você recebeu R$ ${(amount / 100).toFixed(2)} de uma venda.`,
    relatedEntityType: "transaction",
    relatedEntityId: transactionId,
    actionUrl: `/merchant`,
    priority: "high",
  });
}

export async function notifySystemAnnouncement(
  userId: number,
  title: string,
  message: string,
  actionUrl?: string
): Promise<void> {
  await db.createNotification({
    userId,
    type: "system_announcement",
    title,
    message,
    actionUrl,
    priority: "normal",
  });
}

/**
 * Notificar todos os usuários (broadcast)
 */
export async function notifyAllUsers(
  title: string,
  message: string,
  actionUrl?: string
): Promise<void> {
  // Em produção, isso seria feito de forma mais eficiente (bulk insert ou job queue)
  // Para demo, vamos deixar como exemplo
  console.log(`[Notification] Broadcast: ${title} - ${message}`);
  // TODO: Implementar bulk insert para notificar todos os usuários
}
