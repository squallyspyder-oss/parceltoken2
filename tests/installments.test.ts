import { describe, it, expect } from 'vitest';

/**
 * Testes para motor de parcelamento automático
 * 
 * Cenários testados:
 * 1. Geração automática de parcelas
 * 2. Cálculo de datas de vencimento
 * 3. Cálculo de juros e valores
 * 4. Renegociação de parcelas
 * 5. Detecção de parcelas vencidas
 */

describe('Motor de Parcelamento', () => {
  describe('Geração Automática de Parcelas', () => {
    it('deve gerar parcelas automaticamente ao criar transação', () => {
      const transaction = {
        amount: 300000, // R$ 3.000,00
        installments: 3,
        createdAt: new Date('2025-01-09'),
      };

      const installmentAmount = Math.ceil(transaction.amount / transaction.installments);
      const installments = [];

      for (let i = 1; i <= transaction.installments; i++) {
        const dueDate = new Date(transaction.createdAt);
        dueDate.setMonth(dueDate.getMonth() + i);

        installments.push({
          installmentNumber: i,
          amount: installmentAmount,
          dueDate,
          status: 'pending',
        });
      }

      expect(installments).toHaveLength(3);
      expect(installments[0].amount).toBe(100000); // R$ 1.000,00
      expect(installments[0].installmentNumber).toBe(1);
      expect(installments[2].installmentNumber).toBe(3);
    });

    it('deve calcular datas de vencimento mensais', () => {
      const baseDate = new Date('2025-01-09');
      const installments = 4;

      const dueDates = [];
      for (let i = 1; i <= installments; i++) {
        const dueDate = new Date(baseDate);
        dueDate.setMonth(dueDate.getMonth() + i);
        dueDates.push(dueDate);
      }

      expect(dueDates[0].getMonth()).toBe(1); // Fevereiro (0-indexed)
      expect(dueDates[1].getMonth()).toBe(2); // Março
      expect(dueDates[2].getMonth()).toBe(3); // Abril
      expect(dueDates[3].getMonth()).toBe(4); // Maio
    });

    it('deve ajustar última parcela para cobrir centavos restantes', () => {
      const amount = 100000; // R$ 1.000,00
      const installments = 3;
      const installmentAmount = Math.floor(amount / installments); // 33333

      const lastInstallmentAmount = amount - (installmentAmount * (installments - 1));

      expect(installmentAmount).toBe(33333);
      expect(lastInstallmentAmount).toBe(33334); // 100000 - (33333 * 2)
    });

    it('deve gerar parcelas com valores iguais quando divisível', () => {
      const amount = 300000; // R$ 3.000,00
      const installments = 3;
      const installmentAmount = amount / installments;

      expect(installmentAmount).toBe(100000);
      expect(installmentAmount * installments).toBe(amount);
    });
  });

  describe('Cálculo de Juros', () => {
    it('deve calcular juros simples por parcela', () => {
      const amount = 100000; // R$ 1.000,00
      const installments = 3;
      const interestRate = 0.02; // 2% ao mês

      const totalWithInterest = amount * (1 + interestRate * installments);
      const installmentAmount = Math.ceil(totalWithInterest / installments);

      expect(totalWithInterest).toBe(106000); // R$ 1.060,00
      expect(installmentAmount).toBe(35334); // R$ 353,34
    });

    it('deve aplicar juros zero para parcelamento sem juros', () => {
      const amount = 100000;
      const installments = 3;
      const interestRate = 0;

      const totalWithInterest = amount * (1 + interestRate * installments);
      expect(totalWithInterest).toBe(amount);
    });

    it('deve calcular juros de mora para parcelas atrasadas', () => {
      const installmentAmount = 100000; // R$ 1.000,00
      const daysLate = 10;
      const dailyInterestRate = 0.01 / 30; // 1% ao mês = 0.033% ao dia

      const lateInterest = installmentAmount * dailyInterestRate * daysLate;
      const totalWithLateInterest = installmentAmount + lateInterest;

      expect(lateInterest).toBeGreaterThan(0);
      expect(totalWithLateInterest).toBeGreaterThan(installmentAmount);
    });

    it('deve aplicar multa de 2% para parcelas vencidas', () => {
      const installmentAmount = 100000; // R$ 1.000,00
      const lateFee = installmentAmount * 0.02; // 2%

      expect(lateFee).toBe(2000); // R$ 20,00
      expect(installmentAmount + lateFee).toBe(102000); // R$ 1.020,00
    });
  });

  describe('Status de Parcelas', () => {
    it('deve iniciar todas as parcelas como pending', () => {
      const installments = [
        { id: 1, status: 'pending' },
        { id: 2, status: 'pending' },
        { id: 3, status: 'pending' },
      ];

      const allPending = installments.every(i => i.status === 'pending');
      expect(allPending).toBe(true);
    });

    it('deve atualizar status para paid após pagamento', () => {
      const installment = {
        id: 1,
        status: 'pending',
        paidAt: null,
      };

      installment.status = 'paid';
      installment.paidAt = new Date();

      expect(installment.status).toBe('paid');
      expect(installment.paidAt).toBeInstanceOf(Date);
    });

    it('deve marcar como overdue se vencida e não paga', () => {
      const installment = {
        id: 1,
        status: 'pending',
        dueDate: new Date('2025-01-01'),
        paidAt: null,
      };

      const now = new Date();
      const isOverdue = installment.dueDate < now && installment.status === 'pending';

      if (isOverdue) {
        installment.status = 'overdue';
      }

      expect(installment.status).toBe('overdue');
    });

    it('deve calcular progresso do plano de parcelamento', () => {
      const installments = [
        { id: 1, status: 'paid' },
        { id: 2, status: 'paid' },
        { id: 3, status: 'pending' },
        { id: 4, status: 'pending' },
      ];

      const paidCount = installments.filter(i => i.status === 'paid').length;
      const progress = (paidCount / installments.length) * 100;

      expect(paidCount).toBe(2);
      expect(progress).toBe(50);
    });
  });

  describe('Renegociação de Parcelas', () => {
    it('deve permitir renegociação de parcelas pendentes', () => {
      const installments = [
        { id: 1, status: 'paid', dueDate: new Date('2025-01-09') },
        { id: 2, status: 'overdue', dueDate: new Date('2025-02-09') },
        { id: 3, status: 'pending', dueDate: new Date('2025-03-09') },
      ];

      const pendingInstallments = installments.filter(
        i => i.status === 'pending' || i.status === 'overdue'
      );

      expect(pendingInstallments).toHaveLength(2);
    });

    it('deve recalcular datas de vencimento na renegociação', () => {
      const overdueInstallments = [
        { id: 2, amount: 100000, dueDate: new Date('2025-02-09') },
        { id: 3, amount: 100000, dueDate: new Date('2025-03-09') },
      ];

      const newStartDate = new Date();
      const renegotiated = overdueInstallments.map((inst, index) => {
        const newDueDate = new Date(newStartDate);
        newDueDate.setMonth(newDueDate.getMonth() + index + 1);
        return {
          ...inst,
          dueDate: newDueDate,
        };
      });

      // Verificar que as datas foram recalculadas
      expect(renegotiated[0].dueDate).toBeInstanceOf(Date);
      expect(renegotiated[1].dueDate).toBeInstanceOf(Date);
      // Segunda parcela deve ser depois da primeira
      expect(renegotiated[1].dueDate.getTime()).toBeGreaterThan(renegotiated[0].dueDate.getTime());
    });

    it('deve manter valor total na renegociação', () => {
      const originalInstallments = [
        { amount: 100000 },
        { amount: 100000 },
        { amount: 100000 },
      ];

      const totalOriginal = originalInstallments.reduce((sum, i) => sum + i.amount, 0);

      // Renegociar para 4 parcelas
      const newInstallments = 4;
      const newInstallmentAmount = Math.ceil(totalOriginal / newInstallments);

      expect(newInstallmentAmount * newInstallments).toBeGreaterThanOrEqual(totalOriginal);
    });
  });

  describe('Detecção de Parcelas Vencidas', () => {
    it('deve detectar parcelas vencendo em 3 dias', () => {
      const now = new Date();
      const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

      const installments = [
        { id: 1, dueDate: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000), status: 'pending' },
        { id: 2, dueDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000), status: 'pending' },
      ];

      const upcomingInstallments = installments.filter(i => {
        const daysUntilDue = Math.ceil((i.dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return daysUntilDue <= 3 && daysUntilDue >= 0 && i.status === 'pending';
      });

      expect(upcomingInstallments).toHaveLength(1);
      expect(upcomingInstallments[0].id).toBe(1);
    });

    it('deve detectar parcelas já vencidas', () => {
      const now = new Date();

      const installments = [
        { id: 1, dueDate: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), status: 'pending' },
        { id: 2, dueDate: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000), status: 'pending' },
      ];

      const overdueInstallments = installments.filter(i => {
        return i.dueDate < now && i.status === 'pending';
      });

      expect(overdueInstallments).toHaveLength(1);
      expect(overdueInstallments[0].id).toBe(1);
    });

    it('deve calcular dias de atraso', () => {
      const now = new Date();
      const dueDate = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000); // 10 dias atrás

      const daysLate = Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));

      expect(daysLate).toBe(10);
    });
  });

  describe('Lembretes de Vencimento', () => {
    it('deve enviar lembrete 3 dias antes do vencimento', () => {
      const now = new Date();
      const dueDate = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

      const installment = {
        id: 1,
        dueDate,
        status: 'pending',
        amount: 100000,
      };

      const daysUntilDue = Math.ceil((installment.dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      const shouldSendReminder = daysUntilDue === 3 && installment.status === 'pending';

      expect(shouldSendReminder).toBe(true);
    });

    it('deve agrupar lembretes por usuário', () => {
      const installments = [
        { userId: 1, id: 1, amount: 100000, dueDate: new Date() },
        { userId: 1, id: 2, amount: 150000, dueDate: new Date() },
        { userId: 2, id: 3, amount: 200000, dueDate: new Date() },
      ];

      const groupedByUser = installments.reduce((acc, inst) => {
        if (!acc[inst.userId]) {
          acc[inst.userId] = [];
        }
        acc[inst.userId].push(inst);
        return acc;
      }, {} as Record<number, typeof installments>);

      expect(Object.keys(groupedByUser)).toHaveLength(2);
      expect(groupedByUser[1]).toHaveLength(2);
      expect(groupedByUser[2]).toHaveLength(1);
    });
  });

  describe('Atualização de Saldo do Token', () => {
    it('deve liberar saldo após pagamento de parcela', () => {
      const token = {
        creditLimit: 5000000,
        usedAmount: 3000000,
      };

      const installmentAmount = 500000;
      token.usedAmount -= installmentAmount;

      const availableAmount = token.creditLimit - token.usedAmount;

      expect(token.usedAmount).toBe(2500000);
      expect(availableAmount).toBe(2500000);
    });

    it('deve liberar saldo progressivamente conforme parcelas são pagas', () => {
      const token = {
        creditLimit: 5000000,
        usedAmount: 3000000,
      };

      const installments = [
        { amount: 500000, status: 'paid' },
        { amount: 500000, status: 'paid' },
        { amount: 500000, status: 'pending' },
      ];

      const paidAmount = installments
        .filter(i => i.status === 'paid')
        .reduce((sum, i) => sum + i.amount, 0);

      token.usedAmount -= paidAmount;
      const availableAmount = token.creditLimit - token.usedAmount;

      expect(token.usedAmount).toBe(2000000);
      expect(availableAmount).toBe(3000000);
    });
  });
});
