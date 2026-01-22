'use client';

import { useState, useEffect, useCallback } from 'react';
import { getDeviceId } from '@/lib/device-id';
import { VAPID_PUBLIC_KEY } from '@/lib/config';

type PermissionState = 'prompt' | 'granted' | 'denied' | 'unsupported' | 'localhost';

interface UseNotificationsResult {
  permission: PermissionState;
  isSubscribed: boolean;
  isLoading: boolean;
  error: string | null;
  isLocalhost: boolean;
  subscribe: () => Promise<boolean>;
  unsubscribe: () => Promise<boolean>;
}

function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray.buffer as ArrayBuffer;
}

function isLocalhostEnv(): boolean {
  if (typeof window === 'undefined') return false;
  const hostname = window.location.hostname;
  const protocol = window.location.protocol;

  // If we're on HTTPS, we're not localhost (deployed)
  if (protocol === 'https:') return false;

  // Only localhost/127.0.0.1/local IPs on HTTP are considered localhost
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168.');
}

export function useNotifications(): UseNotificationsResult {
  const [permission, setPermission] = useState<PermissionState>('prompt');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLocalhost, setIsLocalhost] = useState(false);

  // Check current state on mount
  useEffect(() => {
    const checkStatus = async () => {
      // Check if running on localhost
      const localhost = isLocalhostEnv();
      setIsLocalhost(localhost);

      // Check if push is supported
      if (!('Notification' in window) || !('serviceWorker' in navigator) || !('PushManager' in window)) {
        setPermission('unsupported');
        setIsLoading(false);
        return;
      }

      // On localhost, push subscription won't work - mark it specially
      if (localhost) {
        setPermission('localhost');
        setIsLoading(false);
        return;
      }

      // Get permission state
      const perm = Notification.permission;
      if (perm === 'default') {
        setPermission('prompt');
      } else if (perm === 'granted') {
        setPermission('granted');
      } else {
        setPermission('denied');
      }

      // Check if already subscribed
      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        setIsSubscribed(!!subscription);
      } catch (e) {
        console.error('Failed to check subscription:', e);
      }

      setIsLoading(false);
    };

    checkStatus();
  }, []);

  const subscribe = useCallback(async (): Promise<boolean> => {
    // Block subscription on localhost
    if (isLocalhostEnv()) {
      setError('Push notifications require HTTPS. Deploy to Vercel to test.');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Request permission
      const perm = await Notification.requestPermission();
      if (perm === 'default') {
        setPermission('prompt');
      } else if (perm === 'granted') {
        setPermission('granted');
      } else {
        setPermission('denied');
      }

      if (perm !== 'granted') {
        setError('Notification permission denied');
        return false;
      }

      // Get service worker registration
      const registration = await navigator.serviceWorker.ready;

      // Subscribe to push
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      // Send subscription to server
      const deviceId = getDeviceId();
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deviceId,
          subscription: subscription.toJSON(),
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to save subscription');
      }

      setIsSubscribed(true);
      return true;
    } catch (e) {
      console.error('Subscribe error:', e);
      const message = e instanceof Error ? e.message : 'Failed to subscribe';
      // Provide helpful message for common errors
      if (message.includes('push service') || message.includes('AbortError')) {
        setError('Push not available on localhost. Deploy to HTTPS to enable.');
      } else {
        setError(message);
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const unsubscribe = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();
      }

      // Remove from server
      const deviceId = getDeviceId();
      await fetch('/api/subscribe', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceId }),
      });

      setIsSubscribed(false);
      return true;
    } catch (e) {
      console.error('Unsubscribe error:', e);
      setError('Failed to unsubscribe');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    permission,
    isSubscribed,
    isLoading,
    error,
    isLocalhost,
    subscribe,
    unsubscribe,
  };
}
