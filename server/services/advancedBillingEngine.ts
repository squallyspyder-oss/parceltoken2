/**
 * Advanced Billing & Collections Engine
 * Implementa cobrança avançada com:
 * - Cálculo de juros e multa por atraso
 * - Notificações automáticas de vencimento
 * - Renegociação de parcelas
 * - Integração com PIX Cobrança
 * - Relatórios de inadimplência
 */

export interface Installment {
  id: string;
  transactionId: string;
  userId: string;
  amount: number;
  dueDate: Date;
  status: "pending" | "paid" | "overdue" | "renegotiated";
  paidDate?: Date;
  paidAmount?: number;
  interestCharged: number;
  fineCharged: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface BillingMetrics {
  totalInstallments: number;
  paidInstallments: number;
  pendingInstallments: number;
  overdueInstallments: number;
  totalAmount: number;
  totalPaid: number;
  totalInterest: number;
  totalFines: number;
  delinquencyRate: number; // %
  averageDaysOverdue: number;
}

export interface RenegotiationRequest {
  installmentId: string;
  newDueDate: Date;
  newNumberOfInstallments?: number;
  reason: string;
}

export interface RenegotiationResponse {
  success: boolean;
  message: string;
  newInstallments?: Installment[];
  totalInterestAdded?: number;
}

class AdvancedBillingEngine {
  // Configurações de juros e multa
  private readonly DAILY_INTEREST_RATE = 0.001; // 0.1% ao dia
  private readonly MONTHLY_INTEREST_RATE = 0.03; // 3% ao mês
  private readonly FINE_PERCENTAGE = 0.02; // 2% de multa
  private readonly MAX_FINE_PERCENTAGE = 0.1; // Máximo 10%

  // Notificações
  private readonly NOTIFICATION_DAYS_BEFORE = [7, 3, 1]; // Notificar 7, 3 e 1 dia antes

  /**
   * Calcula juros sobre parcela atrasada
   */
  calculateInterest(amount: number, daysOverdue: number): number {
    if (daysOverdue <= 0) return 0;

    // Juros simples: P * i * t
    const interest = amount * this.DAILY_INTEREST_RATE * daysOverdue;

    // Máximo de 30% de juros
    const maxInterest = amount * 0.3;

    return Math.min(interest, maxInterest);
  }

  /**
   * Calcula multa por atraso
   */
  calculateFine(amount: number, daysOverdue: number): number {
    if (daysOverdue <= 0) return 0;

    // Multa fixa de 2% + 0.1% por dia de atraso (máximo 10%)
    const baseFine = amount * this.FINE_PERCENTAGE;
    const additionalFine = amount * (0.001 * Math.min(daysOverdue, 80)); // Máximo 80 dias

    const totalFine = baseFine + additionalFine;
    const maxFine = amount * this.MAX_FINE_PERCENTAGE;

    return Math.min(totalFine, maxFine);
  }

  /**
   * Calcula total devido (principal + juros + multa)
   */
  calculateTotalDue(installment: Installment, currentDate: Date = new Date()): number {
    if (installment.status === "paid") {
      return 0;
    }

    const daysOverdue = Math.max(0, Math.floor(
      (currentDate.getTime() - installment.dueDate.getTime()) / (1000 * 60 * 60 * 24)
    ));

    const interest = this.calculateInterest(installment.amount, daysOverdue);
    const fine = this.calculateFine(installment.amount, daysOverdue);

    return installment.amount + interest + fine;
  }

  /**
   * Processa pagamento de parcela
   */
  processPayment(installment: Installment, paidAmount: number, currentDate: Date = new Date()): {
    success: boolean;
    message: string;
    remainingAmount: number;
    newStatus: string;
  } {
    const totalDue = this.calculateTotalDue(installment, currentDate);

    if (paidAmount < totalDue) {
      return {
        success: false,
        message: `Valor insuficiente. Devido: R$ ${totalDue.toFixed(2)}, Recebido: R$ ${paidAmount.toFixed(2)}`,
        remainingAmount: totalDue - paidAmount,
        newStatus: "pending"
      };
    }

    return {
      success: true,
      message: "Pagamento processado com sucesso",
      remainingAmount: 0,
      newStatus: "paid"
    };
  }

  /**
   * Gera notificação de vencimento
   */
  generateNotification(installment: Installment, daysUntilDue: number): {
    shouldNotify: boolean;
    notificationType: "REMINDER_7_DAYS" | "REMINDER_3_DAYS" | "REMINDER_1_DAY" | "OVERDUE" | null;
    message: string;
  } {
    if (daysUntilDue < 0) {
      return {
        shouldNotify: true,
        notificationType: "OVERDUE",
        message: `Sua parcela de R$ ${installment.amount.toFixed(2)} está vencida desde ${Math.abs(daysUntilDue)} dias.`
      };
    }

    if (daysUntilDue === 7) {
      return {
        shouldNotify: true,
        notificationType: "REMINDER_7_DAYS",
        message: `Sua parcela de R$ ${installment.amount.toFixed(2)} vence em 7 dias (${installment.dueDate.toLocaleDateString("pt-BR")})`
      };
    }

    if (daysUntilDue === 3) {
      return {
        shouldNotify: true,
        notificationType: "REMINDER_3_DAYS",
        message: `Atenção! Sua parcela de R$ ${installment.amount.toFixed(2)} vence em 3 dias`
      };
    }

    if (daysUntilDue === 1) {
      return {
        shouldNotify: true,
        notificationType: "REMINDER_1_DAY",
        message: `Urgente! Sua parcela de R$ ${installment.amount.toFixed(2)} vence AMANHÃ`
      };
    }

    return {
      shouldNotify: false,
      notificationType: null,
      message: ""
    };
  }

