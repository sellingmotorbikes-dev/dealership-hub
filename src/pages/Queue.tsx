import { useSmartQueue } from '@/hooks/useSmartQueue';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow, format } from 'date-fns';
import { nl } from 'date-fns/locale';
import { Clock, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';
import { QueueRuleType } from '@/types';

const ruleIcons: Record<QueueRuleType, React.ReactNode> = {
  offer_followup: <Clock className="h-4 w-4" />,
  deposit_overdue: <AlertCircle className="h-4 w-4" />,
  test_ride_today: <CheckCircle className="h-4 w-4" />,
  delivery_upcoming: <Clock className="h-4 w-4" />,
  unit_in_stock: <CheckCircle className="h-4 w-4" />,
  unit_ready: <AlertCircle className="h-4 w-4" />,
  no_activity: <Clock className="h-4 w-4" />,
  first_followup: <Clock className="h-4 w-4" />,
};

export default function QueuePage() {
  const { queueItems, urgentCount, totalCount } = useSmartQueue();
  const navigate = useNavigate();

  const urgentItems = queueItems.filter(item => item.priority === 'urgent');
  const normalItems = queueItems.filter(item => item.priority === 'normal');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Smart Queue</h1>
        <p className="text-muted-foreground">
          Automatisch gegenereerde taken gebaseerd op deal status en activiteit
        </p>
      </div>

      {/* Summary */}
      <div className="flex gap-4">
        <Card className="flex-1">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-4xl font-bold">{totalCount}</p>
              <p className="text-sm text-muted-foreground">Totaal items</p>
            </div>
          </CardContent>
        </Card>
        <Card className="flex-1 border-destructive/50">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-4xl font-bold text-destructive">{urgentCount}</p>
              <p className="text-sm text-muted-foreground">Urgent</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Urgent Items */}
      {urgentItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Urgente Items ({urgentItems.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {urgentItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-lg border border-destructive/30 bg-destructive/5 p-4 hover:bg-destructive/10 cursor-pointer transition-colors"
                  onClick={() => navigate(`/deals/${item.dealId}`)}
                >
                  <div className="flex items-center gap-4">
                    <div className="text-destructive">
                      {ruleIcons[item.ruleType]}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant="destructive" className="text-xs">
                          {item.title}
                        </Badge>
                        <span className="text-sm font-medium">
                          {item.deal.dealNumber}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {item.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {item.dueDate && (
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Deadline</p>
                        <p className="text-sm font-medium">
                          {format(item.dueDate, 'd MMM', { locale: nl })}
                        </p>
                      </div>
                    )}
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Normal Items */}
      {normalItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Overige Items ({normalItems.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {normalItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-lg border p-4 hover:bg-accent cursor-pointer transition-colors"
                  onClick={() => navigate(`/deals/${item.dealId}`)}
                >
                  <div className="flex items-center gap-4">
                    <div className="text-muted-foreground">
                      {ruleIcons[item.ruleType]}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {item.title}
                        </Badge>
                        <span className="text-sm font-medium">
                          {item.deal.dealNumber}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {item.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {item.dueDate && (
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Deadline</p>
                        <p className="text-sm font-medium">
                          {format(item.dueDate, 'd MMM', { locale: nl })}
                        </p>
                      </div>
                    )}
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {totalCount === 0 && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
              <h3 className="text-lg font-semibold">Alles bijgewerkt!</h3>
              <p className="text-muted-foreground">
                Er zijn geen openstaande taken die aandacht nodig hebben.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
