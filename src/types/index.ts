// Crypto price data
export interface PriceData {
  bitcoin: CoinPrice;
  ethereum: CoinPrice;
  solana: CoinPrice;
}

export interface CoinPrice {
  usd: number;
  usd_24h_change: number;
}

// Normalized price for UI
export interface CryptoPrice {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  sparkline?: number[];
}

// Alert types
export type AlertCondition = 'above' | 'below';
export type CoinId = 'bitcoin' | 'ethereum' | 'solana';

export interface Alert {
  id: string;
  deviceId: string;
  coin: CoinId;
  coinSymbol: string;
  condition: AlertCondition;
  targetPrice: number;
  triggered: boolean;
  createdAt: number;
}

export interface CreateAlertPayload {
  coin: CoinId;
  condition: AlertCondition;
  targetPrice: number;
}

// Push subscription
export interface StoredSubscription {
  deviceId: string;
  subscription: PushSubscriptionJSON;
  createdAt: number;
}

// Store structure
export interface StoreData {
  subscriptions: Record<string, StoredSubscription>;
  alerts: Alert[];
}

// API responses
export interface PricesResponse {
  prices: CryptoPrice[];
  timestamp: number;
}

export interface AlertsResponse {
  alerts: Alert[];
}

export interface CheckAlertsResponse {
  checked: number;
  triggered: number;
}

// Browser info
export interface BrowserInfo {
  isVanadium: boolean;
  isBrave: boolean;
  isFirefox: boolean;
  pushReliability: 'good' | 'poor' | 'unknown';
}

// Coin mapping
export const COIN_MAP: Record<CoinId, { symbol: string; name: string }> = {
  bitcoin: { symbol: 'BTC', name: 'Bitcoin' },
  ethereum: { symbol: 'ETH', name: 'Ethereum' },
  solana: { symbol: 'SOL', name: 'Solana' },
};
