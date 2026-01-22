import { NextRequest, NextResponse } from 'next/server';
import { getAllAlerts, markAlertTriggered, getAllSubscriptions } from '@/lib/store';
import { sendPushToDevice } from '@/lib/push';
import { COINGECKO_API_URL, CRON_SECRET } from '@/lib/config';
import type { PriceData, CoinId } from '@/types';
import { COIN_MAP } from '@/types';

interface TriggeredAlert {
  id: string;
  deviceId: string;
  coin: CoinId;
  coinSymbol: string;
  condition: 'above' | 'below';
  targetPrice: number;
  currentPrice: number;
}

async function fetchCurrentPrices(): Promise<Record<CoinId, number>> {
  const url = `${COINGECKO_API_URL}/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd`;

  const response = await fetch(url, {
    headers: { Accept: 'application/json' },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch prices: ${response.status}`);
  }

  const data: PriceData = await response.json();

  return {
    bitcoin: data.bitcoin?.usd || 0,
    ethereum: data.ethereum?.usd || 0,
    solana: data.solana?.usd || 0,
  };
}

export async function GET(request: NextRequest) {
  try {
    // Verify authorization for cron jobs
    const authHeader = request.headers.get('authorization');
    const isLocalhost = request.headers.get('host')?.includes('localhost');
    const isVercelCron = authHeader === `Bearer ${CRON_SECRET}`;

    // Allow localhost for testing, or valid cron secret
    if (!isLocalhost && !isVercelCron) {
      // Also check for Vercel's cron header
      const vercelCronHeader = request.headers.get('x-vercel-cron');
      if (!vercelCronHeader) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
    }

    // Fetch current prices
    const prices = await fetchCurrentPrices();

    // Get all alerts
    const alerts = await getAllAlerts();

    // Get all subscriptions to verify we can send notifications
    const subscriptions = await getAllSubscriptions();
    const deviceIds = new Set(subscriptions.map(s => s.deviceId));

    // Check each alert
    const triggered: TriggeredAlert[] = [];

    for (const alert of alerts) {
      // Skip already triggered alerts
      if (alert.triggered) continue;

      // Skip if device has no subscription
      if (!deviceIds.has(alert.deviceId)) continue;

      const currentPrice = prices[alert.coin];
      if (!currentPrice) continue;

      const shouldTrigger =
        (alert.condition === 'above' && currentPrice >= alert.targetPrice) ||
        (alert.condition === 'below' && currentPrice <= alert.targetPrice);

      if (shouldTrigger) {
        triggered.push({
          ...alert,
          currentPrice,
        });

        // Mark as triggered
        await markAlertTriggered(alert.id);
      }
    }

    // Send push notifications for triggered alerts
    for (const alert of triggered) {
      const direction = alert.condition === 'above' ? 'above' : 'below';
      const symbol = COIN_MAP[alert.coin]?.symbol || alert.coin;

      await sendPushToDevice(alert.deviceId, {
        title: `${symbol} Alert Triggered!`,
        body: `${symbol} is now $${alert.currentPrice.toLocaleString()} (${direction} $${alert.targetPrice.toLocaleString()})`,
        tag: `alert-${alert.id}`,
        data: {
          alertId: alert.id,
          coin: alert.coin,
          currentPrice: alert.currentPrice,
        },
      });
    }

    return NextResponse.json({
      checked: alerts.filter(a => !a.triggered).length,
      triggered: triggered.length,
      prices,
    });
  } catch (error) {
    console.error('Check alerts error:', error);
    return NextResponse.json(
      { error: 'Failed to check alerts' },
      { status: 500 }
    );
  }
}
