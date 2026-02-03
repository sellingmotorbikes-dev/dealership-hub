import { Deal, DealPhase, DealSubstatus } from '@/types';

// Event types for n8n integration
export type DealEventType = 
  | 'phase_changed'
  | 'substatus_changed'
  | 'deposit_received'
  | 'fully_paid'
  | 'delivery_scheduled'
  | 'deal_created';

// Enriched event structure for n8n webhooks
export interface EnrichedDealEvent {
  type: DealEventType;
  dealId: string;
  dealNumber: string;
  timestamp: string; // ISO format
  payload: Record<string, unknown>;
  context: {
    customer: {
      id: string;
      name: string;
      email: string;
      phone: string;
      preferredChannel: string;
    };
    motorcycle: {
      brand: string;
      model: string;
      year: number;
      color: string;
    };
    payment: {
      totalPrice: number;
      depositAmount: number;
      depositPaid: boolean;
      remainingAmount: number;
      fullyPaid: boolean;
    };
    currentPhase: DealPhase;
    currentSubstatus: DealSubstatus;
  };
}

// Service configuration
interface EventServiceConfig {
  webhookUrl?: string;
  enabled: boolean;
}

let config: EventServiceConfig = {
  webhookUrl: undefined,
  enabled: false,
};

const eventHistory: EnrichedDealEvent[] = [];

// Configure webhook URL
export function configureWebhook(url: string): void {
  config = {
    webhookUrl: url,
    enabled: true,
  };
  console.log('[n8n] Webhook configured:', url);
}

// Disable webhook dispatch
export function disableWebhook(): void {
  config.enabled = false;
  console.log('[n8n] Webhook disabled');
}

// Get current configuration
export function getConfig(): EventServiceConfig {
  return { ...config };
}

// Get event history for debugging
export function getEventHistory(): EnrichedDealEvent[] {
  return [...eventHistory];
}

// Clear event history
export function clearEventHistory(): void {
  eventHistory.length = 0;
}

// Build enriched context from a deal
export function buildEventContext(deal: Deal): EnrichedDealEvent['context'] {
  return {
    customer: {
      id: deal.customer.id,
      name: `${deal.customer.firstName} ${deal.customer.lastName}`,
      email: deal.customer.email,
      phone: deal.customer.phone,
      preferredChannel: deal.customer.preferredChannel,
    },
    motorcycle: {
      brand: deal.motorcycle.brand,
      model: deal.motorcycle.model,
      year: deal.motorcycle.year,
      color: deal.motorcycle.color,
    },
    payment: {
      totalPrice: deal.payment.totalPrice,
      depositAmount: deal.payment.depositAmount,
      depositPaid: deal.payment.depositPaid,
      remainingAmount: deal.payment.remainingAmount,
      fullyPaid: deal.payment.fullyPaid,
    },
    currentPhase: deal.phase,
    currentSubstatus: deal.substatus,
  };
}

// Dispatch event to webhook
async function dispatchToWebhook(event: EnrichedDealEvent): Promise<void> {
  if (!config.enabled || !config.webhookUrl) {
    console.log('[n8n Event - Not Dispatched]', event.type, event.dealId);
    return;
  }

  try {
    await fetch(config.webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      mode: 'no-cors', // For cross-origin webhooks
      body: JSON.stringify(event),
    });
    console.log('[n8n Event - Dispatched]', event.type, event.dealId);
  } catch (error) {
    console.error('[n8n Event - Failed]', error);
    // Don't throw - webhook failures shouldn't block the UI
  }
}

// Main event emission function
export async function emitDealEvent(
  type: DealEventType,
  deal: Deal,
  payload: Record<string, unknown>
): Promise<void> {
  const event: EnrichedDealEvent = {
    type,
    dealId: deal.id,
    dealNumber: deal.dealNumber,
    timestamp: new Date().toISOString(),
    payload,
    context: buildEventContext(deal),
  };

  // Always log to console for debugging
  console.log('[n8n Event]', event);

  // Store in history
  eventHistory.push(event);

  // Dispatch to webhook if configured
  await dispatchToWebhook(event);
}
