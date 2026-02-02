import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useDeals } from '@/contexts/DealContext';
import { useMemo } from 'react';
import { isToday, isTomorrow, addDays, isBefore, isAfter } from 'date-fns';
import { Calendar, Bike, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function TodayActivities() {
  const { deals } = useDeals();
  const navigate = useNavigate();

  const activities = useMemo(() => {
    const items: { id: string; dealId: string; type: string; label: string; icon: React.ReactNode; priority: 'high' | 'medium' | 'low' }[] = [];

    for (const deal of deals) {
      // Test rides today
      if (deal.testRideDate && isToday(deal.testRideDate)) {
        items.push({
          id: `testride-${deal.id}`,
          dealId: deal.id,
          type: 'Proefrit',
          label: `${deal.customer.firstName} ${deal.customer.lastName} - ${deal.motorcycle.brand} ${deal.motorcycle.model}`,
          icon: <Bike className="h-4 w-4" />,
          priority: 'high',
        });
      }

      // Deliveries today or tomorrow
      if (deal.deliveryDate && (isToday(deal.deliveryDate) || isTomorrow(deal.deliveryDate))) {
        items.push({
          id: `delivery-${deal.id}`,
          dealId: deal.id,
          type: isToday(deal.deliveryDate) ? 'Aflevering vandaag' : 'Aflevering morgen',
          label: `${deal.customer.firstName} ${deal.customer.lastName} - ${deal.motorcycle.brand}`,
          icon: <Calendar className="h-4 w-4" />,
          priority: isToday(deal.deliveryDate) ? 'high' : 'medium',
        });
      }

      // Overdue deposits
      if (deal.phase === 'betaling' && !deal.payment.depositPaid) {
        const daysSinceCreated = Math.floor((Date.now() - deal.createdAt.getTime()) / (1000 * 60 * 60 * 24));
        if (daysSinceCreated >= 3) {
          items.push({
            id: `deposit-${deal.id}`,
            dealId: deal.id,
            type: 'Aanbetaling openstaand',
            label: `${deal.customer.firstName} ${deal.customer.lastName} - €${deal.payment.depositAmount.toLocaleString()}`,
            icon: <CreditCard className="h-4 w-4" />,
            priority: 'high',
          });
        }
      }
    }

    return items.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }, [deals]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vandaag & Morgen</CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">
            Geen activiteiten gepland
          </p>
        ) : (
          <div className="space-y-3">
            {activities.slice(0, 5).map((activity) => (
              <div
                key={activity.id}
                className="flex items-center gap-3 rounded-lg border p-3 hover:bg-accent cursor-pointer transition-colors"
                onClick={() => navigate(`/deals/${activity.dealId}`)}
              >
                <div className="text-muted-foreground">
                  {activity.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <Badge
                    variant={activity.priority === 'high' ? 'destructive' : 'secondary'}
                    className="text-xs"
                  >
                    {activity.type}
                  </Badge>
                  <p className="mt-1 text-sm truncate">{activity.label}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
