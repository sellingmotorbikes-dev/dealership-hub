import { DealPhase, DEAL_PHASES, Deal, SUBSTATUS_OPTIONS, DealSubstatus } from '@/types';
import { DealCard } from './DealCard';
import { Droppable } from '@hello-pangea/dnd';
import { cn } from '@/lib/utils';

interface KanbanColumnProps {
  phase: typeof DEAL_PHASES[number];
  deals: Deal[];
}

const phaseColors: Record<DealPhase, string> = {
  lead_verkoop: 'border-t-blue-500',
  betaling: 'border-t-yellow-500',
  logistiek: 'border-t-purple-500',
  werkplaats: 'border-t-orange-500',
  aflevering: 'border-t-green-500',
  nazorg: 'border-t-gray-500',
};

export function KanbanColumn({ phase, deals }: KanbanColumnProps) {
  return (
    <div className="flex flex-col min-w-[280px] max-w-[320px]">
      {/* Column Header */}
      <div className={cn(
        "rounded-t-lg border border-b-0 bg-muted/50 p-3 border-t-4",
        phaseColors[phase.id]
      )}>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm">{phase.labelNL}</h3>
          <span className="rounded-full bg-background px-2 py-0.5 text-xs font-medium">
            {deals.length}
          </span>
        </div>
      </div>

      {/* Droppable Area */}
      <Droppable droppableId={phase.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={cn(
              "flex-1 rounded-b-lg border bg-muted/30 p-2 space-y-2 min-h-[200px] transition-colors",
              snapshot.isDraggingOver && "bg-accent"
            )}
          >
            {deals.map((deal, index) => (
              <DealCard key={deal.id} deal={deal} index={index} />
            ))}
            {provided.placeholder}
            {deals.length === 0 && !snapshot.isDraggingOver && (
              <div className="flex items-center justify-center h-20 text-sm text-muted-foreground">
                Geen deals
              </div>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
}
