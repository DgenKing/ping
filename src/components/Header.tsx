'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell, Settings, Zap } from 'lucide-react';

interface HeaderProps {
  notificationStatus?: 'subscribed' | 'unsubscribed' | 'unsupported';
}

export function Header({ notificationStatus }: HeaderProps) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/80 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white">Ping</span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-1">
          <Link
            href="/"
            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              pathname === '/'
                ? 'bg-slate-800 text-white'
                : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
            }`}
          >
            Dashboard
          </Link>

          <Link
            href="/settings"
            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              pathname === '/settings'
                ? 'bg-slate-800 text-white'
                : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
            }`}
          >
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Settings</span>
          </Link>

          {/* Notification status indicator */}
          <div className="ml-2 flex items-center">
            <div
              className={`relative flex h-8 w-8 items-center justify-center rounded-full ${
                notificationStatus === 'subscribed'
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : notificationStatus === 'unsupported'
                  ? 'bg-slate-500/20 text-slate-400'
                  : 'bg-amber-500/20 text-amber-400'
              }`}
              title={
                notificationStatus === 'subscribed'
                  ? 'Notifications enabled'
                  : notificationStatus === 'unsupported'
                  ? 'Notifications not supported'
                  : 'Notifications disabled'
              }
            >
              <Bell className="h-4 w-4" />
              {notificationStatus === 'subscribed' && (
                <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400" />
              )}
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
}
