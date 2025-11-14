import crypto from 'crypto';
import { eq, sql } from 'drizzle-orm';
import { getDb } from './db';

/**
 * Valida assinatura HMAC-SHA256 do webhook Efi Bank
 */
export function validateWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const hash = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  return hash === signature;
}

/**
 * Processa webhook de pagamento PIX confirmado
 */
export async function handlePixWebhook(payload: {
  txid: string;
  status: string;
  paidAt?: string;
  amount: number;
  payer?: {
    cpf: string;
    name: string;
  };
}) {
  const db = await getDb();
  if (!db) {
    console.error('[Webhook] Database not available');
    return;
  }

  try {
    console.log(`[Webhook] Processando pagamento PIX: ${payload.txid}`);

    // Mapear status Efi para nosso formato
    const statusMap: Record<string, string> = {
      'CONCLUIDA': 'paid',
      'ATIVA': 'pending',
      'REMOVIDA_PELO_USUARIO_RECEBEDOR': 'cancelled',
      'REMOVIDA_PELO_PSP': 'expired'
    };

    const status = statusMap[payload.status] || payload.status;

    if (status === 'paid') {
      // Buscar parcela pelo TxID
      const installments = await db
        .select()
        .from('installments' as any)
        .where(sql`pixChargeId = ${payload.txid}`)
        .limit(1);

      if (installments.length === 0) {
        console.warn(`[Webhook] Parcela não encontrada para TxID: ${payload.txid}`);
        return;
      }

      const installment = installments[0];

      // Atualizar status da parcela
      await db
        .update('installments' as any)
        .set({
          status: 'paid',
          paidAt: new Date(payload.paidAt || Date.now()),
          updatedAt: new Date()
        })
        .where(sql`id = ${installment.id}`);

      console.log(`[Webhook] Parcela ${installment.id} marcada como paga`);

      // Buscar consumidor para notificar
      const tokens = await db
        .select()
        .from('parcelTokens' as any)
        .where(sql`id = ${installment.tokenId}`)
        .limit(1);

      if (tokens.length > 0) {
        const token = tokens[0];
        
        // Criar notificação
        await db.insert('notifications' as any).values({
          userId: token.userId,
          type: 'installment_paid',
          title: 'Parcela Paga com Sucesso',
          message: `Sua parcela de R$ ${(installment.amount / 100).toFixed(2)} foi confirmada!`,
          data: JSON.stringify({
            installmentId: installment.id,
            amount: installment.amount,
            paidAt: payload.paidAt,
            txid: payload.txid
          }),
          isRead: false,
          createdAt: new Date()
        });

        // Buscar merchant para notificar sobre recebimento
        const merchants = await db
          .select()
          .from('merchants' as any)
          .where(sql`id = ${installment.merchantId}`)
          .limit(1);

        if (merchants.length > 0) {
          const merchant = merchants[0];
          
          await db.insert('notifications' as any).values({
            userId: merchant.userId,
            type: 'payment_received',
            title: 'Pagamento Recebido',
            message: `Você recebeu R$ ${(installment.amount / 100).toFixed(2)} via ParcelToken`,
            data: JSON.stringify({
              installmentId: installment.id,
              amount: installment.amount,
              txid: payload.txid,
              payer: payload.payer?.name || 'Cliente'
            }),
            isRead: false,
            createdAt: new Date()
          });
        }
      }

      // Log de webhook
      await db.insert('webhookLogs' as any).values([
        {
          merchantId: installment.merchantId,
          event: 'payment_confirmed',
          payload: JSON.stringify(payload),
          status: 'success',
          httpStatus: 200,
          createdAt: new Date()
        }
      ]);
    }
  } catch (error) {
    console.error('[Webhook] Erro ao processar webhook:', error);
    
    // Log de erro
    const dbInstance = await getDb();
    if (dbInstance) {
      await dbInstance.insert('webhookLogs' as any).values([
        {
          event: 'payment_webhook_error',
          payload: JSON.stringify(payload),
          status: 'error',
          httpStatus: 500,
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
          createdAt: new Date()
        }
      ]);
    }
    
    throw error;
  }
}

/**
 * Processa webhook de expiração de cobrança
 */
export async function handlePixExpired(payload: {
  txid: string;
  expiresAt?: string;
}) {
  const db = await getDb();
  if (!db) {
    console.error('[Webhook] Database not available');
    return;
  }

  try {
    console.log(`[Webhook] Cobrança expirada: ${payload.txid}`);

    // Buscar parcela
    const installments = await db
      .select()
      .from('installments' as any)
      .where(sql`pixChargeId = ${payload.txid}`)
      .limit(1);

    if (installments.length > 0) {
      const installment = installments[0];

      // Atualizar status
      await db
        .update('installments' as any)
        .set({
          status: 'expired',
          updatedAt: new Date()
        })
        .where(sql`id = ${installment.id}`);

      // Notificar consumidor
      const tokens = await db
        .select()
        .from('parcelTokens' as any)
        .where(sql`id = ${installment.tokenId}`)
        .limit(1);

      if (tokens.length > 0) {
        const token = tokens[0];
        
        await db.insert('notifications' as any).values({
          userId: token.userId,
          type: 'installment_overdue',
          title: 'Parcela Vencida',
          message: `Sua parcela de R$ ${(installment.amount / 100).toFixed(2)} venceu. Clique para renegociar.`,
          data: JSON.stringify({
            installmentId: installment.id,
            amount: installment.amount,
            txid: payload.txid
          }),
          isRead: false,
          createdAt: new Date()
        });
      }
    }
  } catch (error) {
    console.error('[Webhook] Erro ao processar expiração:', error);
  }
}

/**
 * Processa webhook de falha de pagamento
 */
export async function handlePixFailed(payload: {
  txid: string;
  reason?: string;
}) {
  const db = await getDb();
  if (!db) {
    console.error('[Webhook] Database not available');
    return;
  }

  try {
    console.log(`[Webhook] Pagamento falhou: ${payload.txid}`);

    // Buscar parcela
    const installments = await db
      .select()
      .from('installments' as any)
      .where(sql`pixChargeId = ${payload.txid}`)
      .limit(1);

    if (installments.length > 0) {
      const installment = installments[0];

      // Notificar consumidor
      const tokens = await db
        .select()
        .from('parcelTokens' as any)
        .where(sql`id = ${installment.tokenId}`)
        .limit(1);

      if (tokens.length > 0) {
        const token = tokens[0];
        
        await db.insert('notifications' as any).values({
          userId: token.userId,
          type: 'payment_failed',
          title: 'Pagamento Não Confirmado',
          message: `Não conseguimos confirmar seu pagamento. Tente novamente.`,
          data: JSON.stringify({
            installmentId: installment.id,
            txid: payload.txid,
            reason: payload.reason
          }),
          isRead: false,
          createdAt: new Date()
        });
      }
    }
  } catch (error) {
    console.error('[Webhook] Erro ao processar falha:', error);
  }
}
