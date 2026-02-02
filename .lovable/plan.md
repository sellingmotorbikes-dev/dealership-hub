

# Motorcycle Dealership Management App

## Overview
An internal B2B web application to manage the complete sales process for motorcycle deals. The app replaces Zapier-based boards and is designed for automation via n8n webhooks.

---

## Core Features

### 1. Authentication & Role-Based Access
- Login system with 4 roles: **Sales**, **Administration**, **Workshop**, **Manager**
- Role-based navigation showing relevant features per user type
- Basic role separation (full permissions enforcement deferred to v2)

### 2. Dashboard (Combined Overview)
- **Smart Queue widget** — Top priority: shows items needing immediate attention
- **Pipeline summary** — Deal counts per phase with quick stats
- **Today's activities** — Test rides, deliveries, overdue payments
- **Recent activity feed** — Latest updates across all deals

### 3. Deal Management (Kanban Board)
- **6 Kanban columns** representing phases:
  1. Lead & Verkoop (Lead & Sales)
  2. Betaling (Payment)
  3. Logistiek (Logistics)
  4. Werkplaats (Workshop)
  5. Aflevering (Delivery)
  6. Nazorg (After-care)
- **Drag-and-drop** to change deal phase
- **Deal cards** showing customer name, motorcycle, total price, and substatus badge
- **Click to open** deal detail page

### 4. Deal Detail Page
- Full deal information with customer details
- **Substatus dropdown** — Change the exact step within a phase
- **Payment tracking** — Deposit and remaining amount status
- **Key dates** — Test ride date, delivery date
- **Activity log** — Timeline of all changes and events
- **Quick actions** — Mark deposit paid, schedule delivery, etc.

### 5. Smart Queue (Primary Work Tool)
- Automatically generated task list based on 8 rules:
  - Offer follow-up (no activity for 2 days after quote sent)
  - Deposit overdue
  - Test ride today
  - Delivery upcoming (within 7 days)
  - Unit in stock but not started
  - Unit ready but delivery not planned
  - No activity for 3 days
  - First follow-up (7 days after delivery)
- **Priority badges** — Urgent vs Normal items
- **Due dates** and countdown indicators
- Items auto-remove when conditions are resolved

### 6. Customer Management (CRM Lite)
- Customer list with search and filters
- Customer detail page with contact info
- Link to all associated deals
- Contact preferences (WhatsApp opt-in, preferred channel)

### 7. Activity Logging
- Automatic logging of all phase/substatus changes
- Manual activity notes option
- Event emission hooks (ready for n8n integration)

---

## Technical Approach

### Mock Data Architecture
- TypeScript interfaces matching the data models (Deal, Customer, Payment, SmartQueueItem, ActivityLog)
- Mock data service with realistic Dutch motorcycle dealership data
- State management that simulates database behavior
- Easy migration path to Supabase when ready

### Component Structure
- Reuse existing UI components (Cards, Badges, Tables, Forms)
- Kanban board with drag-and-drop (using a lightweight library)
- Hybrid design: data tables + visual cards

### n8n-Ready Events
- Event emitter pattern for phase/substatus changes
- Webhook payload structure defined (ready for future integration)

---

## Screen Summary

| Screen | Purpose |
|--------|---------|
| `/` | Dashboard with Smart Queue + Pipeline Overview |
| `/deals` | Kanban board view of all deals |
| `/deals/:id` | Deal detail page |
| `/queue` | Full Smart Queue list |
| `/customers` | Customer list and management |
| `/customers/:id` | Customer detail with linked deals |
| `/auth` | Login page |

---

## What's NOT Included (Per Knowledge File)
- No customer-facing portal
- No advanced reporting in v1
- No financial accounting
- No email/WhatsApp sending (handled by n8n)

