 import { useState } from 'react';
 import { Filter } from 'lucide-react';
 import { Button } from '@/components/ui/button';
 import { Checkbox } from '@/components/ui/checkbox';
 import { Badge } from '@/components/ui/badge';
 import {
   Popover,
   PopoverContent,
   PopoverTrigger,
 } from '@/components/ui/popover';
 import { DEAL_PHASES, DealPhase } from '@/types';
 
 interface PhaseFilterProps {
   selected: DealPhase[];
   onChange: (phases: DealPhase[]) => void;
 }
 
 export function PhaseFilter({ selected, onChange }: PhaseFilterProps) {
   const [open, setOpen] = useState(false);
 
   const handleToggle = (phaseId: DealPhase) => {
     if (selected.includes(phaseId)) {
       // Don't allow deselecting all phases
       if (selected.length > 1) {
         onChange(selected.filter(id => id !== phaseId));
       }
     } else {
       onChange([...selected, phaseId]);
     }
   };
 
   const handleSelectAll = () => {
     onChange(DEAL_PHASES.map(p => p.id));
   };
 
   const handleReset = () => {
     onChange(DEAL_PHASES.map(p => p.id));
   };
 
   const allSelected = selected.length === DEAL_PHASES.length;
 
   return (
     <Popover open={open} onOpenChange={setOpen}>
       <PopoverTrigger asChild>
         <Button variant="outline" className="gap-2">
           <Filter className="h-4 w-4" />
           <span>Fases</span>
           {!allSelected && (
             <Badge variant="secondary" className="ml-1">
               {selected.length}/{DEAL_PHASES.length}
             </Badge>
           )}
         </Button>
       </PopoverTrigger>
       <PopoverContent className="w-64" align="end">
         <div className="space-y-4">
           <p className="text-sm font-medium">Toon kolommen:</p>
           <div className="space-y-2">
             {DEAL_PHASES.map((phase) => (
               <label
                 key={phase.id}
                 className="flex items-center gap-2 cursor-pointer"
               >
                 <Checkbox
                   checked={selected.includes(phase.id)}
                   onCheckedChange={() => handleToggle(phase.id)}
                 />
                 <span className="text-sm">{phase.labelNL}</span>
               </label>
             ))}
           </div>
           <div className="flex gap-2 pt-2 border-t">
             <Button
               variant="outline"
               size="sm"
               className="flex-1"
               onClick={handleSelectAll}
               disabled={allSelected}
             >
               Alles selecteren
             </Button>
             <Button
               variant="outline"
               size="sm"
               className="flex-1"
               onClick={handleReset}
               disabled={allSelected}
             >
               Reset
             </Button>
           </div>
         </div>
       </PopoverContent>
     </Popover>
   );
 }