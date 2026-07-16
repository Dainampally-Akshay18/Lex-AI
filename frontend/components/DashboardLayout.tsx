'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter, usePathname } from 'next/navigation';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: '🏠' },
    { name: 'Upload', href: '/upload', icon: '📤' },
  ];

  return (
    <div className="min-h-screen bg-slate-50/40 text-slate-900">
      <nav className="border-b border-slate-200/80 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-sm font-semibold text-white shadow-sm">
                  L
                </div>
                <div>
                  <h1 className="text-base font-semibold tracking-tight text-slate-900">LexAI</h1>
                  <p className="text-xs text-slate-500">Enterprise analysis workspace</p>
                </div>
              </div>
              <div className="hidden sm:flex sm:space-x-2">
                {navigation.map((item) => (
                  <button
                    key={item.name}
                    onClick={() => router.push(item.href)}
                    className={`inline-flex items-center rounded-full px-4 py-2 text-sm font-medium transition ${
                      pathname === item.href
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <span className="mr-2">{item.icon}</span>
                    {item.name}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-slate-900">{user?.name}</p>
                <p className="text-xs text-slate-500">{user?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">{children}</div>
      </main>
    </div>
  );
}
