'use client';

import { Header } from '@/components/Header';
import { Dashboard } from '@/components/Dashboard';
import { useNotifications } from '@/hooks/useNotifications';

export default function Home() {
  const { permission, isSubscribed } = useNotifications();

  const notificationStatus =
    permission === 'unsupported' ? 'unsupported' :
    isSubscribed ? 'subscribed' : 'unsubscribed';

  return (
    <div className="min-h-screen bg-slate-950">
      <Header notificationStatus={notificationStatus} />

      <main className="mx-auto max-w-4xl px-4 py-8">
        <Dashboard />
      </main>

      {/* Decorative gradient */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-indigo-600/20 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-emerald-600/20 blur-3xl" />
      </div>
    </div>
  );
}
