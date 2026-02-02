import { useMemo } from 'react';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { useDeals } from '@/contexts/DealContext';
import { DEAL_PHASES, DealPhase, SUBSTATUS_OPTIONS, DealSubstatus } from '@/types';
import { KanbanColumn } from './KanbanColumn';

export function KanbanBoard() {
  const { deals, updateDealPhase } = useDeals();

  const dealsByPhase = useMemo(() => {
    const grouped: Record<DealPhase, typeof deals> = {
      lead_verkoop: [],
      betaling: [],
      logistiek: [],
      werkplaats: [],
      aflevering: [],
      nazorg: [],
    };

    for (const deal of deals) {
      grouped[deal.phase].push(deal);
    }

    return grouped;
  }, [deals]);

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return;
    }

    const newPhase = destination.droppableId as DealPhase;
    const firstSubstatus = SUBSTATUS_OPTIONS[newPhase][0].id;

    updateDealPhase(draggableId, newPhase, firstSubstatus);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {DEAL_PHASES.map((phase) => (
          <KanbanColumn
            key={phase.id}
            phase={phase}
            deals={dealsByPhase[phase.id]}
          />
        ))}
      </div>
    </DragDropContext>
  );
}
