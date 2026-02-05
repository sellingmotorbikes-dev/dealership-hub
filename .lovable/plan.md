

# Plan: Responsive Kanban Board

## Probleem

De Kanban-kolommen hebben momenteel vaste breedtes (`min-w-[280px] max-w-[320px]`), waardoor het bord niet meegroeit met de venstergrootte.

## Oplossing

De kolommen responsive maken zodat ze:
- De beschikbare ruimte verdelen over alle zichtbare kolommen
- Een minimum breedte behouden voor leesbaarheid
- Horizontaal scrollen als er niet genoeg ruimte is

## Wijzigingen

### 1. KanbanColumn.tsx

**Huidige styling (regel 22)**:
```typescript
<div className="flex flex-col min-w-[280px] max-w-[320px]">
```

**Nieuwe styling**:
```typescript
<div className="flex flex-col flex-1 min-w-[260px]">
```

- `flex-1`: Kolom groeit mee om beschikbare ruimte te vullen
- `min-w-[260px]`: Minimale breedte voor leesbaarheid
- Geen `max-w`: Kolommen mogen groeien

### 2. KanbanBoard.tsx

**Huidige styling (regel 51)**:
```typescript
<div className="flex gap-4 overflow-x-auto pb-4">
```

**Nieuwe styling**:
```typescript
<div className="flex gap-4 overflow-x-auto pb-4 w-full">
```

- `w-full`: Zorgt dat de container de volledige breedte benut

## Resultaat

| Scenario | Gedrag |
|----------|--------|
| Breed venster (1920px) | Kolommen groeien, vullen de ruimte |
| Normaal venster (1440px) | Kolommen passen precies |
| Smal venster (1024px) | Kolommen krimpen tot minimum, dan horizontaal scrollen |

## Te wijzigen bestanden

| Bestand | Wijziging |
|---------|-----------|
| `src/components/deals/KanbanColumn.tsx` | `flex-1` toevoegen, `max-w` verwijderen |
| `src/components/deals/KanbanBoard.tsx` | `w-full` toevoegen aan container |

