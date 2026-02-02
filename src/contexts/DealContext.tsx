import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { Deal, DealPhase, DealSubstatus, ActivityLog, DealEvent } from '@/types';
import { mockDeals } from '@/data/mockData';

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
}

const DealContext = createContext<DealContextType | undefined>(undefined);

// Event emitter for n8n integration
const emitEvent = (event: DealEvent) => {
  console.log('[n8n Event]', event);
  // In production, this would send to n8n webhook
};

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

      const event: DealEvent = {
        type: 'phase_changed',
        dealId,
        timestamp: new Date(),
        payload: { oldPhase: deal.phase, newPhase, newSubstatus },
      };
      emitEvent(event);
      setEvents(prev => [...prev, event]);

      return {
        ...deal,
        phase: newPhase,
        substatus: newSubstatus,
        updatedAt: new Date(),
        lastActivityAt: new Date(),
        activities: [activity, ...deal.activities],
      };
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

      const event: DealEvent = {
        type: 'substatus_changed',
        dealId,
        timestamp: new Date(),
        payload: { oldSubstatus: deal.substatus, newSubstatus },
      };
      emitEvent(event);
      setEvents(prev => [...prev, event]);

      return {
        ...deal,
        substatus: newSubstatus,
        updatedAt: new Date(),
        lastActivityAt: new Date(),
        activities: [activity, ...deal.activities],
      };
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

      const activity: ActivityLog = {
        id: `act-${Date.now()}`,
        dealId,
        type: 'payment_received',
        description: `Aanbetaling van €${deal.payment.depositAmount.toLocaleString()} ontvangen`,
        createdAt: new Date(),
        createdBy: 'Systeem',
      };

      const event: DealEvent = {
        type: 'payment_received',
        dealId,
        timestamp: new Date(),
        payload: { type: 'deposit', amount: deal.payment.depositAmount },
      };
      emitEvent(event);
      setEvents(prev => [...prev, event]);

      return {
        ...deal,
        payment: {
          ...deal.payment,
          depositPaid: true,
          depositPaidAt: new Date(),
          remainingAmount: deal.payment.totalPrice - deal.payment.depositAmount,
        },
        updatedAt: new Date(),
        lastActivityAt: new Date(),
        activities: [activity, ...deal.activities],
      };
    }));
  }, []);

  const markFullyPaid = useCallback((dealId: string) => {
    setDeals(prev => prev.map(deal => {
      if (deal.id !== dealId) return deal;

      const activity: ActivityLog = {
        id: `act-${Date.now()}`,
        dealId,
        type: 'payment_received',
        description: 'Volledige betaling ontvangen',
        createdAt: new Date(),
        createdBy: 'Systeem',
      };

      return {
        ...deal,
        payment: {
          ...deal.payment,
          fullyPaid: true,
          fullyPaidAt: new Date(),
          remainingAmount: 0,
        },
        updatedAt: new Date(),
        lastActivityAt: new Date(),
        activities: [activity, ...deal.activities],
      };
    }));
  }, []);

  const setDeliveryDate = useCallback((dealId: string, date: Date) => {
    setDeals(prev => prev.map(deal => {
      if (deal.id !== dealId) return deal;

      const activity: ActivityLog = {
        id: `act-${Date.now()}`,
        dealId,
        type: 'delivery_scheduled',
        description: `Aflevering gepland voor ${date.toLocaleDateString('nl-NL')}`,
        createdAt: new Date(),
        createdBy: 'Systeem',
      };

      return {
        ...deal,
        deliveryDate: date,
        updatedAt: new Date(),
        lastActivityAt: new Date(),
        activities: [activity, ...deal.activities],
      };
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
