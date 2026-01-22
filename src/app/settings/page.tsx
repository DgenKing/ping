'use client';

import { Header } from '@/components/Header';
import { NotificationManager } from '@/components/NotificationManager';
import { AlertList } from '@/components/AlertList';
import { useNotifications } from '@/hooks/useNotifications';
import { useAlerts } from '@/hooks/useAlerts';
import { toast } from 'sonner';
import { Shield, Zap, Github } from 'lucide-react';

export default function SettingsPage() {
  const { permission, isSubscribed } = useNotifications();
  const { alerts, deleteAlert, resetAlert } = useAlerts();

  const notificationStatus =
    permission === 'unsupported' ? 'unsupported' :
    isSubscribed ? 'subscribed' : 'unsubscribed';

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
    <div className="min-h-screen bg-slate-950">
      <Header notificationStatus={notificationStatus} />

      <main className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="mb-8 text-2xl font-bold text-white">Settings</h1>

        {/* Notification Settings */}
        <section className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-white">Notifications</h2>
          <NotificationManager />
        </section>

        {/* Active Alerts */}
        <section className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-white">Your Alerts</h2>
          <AlertList
            alerts={alerts}
            onDelete={handleDeleteAlert}
            onReset={handleResetAlert}
          />
        </section>

        {/* About Section */}
        <section className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-white">About</h2>
          <div className="rounded-xl border border-slate-700/50 bg-slate-800/50 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-600">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Ping</h3>
                <p className="text-sm text-slate-400">Privacy-first crypto alerts</p>
              </div>
            </div>

            <div className="space-y-3 text-sm text-slate-300">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-white">No Google, No Firebase</p>
                  <p className="text-slate-400">Uses Web Push (VAPID) for notifications. Works on de-Googled devices.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Zap className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-white">Real-time Alerts</p>
                  <p className="text-slate-400">Get notified when BTC, ETH, or SOL hit your price targets.</p>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-700">
              <p className="text-xs text-slate-500">
                Price data from CoinGecko. For best push notification support on GrapheneOS/LineageOS, use Brave or Firefox.
              </p>
            </div>
          </div>
        </section>

        {/* Version */}
        <div className="text-center text-xs text-slate-600">
          <p>Ping v1.0.0</p>
          <p className="mt-1">Built with Next.js, Tailwind CSS, and Web Push API</p>
        </div>
      </main>

      {/* Decorative gradient */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-indigo-600/20 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-emerald-600/20 blur-3xl" />
      </div>
    </div>
  );
}
