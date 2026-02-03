import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { Deal, DealPhase, DealSubstatus, ActivityLog, DealEvent } from '@/types';
import { mockDeals } from '@/data/mockData';
import { emitDealEvent, EnrichedDealEvent, getEventHistory } from '@/lib/eventService';

interface DealContextType {
  deals: Deal[];
  getDeal: (id: string) => Deal | undefined;
  updateDealPhase: (dealId: string, newPhase: DealPhase, newSubstatus: DealSubstatus) => void;
  updateDealSubstatus: (dealId: string, newSubstatus: DealSubstatus) => void;
  addActivity: (dealId: string, activity: Omit<ActivityLog, 'id' | 'dealId' | 'createdAt'>) => void;
  markDepositPaid: (dealId: string) => void;
  markFullyPaid: (dealId: string) => void;
  setDeliveryDate: (dealId: string, date: Date) => void;
  events: DealEvent[];
  enrichedEvents: EnrichedDealEvent[];
}

const DealContext = createContext<DealContextType | undefined>(undefined);

export function DealProvider({ children }: { children: ReactNode }) {
  const [deals, setDeals] = useState<Deal[]>(mockDeals);
  const [events, setEvents] = useState<DealEvent[]>([]);

  const getDeal = useCallback((id: string) => {
    return deals.find(d => d.id === id);
  }, [deals]);

  const updateDealPhase = useCallback((dealId: string, newPhase: DealPhase, newSubstatus: DealSubstatus) => {
    setDeals(prev => prev.map(deal => {
      if (deal.id !== dealId) return deal;
      
      const activity: ActivityLog = {
        id: `act-${Date.now()}`,
        dealId,
        type: 'phase_change',
        description: `Fase gewijzigd naar ${newPhase}`,
        createdAt: new Date(),
        createdBy: 'Systeem',
      };

      // Legacy event for backward compatibility
      const event: DealEvent = {
        type: 'phase_changed',
        dealId,
        timestamp: new Date(),
        payload: { oldPhase: deal.phase, newPhase, newSubstatus },
      };
      setEvents(prev => [...prev, event]);

      // Create updated deal for enriched event
      const updatedDeal: Deal = {
        ...deal,
        phase: newPhase,
        substatus: newSubstatus,
        updatedAt: new Date(),
        lastActivityAt: new Date(),
        activities: [activity, ...deal.activities],
      };

      // Emit enriched event for n8n
      emitDealEvent('phase_changed', updatedDeal, {
        oldPhase: deal.phase,
        newPhase,
        oldSubstatus: deal.substatus,
        newSubstatus,
      });

      return updatedDeal;
    }));
  }, []);

  const updateDealSubstatus = useCallback((dealId: string, newSubstatus: DealSubstatus) => {
    setDeals(prev => prev.map(deal => {
      if (deal.id !== dealId) return deal;

      const activity: ActivityLog = {
        id: `act-${Date.now()}`,
        dealId,
        type: 'substatus_change',
        description: `Status gewijzigd naar ${newSubstatus}`,
        createdAt: new Date(),
        createdBy: 'Systeem',
      };

      // Legacy event for backward compatibility
      const event: DealEvent = {
        type: 'substatus_changed',
        dealId,
        timestamp: new Date(),
        payload: { oldSubstatus: deal.substatus, newSubstatus },
      };
      setEvents(prev => [...prev, event]);

      // Create updated deal for enriched event
      const updatedDeal: Deal = {
        ...deal,
        substatus: newSubstatus,
        updatedAt: new Date(),
        lastActivityAt: new Date(),
        activities: [activity, ...deal.activities],
      };

      // Emit enriched event for n8n
      emitDealEvent('substatus_changed', updatedDeal, {
        oldSubstatus: deal.substatus,
        newSubstatus,
      });

      return updatedDeal;
    }));
  }, []);

  const addActivity = useCallback((dealId: string, activityData: Omit<ActivityLog, 'id' | 'dealId' | 'createdAt'>) => {
    setDeals(prev => prev.map(deal => {
      if (deal.id !== dealId) return deal;

      const activity: ActivityLog = {
        id: `act-${Date.now()}`,
        dealId,
        createdAt: new Date(),
        ...activityData,
      };

      return {
        ...deal,
        updatedAt: new Date(),
        lastActivityAt: new Date(),
        activities: [activity, ...deal.activities],
      };
    }));
  }, []);

  const markDepositPaid = useCallback((dealId: string) => {
    setDeals(prev => prev.map(deal => {
      if (deal.id !== dealId) return deal;

      const depositPaidAt = new Date();
      
      const activity: ActivityLog = {
        id: `act-${Date.now()}`,
        dealId,
        type: 'payment_received',
        description: `Aanbetaling van €${deal.payment.depositAmount.toLocaleString()} ontvangen`,
        createdAt: new Date(),
        createdBy: 'Systeem',
      };

      // Legacy event for backward compatibility
      const event: DealEvent = {
        type: 'payment_received',
        dealId,
        timestamp: new Date(),
        payload: { type: 'deposit', amount: deal.payment.depositAmount },
      };
      setEvents(prev => [...prev, event]);

      // Create updated deal for enriched event
      const updatedDeal: Deal = {
        ...deal,
        payment: {
          ...deal.payment,
          depositPaid: true,
          depositPaidAt,
          remainingAmount: deal.payment.totalPrice - deal.payment.depositAmount,
        },
        updatedAt: new Date(),
        lastActivityAt: new Date(),
        activities: [activity, ...deal.activities],
      };

      // Emit enriched event for n8n
      emitDealEvent('deposit_received', updatedDeal, {
        amount: deal.payment.depositAmount,
        depositPaidAt: depositPaidAt.toISOString(),
      });

      return updatedDeal;
    }));
  }, []);

  const markFullyPaid = useCallback((dealId: string) => {
    setDeals(prev => prev.map(deal => {
      if (deal.id !== dealId) return deal;

      const fullyPaidAt = new Date();
      
      const activity: ActivityLog = {
        id: `act-${Date.now()}`,
        dealId,
        type: 'payment_received',
        description: 'Volledige betaling ontvangen',
        createdAt: new Date(),
        createdBy: 'Systeem',
      };

      // Create updated deal for enriched event
      const updatedDeal: Deal = {
        ...deal,
        payment: {
          ...deal.payment,
          fullyPaid: true,
          fullyPaidAt,
          remainingAmount: 0,
        },
        updatedAt: new Date(),
        lastActivityAt: new Date(),
        activities: [activity, ...deal.activities],
      };

      // Emit enriched event for n8n
      emitDealEvent('fully_paid', updatedDeal, {
        totalAmount: deal.payment.totalPrice,
        fullyPaidAt: fullyPaidAt.toISOString(),
      });

      return updatedDeal;
    }));
  }, []);

  const setDeliveryDate = useCallback((dealId: string, date: Date) => {
    setDeals(prev => prev.map(deal => {
      if (deal.id !== dealId) return deal;

      const previousDate = deal.deliveryDate;
      
      const activity: ActivityLog = {
        id: `act-${Date.now()}`,
        dealId,
        type: 'delivery_scheduled',
        description: `Aflevering gepland voor ${date.toLocaleDateString('nl-NL')}`,
        createdAt: new Date(),
        createdBy: 'Systeem',
      };

      // Create updated deal for enriched event
      const updatedDeal: Deal = {
        ...deal,
        deliveryDate: date,
        updatedAt: new Date(),
        lastActivityAt: new Date(),
        activities: [activity, ...deal.activities],
      };

      // Emit enriched event for n8n
      emitDealEvent('delivery_scheduled', updatedDeal, {
        deliveryDate: date.toISOString(),
        previousDate: previousDate?.toISOString() ?? null,
      });

      return updatedDeal;
    }));
  }, []);

  return (
    <DealContext.Provider
      value={{
        deals,
        getDeal,
        updateDealPhase,
        updateDealSubstatus,
        addActivity,
        markDepositPaid,
        markFullyPaid,
        setDeliveryDate,
        events,
        enrichedEvents: getEventHistory(),
      }}
    >
      {children}
    </DealContext.Provider>
  );
}

export function useDeals() {
  const context = useContext(DealContext);
  if (context === undefined) {
    throw new Error('useDeals must be used within a DealProvider');
  }
  return context;
}
