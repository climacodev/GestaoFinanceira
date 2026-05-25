'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Lock, Mail, User, Shield, Sparkles, TrendingUp, CreditCard, Laptop, Smartphone } from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('claudio@lima.com');
  const [password, setPassword] = useState('123456');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // If token exists, direct to dashboard
    if (localStorage.getItem('contable_token')) {
      router.push('/dashboard');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let res;
      if (isLogin) {
        res = await api.auth.login({ email, password });
      } else {
        res = await api.auth.register({ email, password, name });
      }

      localStorage.setItem('contable_token', res.token);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Erro ao processar requisição');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: string) => {
    setLoading(true);
    try {
      const res = await api.auth.socialLogin({
        email: `${provider.toLowerCase()}@example.com`,
        name: `Usuário ${provider}`,
      });
      localStorage.setItem('contable_token', res.token);
      router.push('/dashboard');
    } catch (err: any) {
      setError('Erro no login social');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080B11] text-gray-100 flex flex-col relative overflow-hidden">
      {/* Background Orbs */}
      <div className="glow-orb w-[600px] h-[600px] bg-brand-800/20 top-[-20%] left-[-10%]" />
      <div className="glow-orb w-[600px] h-[600px] bg-emerald-950/20 bottom-[-20%] right-[-10%] delay-1000" />

      {/* Navigation Header */}
      <header className="max-w-7xl w-full mx-auto px-6 py-6 flex justify-between items-center relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-400 flex items-center justify-center shadow-neon-brand">
            <span className="font-bold text-xl text-white">C</span>
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-wide bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">Contable</h1>
            <p className="text-[9px] text-gray-400 font-semibold tracking-wider uppercase">Finanças Pessoais</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden sm:inline text-xs text-gray-400">Contable SaaS v1.0</span>
          <a 
            href="#demo"
            className="text-xs bg-white/5 border border-white/10 hover:bg-white/10 px-4 py-2 rounded-xl transition-all font-semibold"
          >
            Ver Recursos
          </a>
        </div>
      </header>

      {/* Main Grid Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
        {/* Left Side: Pitch and UI details */}
        <div className="lg:col-span-7 space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-300 text-xs font-semibold">
            <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse" />
            <span>Co-Pilot Inteligente Integrado</span>
          </div>

          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight text-white">
            Gerencie seu dinheiro com <span className="bg-gradient-to-r from-brand-400 via-indigo-300 to-emerald-400 bg-clip-text text-transparent">Aesthetics & IA.</span>
          </h2>

          <p className="text-gray-300 text-lg leading-relaxed max-w-2xl">
            Uma plataforma de gestão financeira pessoal completa, minimalista e automatizada. Organize múltiplos cartões de crédito, contas bancárias, crie metas e receba insights gerados por inteligência artificial.
          </p>

          {/* Features showcase */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
            <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-md">
              <div className="p-3 bg-brand-500/10 rounded-xl text-brand-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-white text-sm">Consultoria Financeira IA</h3>
                <p className="text-xs text-gray-400 mt-1">Chatbot contextual que conhece seus gastos e aconselha cortes.</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-md">
              <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-white text-sm">Metas Gamificadas</h3>
                <p className="text-xs text-gray-400 mt-1">Acompanhe reservas, viagens e compras com prazos e porcentagens.</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-md">
              <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-white text-sm">Faturas & Cartões</h3>
                <p className="text-xs text-gray-400 mt-1">Controle de limites disponíveis, datas de vencimento e parcelas futuras.</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-md">
              <div className="p-3 bg-purple-500/10 rounded-xl text-purple-400">
                <Laptop className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-white text-sm">Multiplataforma</h3>
                <p className="text-xs text-gray-400 mt-1">Interface Web responsiva integrada com aplicativo mobile.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Auth Form Container */}
        <div className="lg:col-span-5 flex justify-center">
          <div className="w-full max-w-md p-8 rounded-3xl glass-panel border border-border flex flex-col shadow-glass relative">
            <h3 className="text-2xl font-bold text-white text-center">
              {isLogin ? 'Faça seu Login' : 'Criar minha Conta'}
            </h3>
            <p className="text-xs text-gray-400 text-center mt-2">
              {isLogin ? 'Monitore suas finanças agora mesmo' : 'Scaffolde seu painel de controle em 10 segundos'}
            </p>

            {error && (
              <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs font-semibold text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 mt-6">
              {!isLogin && (
                <div>
                  <label className="text-xs text-gray-400 font-semibold mb-1.5 block">Nome Completo</label>
                  <div className="relative">
                    <User className="absolute left-4 top-3.5 w-4 h-4 text-gray-500" />
                    <input 
                      type="text" 
                      placeholder="Seu nome"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full bg-[#0E131F] border border-white/5 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-brand-500 transition-colors text-white"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="text-xs text-gray-400 font-semibold mb-1.5 block">E-mail</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-3.5 w-4 h-4 text-gray-500" />
                  <input 
                    type="email" 
                    placeholder="voce@exemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-[#0E131F] border border-white/5 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-brand-500 transition-colors text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-400 font-semibold mb-1.5 block">Senha</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-3.5 w-4 h-4 text-gray-500" />
                  <input 
                    type="password" 
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full bg-[#0E131F] border border-white/5 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-brand-500 transition-colors text-white"
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-brand-600 to-indigo-500 hover:from-brand-500 hover:to-indigo-400 text-white font-semibold py-3.5 rounded-xl transition-all duration-300 shadow-neon-brand text-sm mt-2 disabled:opacity-50"
              >
                {loading ? 'Processando...' : isLogin ? 'Entrar na Plataforma' : 'Finalizar Cadastro'}
              </button>
            </form>

            <div className="relative flex py-4 items-center">
              <div className="flex-grow border-t border-white/5"></div>
              <span className="flex-shrink mx-4 text-[10px] text-gray-500 font-bold uppercase tracking-wider">Ou continuar com</span>
              <div className="flex-grow border-t border-white/5"></div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => handleSocialLogin('Google')}
                className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 text-xs font-semibold transition-all cursor-pointer"
              >
                <span>Google</span>
              </button>
              <button 
                onClick={() => handleSocialLogin('Apple')}
                className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 text-xs font-semibold transition-all cursor-pointer"
              >
                <span>Apple</span>
              </button>
            </div>

            {/* Quick Demo Assist */}
            {isLogin && (
              <div className="mt-5 p-3 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 text-center">
                <p className="text-[10px] text-indigo-300 font-semibold">Credenciais de Teste:</p>
                <code className="text-xs text-gray-300 mt-1 block">claudio@lima.com / 123456</code>
              </div>
            )}

            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-xs text-gray-400 hover:text-white mt-5 text-center font-medium transition-colors"
            >
              {isLogin ? 'Novo por aqui? Crie uma conta grátis' : 'Já possui conta? Faça o Login'}
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-border mt-auto relative z-10 bg-black/10">
        <div className="max-w-7xl w-full mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-gray-400">
          <p>© 2026 Contable Personal Finance SaaS. Todos os direitos reservados.</p>
          <div className="flex gap-4">
            <span className="hover:text-white transition-colors cursor-pointer">Segurança</span>
            <span className="hover:text-white transition-colors cursor-pointer">LGPD</span>
            <span className="hover:text-white transition-colors cursor-pointer">Termos de Uso</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
