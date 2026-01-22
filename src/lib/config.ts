// VAPID Keys for Web Push
// These are loaded from environment variables

export const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || 'BO3CR55Tm53CM07YTBq0m0LEcSXSNRdv5KvMINJnlqNVXkq5RO5TH1KTQr5Yayncps8CuXmCCmTDkog_-3QWaC0';

export const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || 'HZZKg75jan9G6358cZmAV0TBqK1ArU2v-II-GNGXTIE';

export const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:ping@example.com';

// CoinGecko API
export const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3';

// Price refresh interval (ms)
export const PRICE_REFRESH_INTERVAL = 30000;

// Cache TTL (ms)
export const PRICE_CACHE_TTL = 30000;

// Cron secret for vercel
export const CRON_SECRET = process.env.CRON_SECRET || 'ping-cron-secret-local';