  /**
   * Processa renegociação de parcelas
   */
  renegotiateInstallment(
    installment: Installment,
    request: RenegotiationRequest
  ): RenegotiationResponse {
    // Validações
    if (installment.status === "paid") {
      return {
        success: false,
        message: "Não é possível renegociar parcela já paga"
      };
    }

    if (request.newDueDate <= new Date()) {
      return {
        success: false,
        message: "Nova data de vencimento deve ser no futuro"
      };
    }

    // Calcular juros de renegociação (1% sobre o saldo)
    const renegotiationInterest = installment.amount * 0.01;
    const newAmount = installment.amount + renegotiationInterest;

    // Se solicitado, dividir em múltiplas parcelas
    if (request.newNumberOfInstallments && request.newNumberOfInstallments > 1) {
      const newInstallments: Installment[] = [];
      const amountPerInstallment = newAmount / request.newNumberOfInstallments;
      const daysBetweenInstallments = Math.floor(
        (request.newDueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24) / request.newNumberOfInstallments
      );

      for (let i = 0; i < request.newNumberOfInstallments; i++) {
        const newDueDate = new Date();
        newDueDate.setDate(newDueDate.getDate() + (daysBetweenInstallments * (i + 1)));

        newInstallments.push({
          ...installment,
          id: `${installment.id}-renegotiated-${i + 1}`,
          amount: amountPerInstallment,
          dueDate: newDueDate,
          status: "renegotiated",
          interestCharged: 0,
          fineCharged: 0
        });
      }

      return {
        success: true,
        message: `Parcela renegociada em ${request.newNumberOfInstallments} parcelas`,
        newInstallments,
        totalInterestAdded: renegotiationInterest
      };
    }

    // Simples adiamento
    const renegotiatedInstallment: Installment = {
      ...installment,
      dueDate: request.newDueDate,
      status: "renegotiated",
      amount: newAmount,
      interestCharged: renegotiationInterest
    };

    return {
      success: true,
      message: "Parcela adiada com sucesso",
      newInstallments: [renegotiatedInstallment],
      totalInterestAdded: renegotiationInterest
    };
  }

  /**
   * Calcula métricas de cobrança
   */
  calculateMetrics(installments: Installment[]): BillingMetrics {
    const now = new Date();
    let totalAmount = 0;
    let totalPaid = 0;
    let totalInterest = 0;
    let totalFines = 0;
    let overdueCount = 0;
    let totalDaysOverdue = 0;

    for (const installment of installments) {
      totalAmount += installment.amount;

      if (installment.status === "paid") {
        totalPaid += installment.paidAmount || installment.amount;
      } else if (installment.status === "overdue") {
        overdueCount++;
        const daysOverdue = Math.floor(
          (now.getTime() - installment.dueDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        totalDaysOverdue += daysOverdue;

        const interest = this.calculateInterest(installment.amount, daysOverdue);
        const fine = this.calculateFine(installment.amount, daysOverdue);
        totalInterest += interest;
        totalFines += fine;
      }
    }

    const averageDaysOverdue = overdueCount > 0 ? totalDaysOverdue / overdueCount : 0;
    const delinquencyRate = installments.length > 0 ? (overdueCount / installments.length) * 100 : 0;

    return {
      totalInstallments: installments.length,
      paidInstallments: installments.filter(i => i.status === "paid").length,
      pendingInstallments: installments.filter(i => i.status === "pending").length,
      overdueInstallments: overdueCount,
      totalAmount,
      totalPaid,
      totalInterest,
      totalFines,
      delinquencyRate,
      averageDaysOverdue
    };
  }

  /**
   * Gera relatório de inadimplência
   */
  generateDelinquencyReport(installments: Installment[]): {
    totalOverdue: number;
    byDaysOverdue: Record<string, number>;
    topDebtors: Array<{ userId: string; totalOverdue: number; installmentCount: number }>;
  } {
    const now = new Date();
    const byDaysOverdue: Record<string, number> = {
      "1-7 dias": 0,
      "8-15 dias": 0,
      "16-30 dias": 0,
      "31-60 dias": 0,
      "60+ dias": 0
    };

    const debtorMap = new Map<string, { totalOverdue: number; count: number }>();
    let totalOverdue = 0;

    for (const installment of installments) {
      if (installment.status === "overdue") {
        const daysOverdue = Math.floor(
          (now.getTime() - installment.dueDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        const totalDue = this.calculateTotalDue(installment, now);
        totalOverdue += totalDue;

        // Categorizar por dias
        if (daysOverdue <= 7) byDaysOverdue["1-7 dias"]++;
        else if (daysOverdue <= 15) byDaysOverdue["8-15 dias"]++;
        else if (daysOverdue <= 30) byDaysOverdue["16-30 dias"]++;
        else if (daysOverdue <= 60) byDaysOverdue["31-60 dias"]++;
        else byDaysOverdue["60+ dias"]++;

        // Agrupar por devedor
        const current = debtorMap.get(installment.userId) || { totalOverdue: 0, count: 0 };
        debtorMap.set(installment.userId, {
          totalOverdue: current.totalOverdue + totalDue,
          count: current.count + 1
        });
      }
    }

    // Top debtors
    const topDebtors = Array.from(debtorMap.entries())
      .map(([userId, { totalOverdue, count }]) => ({ userId, totalOverdue, installmentCount: count }))
      .sort((a, b) => b.totalOverdue - a.totalOverdue)
      .slice(0, 10);

    return {
      totalOverdue,
      byDaysOverdue,
      topDebtors
    };
  }
}

export const advancedBillingEngine = new AdvancedBillingEngine();
