import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useSmartQueue } from '@/hooks/useSmartQueue';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Clock, ArrowRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { nl } from 'date-fns/locale';

export function SmartQueueWidget() {
  const { queueItems, urgentCount, totalCount } = useSmartQueue();
  const navigate = useNavigate();

  const displayItems = queueItems.slice(0, 5);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-destructive" />
          Smart Queue
          {urgentCount > 0 && (
            <Badge variant="destructive">{urgentCount} urgent</Badge>
          )}
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={() => navigate('/queue')}>
          Bekijk alle ({totalCount})
          <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        {displayItems.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">
            Geen actie-items op dit moment
          </p>
        ) : (
          <div className="space-y-3">
            {displayItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-lg border p-3 hover:bg-accent cursor-pointer transition-colors"
                onClick={() => navigate(`/deals/${item.dealId}`)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={item.priority === 'urgent' ? 'destructive' : 'secondary'}
                      className="text-xs"
                    >
                      {item.title}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground truncate">
                    {item.description}
                  </p>
                </div>
                {item.dueDate && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground ml-2">
                    <Clock className="h-3 w-3" />
                    {formatDistanceToNow(item.dueDate, { addSuffix: true, locale: nl })}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
