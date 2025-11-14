/**
 * Motor de Parcelamento Automático
 * Gera parcelas automaticamente ao criar transação
 */

import * as db from './db';

export interface InstallmentConfig {
  transactionId: number;
  tokenId: number;
  totalAmount: number;
  installments: number;
  interestRate?: number; // Taxa de juros mensal (ex: 0.02 = 2%)
  discountRate?: number; // Taxa de desconto para pagamento antecipado
}

export interface GeneratedInstallment {
  installmentNumber: number;
  amount: number;
  dueDate: Date;
  status: 'pending' | 'paid' | 'overdue';
}

/**
 * Gera parcelas automaticamente
 */
export async function generateInstallments(config: InstallmentConfig): Promise<void> {
  const {
    transactionId,
    tokenId,
    totalAmount,
    installments,
    interestRate = 0, // Sem juros por padrão
    discountRate = 0
  } = config;

  // Buscar userId do token
  const token = await db.getParcelTokenById(tokenId);
  if (!token) {
    throw new Error('Token não encontrado');
  }

  // Calcular valor base por parcela
  let baseInstallmentAmount = Math.ceil(totalAmount / installments);

  // Criar plano de parcelamento
  const planId = await db.createInstallmentPlan({
    transactionId,
    tokenId,
    userId: token.userId,
    totalInstallments: installments,
    installments, // Compatibilidade
    installmentAmount: baseInstallmentAmount,
    paidInstallments: 0,
    totalAmount,
    paidAmount: 0,
    status: 'active',
    nextDueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 dias
  });

  if (!planId) {
    throw new Error('Falha ao criar plano de parcelamento');
  }

  // Calcular valor base por parcela
  let installmentAmount = Math.ceil(totalAmount / installments);

  // Aplicar juros compostos se houver
  if (interestRate > 0) {
    const factor = Math.pow(1 + interestRate, installments);
    installmentAmount = Math.ceil((totalAmount * factor * interestRate) / (factor - 1));
  }

  // Gerar parcelas
  const now = new Date();
  const parcelas: GeneratedInstallment[] = [];

  for (let i = 1; i <= installments; i++) {
    // Data de vencimento: 30 dias * número da parcela
    const dueDate = new Date(now);
    dueDate.setDate(dueDate.getDate() + (30 * i));

    // Última parcela ajusta para o valor exato
    const amount = i === installments 
      ? totalAmount - (installmentAmount * (installments - 1))
      : installmentAmount;

    await db.createInstallmentPayment({
      planId,
      installmentNumber: i,
      amount,
      dueDate,
      status: 'pending'
    });

    parcelas.push({
      installmentNumber: i,
      amount,
      dueDate,
      status: 'pending'
    });
  }

  console.log(`[InstallmentEngine] Geradas ${installments} parcelas para transação ${transactionId}`);
}

/**
 * Marca parcela como paga e atualiza saldo do token
 */
export async function payInstallment(paymentId: number): Promise<void> {
  // Buscar parcela
  const payment = await db.getInstallmentPaymentById(paymentId);
  if (!payment) {
    throw new Error('Parcela não encontrada');
  }

  if (payment.status === 'paid') {
    throw new Error('Parcela já foi paga');
  }

  // Buscar plano
  const plan = await db.getInstallmentPlanById(payment.planId);
  if (!plan) {
    throw new Error('Plano de parcelamento não encontrado');
  }

  // Atualizar status da parcela
  await db.updateInstallmentPaymentStatus(paymentId, 'paid', new Date());

  // Atualizar plano
  const newPaidAmount = (plan.paidAmount || 0) + payment.amount;
  const newPaidInstallments = (plan.paidInstallments || 0) + 1;
  
  await db.updateInstallmentPlan(payment.planId, {
    paidAmount: newPaidAmount,
    paidInstallments: newPaidInstallments,
    status: newPaidInstallments === plan.totalInstallments ? 'completed' : 'active'
  });

  // Atualizar saldo do token (libera crédito conforme quitação)
  const token = await db.getParcelTokenById(plan.tokenId);
  if (token) {
    const usedAmount = (token.usedAmount || 0) - payment.amount;
    await db.updateParcelTokenUsedAmount(plan.tokenId, Math.max(0, usedAmount));
    
    console.log(`[InstallmentEngine] Parcela ${payment.installmentNumber} paga. Saldo liberado: R$ ${(payment.amount / 100).toFixed(2)}`);
  }
}

/**
 * Renegocia parcelas (reagenda vencimentos)
 */
export async function rescheduleInstallments(
  planId: number,
  newDueDates: Date[]
): Promise<void> {
  const plan = await db.getInstallmentPlanById(planId);
  if (!plan) {
    throw new Error('Plano não encontrado');
  }

  const payments = await db.getInstallmentPaymentsByPlanId(planId);
  const pendingPayments = payments.filter(p => p.status === 'pending');

  if (newDueDates.length !== pendingPayments.length) {
    throw new Error('Número de datas não corresponde ao número de parcelas pendentes');
  }

  for (let i = 0; i < pendingPayments.length; i++) {
    await db.updateInstallmentPaymentDueDate(pendingPayments[i].id, newDueDates[i]);
  }

  console.log(`[InstallmentEngine] ${pendingPayments.length} parcelas renegociadas`);
}

/**
 * Verifica parcelas vencidas e atualiza status
 */
export async function checkOverdueInstallments(): Promise<void> {
  const now = new Date();
  const allPayments = await db.getAllPendingInstallmentPayments();

  for (const payment of allPayments) {
    if (payment.status === 'pending' && new Date(payment.dueDate) < now) {
      await db.updateInstallmentPaymentStatus(payment.id, 'overdue');
      console.log(`[InstallmentEngine] Parcela ${payment.id} marcada como vencida`);
    }
  }
}
