import { useMemo } from 'react';
import { Deal, SmartQueueItem, QueueRuleType, QueuePriority } from '@/types';
import { useDeals } from '@/contexts/DealContext';
import { differenceInDays, isToday, isBefore, addDays } from 'date-fns';

const RULE_CONFIG: Record<QueueRuleType, { title: string; priority: QueuePriority }> = {
  offer_followup: { title: 'Offerte opvolgen', priority: 'normal' },
  deposit_overdue: { title: 'Aanbetaling openstaand', priority: 'urgent' },
  test_ride_today: { title: 'Proefrit vandaag', priority: 'urgent' },
  delivery_upcoming: { title: 'Aflevering aanstaand', priority: 'normal' },
  unit_in_stock: { title: 'Unit op voorraad', priority: 'normal' },
  unit_ready: { title: 'Unit klaar, geen afleverdatum', priority: 'urgent' },
  no_activity: { title: 'Geen activiteit', priority: 'normal' },
  first_followup: { title: 'Eerste follow-up na aflevering', priority: 'normal' },
};

function checkOfferFollowup(deal: Deal): SmartQueueItem | null {
  if (deal.phase !== 'lead_verkoop' || deal.substatus !== 'offerte_verstuurd') return null;
  
  const daysSinceActivity = differenceInDays(new Date(), deal.lastActivityAt);
  if (daysSinceActivity < 2) return null;

  return {
    id: `queue-${deal.id}-offer`,
    dealId: deal.id,
    deal,
    ruleType: 'offer_followup',
    priority: 'normal',
    title: RULE_CONFIG.offer_followup.title,
    description: `${deal.customer.firstName} ${deal.customer.lastName} - ${daysSinceActivity} dagen sinds offerte`,
    createdAt: new Date(),
  };
}

function checkDepositOverdue(deal: Deal): SmartQueueItem | null {
  if (deal.phase !== 'betaling' || deal.substatus !== 'aanbetaling_openstaand') return null;
  if (deal.payment.depositPaid) return null;

  const daysSinceCreated = differenceInDays(new Date(), deal.createdAt);
  if (daysSinceCreated < 3) return null;

  return {
    id: `queue-${deal.id}-deposit`,
    dealId: deal.id,
    deal,
    ruleType: 'deposit_overdue',
    priority: 'urgent',
    title: RULE_CONFIG.deposit_overdue.title,
    description: `${deal.customer.firstName} ${deal.customer.lastName} - €${deal.payment.depositAmount.toLocaleString()} openstaand`,
    createdAt: new Date(),
  };
}

function checkTestRideToday(deal: Deal): SmartQueueItem | null {
  if (!deal.testRideDate) return null;
  if (!isToday(deal.testRideDate)) return null;

  return {
    id: `queue-${deal.id}-testride`,
    dealId: deal.id,
    deal,
    ruleType: 'test_ride_today',
    priority: 'urgent',
    title: RULE_CONFIG.test_ride_today.title,
    description: `${deal.customer.firstName} ${deal.customer.lastName} - ${deal.motorcycle.brand} ${deal.motorcycle.model}`,
    dueDate: deal.testRideDate,
    createdAt: new Date(),
  };
}

function checkDeliveryUpcoming(deal: Deal): SmartQueueItem | null {
  if (!deal.deliveryDate) return null;
  if (deal.phase === 'nazorg') return null;

  const daysUntilDelivery = differenceInDays(deal.deliveryDate, new Date());
  if (daysUntilDelivery < 0 || daysUntilDelivery > 7) return null;

  return {
    id: `queue-${deal.id}-delivery`,
    dealId: deal.id,
    deal,
    ruleType: 'delivery_upcoming',
    priority: daysUntilDelivery <= 2 ? 'urgent' : 'normal',
    title: RULE_CONFIG.delivery_upcoming.title,
    description: `${deal.customer.firstName} ${deal.customer.lastName} - over ${daysUntilDelivery} dag(en)`,
    dueDate: deal.deliveryDate,
    createdAt: new Date(),
  };
}

