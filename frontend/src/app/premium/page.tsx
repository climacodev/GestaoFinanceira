'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { api } from '@/lib/api';
import { Crown, Check, Sparkles, Rocket, Globe } from 'lucide-react';

export default function PremiumPage() {
  const [user, setUser] = useState<{ plan: string } | null>(null);
  const [upgrading, setUpgrading] = useState(false);
  const [success, setSuccess] = useState(false);

  const checkUserPlan = async () => {
    try {
      const profile = await api.auth.getProfile();
      setUser(profile);
    } catch (err) {
      const localDb = localStorage.getItem('contable_mock_db');
      if (localDb) {
        setUser(JSON.parse(localDb).user);
      }
    }
  };

  useEffect(() => {
    checkUserPlan();
  }, []);

  const handleUpgrade = async () => {
    setUpgrading(true);
    try {
      const res = await api.auth.upgradePlan();
      // Update local storage too to ensure mock updates
      const localDb = localStorage.getItem('contable_mock_db');
      if (localDb) {
        const parsed = JSON.parse(localDb);
        parsed.user.plan = 'PREMIUM';
        localStorage.setItem('contable_mock_db', JSON.stringify(parsed));
      }

      setSuccess(true);
      setUpgrading(false);
      checkUserPlan();
    } catch (err) {
      setUpgrading(false);
    }
  };

  const premiumFeatures = [
    { title: 'Sincronização Bancária Integrada', desc: 'Conecte suas contas via Open Finance Brasil de forma segura.' },
    { title: 'Inteligência Artificial Avançada', desc: 'Recomendações profundas de investimento e previsões de saldo futuro.' },
    { title: 'Exportações Completas sem Limites', desc: 'Extraia planilhas nos formatos Excel, CSV e relatórios estruturados em PDF.' },
    { title: 'Controle de Múltiplos Usuários (Família)', desc: 'Compartilhe orçamentos domésticos em tempo real com familiares.' },
    { title: 'Backup em Nuvem Automático', desc: 'Seus lançamentos protegidos em backups criptografados diários.' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Title */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs font-semibold px-3 py-1 rounded-full">
            <Crown className="w-4 h-4" />
            <span>Contable Premium SaaS</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Desbloqueie o Poder Total do seu Dinheiro</h2>
          <p className="text-xs text-gray-400 font-medium leading-relaxed">
            Tenha acesso a ferramentas profissionais de auditoria financeira, inteligência artificial integrada e dashboards customizados.
          </p>
        </div>

        {/* Success greeting */}
        {success && (
          <div className="max-w-xl mx-auto p-6 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-3 animate-fade-in relative overflow-hidden">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 mx-auto">
              <Rocket className="w-6 h-6" />
            </div>
            <h4 className="text-md font-bold text-white">Parabéns! Plano Premium Ativado.</h4>
            <p className="text-xs text-gray-300">Você agora tem acesso ilimitado a todas as ferramentas e integrações Open Finance.</p>
          </div>
        )}

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch">
          {/* Free Plan */}
          <div className="glass-panel p-8 rounded-3xl flex flex-col justify-between border-white/5 relative bg-[#0D1220]">
            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Plano Grátis</p>
              <h3 className="text-xl font-bold text-white mt-2">Básico</h3>
              <p className="text-xs text-gray-400 mt-2">Controle orçamentário básico manual</p>
              
              <div className="my-6">
                <span className="text-3xl font-extrabold text-white">R$ 0</span>
                <span className="text-xs text-gray-400"> / sempre</span>
              </div>

              <ul className="space-y-3 text-xs text-gray-300 font-medium">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Até 2 Contas Bancárias</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Cadastro Manual de Despesas</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Metas Financeiras Básicas</span>
                </li>
                <li className="flex items-center gap-2 opacity-40">
                  <Check className="w-4 h-4 text-gray-500 flex-shrink-0" />
                  <span>Sincronização Bancária (Open Finance)</span>
                </li>
              </ul>
            </div>

            <button 
              disabled 
              className="w-full mt-8 py-3 bg-white/5 text-gray-400 rounded-xl font-bold text-xs border border-white/5 cursor-not-allowed"
            >
              Seu Plano Atual
            </button>
          </div>

          {/* Premium Plan */}
          <div className="glass-panel p-8 rounded-3xl flex flex-col justify-between border-yellow-500/20 relative overflow-hidden bg-gradient-to-b from-[#11162B] to-[#0A0D1A] shadow-neon-brand">
            {/* Glow accent */}
            <div className="absolute right-[-10%] top-[-10%] w-40 h-40 bg-indigo-500/10 rounded-full filter blur-2xl pointer-events-none" />
            
            <div>
              <div className="flex justify-between items-center">
                <p className="text-[10px] text-yellow-400 font-bold uppercase tracking-widest flex items-center gap-1">
                  <Crown className="w-3.5 h-3.5" />
                  <span>Recomendado</span>
                </p>
                <span className="text-[9px] bg-yellow-500/20 text-yellow-300 px-2 py-0.5 rounded-full font-bold uppercase">Pro</span>
              </div>
              <h3 className="text-xl font-bold text-white mt-2">Contable Premium</h3>
              <p className="text-xs text-gray-400 mt-2">Inteligência artificial e sincronizações automatizadas</p>
              
              <div className="my-6 flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-white">R$ 19,90</span>
                <span className="text-xs text-gray-400"> / mês</span>
              </div>

              <ul className="space-y-3.5 text-xs text-gray-300 font-semibold">
                {premiumFeatures.map((f, i) => (
                  <li key={i} className="flex gap-2.5">
                    <Check className="w-4.5 h-4.5 text-yellow-400 flex-shrink-0" />
                    <div>
                      <h4 className="text-white font-bold">{f.title}</h4>
                      <p className="text-[9px] text-gray-400 font-normal mt-0.5">{f.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {user?.plan === 'PREMIUM' ? (
              <button 
                disabled 
                className="w-full mt-8 py-3.5 bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 rounded-xl font-bold text-xs cursor-default"
              >
                Inscrição Premium Ativa
              </button>
            ) : (
              <button 
                onClick={handleUpgrade}
                disabled={upgrading}
                className="w-full mt-8 py-3.5 bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-black font-extrabold text-xs rounded-xl transition-all duration-300 shadow-neon-brand cursor-pointer"
              >
                {upgrading ? 'Processando assinatura...' : 'Assinar Plano Premium'}
              </button>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
