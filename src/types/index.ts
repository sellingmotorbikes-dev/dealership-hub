// User & Authentication Types
export type UserRole = 'sales' | 'administration' | 'workshop' | 'manager';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

// Deal Phase & Substatus Types
export type DealPhase = 
  | 'lead_verkoop'      // Lead & Sales
  | 'betaling'          // Payment
  | 'logistiek'         // Logistics
  | 'werkplaats'        // Workshop
  | 'aflevering'        // Delivery
  | 'nazorg';           // After-care

export const DEAL_PHASES: { id: DealPhase; label: string; labelNL: string }[] = [
  { id: 'lead_verkoop', label: 'Lead & Sales', labelNL: 'Lead & Verkoop' },
  { id: 'betaling', label: 'Payment', labelNL: 'Betaling' },
  { id: 'logistiek', label: 'Logistics', labelNL: 'Logistiek' },
  { id: 'werkplaats', label: 'Workshop', labelNL: 'Werkplaats' },
  { id: 'aflevering', label: 'Delivery', labelNL: 'Aflevering' },
  { id: 'nazorg', label: 'After-care', labelNL: 'Nazorg' },
];

export type LeadVerkoopSubstatus = 
  | 'nieuw_lead'
  | 'contact_gemaakt'
  | 'proefrit_gepland'
  | 'offerte_verstuurd'
  | 'deal_gesloten';

export type BetalingSubstatus = 
  | 'aanbetaling_openstaand'
  | 'aanbetaling_ontvangen'
  | 'financiering_aangevraagd'
  | 'financiering_goedgekeurd'
  | 'volledig_betaald';

export type LogistiekSubstatus = 
  | 'bestelling_geplaatst'
  | 'in_transport'
  | 'ontvangen_magazijn'
  | 'klaar_voor_werkplaats';

export type WerkplaatsSubstatus = 
  | 'wacht_op_unit'
  | 'voorbereiding_gestart'
  | 'accessoires_monteren'
  | 'kwaliteitscontrole'
  | 'klaar_voor_aflevering';

export type AfleveringSubstatus = 
  | 'planning_aflevering'
  | 'klant_gecontacteerd'
  | 'aflevering_bevestigd'
  | 'afgeleverd';

export type NazorgSubstatus = 
  | 'follow_up_gepland'
  | 'follow_up_gedaan'
  | 'review_gevraagd'
  | 'afgerond';

export type DealSubstatus = 
  | LeadVerkoopSubstatus 
  | BetalingSubstatus 
  | LogistiekSubstatus 
  | WerkplaatsSubstatus 
  | AfleveringSubstatus 
  | NazorgSubstatus;

export const SUBSTATUS_OPTIONS: Record<DealPhase, { id: DealSubstatus; label: string }[]> = {
  lead_verkoop: [
    { id: 'nieuw_lead', label: 'Nieuw Lead' },
    { id: 'contact_gemaakt', label: 'Contact Gemaakt' },
    { id: 'proefrit_gepland', label: 'Proefrit Gepland' },
    { id: 'offerte_verstuurd', label: 'Offerte Verstuurd' },
    { id: 'deal_gesloten', label: 'Deal Gesloten' },
  ],
  betaling: [
    { id: 'aanbetaling_openstaand', label: 'Aanbetaling Openstaand' },
    { id: 'aanbetaling_ontvangen', label: 'Aanbetaling Ontvangen' },
    { id: 'financiering_aangevraagd', label: 'Financiering Aangevraagd' },
    { id: 'financiering_goedgekeurd', label: 'Financiering Goedgekeurd' },
    { id: 'volledig_betaald', label: 'Volledig Betaald' },
  ],
  logistiek: [
    { id: 'bestelling_geplaatst', label: 'Bestelling Geplaatst' },
    { id: 'in_transport', label: 'In Transport' },
    { id: 'ontvangen_magazijn', label: 'Ontvangen in Magazijn' },
    { id: 'klaar_voor_werkplaats', label: 'Klaar voor Werkplaats' },
  ],
  werkplaats: [
    { id: 'wacht_op_unit', label: 'Wacht op Unit' },
    { id: 'voorbereiding_gestart', label: 'Voorbereiding Gestart' },
    { id: 'accessoires_monteren', label: 'Accessoires Monteren' },
    { id: 'kwaliteitscontrole', label: 'Kwaliteitscontrole' },
    { id: 'klaar_voor_aflevering', label: 'Klaar voor Aflevering' },
  ],
  aflevering: [
    { id: 'planning_aflevering', label: 'Planning Aflevering' },
    { id: 'klant_gecontacteerd', label: 'Klant Gecontacteerd' },
    { id: 'aflevering_bevestigd', label: 'Aflevering Bevestigd' },
    { id: 'afgeleverd', label: 'Afgeleverd' },
  ],
  nazorg: [
    { id: 'follow_up_gepland', label: 'Follow-up Gepland' },
    { id: 'follow_up_gedaan', label: 'Follow-up Gedaan' },
    { id: 'review_gevraagd', label: 'Review Gevraagd' },
    { id: 'afgerond', label: 'Afgerond' },
  ],
};

