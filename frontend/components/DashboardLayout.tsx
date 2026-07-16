// components/layout/DashboardLayout.tsx
'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import { LogOut, LayoutDashboard, Upload, ChevronDown, Bell, Settings, User } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Upload', href: '/upload', icon: Upload },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Left Section - Logo & Brand */}
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10">
                <Image
                  src="/logo.png"
                  alt="LexAI Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold text-gray-900 tracking-tight">LexAI</span>
                <span className="hidden sm:inline text-xs font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                  Enterprise
                </span>
              </div>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center gap-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <button
                    key={item.name}
                    onClick={() => router.push(item.href)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <item.icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                    {item.name}
                  </button>
                );
              })}
            </div>

            {/* Right Section - User & Actions */}
            <div className="flex items-center gap-3">
              <button className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-all">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full" />
              </button>
              
              <div className="flex items-center gap-3 pl-3 border-l border-gray-200">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white font-semibold text-sm">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-red-600 transition-all"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden md:inline">Logout</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden border-t border-gray-100 bg-gray-50/50">
          <div className="flex justify-around px-4 py-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <button
                  key={item.name}
                  onClick={() => router.push(item.href)}
                  className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-all ${
                    isActive ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <item.icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                  <span className="text-xs font-medium">{item.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
    </div>
  );
}