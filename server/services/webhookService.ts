import { getDb } from "../db";

export type WebhookEventType =
  | "transaction.created"
  | "transaction.completed"
  | "transaction.failed"
  | "installment.due"
  | "installment.paid"
  | "installment.overdue"
  | "fraud.detected"
  | "kyc.approved"
  | "kyc.rejected"
  | "kyb.approved"
  | "kyb.rejected";

export interface WebhookPayload {
  event: WebhookEventType;
  timestamp: Date;
  data: Record<string, any>;
  id: string;
}

export interface WebhookEndpoint {
  id: string;
  merchantId: string;
  url: string;
  events: WebhookEventType[];
  active: boolean;
  secret: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface WebhookDelivery {
  id: string;
  webhookId: string;
  payload: WebhookPayload;
  statusCode?: number;
  response?: string;
  attempts: number;
  nextRetry?: Date;
  status: "pending" | "delivered" | "failed";
  createdAt: Date;
  updatedAt: Date;
}

// Simular armazenamento de webhooks (em produção seria banco de dados)
const webhooks: Map<string, WebhookEndpoint> = new Map();
const deliveries: Map<string, WebhookDelivery> = new Map();

export async function registerWebhook(
  merchantId: string,
  url: string,
  events: WebhookEventType[],
  secret: string
): Promise<WebhookEndpoint> {
  const id = `webhook_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const webhook: WebhookEndpoint = {
    id,
    merchantId,
    url,
    events,
    active: true,
    secret,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  webhooks.set(id, webhook);
  return webhook;
}

export async function getWebhooks(merchantId: string): Promise<WebhookEndpoint[]> {
  return Array.from(webhooks.values()).filter(w => w.merchantId === merchantId);
}

export async function updateWebhook(
  webhookId: string,
  updates: Partial<WebhookEndpoint>
): Promise<WebhookEndpoint | null> {
  const webhook = webhooks.get(webhookId);
  if (!webhook) return null;

  const updated = { ...webhook, ...updates, updatedAt: new Date() };
  webhooks.set(webhookId, updated);
  return updated;
}

export async function deleteWebhook(webhookId: string): Promise<boolean> {
  return webhooks.delete(webhookId);
}

export async function triggerWebhook(
  merchantId: string,
  event: WebhookEventType,
  data: Record<string, any>
): Promise<void> {
  const merchantWebhooks = Array.from(webhooks.values()).filter(
    w => w.merchantId === merchantId && w.active && w.events.includes(event)
  );

  const payload: WebhookPayload = {
    event,
    timestamp: new Date(),
    data,
    id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  };

  for (const webhook of merchantWebhooks) {
    await deliverWebhook(webhook, payload);
  }
}

async function deliverWebhook(
  webhook: WebhookEndpoint,
  payload: WebhookPayload
): Promise<void> {
  const deliveryId = `delivery_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const delivery: WebhookDelivery = {
    id: deliveryId,
    webhookId: webhook.id,
    payload,
    attempts: 0,
    status: "pending",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  deliveries.set(deliveryId, delivery);

  // Tentar entregar com retry automático
  await retryDelivery(delivery, webhook);
}

async function retryDelivery(
  delivery: WebhookDelivery,
  webhook: WebhookEndpoint,
  attempt: number = 1
): Promise<void> {
  const maxAttempts = 5;
  const backoffMs = Math.pow(2, attempt - 1) * 1000; // Exponential backoff

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(webhook.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Webhook-Signature": generateSignature(webhook.secret, delivery.payload),
        "X-Webhook-ID": webhook.id,
        "X-Delivery-ID": delivery.id,
      },
      body: JSON.stringify(delivery.payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    delivery.statusCode = response.status;
    delivery.response = await response.text();
    delivery.attempts = attempt;
    delivery.updatedAt = new Date();

    if (response.ok) {
      delivery.status = "delivered";
    } else if (attempt < maxAttempts) {
      // Retry em caso de erro
      delivery.status = "pending";
      delivery.nextRetry = new Date(Date.now() + backoffMs);
      scheduleRetry(delivery, webhook, attempt + 1);
    } else {
      delivery.status = "failed";
    }

    deliveries.set(delivery.id, delivery);
  } catch (error) {
    delivery.attempts = attempt;
    delivery.updatedAt = new Date();

    if (attempt < maxAttempts) {
      delivery.status = "pending";
      delivery.nextRetry = new Date(Date.now() + backoffMs);
      scheduleRetry(delivery, webhook, attempt + 1);
    } else {
      delivery.status = "failed";
      delivery.response = String(error);
    }

    deliveries.set(delivery.id, delivery);
  }
}

function scheduleRetry(
  delivery: WebhookDelivery,
  webhook: WebhookEndpoint,
  attempt: number
): void {
  const backoffMs = Math.pow(2, attempt - 1) * 1000;
  setTimeout(() => {
    const currentDelivery = deliveries.get(delivery.id);
    if (currentDelivery && currentDelivery.status === "pending") {
      retryDelivery(currentDelivery, webhook, attempt);
    }
  }, backoffMs);
}

function generateSignature(secret: string, payload: WebhookPayload): string {
  const crypto = require("crypto");
  const message = JSON.stringify(payload);
  return crypto.createHmac("sha256", secret).update(message).digest("hex");
}

export async function getWebhookDeliveries(
  webhookId: string,
  limit: number = 50
): Promise<WebhookDelivery[]> {
  return Array.from(deliveries.values())
    .filter(d => d.webhookId === webhookId)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, limit);
}

export async function retryFailedDelivery(deliveryId: string): Promise<boolean> {
  const delivery = deliveries.get(deliveryId);
  if (!delivery) return false;

  const webhook = webhooks.get(delivery.webhookId);
  if (!webhook) return false;

  delivery.status = "pending";
  delivery.attempts = 0;
  delivery.nextRetry = undefined;
  deliveries.set(deliveryId, delivery);

  await retryDelivery(delivery, webhook);
  return true;
}