// Motorcycle Types
export interface Motorcycle {
  id: string;
  brand: string;
  model: string;
  year: number;
  color: string;
  vin?: string;
  stockLocation?: string;
  isNewUnit: boolean;
}

// Customer Types
export type ContactChannel = 'email' | 'phone' | 'whatsapp';

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  whatsappOptIn: boolean;
  preferredChannel: ContactChannel;
  address?: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  createdAt: Date;
  notes?: string;
}

// Payment Types
export interface Payment {
  depositAmount: number;
  depositPaid: boolean;
  depositPaidAt?: Date;
  totalPrice: number;
  remainingAmount: number;
  financingRequested: boolean;
  financingApproved?: boolean;
  fullyPaid: boolean;
  fullyPaidAt?: Date;
}

// Activity Log Types
export type ActivityType = 
  | 'phase_change'
  | 'substatus_change'
  | 'payment_received'
  | 'note_added'
  | 'test_ride'
  | 'delivery_scheduled'
  | 'customer_contact';

export interface ActivityLog {
  id: string;
  dealId: string;
  type: ActivityType;
  description: string;
  createdAt: Date;
  createdBy: string;
  metadata?: Record<string, unknown>;
}

// Deal Types
export interface Deal {
  id: string;
  dealNumber: string;
  customer: Customer;
  motorcycle: Motorcycle;
  phase: DealPhase;
  substatus: DealSubstatus;
  payment: Payment;
  testRideDate?: Date;
  deliveryDate?: Date;
  assignedTo: string;
  createdAt: Date;
  updatedAt: Date;
  lastActivityAt: Date;
  activities: ActivityLog[];
}

// Smart Queue Types
export type QueueRuleType = 
  | 'offer_followup'          // No activity 2 days after quote sent
  | 'deposit_overdue'         // Deposit payment overdue
  | 'test_ride_today'         // Test ride scheduled for today
  | 'delivery_upcoming'       // Delivery within 7 days
  | 'unit_in_stock'           // Unit in stock but not started
  | 'unit_ready'              // Unit ready but delivery not planned
  | 'no_activity'             // No activity for 3 days
  | 'first_followup';         // 7 days after delivery

export type QueuePriority = 'urgent' | 'normal';

export interface SmartQueueItem {
  id: string;
  dealId: string;
  deal: Deal;
  ruleType: QueueRuleType;
  priority: QueuePriority;
  title: string;
  description: string;
  dueDate?: Date;
  createdAt: Date;
}

// Event Types (for n8n integration)
export interface DealEvent {
  type: 'phase_changed' | 'substatus_changed' | 'payment_received' | 'deal_created';
  dealId: string;
  timestamp: Date;
  payload: Record<string, unknown>;
}
