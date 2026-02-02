import { KanbanBoard } from '@/components/deals';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function DealsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Deals</h1>
          <p className="text-muted-foreground">
            Beheer al je deals in het Kanban overzicht
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nieuwe Deal
        </Button>
      </div>

      <KanbanBoard />
    </div>
  );
}
