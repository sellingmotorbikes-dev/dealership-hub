import { useState, useEffect } from 'react';
import { KanbanBoard, PhaseFilter } from '@/components/deals';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { DEAL_PHASES, DealPhase } from '@/types';

export default function DealsPage() {
  const { user } = useAuth();
  const [visiblePhases, setVisiblePhases] = useState<DealPhase[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load filter from localStorage on mount
  useEffect(() => {
    const storageKey = `kanban_phase_filter_${user?.id}`;
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setVisiblePhases(parsed);
      } catch {
        setVisiblePhases(DEAL_PHASES.map(p => p.id));
      }
    } else {
      setVisiblePhases(DEAL_PHASES.map(p => p.id));
    }
    setIsLoaded(true);
  }, [user?.id]);

  // Save filter to localStorage on change
  const handleFilterChange = (phases: DealPhase[]) => {
    setVisiblePhases(phases);
    const storageKey = `kanban_phase_filter_${user?.id}`;
    localStorage.setItem(storageKey, JSON.stringify(phases));
  };

  // Don't render until filter is loaded to prevent flash
  if (!isLoaded) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Deals</h1>
          <p className="text-muted-foreground">
            Beheer al je deals in het Kanban overzicht
          </p>
        </div>
        <div className="flex items-center gap-2">
          <PhaseFilter
            selected={visiblePhases}
            onChange={handleFilterChange}
          />
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nieuwe Deal
          </Button>
        </div>
      </div>

      <KanbanBoard visiblePhases={visiblePhases} />
    </div>
  );
}
