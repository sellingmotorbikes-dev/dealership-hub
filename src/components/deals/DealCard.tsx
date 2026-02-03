import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Deal } from '@/types';
import { useNavigate } from 'react-router-dom';
import { Draggable } from '@hello-pangea/dnd';
import { Euro, Calendar, User } from 'lucide-react';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';
import { SubstatusSelector } from './SubstatusSelector';

interface DealCardProps {
  deal: Deal;
  index: number;
}

export function DealCard({ deal, index }: DealCardProps) {
  const navigate = useNavigate();

  return (
    <Draggable draggableId={deal.id} index={index}>
      {(provided, snapshot) => (
        <Card
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`cursor-pointer transition-shadow hover:shadow-md ${
            snapshot.isDragging ? 'shadow-lg ring-2 ring-primary' : ''
          }`}
          onClick={() => navigate(`/deals/${deal.id}`)}
        >
          <CardContent className="p-4">
            {/* Customer Name */}
            <div className="flex items-center gap-2 mb-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium truncate">
                {deal.customer.firstName} {deal.customer.lastName}
              </span>
            </div>

            {/* Motorcycle */}
            <p className="text-sm text-muted-foreground mb-3 truncate">
              {deal.motorcycle.brand} {deal.motorcycle.model}
            </p>

            {/* Substatus Selector */}
            <div className="mb-3">
              <SubstatusSelector
                dealId={deal.id}
                phase={deal.phase}
                currentSubstatus={deal.substatus}
              />
            </div>

            {/* Footer info */}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Euro className="h-3 w-3" />
                <span>€{deal.payment.totalPrice.toLocaleString('nl-NL')}</span>
              </div>
              {deal.deliveryDate && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>{format(deal.deliveryDate, 'd MMM', { locale: nl })}</span>
                </div>
              )}
            </div>

            {/* Payment indicator */}
            {deal.payment.depositPaid && !deal.payment.fullyPaid && (
              <div className="mt-2 h-1 w-full bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-green-500 rounded-full"
                  style={{ 
                    width: `${((deal.payment.totalPrice - deal.payment.remainingAmount) / deal.payment.totalPrice) * 100}%` 
                  }}
                />
              </div>
            )}
            {deal.payment.fullyPaid && (
              <div className="mt-2">
                <Badge variant="default" className="text-xs bg-green-600">
                  Volledig betaald
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </Draggable>
  );
}
