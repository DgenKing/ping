'use client';

import { Bell, BellOff, AlertTriangle, Loader2, CheckCircle2, Globe } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useNotifications } from '@/hooks/useNotifications';
import { getBrowserInfo } from '@/lib/browser-detect';
import { useEffect, useState } from 'react';
import type { BrowserInfo } from '@/types';

export function NotificationManager() {
  const { permission, isSubscribed, isLoading, error, isLocalhost, subscribe, unsubscribe } = useNotifications();
  const [browserInfo, setBrowserInfo] = useState<BrowserInfo | null>(null);

  useEffect(() => {
    setBrowserInfo(getBrowserInfo());
  }, []);

  const handleToggle = async (checked: boolean) => {
    if (checked) {
      await subscribe();
    } else {
      await unsubscribe();
    }
  };

  // Localhost warning - show instead of the toggle
  if (permission === 'localhost' || isLocalhost) {
    return (
      <div className="space-y-4">
        <div className="rounded-xl border border-blue-500/50 bg-blue-500/10 p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/20">
              <Globe className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Development Mode</h3>
              <p className="mt-1 text-sm text-blue-200">
                Push notifications require HTTPS and won&apos;t work on localhost.
              </p>
              <p className="mt-2 text-sm text-slate-400">
                To test push notifications, deploy to Vercel:
              </p>
              <code className="mt-2 block rounded bg-slate-800 px-3 py-2 text-xs text-slate-300">
                vercel deploy
              </code>
              <p className="mt-3 text-xs text-slate-500">
                Everything else (prices, alerts, UI) works locally.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (permission === 'unsupported') {
    return (
      <div className="rounded-xl border border-slate-700/50 bg-slate-800/50 p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-700">
            <BellOff className="h-6 w-6 text-slate-400" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Notifications Not Supported</h3>
            <p className="mt-1 text-sm text-slate-400">
              Your browser doesn&apos;t support push notifications. Try using a different browser.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Vanadium Warning */}
      {browserInfo?.isVanadium && (
        <div className="rounded-xl border border-amber-500/50 bg-amber-500/10 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-amber-200">Limited Push Support</h4>
              <p className="mt-1 text-sm text-amber-200/80">
                Push notifications may be unreliable on Vanadium. For best results, use{' '}
                <strong>Brave</strong> or <strong>Firefox</strong>.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main notification toggle */}
      <div className="rounded-xl border border-slate-700/50 bg-slate-800/50 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-full ${
                isSubscribed
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'bg-slate-700 text-slate-400'
              }`}
            >
              {isLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : isSubscribed ? (
                <CheckCircle2 className="h-6 w-6" />
              ) : (
                <Bell className="h-6 w-6" />
              )}
            </div>
            <div>
              <Label htmlFor="notifications" className="text-base font-semibold text-white">
                Push Notifications
              </Label>
              <p className="text-sm text-slate-400">
                {isSubscribed
                  ? 'You will receive alerts when prices hit your targets'
                  : 'Enable to receive price alerts'}
              </p>
            </div>
          </div>

          <Switch
            id="notifications"
            checked={isSubscribed}
            onCheckedChange={handleToggle}
            disabled={isLoading || permission === 'denied'}
          />
        </div>

        {/* Permission denied warning */}
        {permission === 'denied' && (
          <div className="mt-4 rounded-lg bg-rose-500/10 p-3">
            <p className="text-sm text-rose-400">
              Notifications are blocked. Please enable them in your browser settings.
            </p>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="mt-4 rounded-lg bg-rose-500/10 p-3">
            <p className="text-sm text-rose-400">{error}</p>
          </div>
        )}
      </div>

      {/* Browser info */}
      {browserInfo && (
        <div className="rounded-xl border border-slate-700/50 bg-slate-800/50 p-4">
          <h4 className="text-sm font-medium text-slate-300">Push Reliability</h4>
          <div className="mt-2 flex items-center gap-2">
            <div
              className={`h-2 w-2 rounded-full ${
                browserInfo.pushReliability === 'good'
                  ? 'bg-emerald-400'
                  : browserInfo.pushReliability === 'poor'
                  ? 'bg-rose-400'
                  : 'bg-amber-400'
              }`}
            />
            <span className="text-sm text-slate-400">
              {browserInfo.pushReliability === 'good'
                ? 'Good - Push notifications should work reliably'
                : browserInfo.pushReliability === 'poor'
                ? 'Poor - Consider using Brave or Firefox'
                : 'Unknown - Push support may vary'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
