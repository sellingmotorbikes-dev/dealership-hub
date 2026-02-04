import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { configureWebhook, disableWebhook, getConfig, emitDealEvent, getEventHistory, clearEventHistory } from '@/lib/eventService';
import { mockDeals } from '@/data/mockData';
import { Settings as SettingsIcon, Webhook, TestTube, Trash2, CheckCircle, XCircle } from 'lucide-react';

const WEBHOOK_STORAGE_KEY = 'n8n_webhook_url';

export default function Settings() {
  const [webhookUrl, setWebhookUrl] = useState('');
  const [isConfigured, setIsConfigured] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const { toast } = useToast();

  // Load saved webhook URL on mount
  useEffect(() => {
    const savedUrl = localStorage.getItem(WEBHOOK_STORAGE_KEY);
    if (savedUrl) {
      setWebhookUrl(savedUrl);
      configureWebhook(savedUrl);
      setIsConfigured(true);
    }
  }, []);

  const handleSave = () => {
    if (!webhookUrl.trim()) {
      toast({
        title: 'URL vereist',
        description: 'Voer een geldige webhook URL in',
        variant: 'destructive',
      });
      return;
    }

    try {
      new URL(webhookUrl);
    } catch {
      toast({
        title: 'Ongeldige URL',
        description: 'Voer een geldige URL in (bijv. https://...)',
        variant: 'destructive',
      });
      return;
    }

    localStorage.setItem(WEBHOOK_STORAGE_KEY, webhookUrl);
    configureWebhook(webhookUrl);
    setIsConfigured(true);

    toast({
      title: 'Webhook opgeslagen',
      description: 'De n8n webhook URL is geconfigureerd',
    });
  };

  const handleDisconnect = () => {
    localStorage.removeItem(WEBHOOK_STORAGE_KEY);
    disableWebhook();
    setWebhookUrl('');
    setIsConfigured(false);

    toast({
      title: 'Webhook verwijderd',
      description: 'De n8n integratie is uitgeschakeld',
    });
  };

  const handleTestEvent = async () => {
    if (!isConfigured) {
      toast({
        title: 'Geen webhook geconfigureerd',
        description: 'Sla eerst een webhook URL op',
        variant: 'destructive',
      });
      return;
    }

    setIsTesting(true);

    try {
      // Use first mock deal for testing
      const testDeal = mockDeals[0];
      
      await emitDealEvent('phase_changed', testDeal, {
        oldPhase: 'lead_verkoop',
        newPhase: 'betaling',
        isTestEvent: true,
      });

      toast({
        title: 'Test event verzonden',
        description: 'Controleer je n8n workflow voor het ontvangen event',
      });
    } catch (error) {
      toast({
        title: 'Test mislukt',
        description: 'Er is een fout opgetreden bij het verzenden',
        variant: 'destructive',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleClearHistory = () => {
    clearEventHistory();
    toast({
      title: 'Geschiedenis gewist',
      description: 'Alle event logs zijn verwijderd',
    });
  };

  const eventHistory = getEventHistory();
  const config = getConfig();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <SettingsIcon className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Instellingen</h1>
          <p className="text-muted-foreground">Beheer je n8n integratie</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Webhook Configuration */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Webhook className="h-5 w-5" />
                <CardTitle>n8n Webhook</CardTitle>
              </div>
              {isConfigured ? (
                <Badge variant="default" className="gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Verbonden
                </Badge>
              ) : (
                <Badge variant="secondary" className="gap-1">
                  <XCircle className="h-3 w-3" />
                  Niet verbonden
                </Badge>
              )}
            </div>
            <CardDescription>
              Configureer de webhook URL om events naar n8n te versturen
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="webhook-url">Webhook URL</Label>
              <Input
                id="webhook-url"
                type="url"
                placeholder="https://your-n8n-instance.app/webhook/..."
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Kopieer de Production URL van je n8n Webhook trigger node
              </p>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSave} className="flex-1">
                Opslaan
              </Button>
              {isConfigured && (
                <Button variant="outline" onClick={handleDisconnect}>
                  Verwijderen
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Test & Debug */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <TestTube className="h-5 w-5" />
              <CardTitle>Test & Debug</CardTitle>
            </div>
            <CardDescription>
              Verstuur een test event en bekijk de event geschiedenis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={handleTestEvent} 
              disabled={!isConfigured || isTesting}
              variant="outline"
              className="w-full"
            >
              {isTesting ? 'Verzenden...' : 'Test Event Versturen'}
            </Button>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Event Geschiedenis</Label>
                {eventHistory.length > 0 && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={handleClearHistory}
                    className="h-7 gap-1 text-xs"
                  >
                    <Trash2 className="h-3 w-3" />
                    Wissen
                  </Button>
                )}
              </div>
              
              <div className="rounded-md border bg-muted/50 p-3 max-h-48 overflow-y-auto">
                {eventHistory.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Nog geen events verzonden
                  </p>
                ) : (
                  <div className="space-y-2">
                    {eventHistory.slice(-5).reverse().map((event, i) => (
                      <div 
                        key={i} 
                        className="text-xs bg-background rounded p-2 space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="text-xs">
                            {event.type}
                          </Badge>
                          <span className="text-muted-foreground">
                            {new Date(event.timestamp).toLocaleTimeString('nl-NL')}
                          </span>
                        </div>
                        <p className="text-muted-foreground">
                          Deal: {event.dealNumber}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="text-xs text-muted-foreground space-y-1">
              <p><strong>Status:</strong> {config.enabled ? 'Actief' : 'Inactief'}</p>
              <p><strong>Events verzonden:</strong> {eventHistory.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Hoe te configureren</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none dark:prose-invert">
          <ol className="space-y-2 text-sm text-muted-foreground">
            <li>Open n8n en maak een nieuwe workflow</li>
            <li>Voeg een <strong>Webhook</strong> trigger node toe (HTTP Method: POST)</li>
            <li>Kopieer de <strong>Production</strong> webhook URL</li>
            <li>Plak de URL hierboven en klik op Opslaan</li>
            <li>Klik op "Test Event Versturen" om de verbinding te testen</li>
            <li>Voeg in n8n een <strong>Switch</strong> node toe om events te routeren op basis van <code>type</code></li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
