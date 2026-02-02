import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDeals } from '@/contexts/DealContext';
import { DEAL_PHASES, DealPhase } from '@/types';
import { useNavigate } from 'react-router-dom';
import { useMemo } from 'react';

const phaseColors: Record<DealPhase, string> = {
  lead_verkoop: 'bg-blue-500',
  betaling: 'bg-yellow-500',
  logistiek: 'bg-purple-500',
  werkplaats: 'bg-orange-500',
  aflevering: 'bg-green-500',
  nazorg: 'bg-gray-500',
};

export function PipelineSummary() {
  const { deals } = useDeals();
  const navigate = useNavigate();

  const phaseCounts = useMemo(() => {
    const counts: Record<DealPhase, number> = {
      lead_verkoop: 0,
      betaling: 0,
      logistiek: 0,
      werkplaats: 0,
      aflevering: 0,
      nazorg: 0,
    };

    for (const deal of deals) {
      counts[deal.phase]++;
    }

    return counts;
  }, [deals]);

  const totalValue = useMemo(() => {
    return deals.reduce((sum, deal) => sum + deal.payment.totalPrice, 0);
  }, [deals]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pipeline Overzicht</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <p className="text-sm text-muted-foreground">Totale waarde in pipeline</p>
          <p className="text-2xl font-bold">€{totalValue.toLocaleString('nl-NL')}</p>
        </div>

        <div className="space-y-3">
          {DEAL_PHASES.map((phase) => (
            <div
              key={phase.id}
              className="flex items-center justify-between cursor-pointer hover:bg-accent rounded-lg p-2 -mx-2 transition-colors"
              onClick={() => navigate('/deals')}
            >
              <div className="flex items-center gap-3">
                <div className={`h-3 w-3 rounded-full ${phaseColors[phase.id]}`} />
                <span className="text-sm">{phase.labelNL}</span>
              </div>
              <span className="font-semibold">{phaseCounts[phase.id]}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
