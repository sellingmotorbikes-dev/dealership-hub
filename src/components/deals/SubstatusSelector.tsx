import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DealPhase, DealSubstatus, SUBSTATUS_OPTIONS } from '@/types';
import { useDeals } from '@/contexts/DealContext';
import { toast } from 'sonner';

interface SubstatusSelectorProps {
  dealId: string;
  phase: DealPhase;
  currentSubstatus: DealSubstatus;
}

export function SubstatusSelector({
  dealId,
  phase,
  currentSubstatus,
}: SubstatusSelectorProps) {
  const { updateDealSubstatus } = useDeals();

  const options = SUBSTATUS_OPTIONS[phase] || [];
  const currentLabel = options.find((s) => s.id === currentSubstatus)?.label || currentSubstatus;

  const handleChange = (newSubstatus: string) => {
    // Validate that the selected substatus is valid for the current phase
    const isValid = options.some((opt) => opt.id === newSubstatus);

    if (!isValid) {
      toast.error('Ongeldige status voor deze fase');
      return;
    }

    const newLabel = options.find((s) => s.id === newSubstatus)?.label || newSubstatus;
    updateDealSubstatus(dealId, newSubstatus as DealSubstatus);
    toast.success(`Status bijgewerkt naar ${newLabel}`);
  };

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <Select value={currentSubstatus} onValueChange={handleChange}>
        <SelectTrigger className="h-6 w-auto min-w-0 gap-1 border-none bg-secondary px-2 py-0.5 text-xs font-medium hover:bg-secondary/80 focus:ring-0 focus:ring-offset-0 [&>svg]:h-3 [&>svg]:w-3">
          <SelectValue>{currentLabel}</SelectValue>
        </SelectTrigger>
        <SelectContent className="z-50 bg-popover">
          {options.map((option) => (
            <SelectItem key={option.id} value={option.id} className="text-xs">
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
