'use client';

import { TrendingUp, TrendingDown, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { CryptoPrice } from '@/types';

interface CryptoCardProps {
  crypto: CryptoPrice;
  onSetAlert?: (crypto: CryptoPrice) => void;
}

export function CryptoCard({ crypto, onSetAlert }: CryptoCardProps) {
  const isPositive = crypto.change24h >= 0;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-700/50 bg-slate-900/50 p-6 backdrop-blur-md transition-all hover:border-slate-600/50 hover:bg-slate-800/50">
      {/* Glow effect */}
      <div
        className={`absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-20 blur-3xl ${
          isPositive ? 'bg-emerald-500' : 'bg-rose-500'
        }`}
      />

      <div className="relative">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800">
              <span className="text-lg font-bold text-white">{crypto.symbol.charAt(0)}</span>
            </div>
            <div>
              <h3 className="font-semibold text-white">{crypto.symbol}</h3>
              <p className="text-xs text-slate-400">{crypto.name}</p>
            </div>
          </div>

          <div
            className={`flex items-center gap-1 rounded-full px-2 py-1 text-sm font-medium ${
              isPositive
                ? 'bg-emerald-500/10 text-emerald-400'
                : 'bg-rose-500/10 text-rose-400'
            }`}
          >
            {isPositive ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            <span>{isPositive ? '+' : ''}{crypto.change24h.toFixed(2)}%</span>
          </div>
        </div>

        {/* Price */}
        <div className="mb-4">
          <p className="font-mono text-3xl font-bold tracking-tight text-white">
            ${crypto.price.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: crypto.price < 1 ? 4 : 2,
            })}
          </p>
        </div>

        {/* Alert Button */}
        {onSetAlert && (
          <Button
            onClick={() => onSetAlert(crypto)}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white"
          >
            <Bell className="mr-2 h-4 w-4" />
            Set Alert
          </Button>
        )}
      </div>
    </div>
  );
}
