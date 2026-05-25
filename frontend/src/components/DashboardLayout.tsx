'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  ArrowUpDown, 
  CreditCard, 
  Target, 
  Sparkles, 
  FileText, 
  Crown, 
  LogOut, 
  Menu, 
  X, 
  Bell, 
  User 
} from 'lucide-react';
import { api } from '@/lib/api';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string; plan: string } | null>(null);
  const [notifications, setNotifications] = useState<string[]>([
    'Limite de cartão próximo (Nubank)',
    'Meta "Viagem ao Japão" atingiu 30%',
    'Lembrete: Fatura XP vence amanhã'
  ]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    // Retrieve profile on mount
    const fetchUser = async () => {
      try {
        const profile = await api.auth.getProfile();
        setUser(profile);
      } catch (err) {
        // Fallback to local user
        const localDb = localStorage.getItem('contable_mock_db');
        if (localDb) {
          const parsed = JSON.parse(localDb);
          setUser(parsed.user);
        } else {
          setUser({ name: 'Claudio Lima', email: 'claudio@lima.com', plan: 'FREE' });
        }
      }
    };
    fetchUser();
  }, [pathname]); // Refresh user profile state on page transitions

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Transações', icon: ArrowUpDown, path: '/transactions' },
    { name: 'Contas & Cartões', icon: CreditCard, path: '/accounts' },
    { name: 'Metas Financeiras', icon: Target, path: '/goals' },
    { name: 'IA Co-Pilot', icon: Sparkles, path: '/ai-assistant', highlight: true },
    { name: 'Relatórios & Exportar', icon: FileText, path: '/reports' },
    { name: 'Contable Premium', icon: Crown, path: '/premium', premiumColor: true },
  ];

  const handleLogout = () => {
    localStorage.removeItem('contable_token');
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-[#080B11] text-gray-100 flex relative overflow-hidden">
      {/* Background Orbs */}
      <div className="glow-orb w-[500px] h-[500px] bg-indigo-900/25 top-[-10%] left-[-10%]" />
      <div className="glow-orb w-[600px] h-[600px] bg-emerald-900/10 bottom-[-20%] right-[-10%] delay-700" />
      <div className="glow-orb w-[400px] h-[400px] bg-purple-900/15 top-[30%] right-[20%]" />

      {/* Sidebar Desktop */}
      <aside className="hidden md:flex md:w-64 lg:w-72 flex-col glass-panel border-r border-border h-screen sticky top-0 z-30">
        <div className="p-6 flex items-center gap-3 border-b border-border">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-400 flex items-center justify-center shadow-neon-brand">
            <span className="font-bold text-xl text-white">C</span>
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-wide bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">Contable</h1>
            <p className="text-[10px] text-gray-400 font-medium tracking-widest uppercase">Personal Finance</p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;
            return (
              <Link 
                key={item.name} 
                href={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium ${
                  isActive 
                    ? 'bg-brand-600 text-white shadow-neon-brand' 
                    : item.premiumColor 
                      ? 'text-yellow-400 hover:bg-yellow-500/10'
                      : item.highlight
                        ? 'text-indigo-400 hover:bg-indigo-500/10 font-semibold'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'scale-110' : ''}`} />
                <span>{item.name}</span>
                {item.premiumColor && user?.plan !== 'PREMIUM' && (
                  <span className="ml-auto text-[9px] bg-yellow-500/20 text-yellow-300 px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider">SaaS</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User profile footer info */}
        <div className="p-4 border-t border-border bg-black/20 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-brand-800 border border-brand-500/50 flex items-center justify-center">
              <User className="w-5 h-5 text-brand-300" />
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold truncate text-white">{user?.name || 'Claudio Lima'}</p>
              <div className="flex items-center gap-1.5">
                <p className="text-xs text-gray-400 truncate">{user?.email || 'claudio@lima.com'}</p>
                {user?.plan === 'PREMIUM' ? (
                  <span className="text-[9px] bg-yellow-500/20 text-yellow-400 px-1 py-0.2 rounded font-bold uppercase tracking-wider">Pro</span>
                ) : (
                  <span className="text-[9px] bg-gray-500/25 text-gray-400 px-1 py-0.2 rounded font-bold uppercase">Free</span>
                )}
              </div>
            </div>
          </div>

          <button 
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 w-full py-2 bg-white/5 hover:bg-red-500/10 text-gray-400 hover:text-red-400 rounded-lg text-xs font-semibold transition-all duration-300 border border-white/5"
          >
            <LogOut className="w-4 h-4" />
            <span>Sair do App</span>
          </button>
        </div>
      </aside>

      {/* Mobile Drawer Navigation Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex">
          <div className="w-64 glass-panel border-r border-border h-full flex flex-col p-5 animate-slide-right">
            <div className="flex justify-between items-center pb-5 border-b border-border mb-5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
                  <span className="font-bold text-white text-md">C</span>
                </div>
                <h1 className="font-bold text-lg text-white">Contable</h1>
              </div>
              <button onClick={() => setMobileMenuOpen(false)} className="text-gray-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            <nav className="flex-1 space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.path;
                return (
                  <Link 
                    key={item.name} 
                    href={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
                      isActive 
                        ? 'bg-brand-600 text-white' 
                        : item.premiumColor 
                          ? 'text-yellow-400'
                          : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="pt-4 border-t border-border flex flex-col gap-3">
              <p className="text-xs text-gray-400">Logado como: {user?.name}</p>
              <button 
                onClick={handleLogout}
                className="flex items-center justify-center gap-2 w-full py-2.5 bg-red-500/10 text-red-400 rounded-xl text-xs font-bold"
              >
                <LogOut className="w-4 h-4" />
                <span>Sair</span>
              </button>
            </div>
          </div>
          <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
        </div>
      )}

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        {/* Header */}
        <header className="glass-panel border-b border-border px-6 py-4 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden text-gray-400 hover:text-white transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
            
            <div>
              <p className="text-xs text-gray-400 font-medium hidden sm:block">Painel de Controle</p>
              <h2 className="text-md sm:text-lg font-bold text-white capitalize">
                {pathname === '/dashboard' ? 'Bem-vindo de volta!' : pathname.replace('/', '').replace('-', ' ')}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-4 relative">
            {/* Notification bell */}
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all relative"
            >
              <Bell className="w-5 h-5" />
              {notifications.length > 0 && (
                <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-[#080B11]" />
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 top-12 w-80 glass-panel rounded-xl shadow-lg border border-border p-4 z-40 animate-fade-in">
                <div className="flex justify-between items-center mb-3 pb-2 border-b border-border">
                  <h3 className="text-sm font-semibold text-white">Alertas do App</h3>
                  <button 
                    onClick={() => setNotifications([])}
                    className="text-[10px] text-brand-400 hover:underline"
                  >
                    Limpar tudo
                  </button>
                </div>
                <div className="space-y-2">
                  {notifications.length === 0 ? (
                    <p className="text-xs text-gray-400 text-center py-4">Sem novas notificações.</p>
                  ) : (
                    notifications.map((n, idx) => (
                      <div key={idx} className="p-2.5 rounded-lg bg-white/5 border border-white/5 text-xs text-gray-300">
                        {n}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Quick action button */}
            <Link 
              href="/premium" 
              className="hidden lg:flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-black font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-neon-brand cursor-pointer"
            >
              <Crown className="w-4 h-4" />
              <span>Assinar Premium</span>
            </Link>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
