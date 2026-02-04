
# Setting Up n8n Workflows for Deal Events

## Overview
This guide covers two parts:
1. Creating n8n workflows that respond to your deal events
2. Configuring your app to send events to n8n

---

## Part 1: Create n8n Workflows

You'll need to create these workflows in your n8n interface. Here are step-by-step instructions for each:

### Workflow 1: Deal Phase Changed Notification

**Purpose**: Notify team when a deal moves to a new phase

**Steps in n8n**:
1. Add a **Webhook** trigger node
   - Set HTTP Method to `POST`
   - Copy the webhook URL (you'll need this later)

2. Add an **IF** node to filter by event type
   - Condition: `{{ $json.type }}` equals `phase_changed`

3. Add a **Switch** node to route by new phase
   - Route based on `{{ $json.payload.newPhase }}`
   - Create branches for: `betaling`, `logistiek`, `werkplaats`, `aflevering`, `nazorg`

4. Add notification nodes per branch (Email, Slack, or other):
   - **betaling**: Notify administration team
   - **werkplaats**: Notify workshop team
   - **aflevering**: Notify delivery coordinator

**Example email template**:
```
Subject: Deal {{ $json.dealNumber }} moved to {{ $json.payload.newPhase }}

Customer: {{ $json.context.customer.name }}
Motorcycle: {{ $json.context.motorcycle.brand }} {{ $json.context.motorcycle.model }}
Previous Phase: {{ $json.payload.oldPhase }}
New Phase: {{ $json.payload.newPhase }}
```

---

### Workflow 2: Payment Confirmation

**Purpose**: Send confirmation to customer when payments are received

**Steps in n8n**:
1. Add a **Webhook** trigger node (POST)

2. Add an **IF** node
   - Condition: `{{ $json.type }}` equals `deposit_received` OR `fully_paid`

3. Add a **Switch** node for payment type
   - Branch 1: `deposit_received`
   - Branch 2: `fully_paid`

4. For each branch, add communication based on customer preference:
   - Check `{{ $json.context.customer.preferredChannel }}`
   - If `whatsapp`: Use WhatsApp Business node
   - If `email`: Use Email node

**Deposit received template**:
```
Beste {{ $json.context.customer.name }},

Bedankt voor uw aanbetaling van €{{ $json.payload.amount }}.

Uw bestelling:
{{ $json.context.motorcycle.brand }} {{ $json.context.motorcycle.model }} ({{ $json.context.motorcycle.year }})

Resterend bedrag: €{{ $json.context.payment.remainingAmount }}

Met vriendelijke groet,
[Your Company]
```

**Fully paid template**:
```
Beste {{ $json.context.customer.name }},

Wij hebben uw volledige betaling van €{{ $json.payload.totalAmount }} ontvangen.

Uw {{ $json.context.motorcycle.brand }} {{ $json.context.motorcycle.model }} wordt nu klaargemaakt voor levering.

Met vriendelijke groet,
[Your Company]
```

---

### Workflow 3: Delivery Reminder

**Purpose**: Send reminder to customer when delivery is scheduled

**Steps in n8n**:
1. Add a **Webhook** trigger node (POST)

2. Add an **IF** node
   - Condition: `{{ $json.type }}` equals `delivery_scheduled`

3. Add a **Date & Time** node to format the delivery date
   - Input: `{{ $json.payload.deliveryDate }}`
   - Format: Dutch locale

4. Add Email/WhatsApp node based on `preferredChannel`

**Template**:
```
Beste {{ $json.context.customer.name }},

Uw aflevering is gepland!

Datum: [formatted date]
Motor: {{ $json.context.motorcycle.brand }} {{ $json.context.motorcycle.model }}

Wij kijken ernaar uit u te verwelkomen.

Met vriendelijke groet,
[Your Company]
```

---

### Workflow 4: Combined Event Router (Recommended)

Instead of separate workflows, you can create ONE workflow that handles all events:

1. **Webhook** trigger (POST) - Single entry point

2. **Switch** node on `{{ $json.type }}`
   - Branches: `phase_changed`, `substatus_changed`, `deposit_received`, `fully_paid`, `delivery_scheduled`, `deal_created`

3. Each branch leads to its specific logic

**Advantage**: Single webhook URL to configure in your app

---

## Part 2: Configure Your App

Once you have your webhook URL from n8n, you need to add it to your app.

### Option A: Add a Settings Page (Recommended)

I can create a settings page where you can enter and save your webhook URL. This would:
- Store the URL in localStorage
- Call `configureWebhook(url)` on app load
- Allow you to test the connection

### Option B: Hardcode for Now (Quick Start)

For testing, you can add the webhook URL directly in your code.

---

## Quick Start Steps

1. **In n8n**: Create a new workflow with a Webhook trigger node
2. **In n8n**: Copy the Production webhook URL
3. **In n8n**: Make sure "Available in MCP" is enabled in workflow settings
4. **In your app**: We'll add a way to configure this URL
5. **Test**: Change a deal's phase and watch for events in n8n

---

## Next Steps After Approval

If you approve this plan, I will:
1. Create a simple Settings page with webhook URL configuration
2. Add a "Test Event" button to verify the connection
3. Persist the webhook URL in localStorage

This way you can easily connect your app to n8n without code changes.
