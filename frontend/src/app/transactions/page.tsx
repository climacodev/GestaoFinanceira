'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { api } from '@/lib/api';
import { Plus, Trash2, Filter, Search, FileDown, UploadCloud, CheckCircle } from 'lucide-react';

export default function Transactions() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [cards, setCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [ofxUploading, setOfxUploading] = useState(false);
  const [ofxSuccess, setOfxSuccess] = useState(false);

  // New Transaction Form State
  const [showAddModal, setShowAddModal] = useState(false);
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('EXPENSE');
  const [category, setCategory] = useState('FOOD');
  const [accountId, setAccountId] = useState('');
  const [cardId, setCardId] = useState('');
  const [status, setStatus] = useState('PAID');
  const [isInstallment, setIsInstallment] = useState(false);
  const [totalInstallments, setTotalInstallments] = useState('3');

  const loadData = async () => {
    try {
      const txList = await api.finance.getTransactions();
      setTransactions(txList);

      const accList = await api.finance.getAccounts();
      setAccounts(accList);
      if (accList.length > 0) setAccountId(accList[0].id.toString());

      const cardList = await api.finance.getCards();
      setCards(cardList);
    } catch (err) {
      console.error('Failed to load transaction resources', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
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
        isInstallment,
        totalInstallments: isInstallment ? parseInt(totalInstallments) : null
      });

      // Clear
      setDesc('');
      setAmount('');
      setCardId('');
      setIsInstallment(false);
      setShowAddModal(false);

      setLoading(true);
      loadData();
    } catch (err) {
      console.error('Error adding transaction', err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Deseja realmente excluir esta transação?')) return;
    try {
      await api.finance.deleteTransaction(id);
      setLoading(true);
      loadData();
    } catch (err) {
      console.error('Failed to delete transaction', err);
    }
  };

  const handleOfxUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setOfxUploading(true);
    setOfxSuccess(false);

    // Mock parsing OFX statement file
    setTimeout(async () => {
      try {
        // Create 2 mock parsed transactions from statement
        await api.finance.createTransaction({
          description: 'Uber *Viagem Importada',
          amount: 28.50,
          type: 'EXPENSE',
          category: 'TRANSPORT',
          accountId: accounts[0]?.id || 101,
          status: 'PAID'
        });

        await api.finance.createTransaction({
          description: 'Restaurante Sabor Local',
          amount: 89.90,
          type: 'EXPENSE',
          category: 'FOOD',
          accountId: accounts[0]?.id || 101,
          status: 'PAID'
        });

        setOfxUploading(false);
        setOfxSuccess(true);
        setLoading(true);
        loadData();
      } catch (err) {
        setOfxUploading(false);
      }
    }, 2000);
  };

  // Filter transactions dynamically on the client
  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch = tx.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType ? tx.type === filterType : true;
    const matchesCategory = filterCategory ? tx.category === filterCategory : true;
    return matchesSearch && matchesType && matchesCategory;
  });

  const formatBRL = (val: number) => {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

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

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Filter bar and top title */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl font-bold text-white">Extrato de Transações</h2>
            <p className="text-xs text-gray-400 mt-0.5">Gerencie e analise seu fluxo de caixa diário</p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button 
              onClick={() => setShowAddModal(true)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-neon-brand cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Adicionar Manual</span>
            </button>
          </div>
        </div>

        {/* Search, Filters, and OFX Box */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* OFX Card */}
          <div className="lg:col-span-4 glass-panel p-6 rounded-3xl flex flex-col justify-center relative overflow-hidden">
            <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
              <UploadCloud className="w-5 h-5 text-indigo-400" />
              <span>Importar Extrato OFX</span>
            </h3>
            <p className="text-xs text-gray-400 mb-4">Sincronize com seu banco importando o extrato.</p>

            <label className="border-2 border-dashed border-white/10 hover:border-brand-500/50 rounded-2xl p-5 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all duration-300 bg-black/10">
              <input 
                type="file" 
                accept=".ofx,.csv"
                onChange={handleOfxUpload}
                className="hidden" 
                disabled={ofxUploading}
              />
              <FileDown className="w-8 h-8 text-gray-500" />
              <span className="text-xs text-gray-400 font-semibold text-center">
                {ofxUploading ? 'Carregando extrato...' : 'Selecione arquivo .OFX ou .CSV'}
              </span>
            </label>

            {ofxSuccess && (
              <div className="mt-3 flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-2.5 rounded-xl text-xs font-semibold">
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                <span>Extrato importado! 2 despesas adicionadas.</span>
              </div>
            )}
          </div>

          {/* Quick Filters */}
          <div className="lg:col-span-8 glass-panel p-6 rounded-3xl flex flex-col justify-between gap-4">
            <h3 className="text-sm font-bold text-white mb-1">Buscar e Filtrar</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Search Bar */}
              <div className="relative col-span-1 sm:col-span-3">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                <input 
                  type="text" 
                  placeholder="Buscar por descrição..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-[#0E131F] border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-xs focus:outline-none focus:border-brand-500 text-white"
                />
              </div>

              {/* Type Select */}
              <div>
                <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">Tipo</label>
                <select 
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full bg-[#0E131F] border border-white/5 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-brand-500 text-white"
                >
                  <option value="">Todos os tipos</option>
                  <option value="INCOME">Receitas (+)</option>
                  <option value="EXPENSE">Despesas (-)</option>
                </select>
              </div>

              {/* Category Select */}
              <div>
                <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">Categoria</label>
                <select 
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full bg-[#0E131F] border border-white/5 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-brand-500 text-white"
                >
                  <option value="">Todas categorias</option>
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

              {/* Clean Filter Button */}
              <div className="flex items-end">
                <button 
                  onClick={() => { setFilterType(''); setFilterCategory(''); setSearchTerm(''); }}
                  className="w-full py-2 bg-white/5 border border-white/5 hover:bg-white/10 text-xs font-semibold rounded-xl text-gray-400 hover:text-white transition-colors"
                >
                  Limpar Filtros
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="glass-panel rounded-3xl overflow-hidden">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="text-center py-12 text-gray-400">Carregando extrato...</div>
            ) : filteredTransactions.length === 0 ? (
              <div className="text-center py-12 text-gray-400">Nenhuma transação localizada com os filtros selecionados.</div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-black/10 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                    <th className="py-4 px-6">Data</th>
                    <th className="py-4 px-6">Descrição</th>
                    <th className="py-4 px-6">Categoria</th>
                    <th className="py-4 px-6">Origem/Conta</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6 text-right">Valor</th>
                    <th className="py-4 px-6 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-xs">
                  {filteredTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-4 px-6 text-gray-400 font-medium">{tx.date.split('T')[0]}</td>
                      <td className="py-4 px-6 font-bold text-white">
                        {tx.description}
                        {tx.isInstallment && (
                          <span className="ml-2 text-[9px] bg-indigo-500/10 text-indigo-400 px-1.5 py-0.5 rounded font-semibold">
                            Parcelado {tx.installmentNumber}/{tx.totalInstallments}
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <span className="bg-white/5 text-gray-300 px-2.5 py-1 rounded-full font-semibold border border-white/5">
                          {categoryNameMap[tx.category] || tx.category}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-gray-400">
                        {tx.creditCardId ? 'Cartão Nubank' : 'Conta Itaú'}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-2 py-0.5 rounded font-bold uppercase text-[9px] ${
                          tx.status === 'PAID' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-yellow-500/10 text-yellow-400'
                        }`}>
                          {tx.status === 'PAID' ? 'Pago' : 'Pendente'}
                        </span>
                      </td>
                      <td className={`py-4 px-6 text-right font-extrabold text-sm ${
                        tx.type === 'INCOME' ? 'text-emerald-400' : 'text-white'
                      }`}>
                        {tx.type === 'INCOME' ? '+' : '-'} {formatBRL(tx.amount)}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <button 
                          onClick={() => handleDelete(tx.id)}
                          className="p-1.5 rounded-lg bg-red-500/5 hover:bg-red-500/10 text-red-400 border border-red-500/5 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* MANUAL TRANSACTION FORM MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg glass-panel p-6 rounded-3xl border border-border flex flex-col gap-4 animate-fade-in">
            <div className="flex justify-between items-center pb-2 border-b border-border">
              <h3 className="text-lg font-bold text-white">Cadastrar Lançamento</h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="text-xs text-gray-400 font-semibold mb-1 block">Descrição</label>
                <input 
                  type="text" 
                  placeholder="Ex: Supermercado Carrefour"
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  required
                  className="w-full bg-[#0E131F] border border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-500 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 font-semibold mb-1 block">Valor Total (R$)</label>
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
                        <option value="">Não usar cartão (Debitado da conta)</option>
                        {cards.map((c: any) => (
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
                        {accounts.map((a: any) => (
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
                      {accounts.map((a: any) => (
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

              {/* Installment parameters */}
              {type === 'EXPENSE' && (
                <div className="border-t border-white/5 pt-3 space-y-2">
                  <label className="flex items-center gap-2 text-xs text-gray-300 font-semibold cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={isInstallment}
                      onChange={(e) => setIsInstallment(e.target.checked)}
                      className="rounded bg-[#0E131F] border-white/10 text-brand-600 focus:ring-0"
                    />
                    <span>Esta compra é parcelada</span>
                  </label>

                  {isInstallment && (
                    <div className="grid grid-cols-2 gap-4 animate-fade-in">
                      <div>
                        <label className="text-xs text-gray-400 font-semibold mb-1 block">Número de Parcelas</label>
                        <select 
                          value={totalInstallments}
                          onChange={(e) => setTotalInstallments(e.target.value)}
                          className="w-full bg-[#0E131F] border border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-500 text-white"
                        >
                          {[2,3,4,5,6,10,12,24].map((num) => (
                            <option key={num} value={num}>{num}x mensais</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex items-center pt-5">
                        <span className="text-[10px] text-gray-400">
                          Será lançado {totalInstallments}x de R$ {(parseFloat(amount || '0') / parseInt(totalInstallments)).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <button 
                type="submit"
                className="w-full bg-gradient-to-r from-brand-600 to-indigo-500 hover:from-brand-500 hover:to-indigo-400 text-white font-bold py-3.5 rounded-xl transition-all duration-300 shadow-neon-brand text-sm mt-4 cursor-pointer"
              >
                Salvar Lançamento
              </button>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
