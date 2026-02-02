import { useParams, useNavigate } from 'react-router-dom';
import { mockCustomers } from '@/data/mockData';
import { useDeals } from '@/contexts/DealContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  MapPin,
  MessageSquare,
  Calendar,
  Euro,
} from 'lucide-react';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';
import { useMemo } from 'react';
import { DEAL_PHASES } from '@/types';

export default function CustomerDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { deals } = useDeals();

  // Find customer from deals first, then mock data
  const customer = useMemo(() => {
    const dealCustomer = deals.find(d => d.customer.id === id)?.customer;
    if (dealCustomer) return dealCustomer;
    return mockCustomers.find(c => c.id === id);
  }, [id, deals]);

  const customerDeals = useMemo(() => {
    return deals.filter(d => d.customer.id === id);
  }, [id, deals]);

  if (!customer) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-muted-foreground">Klant niet gevonden</p>
        <Button variant="link" onClick={() => navigate('/customers')}>
          Terug naar klanten
        </Button>
      </div>
    );
  }

  const totalValue = customerDeals.reduce((sum, deal) => sum + deal.payment.totalPrice, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">
            {customer.firstName} {customer.lastName}
          </h1>
          <p className="text-muted-foreground">
            Klant sinds {format(customer.createdAt, 'MMMM yyyy', { locale: nl })}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Customer Info */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Contactgegevens
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground text-xl font-semibold">
                  {customer.firstName.charAt(0)}{customer.lastName.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-lg">
                    {customer.firstName} {customer.lastName}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a href={`mailto:${customer.email}`} className="hover:underline">
                    {customer.email}
                  </a>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <a href={`tel:${customer.phone}`} className="hover:underline">
                    {customer.phone}
                  </a>
                </div>
                {customer.address && (
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p>{customer.address.street}</p>
                      <p>{customer.address.postalCode} {customer.address.city}</p>
                      <p>{customer.address.country}</p>
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Voorkeuren</p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">
                    {customer.preferredChannel === 'whatsapp' ? (
                      <><MessageSquare className="h-3 w-3 mr-1" /> WhatsApp</>
                    ) : customer.preferredChannel === 'email' ? (
                      <><Mail className="h-3 w-3 mr-1" /> Email</>
                    ) : (
                      <><Phone className="h-3 w-3 mr-1" /> Telefoon</>
                    )}
                  </Badge>
                  {customer.whatsappOptIn && (
                    <Badge variant="default">WhatsApp opt-in ✓</Badge>
                  )}
                </div>
              </div>

              {customer.notes && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Notities</p>
                    <p className="text-sm">{customer.notes}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Stats */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-3xl font-bold">{customerDeals.length}</p>
                  <p className="text-sm text-muted-foreground">Deals</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold">€{totalValue.toLocaleString('nl-NL')}</p>
                  <p className="text-sm text-muted-foreground">Totale waarde</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Deals */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Deals ({customerDeals.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {customerDeals.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Nog geen deals voor deze klant</p>
                  <Button className="mt-4">
                    Nieuwe Deal Aanmaken
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {customerDeals.map((deal) => {
                    const phase = DEAL_PHASES.find(p => p.id === deal.phase);
                    return (
                      <div
                        key={deal.id}
                        className="flex items-center justify-between rounded-lg border p-4 hover:bg-accent cursor-pointer transition-colors"
                        onClick={() => navigate(`/deals/${deal.id}`)}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{deal.dealNumber}</span>
                            <Badge variant="outline">{phase?.labelNL}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {deal.motorcycle.brand} {deal.motorcycle.model} ({deal.motorcycle.year})
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1">
                            <Euro className="h-4 w-4 text-muted-foreground" />
                            <span className="font-semibold">
                              €{deal.payment.totalPrice.toLocaleString('nl-NL')}
                            </span>
                          </div>
                          {deal.deliveryDate && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                              <Calendar className="h-3 w-3" />
                              {format(deal.deliveryDate, 'd MMM yyyy', { locale: nl })}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
