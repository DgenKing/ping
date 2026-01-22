'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Alert, CoinId, AlertCondition } from '@/types';
import { getDeviceId } from '@/lib/device-id';

interface UseAlertsResult {
  alerts: Alert[];
  isLoading: boolean;
  error: string | null;
  createAlert: (coin: CoinId, condition: AlertCondition, targetPrice: number) => Promise<boolean>;
  deleteAlert: (alertId: string) => Promise<boolean>;
  resetAlert: (alertId: string) => Promise<boolean>;
  refresh: () => Promise<void>;
}

export function useAlerts(): UseAlertsResult {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAlerts = useCallback(async () => {
    try {
      const deviceId = getDeviceId();
      if (!deviceId) return;

      const res = await fetch('/api/alerts', {
        headers: {
          'x-device-id': deviceId,
        },
      });

      if (!res.ok) throw new Error('Failed to fetch alerts');

      const data = await res.json();
      setAlerts(data.alerts || []);
      setError(null);
    } catch (e) {
      console.error('Alerts fetch error:', e);
      setError('Failed to load alerts');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  const createAlert = useCallback(
    async (coin: CoinId, condition: AlertCondition, targetPrice: number): Promise<boolean> => {
      try {
        const deviceId = getDeviceId();
        if (!deviceId) throw new Error('No device ID');

        const res = await fetch('/api/alerts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-device-id': deviceId,
          },
          body: JSON.stringify({ coin, condition, targetPrice }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Failed to create alert');
        }

        const data = await res.json();
        setAlerts((prev) => [...prev, data.alert]);
        return true;
      } catch (e) {
        console.error('Create alert error:', e);
        setError(e instanceof Error ? e.message : 'Failed to create alert');
        return false;
      }
    },
    []
  );

  const deleteAlert = useCallback(async (alertId: string): Promise<boolean> => {
    try {
      const deviceId = getDeviceId();
      if (!deviceId) throw new Error('No device ID');

      const res = await fetch('/api/alerts', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-device-id': deviceId,
        },
        body: JSON.stringify({ alertId }),
      });

      if (!res.ok) throw new Error('Failed to delete alert');

      setAlerts((prev) => prev.filter((a) => a.id !== alertId));
      return true;
    } catch (e) {
      console.error('Delete alert error:', e);
      setError('Failed to delete alert');
      return false;
    }
  }, []);

  const resetAlert = useCallback(async (alertId: string): Promise<boolean> => {
    try {
      const deviceId = getDeviceId();
      if (!deviceId) throw new Error('No device ID');

      const res = await fetch('/api/alerts', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-device-id': deviceId,
        },
        body: JSON.stringify({ alertId, action: 'reset' }),
      });

      if (!res.ok) throw new Error('Failed to reset alert');

      setAlerts((prev) =>
        prev.map((a) => (a.id === alertId ? { ...a, triggered: false } : a))
      );
      return true;
    } catch (e) {
      console.error('Reset alert error:', e);
      setError('Failed to reset alert');
      return false;
    }
  }, []);

  return {
    alerts,
    isLoading,
    error,
    createAlert,
    deleteAlert,
    resetAlert,
    refresh: fetchAlerts,
  };
}
