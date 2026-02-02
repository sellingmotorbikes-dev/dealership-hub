import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDeals } from '@/contexts/DealContext';
import { useMemo } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { nl } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

export function RecentActivity() {
  const { deals } = useDeals();
  const navigate = useNavigate();

  const recentActivities = useMemo(() => {
    const allActivities = deals.flatMap((deal) =>
      deal.activities.map((activity) => ({
        ...activity,
        deal,
      }))
    );

    return allActivities
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 8);
  }, [deals]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recente Activiteit</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentActivities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start gap-3 cursor-pointer hover:bg-accent rounded-lg p-2 -mx-2 transition-colors"
              onClick={() => navigate(`/deals/${activity.dealId}`)}
            >
              <div className="mt-1 h-2 w-2 rounded-full bg-primary flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm">{activity.description}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-muted-foreground">
                    {activity.deal.customer.firstName} {activity.deal.customer.lastName}
                  </span>
                  <span className="text-xs text-muted-foreground">•</span>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(activity.createdAt, { addSuffix: true, locale: nl })}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
