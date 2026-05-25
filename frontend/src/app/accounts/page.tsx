'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { api } from '@/lib/api';
import { Wallet, CreditCard, Plus, Trash2, ArrowRightLeft, Sparkles } from 'lucide-react';

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [cards, setCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals / Form states
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [accName, setAccName] = useState('');
  const [accType, setAccType] = useState('CHECKING');
  const [accBalance, setAccBalance] = useState('');

  const [showCardModal, setShowCardModal] = useState(false);
  const [cardName, setCardName] = useState('');
  const [cardLimit, setCardLimit] = useState('');
  const [cardClosing, setCardClosing] = useState('5');
  const [cardDue, setCardDue] = useState('15');

  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState('');
  const [payAccountId, setPayAccountId] = useState('');
  const [payAmount, setPayAmount] = useState('1250.00');

  const loadData = async () => {
    try {
      const accList = await api.finance.getAccounts();
      setAccounts(accList);
      if (accList.length > 0) setPayAccountId(accList[0].id.toString());

      const cardList = await api.finance.getCards();
      setCards(cardList);
      if (cardList.length > 0) setSelectedCardId(cardList[0].id.toString());
    } catch (err) {
      console.error('Error loading accounts/cards data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accName) return;

    try {
      await api.finance.createAccount({
        name: accName,
        type: accType,
        balance: parseFloat(accBalance || '0')
      });
      setAccName('');
      setAccBalance('');
      setShowAccountModal(false);
      setLoading(true);
      loadData();
    } catch (err) {
      console.error('Error creating account', err);
    }
  };

  const handleCreateCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardName || !cardLimit) return;

    try {
      await api.finance.createCard({
        name: cardName,
        limit: parseFloat(cardLimit),
        closingDay: parseInt(cardClosing),
        dueDay: parseInt(cardDue)
      });
      setCardName('');
      setCardLimit('');
      setShowCardModal(false);
      setLoading(true);
      loadData();
    } catch (err) {
      console.error('Error creating card', err);
    }
  };

  const handleDeleteAccount = async (id: number) => {
    if (!confirm('Excluir esta conta apagará seus registros?')) return;
    try {
      await api.finance.deleteAccount(id);
      setLoading(true);
      loadData();
    } catch (err) {
      console.error('Failed to delete account', err);
    }
  };

  const handleDeleteCard = async (id: number) => {
    if (!confirm('Deseja excluir este cartão?')) return;
    try {
      await api.finance.deleteCard(id);
      setLoading(true);
      loadData();
    } catch (err) {
      console.error('Failed to delete card', err);
    }
  };

  const handlePayInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Record card invoice payment as an expense in selected account
      await api.finance.createTransaction({
        description: `Pgmto Fatura - ${cards.find(c => c.id === parseInt(selectedCardId))?.name || 'Cartão'}`,
        amount: parseFloat(payAmount),
        type: 'EXPENSE',
        category: 'UTILITIES',
        accountId: parseInt(payAccountId),
        status: 'PAID',
        date: new Date().toISOString().split('T')[0]
      });

      setShowPayModal(false);
      alert('Fatura paga com sucesso! O valor foi debitado da sua conta.');
      setLoading(true);
      loadData();
    } catch (err) {
      console.error('Invoice payment failed', err);
    }
  };

  const formatBRL = (val: number) => {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Title Deck */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-white">Carteira e Meios de Pagamento</h2>
            <p className="text-xs text-gray-400 mt-0.5 font-medium">Controle seus saldos e limites de crédito em um só lugar</p>
          </div>

          <button 
            onClick={() => setShowPayModal(true)}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-neon-brand cursor-pointer"
          >
            <ArrowRightLeft className="w-4 h-4" />
            <span>Pagar Fatura</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Bank Accounts Section */}
          <div className="glass-panel p-6 rounded-3xl space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-md font-bold text-white flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-brand-400" />
                  <span>Contas Bancárias</span>
                </h3>
                <p className="text-xs text-gray-400 font-medium">Contas correntes, investimentos e carteiras</p>
              </div>
              <button 
                onClick={() => setShowAccountModal(true)}
                className="w-8 h-8 rounded-lg bg-white/5 border border-white/5 hover:border-white/10 flex items-center justify-center text-gray-300 hover:text-white cursor-pointer"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {loading ? (
              <p className="text-xs text-gray-400">Carregando contas...</p>
            ) : accounts.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-6">Nenhuma conta cadastrada.</p>
            ) : (
              <div className="space-y-4">
                {accounts.map((acc) => (
                  <div key={acc.id} className="flex justify-between items-center p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-brand-500/10 transition-all duration-300">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-brand-500/10 flex items-center justify-center text-brand-400 font-bold text-xs">
                        {acc.type[0]}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white">{acc.name}</h4>
                        <span className="text-[9px] text-gray-400 uppercase font-bold tracking-wider">{acc.type}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-extrabold text-white">{formatBRL(acc.balance)}</span>
                      <button 
                        onClick={() => handleDeleteAccount(acc.id)}
                        className="p-1 text-gray-500 hover:text-red-400 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Credit Cards Section */}
          <div className="glass-panel p-6 rounded-3xl space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-md font-bold text-white flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-indigo-400" />
                  <span>Cartões de Crédito</span>
                </h3>
                <p className="text-xs text-gray-400 font-medium">Gerenciamento de limites e vencimentos</p>
              </div>
              <button 
                onClick={() => setShowCardModal(true)}
                className="w-8 h-8 rounded-lg bg-white/5 border border-white/5 hover:border-white/10 flex items-center justify-center text-gray-300 hover:text-white cursor-pointer"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {loading ? (
              <p className="text-xs text-gray-400">Carregando cartões...</p>
            ) : cards.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-6">Nenhum cartão cadastrado.</p>
            ) : (
              <div className="space-y-4">
                {cards.map((card) => (
                  <div key={card.id} className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-3 hover:border-indigo-500/10 transition-all duration-300">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                          <CreditCard className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-white">{card.name}</h4>
                          <p className="text-[9px] text-gray-400 font-semibold">Fechamento: dia {card.closingDay} | Vencimento: dia {card.dueDay}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleDeleteCard(card.id)}
                        className="p-1 text-gray-500 hover:text-red-400 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-1">
                      <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                        <div className="bg-indigo-500 h-full rounded-full w-[15%]" />
                      </div>
                      <div className="flex justify-between text-[9px] text-gray-400 font-semibold">
                        <span>Fatura Atual: R$ 0,00</span>
                        <span>Limite Disponível: {formatBRL(card.limit)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CREATE BANK ACCOUNT MODAL */}
      {showAccountModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md glass-panel p-6 rounded-3xl border border-border flex flex-col gap-4 animate-fade-in">
            <div className="flex justify-between items-center pb-2 border-b border-border">
              <h3 className="text-md font-bold text-white">Cadastrar Conta Bancária</h3>
              <button onClick={() => setShowAccountModal(false)} className="text-gray-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleCreateAccount} className="space-y-4">
              <div>
                <label className="text-xs text-gray-400 font-semibold mb-1 block">Nome da Instituição/Conta</label>
                <input 
                  type="text" 
                  placeholder="Ex: Itaú Uniclass, Carteira, Binances" 
                  value={accName}
                  onChange={(e) => setAccName(e.target.value)}
                  required
                  className="w-full bg-[#0E131F] border border-white/5 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-brand-500 text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 font-semibold mb-1 block">Tipo de Conta</label>
                  <select 
                    value={accType}
                    onChange={(e) => setAccType(e.target.value)}
                    className="w-full bg-[#0E131F] border border-white/5 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-brand-500 text-white"
                  >
                    <option value="CHECKING">Conta Corrente</option>
                    <option value="SAVINGS">Poupança</option>
                    <option value="WALLET">Carteira (Dinheiro)</option>
                    <option value="INVESTMENT">Investimentos</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-400 font-semibold mb-1 block">Saldo Inicial (R$)</label>
                  <input 
                    type="number" 
                    placeholder="0.00" 
                    value={accBalance}
                    onChange={(e) => setAccBalance(e.target.value)}
                    className="w-full bg-[#0E131F] border border-white/5 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-brand-500 text-white"
                  />
                </div>
              </div>
              <button type="submit" className="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold py-3 rounded-xl transition-all shadow-neon-brand text-xs">
                Salvar Conta
              </button>
            </form>
          </div>
        </div>
      )}

      {/* CREATE CREDIT CARD MODAL */}
      {showCardModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md glass-panel p-6 rounded-3xl border border-border flex flex-col gap-4 animate-fade-in">
            <div className="flex justify-between items-center pb-2 border-b border-border">
              <h3 className="text-md font-bold text-white">Cadastrar Cartão de Crédito</h3>
              <button onClick={() => setShowCardModal(false)} className="text-gray-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleCreateCard} className="space-y-4">
              <div>
                <label className="text-xs text-gray-400 font-semibold mb-1 block">Nome do Cartão</label>
                <input 
                  type="text" 
                  placeholder="Ex: Nubank Mastercard Gold" 
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  required
                  className="w-full bg-[#0E131F] border border-white/5 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-brand-500 text-white"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 font-semibold mb-1 block">Limite de Crédito (R$)</label>
                <input 
                  type="number" 
                  placeholder="5000.00" 
                  value={cardLimit}
                  onChange={(e) => setCardLimit(e.target.value)}
                  required
                  className="w-full bg-[#0E131F] border border-white/5 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-brand-500 text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 font-semibold mb-1 block">Dia de Fechamento</label>
                  <input 
                    type="number" 
                    min="1" 
                    max="31" 
                    value={cardClosing}
                    onChange={(e) => setCardClosing(e.target.value)}
                    className="w-full bg-[#0E131F] border border-white/5 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-brand-500 text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 font-semibold mb-1 block">Dia de Vencimento</label>
                  <input 
                    type="number" 
                    min="1" 
                    max="31" 
                    value={cardDue}
                    onChange={(e) => setCardDue(e.target.value)}
                    className="w-full bg-[#0E131F] border border-white/5 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-brand-500 text-white"
                  />
                </div>
              </div>
              <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition-all shadow-neon-brand text-xs">
                Salvar Cartão
              </button>
            </form>
          </div>
        </div>
      )}

      {/* SIMULATE PAY INVOICE MODAL */}
      {showPayModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md glass-panel p-6 rounded-3xl border border-border flex flex-col gap-4 animate-fade-in">
            <div className="flex justify-between items-center pb-2 border-b border-border">
              <h3 className="text-md font-bold text-white flex items-center gap-1.5">
                <Sparkles className="w-5 h-5 text-yellow-400" />
                <span>Simulador de Pagamento de Fatura</span>
              </h3>
              <button onClick={() => setShowPayModal(false)} className="text-gray-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={handlePayInvoice} className="space-y-4">
              <div>
                <label className="text-xs text-gray-400 font-semibold mb-1 block">Selecione o Cartão</label>
                <select 
                  value={selectedCardId}
                  onChange={(e) => setSelectedCardId(e.target.value)}
                  className="w-full bg-[#0E131F] border border-white/5 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-brand-500 text-white"
                >
                  {cards.map((c: any) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 font-semibold mb-1 block">Pagar usando Conta</label>
                  <select 
                    value={payAccountId}
                    onChange={(e) => setPayAccountId(e.target.value)}
                    className="w-full bg-[#0E131F] border border-white/5 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-brand-500 text-white"
                  >
                    {accounts.map((a: any) => (
                      <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-400 font-semibold mb-1 block">Valor Pago (R$)</label>
                  <input 
                    type="number" 
                    value={payAmount}
                    onChange={(e) => setPayAmount(e.target.value)}
                    required
                    className="w-full bg-[#0E131F] border border-white/5 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-brand-500 text-white"
                  />
                </div>
              </div>

              <p className="text-[10px] text-gray-400 italic">
                * Nota: Esta operação fará o débito correspondente na conta bancária selecionada e registrará o lançamento sob a categoria de 'Contas'.
              </p>

              <button type="submit" className="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold py-3 rounded-xl transition-all shadow-neon-brand text-xs">
                Confirmar Pagamento
              </button>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
