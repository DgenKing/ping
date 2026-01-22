'use client';

import { Trash2, RefreshCw, TrendingUp, TrendingDown, Bell, BellOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Alert } from '@/types';

interface AlertListProps {
  alerts: Alert[];
  onDelete: (alertId: string) => Promise<boolean>;
  onReset: (alertId: string) => Promise<boolean>;
}

export function AlertList({ alerts, onDelete, onReset }: AlertListProps) {
  if (alerts.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-700 p-8 text-center">
        <Bell className="mx-auto h-12 w-12 text-slate-600" />
        <h3 className="mt-4 font-medium text-slate-300">No alerts set</h3>
        <p className="mt-1 text-sm text-slate-500">
          Create an alert to get notified when prices reach your targets.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className={`flex items-center justify-between rounded-xl border p-4 transition-all ${
            alert.triggered
              ? 'border-amber-500/50 bg-amber-500/10'
              : 'border-slate-700/50 bg-slate-800/50'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full ${
                alert.triggered
                  ? 'bg-amber-500/20 text-amber-400'
                  : alert.condition === 'above'
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'bg-rose-500/20 text-rose-400'
              }`}
            >
              {alert.triggered ? (
                <BellOff className="h-5 w-5" />
              ) : alert.condition === 'above' ? (
                <TrendingUp className="h-5 w-5" />
              ) : (
                <TrendingDown className="h-5 w-5" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white">{alert.coinSymbol}</span>
                <span className="text-sm text-slate-400">
                  {alert.condition === 'above' ? 'above' : 'below'}
                </span>
                <span className="font-mono text-white">
                  ${alert.targetPrice.toLocaleString()}
                </span>
              </div>
              {alert.triggered && (
                <p className="text-xs text-amber-400">Triggered - tap to reactivate</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1">
            {alert.triggered && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-amber-400 hover:bg-amber-500/20 hover:text-amber-300"
                onClick={() => onReset(alert.id)}
                title="Reactivate alert"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-slate-400 hover:bg-rose-500/20 hover:text-rose-400"
              onClick={() => onDelete(alert.id)}
              title="Delete alert"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
