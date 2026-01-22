'use client';

import { useState } from 'react';
import { RefreshCw, Plus, X } from 'lucide-react';
import { CryptoCard } from './CryptoCard';
import { CryptoCardSkeleton } from './CryptoCardSkeleton';
import { AlertForm } from './AlertForm';
import { AlertList } from './AlertList';
import { Button } from '@/components/ui/button';
import { usePrices } from '@/hooks/usePrices';
import { useAlerts } from '@/hooks/useAlerts';
import type { CryptoPrice, CoinId } from '@/types';
import { toast } from 'sonner';

export function Dashboard() {
  const { prices, lastUpdated, isStale, isLoading, error, refresh } = usePrices();
  const { alerts, createAlert, deleteAlert, resetAlert } = useAlerts();
  const [showAlertForm, setShowAlertForm] = useState(false);
  const [selectedCoin, setSelectedCoin] = useState<CoinId | undefined>();

  const handleSetAlert = (crypto: CryptoPrice) => {
    setSelectedCoin(crypto.id as CoinId);
    setShowAlertForm(true);
  };

  const handleCreateAlert = async (coin: CoinId, condition: 'above' | 'below', targetPrice: number) => {
    const success = await createAlert(coin, condition, targetPrice);
    if (success) {
      toast.success('Alert created', {
        description: `You'll be notified when ${coin} goes ${condition} $${targetPrice.toLocaleString()}`,
      });
      setShowAlertForm(false);
    } else {
      toast.error('Failed to create alert');
    }
    return success;
  };

  const handleDeleteAlert = async (alertId: string) => {
    const success = await deleteAlert(alertId);
    if (success) {
      toast.success('Alert deleted');
    }
    return success;
  };

  const handleResetAlert = async (alertId: string) => {
    const success = await resetAlert(alertId);
    if (success) {
      toast.success('Alert reactivated');
    }
    return success;
  };

  return (
    <div className="space-y-8">
      {/* Price Cards */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Prices</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={refresh}
            disabled={isLoading}
            className="text-slate-400 hover:text-white"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {error && !prices && (
          <div className="rounded-xl border border-rose-500/50 bg-rose-500/10 p-4 text-center">
            <p className="text-rose-400">{error}</p>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading && !prices ? (
            <>
              <CryptoCardSkeleton />
              <CryptoCardSkeleton />
              <CryptoCardSkeleton />
            </>
          ) : (
            prices?.map((crypto) => (
              <CryptoCard
                key={crypto.id}
                crypto={crypto}
                onSetAlert={handleSetAlert}
              />
            ))
          )}
        </div>

        {/* Last updated */}
        {lastUpdated && (
          <p className="mt-4 text-center text-xs text-slate-500">
            {isStale && <span className="text-amber-400">Offline - </span>}
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        )}
      </section>

      {/* Alerts Section */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Your Alerts</h2>
          <Button
            size="sm"
            onClick={() => setShowAlertForm(true)}
            className="bg-indigo-600 hover:bg-indigo-500"
          >
            <Plus className="mr-2 h-4 w-4" />
            New Alert
          </Button>
        </div>

        {/* Alert Form Modal */}
        {showAlertForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="relative w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6">
              <button
                onClick={() => setShowAlertForm(false)}
                className="absolute right-4 top-4 text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
              <h3 className="mb-4 text-lg font-semibold text-white">Create Price Alert</h3>
              <AlertForm
                onSubmit={handleCreateAlert}
                currentPrices={prices || undefined}
                defaultCoin={selectedCoin}
                onCancel={() => setShowAlertForm(false)}
              />
            </div>
          </div>
        )}

        <AlertList
          alerts={alerts}
          onDelete={handleDeleteAlert}
          onReset={handleResetAlert}
        />
      </section>
    </div>
  );
}
