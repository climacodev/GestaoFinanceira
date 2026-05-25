import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async exportCsv(userId: number, type: string) {
    if (type === 'transactions') {
      const txs = await this.prisma.transaction.findMany({
        where: { userId },
        orderBy: { date: 'desc' },
      });

      let csv = 'ID,Data,Descricao,Valor,Tipo,Categoria,Status\n';
      txs.forEach((tx) => {
        csv += `${tx.id},"${tx.date.toISOString().split('T')[0]}","${tx.description.replace(/"/g, '""')}",${tx.amount},"${tx.type}","${tx.category}","${tx.status}"\n`;
      });
      return csv;
    } else if (type === 'categories') {
      const txs = await this.prisma.transaction.findMany({
        where: { userId, type: 'EXPENSE' },
      });

      const categories: Record<string, number> = {};
      txs.forEach((tx) => {
        categories[tx.category] = (categories[tx.category] || 0) + tx.amount;
      });

      let csv = 'Categoria,Total Gasto\n';
      Object.entries(categories).forEach(([cat, val]) => {
        csv += `"${cat}",${val}\n`;
      });
      return csv;
    } else if (type === 'goals') {
      const goals = await this.prisma.financialGoal.findMany({
        where: { userId },
      });

      let csv = 'Meta,Valor Objetivo,Valor Atual,Deadline,Percentual\n';
      goals.forEach((g) => {
        const pct = g.targetAmount > 0 ? ((g.currentAmount / g.targetAmount) * 100).toFixed(1) : '0.0';
        csv += `"${g.name.replace(/"/g, '""')}",${g.targetAmount},${g.currentAmount},"${g.deadline ? g.deadline.toISOString().split('T')[0] : 'N/A'}",${pct}%\n`;
      });
      return csv;
    }

    return 'ID,Mensagem\n1,"Relatorio sem dados ou tipo nao suportado"\n';
  }

  async getReportsSummary(userId: number) {
    const transactions = await this.prisma.transaction.findMany({ where: { userId } });
    const goals = await this.prisma.financialGoal.findMany({ where: { userId } });

    const totalIncome = transactions.filter(t => t.type === 'INCOME').reduce((s, t) => s + t.amount, 0);
    const totalExpense = transactions.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + t.amount, 0);

    return {
      overview: {
        totalIncome,
        totalExpense,
        netSavings: totalIncome - totalExpense,
        numberOfTransactions: transactions.length,
        numberOfGoals: goals.length,
      },
      exportOptions: [
        { key: 'transactions', label: 'Transações Completas', format: 'CSV' },
        { key: 'categories', label: 'Despesas por Categorias', format: 'CSV' },
        { key: 'goals', label: 'Status de Metas Financeiras', format: 'CSV' },
      ],
    };
  }
}