function checkUnitInStock(deal: Deal): SmartQueueItem | null {
  if (deal.phase !== 'logistiek') return null;
  if (deal.substatus !== 'ontvangen_magazijn' && deal.substatus !== 'klaar_voor_werkplaats') return null;

  return {
    id: `queue-${deal.id}-stock`,
    dealId: deal.id,
    deal,
    ruleType: 'unit_in_stock',
    priority: 'normal',
    title: RULE_CONFIG.unit_in_stock.title,
    description: `${deal.motorcycle.brand} ${deal.motorcycle.model} - klaar om naar werkplaats`,
    createdAt: new Date(),
  };
}

function checkUnitReady(deal: Deal): SmartQueueItem | null {
  if (deal.phase !== 'werkplaats' || deal.substatus !== 'klaar_voor_aflevering') return null;
  if (deal.deliveryDate) return null;

  return {
    id: `queue-${deal.id}-ready`,
    dealId: deal.id,
    deal,
    ruleType: 'unit_ready',
    priority: 'urgent',
    title: RULE_CONFIG.unit_ready.title,
    description: `${deal.customer.firstName} ${deal.customer.lastName} - plan aflevering in`,
    createdAt: new Date(),
  };
}

function checkNoActivity(deal: Deal): SmartQueueItem | null {
  if (deal.phase === 'nazorg') return null;
  
  const daysSinceActivity = differenceInDays(new Date(), deal.lastActivityAt);
  if (daysSinceActivity < 3) return null;

  return {
    id: `queue-${deal.id}-inactive`,
    dealId: deal.id,
    deal,
    ruleType: 'no_activity',
    priority: 'normal',
    title: RULE_CONFIG.no_activity.title,
    description: `${deal.customer.firstName} ${deal.customer.lastName} - ${daysSinceActivity} dagen inactief`,
    createdAt: new Date(),
  };
}

function checkFirstFollowup(deal: Deal): SmartQueueItem | null {
  if (deal.phase !== 'nazorg') return null;
  if (deal.substatus !== 'follow_up_gepland') return null;
  if (!deal.deliveryDate) return null;

  const daysSinceDelivery = differenceInDays(new Date(), deal.deliveryDate);
  if (daysSinceDelivery < 7) return null;

  const followUpDate = addDays(deal.deliveryDate, 7);

  return {
    id: `queue-${deal.id}-followup`,
    dealId: deal.id,
    deal,
    ruleType: 'first_followup',
    priority: isBefore(followUpDate, new Date()) ? 'urgent' : 'normal',
    title: RULE_CONFIG.first_followup.title,
    description: `${deal.customer.firstName} ${deal.customer.lastName} - check ervaring`,
    dueDate: followUpDate,
    createdAt: new Date(),
  };
}

export function useSmartQueue() {
  const { deals } = useDeals();

  const queueItems = useMemo(() => {
    const items: SmartQueueItem[] = [];

    for (const deal of deals) {
      const checks = [
        checkOfferFollowup,
        checkDepositOverdue,
        checkTestRideToday,
        checkDeliveryUpcoming,
        checkUnitInStock,
        checkUnitReady,
        checkNoActivity,
        checkFirstFollowup,
      ];

      for (const check of checks) {
        const item = check(deal);
        if (item) items.push(item);
      }
    }

    // Sort by priority (urgent first) then by creation date
    return items.sort((a, b) => {
      if (a.priority === 'urgent' && b.priority !== 'urgent') return -1;
      if (a.priority !== 'urgent' && b.priority === 'urgent') return 1;
      return b.createdAt.getTime() - a.createdAt.getTime();
    });
  }, [deals]);

  const urgentCount = useMemo(() => 
    queueItems.filter(item => item.priority === 'urgent').length
  , [queueItems]);

  return {
    queueItems,
    urgentCount,
    totalCount: queueItems.length,
  };
}
