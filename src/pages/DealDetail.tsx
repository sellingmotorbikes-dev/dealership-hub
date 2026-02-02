import { useParams, useNavigate } from 'react-router-dom';
import { useDeals } from '@/contexts/DealContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Euro,
  Bike,
  MessageSquare,
  CheckCircle,
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { nl } from 'date-fns/locale';
import { DEAL_PHASES, SUBSTATUS_OPTIONS, DealPhase, DealSubstatus } from '@/types';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';

export default function DealDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getDeal, updateDealPhase, updateDealSubstatus, markDepositPaid, markFullyPaid, setDeliveryDate, addActivity } = useDeals();
  const [note, setNote] = useState('');

  const deal = getDeal(id!);

  if (!deal) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-muted-foreground">Deal niet gevonden</p>
        <Button variant="link" onClick={() => navigate('/deals')}>
          Terug naar deals
        </Button>
      </div>
    );
  }

  const currentPhase = DEAL_PHASES.find(p => p.id === deal.phase);
  const substatusOptions = SUBSTATUS_OPTIONS[deal.phase];

  const handlePhaseChange = (newPhase: DealPhase) => {
    const firstSubstatus = SUBSTATUS_OPTIONS[newPhase][0].id;
    updateDealPhase(deal.id, newPhase, firstSubstatus);
  };

  const handleSubstatusChange = (newSubstatus: DealSubstatus) => {
    updateDealSubstatus(deal.id, newSubstatus);
  };

  const handleAddNote = () => {
    if (!note.trim()) return;
    addActivity(deal.id, {
      type: 'note_added',
      description: note,
      createdBy: 'Jan de Vries',
    });
    setNote('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{deal.dealNumber}</h1>
          <p className="text-muted-foreground">
            {deal.motorcycle.brand} {deal.motorcycle.model} ({deal.motorcycle.year})
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          {currentPhase?.labelNL}
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Deal Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Phase & Substatus */}
          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Fase</label>
                  <Select value={deal.phase} onValueChange={(v) => handlePhaseChange(v as DealPhase)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DEAL_PHASES.map((phase) => (
                        <SelectItem key={phase.id} value={phase.id}>
                          {phase.labelNL}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Substatus</label>
                  <Select value={deal.substatus} onValueChange={(v) => handleSubstatusChange(v as DealSubstatus)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {substatusOptions.map((status) => (
                        <SelectItem key={status.id} value={status.id}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Euro className="h-5 w-5" />
                Betaling
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <p className="text-sm text-muted-foreground">Totaalbedrag</p>
                  <p className="text-xl font-bold">€{deal.payment.totalPrice.toLocaleString('nl-NL')}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Aanbetaling</p>
                  <div className="flex items-center gap-2">
                    <p className="text-xl font-bold">€{deal.payment.depositAmount.toLocaleString('nl-NL')}</p>
                    {deal.payment.depositPaid ? (
                      <Badge className="bg-green-600">Betaald</Badge>
                    ) : (
                      <Badge variant="destructive">Openstaand</Badge>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Resterend</p>
                  <p className="text-xl font-bold">€{deal.payment.remainingAmount.toLocaleString('nl-NL')}</p>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="flex gap-2">
                {!deal.payment.depositPaid && (
                  <Button onClick={() => markDepositPaid(deal.id)}>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Aanbetaling Ontvangen
                  </Button>
                )}
                {deal.payment.depositPaid && !deal.payment.fullyPaid && (
                  <Button onClick={() => markFullyPaid(deal.id)}>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Volledig Betaald
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Key Dates */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Belangrijke Data
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Proefrit</p>
                  <p className="font-medium">
                    {deal.testRideDate
                      ? format(deal.testRideDate, 'd MMMM yyyy', { locale: nl })
                      : 'Niet gepland'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Aflevering</p>
                  <p className="font-medium">
                    {deal.deliveryDate
                      ? format(deal.deliveryDate, 'd MMMM yyyy', { locale: nl })
                      : 'Niet gepland'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Add Note */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Notitie Toevoegen
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Typ een notitie..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="mb-2"
              />
              <Button onClick={handleAddNote} disabled={!note.trim()}>
                Notitie Opslaan
              </Button>
            </CardContent>
          </Card>

          {/* Activity Log */}
          <Card>
            <CardHeader>
              <CardTitle>Activiteiten</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {deal.activities.map((activity) => (
                  <div key={activity.id} className="flex gap-3">
                    <div className="mt-1.5 h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm">{activity.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {activity.createdBy} • {formatDistanceToNow(activity.createdAt, { addSuffix: true, locale: nl })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Customer & Motorcycle */}
        <div className="space-y-6">
          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Klant
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="font-semibold text-lg">
                  {deal.customer.firstName} {deal.customer.lastName}
                </p>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a href={`mailto:${deal.customer.email}`} className="hover:underline">
                  {deal.customer.email}
                </a>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <a href={`tel:${deal.customer.phone}`} className="hover:underline">
                  {deal.customer.phone}
                </a>
              </div>
              {deal.customer.address && (
                <div className="flex items-start gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p>{deal.customer.address.street}</p>
                    <p>{deal.customer.address.postalCode} {deal.customer.address.city}</p>
                  </div>
                </div>
              )}
              <Separator />
              <div className="flex items-center gap-2">
                <Badge variant={deal.customer.whatsappOptIn ? 'default' : 'secondary'}>
                  {deal.customer.whatsappOptIn ? 'WhatsApp ✓' : 'Geen WhatsApp'}
                </Badge>
                <Badge variant="outline">
                  {deal.customer.preferredChannel === 'whatsapp' ? 'WhatsApp' : 
                   deal.customer.preferredChannel === 'email' ? 'Email' : 'Telefoon'}
                </Badge>
              </div>
              <Button variant="outline" className="w-full" onClick={() => navigate(`/customers/${deal.customer.id}`)}>
                Bekijk Klantprofiel
              </Button>
            </CardContent>
          </Card>

          {/* Motorcycle Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bike className="h-5 w-5" />
                Motor
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="font-semibold text-lg">
                  {deal.motorcycle.brand} {deal.motorcycle.model}
                </p>
                <p className="text-sm text-muted-foreground">
                  {deal.motorcycle.year} • {deal.motorcycle.color}
                </p>
              </div>
              <Badge variant={deal.motorcycle.isNewUnit ? 'default' : 'secondary'}>
                {deal.motorcycle.isNewUnit ? 'Nieuw' : 'Occasion'}
              </Badge>
              {deal.motorcycle.vin && (
                <div>
                  <p className="text-xs text-muted-foreground">VIN</p>
                  <p className="text-sm font-mono">{deal.motorcycle.vin}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
