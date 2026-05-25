'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { api } from '@/lib/api';
import { Target, Plus, ShieldCheck, Award, TrendingUp, Calendar, Trash2 } from 'lucide-react';

export default function GoalsPage() {
  const [goals, setGoals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal / Contribution states
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [goalName, setGoalName] = useState('');
  const [goalTarget, setGoalTarget] = useState('');
  const [goalCurrent, setGoalCurrent] = useState('');
  const [goalDeadline, setGoalDeadline] = useState('');

  const [showDepositModal, setShowDepositModal] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState<number | null>(null);
  const [depositAmount, setDepositAmount] = useState('');

  const loadGoals = async () => {
    try {
      const list = await api.finance.getGoals();
      setGoals(list);
    } catch (err) {
      console.error('Failed to load goals', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGoals();
  }, []);

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalName || !goalTarget) return;

    try {
      await api.finance.createGoal({
        name: goalName,
        targetAmount: parseFloat(goalTarget),
        currentAmount: parseFloat(goalCurrent || '0'),
        deadline: goalDeadline || null
      });
      
      setGoalName('');
      setGoalTarget('');
      setGoalCurrent('');
      setGoalDeadline('');
      setShowGoalModal(false);
      
      setLoading(true);
      loadGoals();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGoalId || !depositAmount) return;

    try {
      const goal = goals.find(g => g.id === selectedGoalId);
      if (goal) {
        const newAmt = goal.currentAmount + parseFloat(depositAmount);
        await api.finance.updateGoal(selectedGoalId, { currentAmount: newAmt });
      }

      setDepositAmount('');
      setShowDepositModal(false);
      setLoading(true);
      loadGoals();
    } catch (err) {
      console.error('Deposit contribution failed', err);
    }
  };

  const handleDeleteGoal = async (id: number) => {
    if (!confirm('Deseja excluir esta meta?')) return;
    try {
      await api.finance.deleteGoal(id);
      setLoading(true);
      loadGoals();
    } catch (err) {
      console.error(err);
    }
  };

  const formatBRL = (val: number) => {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  // Gamification stats
  const averageProgress = goals.length > 0 
    ? goals.reduce((acc, curr) => acc + (curr.currentAmount / curr.targetAmount), 0) / goals.length * 100
    : 0;

  const getRankBadge = (pct: number) => {
    if (pct === 0) return { title: 'Poupador Inativo', desc: 'Defina suas metas para pontuar.', color: 'text-gray-400', bg: 'bg-gray-500/10' };
    if (pct < 30) return { title: 'Poupador Iniciante', desc: 'Excelente primeiro passo! Mantenha o foco.', color: 'text-orange-400', bg: 'bg-orange-500/10' };
    if (pct < 60) return { title: 'Economista Prata', desc: 'Quase lá! Suas reservas estão crescendo.', color: 'text-blue-400', bg: 'bg-blue-500/10' };
    if (pct < 90) return { title: 'Investidor Ouro', desc: 'Impressionante. Ótimo controle orçamentário.', color: 'text-yellow-400', bg: 'bg-yellow-500/10' };
    return { title: 'Lenda das Finanças', desc: 'Nível máximo! Patrimônio altamente blindado.', color: 'text-emerald-400', bg: 'bg-emerald-500/10' };
  };

  const rank = getRankBadge(averageProgress);

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Title */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-white">Metas Financeiras</h2>
            <p className="text-xs text-gray-400 mt-0.5 font-medium">Economize dinheiro de forma planejada e focada</p>
          </div>

          <button 
            onClick={() => setShowGoalModal(true)}
            className="flex items-center gap-1.5 bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-neon-brand cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Criar Nova Meta</span>
          </button>
        </div>

        {/* Gamification Dashboard */}
        <div className="glass-panel p-6 rounded-3xl grid grid-cols-1 md:grid-cols-12 gap-6 items-center relative overflow-hidden">
          <div className="md:col-span-8 space-y-3">
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${rank.bg} ${rank.color}`}>
                {rank.title}
              </span>
              <p className="text-xs text-gray-400 font-medium">Rank Contable Gamer</p>
            </div>
            <h3 className="text-lg font-bold text-white">Progresso Consolidado de Metas</h3>
            <p className="text-xs text-gray-400 leading-relaxed max-w-xl">{rank.desc}</p>
            
            <div className="space-y-1 pt-2">
              <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-brand-500 h-full rounded-full transition-all duration-1000" 
                  style={{ width: `${averageProgress}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-gray-400 font-bold">
                <span>Concluído: {averageProgress.toFixed(1)}%</span>
                <span>Objetivo Geral</span>
              </div>
            </div>
          </div>

          <div className="md:col-span-4 flex justify-center py-4 md:py-0 border-t md:border-t-0 md:border-l border-white/5">
            <div className="flex flex-col items-center text-center gap-2">
              <div className="w-16 h-16 rounded-2xl bg-brand-500/10 flex items-center justify-center text-brand-400 shadow-neon-brand border border-brand-500/20">
                <Award className="w-8 h-8" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Medalha Economista</p>
                <p className="text-[9px] text-gray-400 mt-0.5">Guardando mais de 20% da renda</p>
              </div>
            </div>
          </div>
        </div>

        {/* Goals Grid */}
        {loading ? (
          <p className="text-xs text-gray-400">Carregando metas...</p>
        ) : goals.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-12">Você não possui nenhuma meta ativa. Crie metas como Viagem, Carro ou Reserva!</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {goals.map((g) => {
              const pct = Math.min(Math.round((g.currentAmount / g.targetAmount) * 100), 100);
              const remaining = Math.max(g.targetAmount - g.currentAmount, 0);

              return (
                <div key={g.id} className="glass-panel p-6 rounded-3xl flex flex-col justify-between gap-5 relative overflow-hidden group hover:border-brand-500/20 transition-all duration-300">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center text-brand-400">
                        <Target className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">{g.name}</h4>
                        <p className="text-[10px] text-gray-400 flex items-center gap-1.5 mt-0.5 font-semibold">
                          <Calendar className="w-3 h-3 text-brand-400" />
                          <span>{g.deadline ? g.deadline.split('T')[0] : 'Sem prazo'}</span>
                        </p>
                      </div>
                    </div>

                    <button 
                      onClick={() => handleDeleteGoal(g.id)}
                      className="p-1 text-gray-500 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-end">
                      <span className="text-xs text-gray-400 font-semibold">Progresso: {pct}%</span>
                      <span className="text-xs font-bold text-white">{formatBRL(g.currentAmount)} / {formatBRL(g.targetAmount)}</span>
                    </div>

                    <div className="w-full bg-white/10 h-2.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-brand-600 to-indigo-400 h-full rounded-full transition-all duration-1000"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 mt-1">
                    <button 
                      onClick={() => { setSelectedGoalId(g.id); setShowDepositModal(true); }}
                      className="flex-1 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs rounded-xl transition-all shadow-neon-brand cursor-pointer"
                    >
                      Aportar Valor
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* CREATE FINANCIAL GOAL MODAL */}
      {showGoalModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md glass-panel p-6 rounded-3xl border border-border flex flex-col gap-4 animate-fade-in">
            <div className="flex justify-between items-center pb-2 border-b border-border">
              <h3 className="text-md font-bold text-white">Nova Meta Financeira</h3>
              <button onClick={() => setShowGoalModal(false)} className="text-gray-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleCreateGoal} className="space-y-4">
              <div>
                <label className="text-xs text-gray-400 font-semibold mb-1 block">Nome da Meta</label>
                <input 
                  type="text" 
                  placeholder="Ex: Viagem de Fim de Ano, Entrada Apartamento" 
                  value={goalName}
                  onChange={(e) => setGoalName(e.target.value)}
                  required
                  className="w-full bg-[#0E131F] border border-white/5 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-brand-500 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 font-semibold mb-1 block">Valor Alvo (R$)</label>
                  <input 
                    type="number" 
                    placeholder="10000.00" 
                    value={goalTarget}
                    onChange={(e) => setGoalTarget(e.target.value)}
                    required
                    className="w-full bg-[#0E131F] border border-white/5 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-brand-500 text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 font-semibold mb-1 block">Valor Inicial (R$)</label>
                  <input 
                    type="number" 
                    placeholder="0.00" 
                    value={goalCurrent}
                    onChange={(e) => setGoalCurrent(e.target.value)}
                    className="w-full bg-[#0E131F] border border-white/5 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-brand-500 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-400 font-semibold mb-1 block">Data Limite (Opcional)</label>
                <input 
                  type="date" 
                  value={goalDeadline}
                  onChange={(e) => setGoalDeadline(e.target.value)}
                  className="w-full bg-[#0E131F] border border-white/5 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-brand-500 text-white"
                />
              </div>

              <button type="submit" className="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold py-3 rounded-xl transition-all shadow-neon-brand text-xs">
                Salvar Meta
              </button>
            </form>
          </div>
        </div>
      )}

      {/* CONTRIBUTE FUNDS DEPOSIT MODAL */}
      {showDepositModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm glass-panel p-6 rounded-3xl border border-border flex flex-col gap-4 animate-fade-in">
            <div className="flex justify-between items-center pb-2 border-b border-border">
              <h3 className="text-md font-bold text-white">Aportar na Meta</h3>
              <button onClick={() => setShowDepositModal(false)} className="text-gray-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleDeposit} className="space-y-4">
              <div>
                <label className="text-xs text-gray-400 font-semibold mb-1 block">Quanto deseja guardar nesta meta hoje? (R$)</label>
                <input 
                  type="number" 
                  step="0.01"
                  placeholder="0.00" 
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  required
                  className="w-full bg-[#0E131F] border border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-500 text-white"
                />
              </div>

              <p className="text-[10px] text-gray-400 italic">
                * Nota: Guardar fundos em suas metas apenas transfere saldo virtualmente para monitoramento, não realizando débitos bancários reais.
              </p>

              <button type="submit" className="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold py-3 rounded-xl transition-all shadow-neon-brand text-xs">
                Confirmar Depósito
              </button>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
