/**
 * Serviço de Lembretes de Parcelas
 * Envia e-mails automáticos para parcelas próximas do vencimento
 */

import cron from 'node-cron';
import { Resend } from 'resend';
import * as db from './db';
import { checkOverdueInstallments } from './installmentEngine';

// Inicializar Resend (usar variável de ambiente)
const resend = new Resend(process.env.RESEND_API_KEY || 'demo-key');

/**
 * Envia e-mail de lembrete de parcela
 */
async function sendInstallmentReminder(
  email: string,
  userName: string,
  installmentNumber: number,
  amount: number,
  dueDate: Date
) {
  try {
    const formattedAmount = (amount / 100).toFixed(2);
    const formattedDate = dueDate.toLocaleDateString('pt-BR');

    await resend.emails.send({
      from: 'ParcelToken <noreply@parceltoken.com>',
      to: email,
      subject: `⏰ Lembrete: Parcela ${installmentNumber} vence em 3 dias`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #6366f1;">Olá, ${userName}!</h2>
          
          <p>Este é um lembrete amigável de que sua parcela está próxima do vencimento:</p>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Parcela:</strong> ${installmentNumber}</p>
            <p style="margin: 5px 0;"><strong>Valor:</strong> R$ ${formattedAmount}</p>
            <p style="margin: 5px 0;"><strong>Vencimento:</strong> ${formattedDate}</p>
          </div>
          
          <p>Para evitar multas e juros, realize o pagamento até a data de vencimento.</p>
          
          <a href="https://parceltoken.com/dashboard" 
             style="display: inline-block; background: #6366f1; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 6px; margin: 20px 0;">
            Ver Minhas Parcelas
          </a>
          
          <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
            Você está recebendo este e-mail porque possui parcelas ativas no ParcelToken.
          </p>
        </div>
      `
    });

    console.log(`[ReminderService] E-mail enviado para ${email} - Parcela ${installmentNumber}`);
    return true;
  } catch (error) {
    console.error('[ReminderService] Erro ao enviar e-mail:', error);
    return false;
  }
}

/**
 * Processa lembretes diários
 */
export async function processDailyReminders() {
  console.log('[ReminderService] Iniciando processamento de lembretes...');

  try {
    // 1. Atualizar status de parcelas vencidas
    await checkOverdueInstallments();

    // 2. Buscar todas as parcelas pendentes vencendo em 3 dias
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    threeDaysFromNow.setHours(0, 0, 0, 0);

    const fourDaysFromNow = new Date(threeDaysFromNow);
    fourDaysFromNow.setDate(fourDaysFromNow.getDate() + 1);

    const allPayments = await db.getAllPendingInstallmentPayments();
    
    const upcomingPayments = allPayments.filter(payment => {
      const dueDate = new Date(payment.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      return dueDate >= threeDaysFromNow && dueDate < fourDaysFromNow;
    });

    console.log(`[ReminderService] Encontradas ${upcomingPayments.length} parcelas vencendo em 3 dias`);

    // 3. Agrupar por usuário
    const paymentsByUser = new Map<number, typeof upcomingPayments>();
    
    for (const payment of upcomingPayments) {
      const plan = await db.getInstallmentPlanById(payment.planId);
      if (!plan) continue;

      if (!paymentsByUser.has(plan.userId)) {
        paymentsByUser.set(plan.userId, []);
      }
      paymentsByUser.get(plan.userId)!.push(payment);
    }

    // 4. Enviar e-mails e Webhooks
    let emailsSent = 0;
    let webhooksTriggered = 0;
    
    for (const [userId, payments] of Array.from(paymentsByUser.entries())) {
      const user = await db.getUserById(userId);
      if (!user || !user.email) continue;

      // Enviar um e-mail e webhook por parcela
      for (const payment of payments) {
        const sent = await sendInstallmentReminder(
          user.email,
          user.name || 'Cliente',
          payment.installmentNumber,
          payment.amount,
          new Date(payment.dueDate)
        );
        
        if (sent) emailsSent++;
        
        // **NOVO**: Disparar webhook para o merchant
        const plan = await db.getInstallmentPlanById(payment.planId);
        if (plan && plan.merchantId) {
          await webhookHelpers.installmentDue(
            payment.id,
            userId,
            new Date(payment.dueDate),
            payment.amount,
            plan.merchantId // Passar o merchantId
          );
          webhooksTriggered++;
        }
        
        // Delay de 100ms entre e-mails para evitar rate limit
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    console.log(`[ReminderService] ${emailsSent} e-mails enviados com sucesso`);
    console.log(`[ReminderService] ${webhooksTriggered} webhooks 'installment.due' disparados`);
    return { success: true, emailsSent, webhooksTriggered };
    
  } catch (error) {
    console.error('[ReminderService] Erro no processamento:', error);
    return { success: false, error };
  }
}

/**
 * Inicia o job diário de lembretes
 * Executa todos os dias às 9h da manhã
 */
export function startReminderJob() {
  // Cron: "0 9 * * *" = Todo dia às 9h
  cron.schedule('0 9 * * *', async () => {
    console.log('[ReminderService] Job diário iniciado');
    await processDailyReminders();
  }, {
    timezone: 'America/Sao_Paulo'
  });

  console.log('[ReminderService] Job agendado para executar diariamente às 9h');
}

/**
 * Executa processamento manual (para testes)
 */
export async function runManualReminders() {
  console.log('[ReminderService] Executando lembretes manualmente...');
  return await processDailyReminders();
}
