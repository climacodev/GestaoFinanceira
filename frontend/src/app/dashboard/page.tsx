'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { api } from '@/lib/api';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Wallet, 
  Plus, 
  TrendingUp, 
  AlertCircle, 
  Lightbulb, 
  CheckCircle,
  HelpCircle,
  Sparkles,
  CreditCard as CardIcon
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

export default function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [insights, setInsights] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Fast Add Transaction Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('EXPENSE');
  const [category, setCategory] = useState('FOOD');
  const [accountId, setAccountId] = useState('');
  const [cardId, setCardId] = useState('');
  const [status, setStatus] = useState('PAID');

  const fetchData = async () => {
    try {
      const dashboard = await api.finance.getDashboard();
      setData(dashboard);
      
      const aiInsights = await api.ai.getInsights();
      setInsights(aiInsights);

      // Select default account for transaction
      if (dashboard.accounts && dashboard.accounts.length > 0) {
        setAccountId(dashboard.accounts[0].id.toString());
      }
    } catch (err) {
      console.error('Error fetching dashboard', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!desc || !amount) return;

    try {
      await api.finance.createTransaction({
        description: desc,
        amount: parseFloat(amount),
        type,
        category,
        accountId: type === 'INCOME' || !cardId ? parseInt(accountId) : null,
        creditCardId: type === 'EXPENSE' && cardId ? parseInt(cardId) : null,
        status,
        date: new Date().toISOString().split('T')[0]
      });

      // Reset
      setDesc('');
      setAmount('');
      setCardId('');
      setShowAddModal(false);
      
      // Reload
      setLoading(true);
      fetchData();
    } catch (err) {
      console.error('Failed to create transaction', err);
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'WARNING': return <AlertCircle className="w-5 h-5 text-red-400" />;
      case 'TIP': return <Lightbulb className="w-5 h-5 text-yellow-400" />;
      case 'SUGGESTION': return <CheckCircle className="w-5 h-5 text-emerald-400" />;
      default: return <HelpCircle className="w-5 h-5 text-indigo-400" />;
    }
  };

  const COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#8B5CF6', '#3B82F6', '#6B7280'];

  const categoryNameMap: Record<string, string> = {
    FOOD: 'Alimentação',
    TRANSPORT: 'Transporte',
    HEALTH: 'Saúde',
    LEISURE: 'Lazer',
    SALARY: 'Salário',
    INVESTMENT: 'Investimentos',
    UTILITIES: 'Contas',
    OTHERS: 'Outros'
  };

  if (loading || !data) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-brand-500 border-t-transparent animate-spin" />
          <p className="text-sm text-gray-400 font-semibold">Carregando painel financeiro...</p>
        </div>
      </DashboardLayout>
    );
  }

  const formatBRL = (val: number) => {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Top Deck: Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="glass-panel p-6 rounded-3xl relative overflow-hidden group">
            <div className="absolute right-4 top-4 w-12 h-12 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center">
              <Wallet className="w-6 h-6 text-brand-400" />
            </div>
            <p className="text-xs text-gray-400 font-semibold tracking-wide uppercase">Saldo Consolidado</p>
            <h3 className="text-2xl font-extrabold mt-3 text-white">{formatBRL(data.totalBalance)}</h3>
            <p className="text-[10px] text-gray-400 mt-2 font-medium">Contas e carteiras somadas</p>
          </div>

          <div className="glass-panel p-6 rounded-3xl relative overflow-hidden group">
            <div className="absolute right-4 top-4 w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <ArrowUpRight className="w-6 h-6 text-emerald-400" />
            </div>
            <p className="text-xs text-gray-400 font-semibold tracking-wide uppercase">Receitas (Mês)</p>
            <h3 className="text-2xl font-extrabold mt-3 text-emerald-400">{formatBRL(data.monthlyIncome)}</h3>
            <p className="text-[10px] text-emerald-500/80 mt-2 font-medium flex items-center gap-1">
              <span>Rendimento ativo</span>
            </p>
          </div>

          <div className="glass-panel p-6 rounded-3xl relative overflow-hidden group">
            <div className="absolute right-4 top-4 w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
              <ArrowDownRight className="w-6 h-6 text-red-400" />
            </div>
            <p className="text-xs text-gray-400 font-semibold tracking-wide uppercase">Despesas (Mês)</p>
            <h3 className="text-2xl font-extrabold mt-3 text-red-400">{formatBRL(data.monthlyExpenses)}</h3>
            <p className="text-[10px] text-red-500/80 mt-2 font-medium">Faturas e contas líquidas</p>
          </div>

          <div className="glass-panel p-6 rounded-3xl relative overflow-hidden group border-brand-500/20">
            <div className="absolute right-4 top-4 w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-indigo-400" />
            </div>
            <p className="text-xs text-gray-400 font-semibold tracking-wide uppercase">Fluxo de Caixa</p>
            <h3 className={`text-2xl font-extrabold mt-3 ${data.netFlow >= 0 ? 'text-indigo-400' : 'text-rose-400'}`}>
              {formatBRL(data.netFlow)}
            </h3>
            <p className="text-[10px] text-gray-400 mt-2 font-medium">Economizado este mês</p>
          </div>
        </div>

        {/* Mid Grid: Charts & AI Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Chart Area */}
          <div className="lg:col-span-8 glass-panel p-6 rounded-3xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-md font-bold text-white">Evolução do Fluxo de Caixa</h3>
                <p className="text-xs text-gray-400 mt-0.5">Visão geral de receitas e despesas nos últimos 6 meses</p>
              </div>
              <button 
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-1.5 bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs px-3.5 py-2.5 rounded-xl transition-all shadow-neon-brand cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Nova Transação</span>
              </button>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.cashFlow} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorIncomes" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EF4444" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="month" stroke="rgba(255,255,255,0.4)" fontSize={11} />
                  <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111827', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                    labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                  />
                  <Area type="monotone" name="Receitas" dataKey="receitas" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#colorIncomes)" />
                  <Area type="monotone" name="Despesas" dataKey="despesas" stroke="#EF4444" strokeWidth={2} fillOpacity={1} fill="url(#colorExpenses)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* AI Insights & Alerts Column */}
          <div className="lg:col-span-4 glass-panel p-6 rounded-3xl flex flex-col">
            <h3 className="text-md font-bold text-white flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse" />
              <span>Dicas do Co-Pilot IA</span>
            </h3>

            <div className="flex-1 space-y-4 overflow-y-auto pr-1">
              {insights.map((insight) => (
                <div 
                  key={insight.id} 
                  className={`p-4 rounded-2xl border transition-all duration-300 ${
                    insight.type === 'WARNING'
                      ? 'bg-red-500/5 border-red-500/10 hover:border-red-500/25'
                      : insight.type === 'SUGGESTION'
                        ? 'bg-emerald-500/5 border-emerald-500/10 hover:border-emerald-500/25'
                        : 'bg-yellow-500/5 border-yellow-500/10 hover:border-yellow-500/25'
                  }`}
                >
                  <div className="flex gap-3">
                    <div className="mt-0.5">{getInsightIcon(insight.type)}</div>
                    <p className="text-xs text-gray-300 leading-relaxed font-medium">
                      {insight.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Lower Grid: Accounts, Category Donut & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Bank Accounts & Cards */}
          <div className="lg:col-span-4 glass-panel p-6 rounded-3xl flex flex-col gap-6">
            <div>
              <h3 className="text-md font-bold text-white">Contas & Cartões</h3>
              <p className="text-xs text-gray-400 mt-0.5 font-medium">Saldos e limites disponíveis</p>
            </div>

            {/* Bank Accounts List */}
            <div className="space-y-3">
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Contas Bancárias</p>
              {data.accounts.map((acc: any) => (
                <div key={acc.id} className="flex justify-between items-center p-3 rounded-2xl bg-white/5 border border-white/5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-brand-500/10 flex items-center justify-center text-brand-400">
                      <Wallet className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-white">{acc.name}</p>
                      <p className="text-[9px] text-gray-400 uppercase font-bold">{acc.type}</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-white">{formatBRL(acc.balance)}</span>
                </div>
              ))}
            </div>

            {/* Credit Cards list */}
            <div className="space-y-3">
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Cartões de Crédito</p>
              {data.creditCards.map((card: any) => (
                <div key={card.id} className="p-3.5 rounded-2xl bg-white/5 border border-white/5 space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <CardIcon className="w-4 h-4 text-indigo-400" />
                      <span className="text-xs font-semibold text-white">{card.name}</span>
                    </div>
                    <span className="text-[10px] text-gray-400 font-bold">Vence dia {card.dueDay}</span>
                  </div>
                  <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-indigo-500 h-full rounded-full w-[45%]" />
                  </div>
                  <div className="flex justify-between text-[9px] text-gray-400 font-semibold">
                    <span>Limite Usado: R$ 2.250</span>
                    <span>Limite Total: {formatBRL(card.limit)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Categories Chart */}
          <div className="lg:col-span-4 glass-panel p-6 rounded-3xl flex flex-col justify-between">
            <div>
              <h3 className="text-md font-bold text-white">Despesas por Categoria</h3>
              <p className="text-xs text-gray-400 mt-0.5">Distribuição do mês atual</p>
            </div>

            <div className="h-56 w-full relative flex items-center justify-center">
              {data.categoryDistribution.length === 0 ? (
                <p className="text-xs text-gray-400">Sem despesas registradas este mês.</p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.categoryDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {data.categoryDistribution.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: any) => formatBRL(Number(value))}
                      contentStyle={{ backgroundColor: '#111827', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Customized legends */}
            <div className="grid grid-cols-2 gap-2 text-[10px] text-gray-300 mt-2 font-medium">
              {data.categoryDistribution.slice(0, 4).map((entry: any, index: number) => (
                <div key={entry.name} className="flex items-center gap-1.5 truncate">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <span className="truncate">{categoryNameMap[entry.name] || entry.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-4 glass-panel p-6 rounded-3xl flex flex-col">
            <h3 className="text-md font-bold text-white mb-4">Atividade Recente</h3>

            <div className="flex-1 space-y-3.5 overflow-y-auto pr-1">
              {data.recentTransactions.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-8">Nenhuma transação cadastrada.</p>
              ) : (
                data.recentTransactions.map((tx: any) => (
                  <div key={tx.id} className="flex justify-between items-center text-xs font-semibold">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        tx.type === 'INCOME' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                      }`}>
                        {tx.type === 'INCOME' ? '+' : '-'}
                      </div>
                      <div className="overflow-hidden max-w-[130px] sm:max-w-none">
                        <p className="text-white truncate font-bold">{tx.description}</p>
                        <p className="text-[9px] text-gray-400 uppercase tracking-wider font-bold">{categoryNameMap[tx.category] || tx.category}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${tx.type === 'INCOME' ? 'text-emerald-400' : 'text-white'}`}>
                        {tx.type === 'INCOME' ? '+' : '-'} {formatBRL(tx.amount)}
                      </p>
                      <p className="text-[9px] text-gray-500 font-bold">{tx.date.split('T')[0]}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* FAST ADD TRANSACTION MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg glass-panel p-6 rounded-3xl border border-border flex flex-col gap-4 animate-fade-in">
            <div className="flex justify-between items-center pb-2 border-b border-border">
              <h3 className="text-lg font-bold text-white">Cadastrar Transação</h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddTransaction} className="space-y-4">
              <div>
                <label className="text-xs text-gray-400 font-semibold mb-1 block">Descrição</label>
                <input 
                  type="text" 
                  placeholder="Ex: Aluguel, Supermercado, Salário"
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  required
                  className="w-full bg-[#0E131F] border border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-500 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 font-semibold mb-1 block">Valor (R$)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                    className="w-full bg-[#0E131F] border border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-500 text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 font-semibold mb-1 block">Tipo</label>
                  <select 
                    value={type} 
                    onChange={(e) => setType(e.target.value)}
                    className="w-full bg-[#0E131F] border border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-500 text-white"
                  >
                    <option value="EXPENSE">Despesa</option>
                    <option value="INCOME">Receita</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 font-semibold mb-1 block">Categoria</label>
                  <select 
                    value={category} 
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-[#0E131F] border border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-500 text-white"
                  >
                    <option value="FOOD">Alimentação</option>
                    <option value="TRANSPORT">Transporte</option>
                    <option value="HEALTH">Saúde</option>
                    <option value="LEISURE">Lazer</option>
                    <option value="UTILITIES">Contas</option>
                    <option value="INVESTMENT">Investimento</option>
                    <option value="SALARY">Salário</option>
                    <option value="OTHERS">Outros</option>
                  </select>
                </div>

                <div>
                  {type === 'EXPENSE' ? (
                    <>
                      <label className="text-xs text-gray-400 font-semibold mb-1 block">Cartão de Crédito (Opcional)</label>
                      <select 
                        value={cardId} 
                        onChange={(e) => setCardId(e.target.value)}
                        className="w-full bg-[#0E131F] border border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-500 text-white"
                      >
                        <option value="">Não usar cartão (Conta Corrente)</option>
                        {data.creditCards.map((c: any) => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </>
                  ) : (
                    <>
                      <label className="text-xs text-gray-400 font-semibold mb-1 block">Conta de Destino</label>
                      <select 
                        value={accountId} 
                        onChange={(e) => setAccountId(e.target.value)}
                        className="w-full bg-[#0E131F] border border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-500 text-white"
                      >
                        {data.accounts.map((a: any) => (
                          <option key={a.id} value={a.id}>{a.name}</option>
                        ))}
                      </select>
                    </>
                  )}
                </div>
              </div>

              {!cardId && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-400 font-semibold mb-1 block">Conta Origem/Destino</label>
                    <select 
                      value={accountId} 
                      onChange={(e) => setAccountId(e.target.value)}
                      className="w-full bg-[#0E131F] border border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-500 text-white"
                    >
                      {data.accounts.map((a: any) => (
                        <option key={a.id} value={a.id}>{a.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 font-semibold mb-1 block">Status</label>
                    <select 
                      value={status} 
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full bg-[#0E131F] border border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-500 text-white"
                    >
                      <option value="PAID">Pago / Recebido</option>
                      <option value="PENDING">Pendente</option>
                    </select>
                  </div>
                </div>
              )}

              <button 
                type="submit"
                className="w-full bg-gradient-to-r from-brand-600 to-indigo-500 hover:from-brand-500 hover:to-indigo-400 text-white font-bold py-3.5 rounded-xl transition-all duration-300 shadow-neon-brand text-sm mt-4 cursor-pointer"
              >
                Salvar Transação
              </button>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
