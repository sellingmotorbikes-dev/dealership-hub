
# Step 6: Emit Events for External Automation

## Overview
Enhance the event system to be production-ready for n8n webhook integration. The app will emit structured events on key deal lifecycle changes, but will NOT implement email/WhatsApp logic internally (that's n8n's responsibility).

---

## Current State

The codebase already has:
- A basic `emitEvent` function that logs to console
- Events stored in React state via `setEvents`
- `DealEvent` type with 4 event types
- Events emitted for: phase change, substatus change, deposit paid

**What's Missing:**
- No actual webhook dispatch mechanism
- Missing event for "fully paid" payment update
- No delivery date change event
- No deal creation event emission
- No webhook URL configuration
- Event payloads lack full context (customer info, motorcycle details)

---

## Implementation Plan

### 1. Create Event Service
**File:** `src/lib/eventService.ts`

A dedicated service for event handling:

```typescript
interface EventServiceConfig {
  webhookUrl?: string;
  enabled: boolean;
}

interface EnrichedDealEvent {
  type: DealEventType;
  dealId: string;
  dealNumber: string;
  timestamp: string; // ISO format
  payload: {
    // Event-specific data
  };
  context: {
    customer: { id, name, email, phone, preferredChannel };
    motorcycle: { brand, model, year, color };
    payment: { totalPrice, depositPaid, fullyPaid };
    phase: string;
    substatus: string;
  };
}
```

Functions:
- `configureWebhook(url: string)` - Set webhook URL
- `emitDealEvent(event: EnrichedDealEvent)` - Log + dispatch to webhook
- `getEventHistory()` - Return logged events for debugging

### 2. Expand Event Types
**File:** `src/types/index.ts`

Add new event types:
```typescript
export type DealEventType = 
  | 'phase_changed'
  | 'substatus_changed'
  | 'deposit_received'      // Renamed for clarity
  | 'fully_paid'            // NEW
  | 'delivery_scheduled'    // NEW
  | 'deal_created';
```

### 3. Update DealContext
**File:** `src/contexts/DealContext.tsx`

Replace inline `emitEvent` calls with the event service:
- Add event emission to `markFullyPaid` function
- Add event emission to `setDeliveryDate` function
- Enrich all events with full deal context
- Use ISO timestamp format for n8n compatibility

### 4. Webhook Payload Structure
Each event sent to n8n will have this structure:

```json
{
  "type": "phase_changed",
  "dealId": "deal-001",
  "dealNumber": "2024-MR-0001",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "payload": {
    "oldPhase": "lead_verkoop",
    "newPhase": "betaling",
    "oldSubstatus": "deal_gesloten",
    "newSubstatus": "aanbetaling_openstaand"
  },
  "context": {
    "customer": {
      "id": "cust-001",
      "name": "Jan de Vries",
      "email": "jan@example.nl",
      "phone": "+31612345678",
      "preferredChannel": "whatsapp"
    },
    "motorcycle": {
      "brand": "BMW",
      "model": "R 1250 GS",
      "year": 2024,
      "color": "Black"
    },
    "payment": {
      "totalPrice": 21500,
      "depositAmount": 2000,
      "depositPaid": true,
      "remainingAmount": 19500,
      "fullyPaid": false
    },
    "currentPhase": "betaling",
    "currentSubstatus": "aanbetaling_openstaand"
  }
}
```

---

## Event Triggers Summary

| Action | Event Type | Key Payload Data |
|--------|-----------|------------------|
| Drag deal to new column | `phase_changed` | oldPhase, newPhase, newSubstatus |
| Change substatus dropdown | `substatus_changed` | oldSubstatus, newSubstatus |
| Mark deposit paid | `deposit_received` | amount, depositPaidAt |
| Mark fully paid | `fully_paid` | totalAmount, fullyPaidAt |
| Set delivery date | `delivery_scheduled` | deliveryDate, previousDate |
| Create new deal | `deal_created` | Full deal data |

---

## Technical Details

### Webhook Dispatch (Mock for now)
```typescript
async function dispatchToWebhook(event: EnrichedDealEvent): Promise<void> {
  const config = getConfig();
  
  if (!config.enabled || !config.webhookUrl) {
    console.log('[n8n Event - Not Dispatched]', event);
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
```

### Files Changed

| File | Change |
|------|--------|
| `src/lib/eventService.ts` | NEW - Event dispatch service |
| `src/types/index.ts` | Update DealEventType, add EnrichedDealEvent |
| `src/contexts/DealContext.tsx` | Use event service, add missing events |

---

## What This Does NOT Include
Per requirements:
- No email sending logic
- No WhatsApp sending logic
- No SMS logic

These are handled by n8n workflows that consume the webhook events.
