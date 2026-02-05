
# Plan: Werkplaats Kanban Toegang + Persoonlijke Fase-filter

## Overzicht

Dit plan implementeert twee aanpassingen:
1. **Optie A**: Werkplaats profiel krijgt toegang tot de volledige Kanban
2. **Fase-filter**: Alle profielen kunnen zelf kiezen welke fases ze willen zien

---

## Wijziging 1: Werkplaats Kanban Toegang

### Bestand: `src/components/layout/Sidebar.tsx`

Eenvoudige wijziging - voeg `workshop` toe aan de roles array:

```typescript
// Regel 27: toevoegen van 'workshop'
{ to: '/deals', icon: Kanban, label: 'Deals', roles: ['sales', 'administration', 'workshop', 'manager'] },
```

---

## Wijziging 2: Persoonlijke Fase-filter

### Nieuwe Component: `src/components/deals/PhaseFilter.tsx`

Een filter-popover waarmee medewerkers kunnen kiezen welke fases zichtbaar zijn:

```text
+------------------------------------------+
|  [Filter icon] Fases (4/6)               |
+------------------------------------------+
         |
         v
+------------------------------------------+
|  Toon kolommen:                          |
|                                          |
|  [x] Lead & Verkoop                      |
|  [x] Betaling                            |
|  [ ] Logistiek                           |
|  [x] Werkplaats                          |
|  [x] Aflevering                          |
|  [ ] Nazorg                              |
|                                          |
|  [Alles selecteren]  [Reset]             |
+------------------------------------------+
```

### Functionaliteit

- Checkbox per fase om te tonen/verbergen
- "Alles selecteren" knop om alle fases te tonen
- "Reset" knop om terug te gaan naar standaard
- Filter-keuzes worden opgeslagen in localStorage per gebruiker
- Badge toont "4/6" om aan te geven hoeveel fases zichtbaar zijn

### Opslag in localStorage

```text
Key: kanban_phase_filter_{userId}
Value: ["lead_verkoop", "betaling", "werkplaats", "aflevering"]
```

---

## Te Wijzigen Bestanden

| Bestand | Wijziging |
|---------|-----------|
| `src/components/layout/Sidebar.tsx` | Workshop toegang toevoegen |
| `src/components/deals/PhaseFilter.tsx` | NIEUW - Filter component |
| `src/components/deals/KanbanBoard.tsx` | Filter state + gefilterde weergave |
| `src/pages/Deals.tsx` | Filter component in header plaatsen |
| `src/components/deals/index.ts` | Export PhaseFilter |

---

## Technische Details

### KanbanBoard.tsx Wijzigingen

```typescript
interface KanbanBoardProps {
  visiblePhases: DealPhase[];
}

export function KanbanBoard({ visiblePhases }: KanbanBoardProps) {
  // Filter DEAL_PHASES op basis van visiblePhases
  const filteredPhases = DEAL_PHASES.filter(phase => 
    visiblePhases.includes(phase.id)
  );

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {filteredPhases.map((phase) => (
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
```

### Deals.tsx Wijzigingen

```typescript
export default function DealsPage() {
  const { user } = useAuth();
  const [visiblePhases, setVisiblePhases] = useState<DealPhase[]>([]);

  // Laad filter uit localStorage bij mount
  useEffect(() => {
    const storageKey = `kanban_phase_filter_${user?.id}`;
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      setVisiblePhases(JSON.parse(saved));
    } else {
      // Default: alle fases
      setVisiblePhases(DEAL_PHASES.map(p => p.id));
    }
  }, [user?.id]);

  // Sla filter op bij wijziging
  const handleFilterChange = (phases: DealPhase[]) => {
    setVisiblePhases(phases);
    localStorage.setItem(
      `kanban_phase_filter_${user?.id}`, 
      JSON.stringify(phases)
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Deals</h1>
          <p className="text-muted-foreground">...</p>
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
```

### PhaseFilter.tsx Component

Gebruikt bestaande UI componenten:
- `Popover` + `PopoverTrigger` + `PopoverContent` voor de dropdown
- `Checkbox` voor de fase-selecties
- `Button` voor "Alles selecteren" en "Reset"
- `Badge` om aantal geselecteerde fases te tonen

---

## UX Overwegingen

### Drag & Drop met Verborgen Kolommen

Wanneer een deal wordt gesleept naar een verborgen fase (bijv. via de detail pagina), blijft de deal zichtbaar in het systeem maar niet in de Kanban. Dit is verwacht gedrag - de medewerker heeft bewust gekozen die fase niet te zien.

### Standaard Filter per Rol (Optioneel)

Later kan dit uitgebreid worden met standaard filters per rol:
- Verkoop: Lead & Verkoop, Betaling, Aflevering, Nazorg
- Werkplaats: Logistiek, Werkplaats, Aflevering
- Administratie: Alle fases

Dit is echter optioneel - de huidige implementatie laat iedereen zelf kiezen.

---

## Samenvatting

Dit plan geeft medewerkers flexibiliteit om hun Kanban-weergave te personaliseren, terwijl de volledige functionaliteit behouden blijft. De filter is:
- Persoonlijk (per gebruiker opgeslagen)
- Persistent (blijft na refresh)
- Intuïtief (checkboxes met duidelijke labels)
- Non-destructief (verborgen fases blijven in het systeem)
