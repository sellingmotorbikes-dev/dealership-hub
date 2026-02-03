
# Step 3: Add Substatus Editing

## Overview
Add inline substatus editing to deal cards on the Kanban board. Users can click a dropdown on any deal card to change its substatus within the current phase.

---

## Components to Create/Modify

### 1. Create SubstatusSelector Component
**File:** `src/components/deals/SubstatusSelector.tsx`

A reusable dropdown component that:
- Accepts the current deal's phase and substatus
- Shows only valid substatuses for that phase (using `SUBSTATUS_OPTIONS`)
- Calls `updateDealSubstatus` from DealContext on change
- Shows success toast notification after update
- Includes validation to prevent invalid substatus selection

### 2. Modify DealCard Component  
**File:** `src/components/deals/DealCard.tsx`

Replace the static Badge with the new SubstatusSelector:
- Import and use `SubstatusSelector` component
- Add `onClick` stop propagation on the selector area (so clicking dropdown doesn't navigate to deal detail)
- Pass `dealId`, `phase`, and current `substatus` as props

### 3. Update Exports
**File:** `src/components/deals/index.ts`

Export the new `SubstatusSelector` component.

---

## Interaction Flow

```text
User clicks substatus dropdown
         |
         v
   Dropdown opens showing
   phase-specific options
         |
         v
   User selects new substatus
         |
         v
  Validation: Is substatus valid
  for current phase?
     |           |
    Yes          No
     |           |
     v           v
  Call       Show error
  updateDealSubstatus()   toast
     |
     v
  Context updates deal,
  logs activity, emits event
     |
     v
  Show success toast:
  "Status bijgewerkt"
```

---

## Validation Logic

The SubstatusSelector will validate selections by:
1. Checking if selected substatus ID exists in `SUBSTATUS_OPTIONS[phase]`
2. If invalid (edge case), show error toast and reject the change
3. This ensures data integrity even if phase changes during dropdown interaction

---

## Technical Details

### SubstatusSelector Props
```typescript
interface SubstatusSelectorProps {
  dealId: string;
  phase: DealPhase;
  currentSubstatus: DealSubstatus;
}
```

### Key Implementation Notes
- Use existing `Select`, `SelectTrigger`, `SelectContent`, `SelectItem` from `@/components/ui/select`
- Use `toast` from `sonner` for notifications
- Stop event propagation on the Select wrapper to prevent card click navigation
- Style the trigger to look like a badge (compact, colored background)
- Dropdown has `z-50` and solid `bg-popover` to prevent transparency issues

### Toast Messages (Dutch)
- Success: "Status bijgewerkt naar [new status label]"
- Error: "Ongeldige status voor deze fase"
