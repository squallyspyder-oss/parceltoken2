import crypto from 'crypto';

/**
 * Tipos de eventos de webhook suportados
 */
export type WebhookEventType =
  | 'qr.scanned'
  | 'qr.paid'
  | 'qr.expired'
  | 'payment.completed'
  | 'payment.failed'
  | 'installment.due'
  | 'installment.paid'
  | 'installment.overdue'
  | 'token.issued'
  | 'token.revoked'
  | 'transaction.created'
  | 'transaction.completed';

/**
 * Estrutura de um evento de webhook
 */
export interface WebhookEvent {
  id: string;
  type: WebhookEventType;
  timestamp: string;
  data: Record<string, any>;
}

/**
 * Estrutura de configuração de webhook
 */
export interface WebhookConfig {
  id: number;
  merchantId: number;
  url: string;
  secret: string;
  events: WebhookEventType[];
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Gera assinatura HMAC-SHA256 para webhook
 */
function generateSignature(payload: string, secret: string): string {
  return crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
}

/**
 * Envia webhook para URL configurada
 */
async function sendWebhook(
  url: string,
  event: WebhookEvent,
  secret: string
): Promise<{ success: boolean; statusCode?: number; error?: string }> {
  try {
    const payload = JSON.stringify(event);
    const signature = generateSignature(payload, secret);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Signature': signature,
        'X-Webhook-Id': event.id,
        'X-Webhook-Timestamp': event.timestamp,
      },
      body: payload,
    });

    return {
      success: response.ok,
      statusCode: response.status,
    };
  } catch (error) {
    console.error('[Webhook] Erro ao enviar webhook:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Dispara evento de webhook para todos os merchants configurados
 */
export async function triggerWebhookEvent(
  eventType: WebhookEventType,
  data: Record<string, any>,
  merchantId?: number
): Promise<void> {
  // Gerar ID único para o evento
  const eventId = crypto.randomUUID();
  const timestamp = new Date().toISOString();

  const event: WebhookEvent = {
    id: eventId,
    type: eventType,
    timestamp,
    data,
  };

  console.log(`[Webhook] Disparando evento: ${eventType}`, {
    eventId,
    merchantId,
    data,
  });

  // TODO: Buscar webhooks configurados do banco de dados
  // Por enquanto, apenas log
  console.log('[Webhook] Evento registrado (implementação de envio pendente)');
  
  // Exemplo de como seria a implementação completa:
  // const webhooks = await getWebhooksByMerchantAndEvent(merchantId, eventType);
  // for (const webhook of webhooks) {
  //   if (webhook.active && webhook.events.includes(eventType)) {
  //     await sendWebhook(webhook.url, event, webhook.secret);
  //   }
  // }
}

/**
 * Helpers para eventos específicos
 */
export const webhookHelpers = {
  /**
   * Notifica quando um QR code é escaneado
   */
  async qrScanned(qrId: number, merchantId: number, metadata?: Record<string, any>) {
    await triggerWebhookEvent('qr.scanned', {
      qrId,
      merchantId,
      ...metadata,
    }, merchantId);
  },

  /**
   * Notifica quando um QR code é pago
   */
  async qrPaid(qrId: number, merchantId: number, amount: number, transactionId: number) {
    await triggerWebhookEvent('qr.paid', {
      qrId,
      merchantId,
      amount,
      transactionId,
    }, merchantId);
  },

  /**
   * Notifica quando um pagamento é concluído
   */
  async paymentCompleted(transactionId: number, merchantId: number, amount: number) {
    await triggerWebhookEvent('payment.completed', {
      transactionId,
      merchantId,
      amount,
    }, merchantId);
  },

  /**
   * Notifica quando um pagamento falha
   */
  async paymentFailed(transactionId: number, merchantId: number, reason: string) {
    await triggerWebhookEvent('payment.failed', {
      transactionId,
      merchantId,
      reason,
    }, merchantId);
  },

  /**
   * Notifica quando uma parcela está próxima do vencimento
   */
  async installmentDue(installmentId: number, userId: number, dueDate: Date, amount: number, merchantId: number) {
    await triggerWebhookEvent('installment.due', {
      installmentId,
      userId,
      dueDate: dueDate.toISOString(),
      amount,
    }, merchantId);
  },

  /**
   * Notifica quando uma parcela é paga
   */
  async installmentPaid(installmentId: number, userId: number, amount: number) {
    await triggerWebhookEvent('installment.paid', {
      installmentId,
      userId,
      amount,
    });
  },

  /**
   * Notifica quando uma parcela está atrasada
   */
  async installmentOverdue(installmentId: number, userId: number, daysOverdue: number, amount: number) {
    await triggerWebhookEvent('installment.overdue', {
      installmentId,
      userId,
      daysOverdue,
      amount,
    });
  },

  /**
   * Notifica quando um token é emitido
   */
  async tokenIssued(tokenId: number, userId: number, creditLimit: number) {
    await triggerWebhookEvent('token.issued', {
      tokenId,
      userId,
      creditLimit,
    });
  },

  /**
   * Notifica quando um token é revogado
   */
  async tokenRevoked(tokenId: number, userId: number, reason: string) {
    await triggerWebhookEvent('token.revoked', {
      tokenId,
      userId,
      reason,
    });
  },

  /**
   * Notifica quando uma transação é criada
   */
  async transactionCreated(transactionId: number, merchantId: number, amount: number) {
    await triggerWebhookEvent('transaction.created', {
      transactionId,
      merchantId,
      amount,
    }, merchantId);
  },
};
