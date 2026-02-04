import { configureWebhook } from './eventService';

const WEBHOOK_STORAGE_KEY = 'n8n_webhook_url';

/**
 * Initialize webhook configuration from localStorage
 * Call this on app startup to restore webhook settings
 */
export function initializeWebhook(): void {
  const savedUrl = localStorage.getItem(WEBHOOK_STORAGE_KEY);
  
  if (savedUrl) {
    try {
      new URL(savedUrl); // Validate URL
      configureWebhook(savedUrl);
      console.log('[Webhook] Initialized from localStorage');
    } catch {
      console.warn('[Webhook] Invalid URL in localStorage, skipping');
      localStorage.removeItem(WEBHOOK_STORAGE_KEY);
    }
  } else {
    console.log('[Webhook] No saved configuration found');
  }
}
