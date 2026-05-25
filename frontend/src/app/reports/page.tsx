'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { api } from '@/lib/api';
import { FileText, Download, CheckCircle, BarChart3, TrendingUp, AlertCircle } from 'lucide-react';

export default function ReportsPage() {
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState<string | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  const loadSummary = async () => {
    try {
      const data = await api.reports.getSummary();
      setSummary(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSummary();
  }, []);

  const handleExport = async (type: string, label: string) => {
    setExporting(type);
    setDownloadSuccess(null);

    try {
      // Simulate file compile and trigger browser file saving
      // Fallback downloads directly using client-side blob generation
      let csvContent = '';
      if (type === 'transactions') {
        const txs = await api.finance.getTransactions();
        csvContent = 'ID,Data,Descricao,Valor,Tipo,Categoria,Status\n' + 
          txs.map((t: any) => `${t.id},${t.date.split('T')[0]},"${t.description.replace(/"/g, '""')}",${t.amount},${t.type},${t.category},${t.status}`).join('\n');
      } else if (type === 'categories') {
        const txs = await api.finance.getTransactions();
        const cats: Record<string, number> = {};
        txs.filter((t: any) => t.type === 'EXPENSE').forEach((t: any) => { cats[t.category] = (cats[t.category] || 0) + t.amount; });
        csvContent = 'Categoria,Total Gasto\n' + Object.entries(cats).map(([c, v]) => `"${c}",${v}`).join('\n');
      } else {
        const goals = await api.finance.getGoals();
        csvContent = 'Meta,Valor Alvo,Valor Atual,Status\n' + 
          goals.map((g: any) => `"${g.name.replace(/"/g, '""')}",${g.targetAmount},${g.currentAmount},${g.currentAmount >= g.targetAmount ? 'Concluído' : 'Poupando'}`).join('\n');
      }

      setTimeout(() => {
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `relatorio_contable_${type}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setExporting(null);
        setDownloadSuccess(label);
      }, 1500);
    } catch (err) {
      setExporting(null);
    }
  };

  const formatBRL = (val: number) => {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  if (loading || !summary) {
    return (
      <DashboardLayout>
        <p className="text-sm text-gray-400 font-semibold">Carregando sumário de relatórios...</p>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Title */}
        <div>
          <h2 className="text-xl font-bold text-white">Relatórios & Exportações</h2>
          <p className="text-xs text-gray-400 mt-0.5 font-medium">Gere planilhas financeiras das suas contas para Excel e PDF</p>
        </div>

        {/* Dashboard summary stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="glass-panel p-6 rounded-3xl relative overflow-hidden">
            <div className="absolute right-4 top-4 w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <TrendingUp className="w-5 h-5" />
            </div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Total Receitas</p>
            <h4 className="text-xl font-extrabold mt-3 text-emerald-400">{formatBRL(summary.overview.totalIncome)}</h4>
          </div>

          <div className="glass-panel p-6 rounded-3xl relative overflow-hidden">
            <div className="absolute right-4 top-4 w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-400">
              <BarChart3 className="w-5 h-5" />
            </div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Total Despesas</p>
            <h4 className="text-xl font-extrabold mt-3 text-red-400">{formatBRL(summary.overview.totalExpense)}</h4>
          </div>

          <div className="glass-panel p-6 rounded-3xl relative overflow-hidden border-brand-500/25">
            <div className="absolute right-4 top-4 w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center text-brand-400">
              <FileText className="w-5 h-5" />
            </div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Registros Totais</p>
            <h4 className="text-xl font-extrabold mt-3 text-white">{summary.overview.numberOfTransactions} lançamentos</h4>
          </div>
        </div>

        {/* Export Files Layout */}
        <div className="glass-panel p-6 rounded-3xl space-y-6">
          <div>
            <h3 className="text-sm font-bold text-white">Relatórios Disponíveis</h3>
            <p className="text-xs text-gray-400 mt-0.5">Selecione o formato para baixar no seu computador</p>
          </div>

          {downloadSuccess && (
            <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3 rounded-2xl text-xs font-semibold">
              <CheckCircle className="w-4 h-4" />
              <span>Download concluído: <strong>{downloadSuccess}</strong></span>
            </div>
          )}

          <div className="divide-y divide-white/5">
            {summary.exportOptions.map((opt: any) => (
              <div key={opt.key} className="flex justify-between items-center py-4 first:pt-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-gray-300 font-extrabold text-[10px]">
                    {opt.format}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">{opt.label}</h4>
                    <p className="text-[9px] text-gray-400 font-semibold">Consolidado em formato de planilha Excel compatível</p>
                  </div>
                </div>

                <button 
                  onClick={() => handleExport(opt.key, opt.label)}
                  disabled={exporting !== null}
                  className="flex items-center gap-1.5 bg-brand-600 hover:bg-brand-500 hover:shadow-neon-brand text-white font-bold text-xs px-4 py-2 rounded-xl transition-all disabled:opacity-50 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>{exporting === opt.key ? 'Compilando...' : 'Exportar'}</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Info advice box */}
        <div className="p-4 rounded-3xl bg-indigo-500/5 border border-indigo-500/10 flex gap-3 text-xs text-indigo-300 font-semibold leading-relaxed">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p>
            Usuários com plano <strong>Contable Premium</strong> têm acesso a relatórios customizados avançados, agrupamento anual, filtragem por tags de projetos e backup automático em nuvem do Google Drive / iCloud.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
