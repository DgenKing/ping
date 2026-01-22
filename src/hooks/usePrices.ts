'use client';

import { useState, useEffect, useCallback } from 'react';
import type { CryptoPrice } from '@/types';
import { cachePrices, getCachedPrices } from '@/lib/price-cache';
import { PRICE_REFRESH_INTERVAL } from '@/lib/config';

interface UsePricesResult {
  prices: CryptoPrice[] | null;
  lastUpdated: Date | null;
  isStale: boolean;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function usePrices(): UsePricesResult {
  const [prices, setPrices] = useState<CryptoPrice[] | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isStale, setIsStale] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPrices = useCallback(async () => {
    try {
      const res = await fetch('/api/prices');

      if (!res.ok) {
        throw new Error('Failed to fetch prices');
      }

      const data = await res.json();
      setPrices(data.prices);
      setLastUpdated(new Date(data.timestamp));
      setIsStale(data.stale || false);
      setError(null);

      // Cache for offline use
      if (data.prices) {
        await cachePrices(data.prices);
      }
    } catch (e) {
      console.error('Price fetch error:', e);

      // Try to load from cache
      const cached = await getCachedPrices();
      if (cached) {
        setPrices(cached.data);
        setLastUpdated(new Date(cached.timestamp));
        setIsStale(true);
        setError('Using cached data');
      } else {
        setError('Unable to fetch prices');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial fetch
    fetchPrices();

    // Set up polling
    const interval = setInterval(fetchPrices, PRICE_REFRESH_INTERVAL);

    // Also refresh on visibility change
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        fetchPrices();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [fetchPrices]);

  return {
    prices,
    lastUpdated,
    isStale,
    isLoading,
    error,
    refresh: fetchPrices,
  };
}
