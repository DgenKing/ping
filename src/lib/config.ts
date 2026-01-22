// VAPID Keys for Web Push
// These are loaded from environment variables

export const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || 'BFr3vMZoYZd7upTgyeaPE9XAZQYc-7786TBCimL3u267Is0dl5cOKaHtOQ5l6xE6ostNx5hFPo1wJRpD2CBg-m8';

export const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || 'bp-Ejcxqxg6xkHwRmUG5HGpEGSUjGWH1Xjs6Jwf3mPc';

export const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:ping@example.com';

// CoinGecko API
export const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3';

// Price refresh interval (ms)
export const PRICE_REFRESH_INTERVAL = 30000;

// Cache TTL (ms)
export const PRICE_CACHE_TTL = 30000;

// Cron secret for vercel
export const CRON_SECRET = process.env.CRON_SECRET || 'ping-cron-secret-local';
