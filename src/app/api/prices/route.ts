import { NextResponse } from 'next/server';
import type { CryptoPrice, PriceData } from '@/types';
import { COINGECKO_API_URL, PRICE_CACHE_TTL } from '@/lib/config';
import { COIN_MAP } from '@/types';

// In-memory cache for rate limiting protection
let priceCache: { data: CryptoPrice[]; timestamp: number } | null = null;

async function fetchFromCoinGecko(): Promise<CryptoPrice[]> {
  const url = `${COINGECKO_API_URL}/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd&include_24hr_change=true&include_sparkline=false`;

  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
    },
    next: { revalidate: 30 },
  });

  if (!response.ok) {
    throw new Error(`CoinGecko API error: ${response.status}`);
  }

  const data: PriceData = await response.json();

  // Transform to our format
  const prices: CryptoPrice[] = Object.entries(data).map(([id, coin]) => ({
    id,
    symbol: COIN_MAP[id as keyof typeof COIN_MAP]?.symbol || id.toUpperCase(),
    name: COIN_MAP[id as keyof typeof COIN_MAP]?.name || id,
    price: coin.usd,
    change24h: coin.usd_24h_change || 0,
  }));

  // Sort: BTC, ETH, SOL
  const order = ['bitcoin', 'ethereum', 'solana'];
  prices.sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));

  return prices;
}

export async function GET() {
  try {
    // Check cache
    const now = Date.now();
    if (priceCache && now - priceCache.timestamp < PRICE_CACHE_TTL) {
      return NextResponse.json({
        prices: priceCache.data,
        timestamp: priceCache.timestamp,
        cached: true,
      });
    }

    // Fetch fresh data
    const prices = await fetchFromCoinGecko();

    // Update cache
    priceCache = { data: prices, timestamp: now };

    return NextResponse.json({
      prices,
      timestamp: now,
      cached: false,
    });
  } catch (error) {
    console.error('Failed to fetch prices:', error);

    // Return cached data if available
    if (priceCache) {
      return NextResponse.json({
        prices: priceCache.data,
        timestamp: priceCache.timestamp,
        cached: true,
        stale: true,
      });
    }

    return NextResponse.json(
      { error: 'Failed to fetch prices' },
      { status: 500 }
    );
  }
}
