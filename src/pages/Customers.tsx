import { useState, useMemo } from 'react';
import { mockCustomers } from '@/data/mockData';
import { useDeals } from '@/contexts/DealContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, User, Phone, Mail, MessageSquare } from 'lucide-react';

export default function CustomersPage() {
  const [search, setSearch] = useState('');
  const { deals } = useDeals();
  const navigate = useNavigate();

  // Get unique customers from deals and mock data
  const customers = useMemo(() => {
    const dealCustomerIds = new Set(deals.map(d => d.customer.id));
    const dealCustomers = deals.map(d => d.customer);
    
    // Add mock customers that aren't in deals
    const allCustomers = [...dealCustomers];
    for (const customer of mockCustomers) {
      if (!dealCustomerIds.has(customer.id)) {
        allCustomers.push(customer);
      }
    }
    
    return allCustomers;
  }, [deals]);

  const filteredCustomers = useMemo(() => {
    if (!search) return customers;
    const searchLower = search.toLowerCase();
    return customers.filter(
      (c) =>
        c.firstName.toLowerCase().includes(searchLower) ||
        c.lastName.toLowerCase().includes(searchLower) ||
        c.email.toLowerCase().includes(searchLower) ||
        c.phone.includes(search)
    );
  }, [customers, search]);

  const getCustomerDealCount = (customerId: string) => {
    return deals.filter(d => d.customer.id === customerId).length;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Klanten</h1>
          <p className="text-muted-foreground">
            Beheer je klantgegevens en bekijk gerelateerde deals
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nieuwe Klant
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Zoek op naam, email of telefoonnummer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Customer List */}
      <Card>
        <CardHeader>
          <CardTitle>
            {filteredCustomers.length} {filteredCustomers.length === 1 ? 'klant' : 'klanten'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Naam</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Voorkeurskanaal</TableHead>
                <TableHead>Deals</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.map((customer) => (
                <TableRow 
                  key={customer.id}
                  className="cursor-pointer"
                  onClick={() => navigate(`/customers/${customer.id}`)}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        {customer.firstName.charAt(0)}{customer.lastName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium">{customer.firstName} {customer.lastName}</p>
                        {customer.address && (
                          <p className="text-xs text-muted-foreground">
                            {customer.address.city}
                          </p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-sm">
                        <Mail className="h-3 w-3 text-muted-foreground" />
                        {customer.email}
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        <Phone className="h-3 w-3 text-muted-foreground" />
                        {customer.phone}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
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
                        <Badge variant="secondary" className="text-xs">WA ✓</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getCustomerDealCount(customer.id) > 0 ? 'default' : 'secondary'}>
                      {getCustomerDealCount(customer.id)} deal(s)
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      Bekijk
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
