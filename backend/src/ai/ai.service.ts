import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AiService {
  constructor(private prisma: PrismaService) {}

  async generateInsights(userId: number) {
    const transactions = await this.prisma.transaction.findMany({
      where: { userId, type: 'EXPENSE' },
    });

    const accounts = await this.prisma.account.findMany({
      where: { userId },
    });

    const goals = await this.prisma.financialGoal.findMany({
      where: { userId },
    });

    const insights = [];

    if (transactions.length === 0) {
      return [
        {
          id: 1,
          text: 'Bem-vindo ao Contable! Cadastre suas despesas diárias para começar a receber análises de gastos automáticas.',
          type: 'TIP',
        },
      ];
    }

    const totalExpense = transactions.reduce((sum, tx) => sum + tx.amount, 0);

    // Categories
    const categoriesMap: Record<string, number> = {};
    transactions.forEach((tx) => {
      categoriesMap[tx.category] = (categoriesMap[tx.category] || 0) + tx.amount;
    });

    let topCategory = '';
    let maxSpent = 0;
    Object.entries(categoriesMap).forEach(([cat, val]) => {
      if (val > maxSpent) {
        maxSpent = val;
        topCategory = cat;
      }
    });

    const translateCat = (cat: string) => {
      const map: Record<string, string> = {
        FOOD: 'Alimentação',
        TRANSPORT: 'Transporte',
        HEALTH: 'Saúde',
        LEISURE: 'Lazer',
        SALARY: 'Salário',
        INVESTMENT: 'Investimentos',
        UTILITIES: 'Contas Residenciais',
        OTHERS: 'Outros',
      };
      return map[cat] || cat;
    };

    // Insight 1: Top Category
    if (topCategory) {
      const pct = Math.round((maxSpent / totalExpense) * 100);
      if (pct > 25) {
        insights.push({
          id: 1,
          text: `Atenção: A categoria **${translateCat(topCategory)}** representa ${pct}% dos seus gastos totais (R$ ${maxSpent.toFixed(2)}). Considere estipular um limite semanal.`,
          type: 'WARNING',
        });
      }
    }

    // Insight 2: Emergencies / Goals
    const emergencyGoal = goals.find((g) => g.name.toLowerCase().includes('emergencia') || g.name.toLowerCase().includes('emergência'));
    const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);

    if (emergencyGoal) {
      const currentPct = Math.round((emergencyGoal.currentAmount / emergencyGoal.targetAmount) * 100);
      if (currentPct < 50) {
        insights.push({
          id: 2,
          text: `Sua reserva de emergência está em **${currentPct}%** da meta. Recomendamos automatizar a transferência de 10% da sua receita mensal logo no dia em que receber seu salário.`,
          type: 'TIP',
        });
      }
    } else {
      insights.push({
        id: 2,
        text: 'Dica de Ouro: Você ainda não criou uma **Reserva de Emergência** nas Metas. Ter de 3 a 6 meses de gastos guardados é essencial para estabilidade financeira.',
        type: 'TIP',
      });
    }

    // Insight 3: Balanced budget check
    const incomes = await this.prisma.transaction.findMany({
      where: { userId, type: 'INCOME', status: 'PAID' },
    });
    const totalIncome = incomes.reduce((sum, tx) => sum + tx.amount, 0);

    if (totalIncome > 0) {
      const savingRate = ((totalIncome - totalExpense) / totalIncome) * 100;
      if (savingRate < 10 && savingRate > 0) {
        insights.push({
          id: 3,
          text: `Alerta: Você está poupando apenas **${savingRate.toFixed(1)}%** do que ganha. Para acelerar seus sonhos, busque otimizar despesas recorrentes e assinaturas.`,
          type: 'WARNING',
        });
      } else if (savingRate <= 0) {
        insights.push({
          id: 3,
          text: `Crítico: Suas despesas excederam suas receitas este mês em R$ ${Math.abs(totalIncome - totalExpense).toFixed(2)}. Utilize a regra 50/30/20 para reajustar seu orçamento.`,
          type: 'WARNING',
        });
      } else {
        insights.push({
          id: 3,
          text: `Parabéns! Você está economizando **${savingRate.toFixed(1)}%** da sua receita mensal. Seus investimentos futuros agradecem!`,
          type: 'SUGGESTION',
        });
      }
    }

    return insights;
  }

  async answerQuestion(userId: number, question: string) {
    const q = question.toLowerCase();
    
    // Fetch live metrics
    const accounts = await this.prisma.account.findMany({ where: { userId } });
    const transactions = await this.prisma.transaction.findMany({ where: { userId } });
    const goals = await this.prisma.financialGoal.findMany({ where: { userId } });

    const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);
    const totalExpense = transactions.filter(t => t.type === 'EXPENSE').reduce((sum, t) => sum + t.amount, 0);
    const totalIncome = transactions.filter(t => t.type === 'INCOME' && t.status === 'PAID').reduce((sum, t) => sum + t.amount, 0);

    // Rule-based conversational AI responses incorporating live user figures!
    if (q.includes('saldo') || q.includes('quanto tenho')) {
      return {
        reply: `Seu saldo consolidado atual é de **R$ ${totalBalance.toFixed(2)}**, distribuído entre ${accounts.length} conta(s). \n\n* Dica: Mantenha seus investimentos separados da sua conta de gastos diários para evitar compras por impulso.`,
      };
    }

    if (q.includes('gasto') || q.includes('despesa') || q.includes('gastei')) {
      const topCategories: Record<string, number> = {};
      transactions.filter(t => t.type === 'EXPENSE').forEach(t => {
        topCategories[t.category] = (topCategories[t.category] || 0) + t.amount;
      });

      const sorted = Object.entries(topCategories).sort((a, b) => b[1] - a[1]);
      let catDetails = '';
      if (sorted.length > 0) {
        catDetails = `\nSuas maiores despesas são:\n` + sorted.slice(0, 3).map(([cat, val]) => `- **${cat}**: R$ ${val.toFixed(2)}`).join('\n');
      }

      return {
        reply: `Neste período, você registrou **R$ ${totalExpense.toFixed(2)}** em despesas. ${catDetails}\n\nSe quiser reduzir isso, me diga se quer dicas específicas de cortes ou parcelamentos.`,
      };
    }

    if (q.includes('receita') || q.includes('ganhei') || q.includes('salario') || q.includes('salário')) {
      return {
        reply: `Suas receitas totais somam **R$ ${totalIncome.toFixed(2)}**. Com uma despesa de **R$ ${totalExpense.toFixed(2)}**, sua taxa de poupança atual está em **${totalIncome > 0 ? ((totalIncome - totalExpense)/totalIncome*100).toFixed(1) : 0}%**.`,
      };
    }

    if (q.includes('emergencia') || q.includes('reserva') || q.includes('emergência')) {
      const emergency = goals.find(g => g.name.toLowerCase().includes('emergencia') || g.name.toLowerCase().includes('emergência'));
      if (emergency) {
        const remaining = emergency.targetAmount - emergency.currentAmount;
        return {
          reply: `Sua **Reserva de Emergência** está em **R$ ${emergency.currentAmount.toFixed(2)}** de um objetivo de **R$ ${emergency.targetAmount.toFixed(2)}** (faltam R$ ${remaining.toFixed(2)}).\n\nPara acelerar, experimente cortar 10% dos gastos supérfluos (Lazer/Lanches) esta semana!`,
        };
      } else {
        return {
          reply: `Você ainda não criou uma meta de reserva de emergência. Aconselho criar uma com o valor correspondente a 6 meses de suas despesas fundamentais (cerca de R$ ${(totalExpense * 6 || 12000).toFixed(2)}). Quer que eu crie para você?`,
        };
      }
    }

    if (q.includes('economizar') || q.includes('poup') || q.includes('dica')) {
      return {
        reply: `Aqui estão 3 recomendações rápidas de economia baseadas no seu perfil:\n\n1. **Revise Assinaturas:** Analise despesas recorrentes e cancele streamings ou apps que não usou nos últimos 30 dias.\n2. **Regra das 24 Horas:** Quando quiser comprar algo não planejado, espere 24h. A maioria dos impulsos passa.\n3. **Cozinhe mais:** Alimentação fora de casa costuma representar o maior ralo financeiro silencioso.`,
      };
    }

    // Default response
    return {
      reply: `Olá! Sou o assistente de IA do Contable. Posso ajudar você a analisar seus gastos, saldo de contas, andamento de metas ou dar dicas de finanças pessoais.\n\nTente me perguntar: *"Quanto gastei este mês?"* ou *"Qual é meu saldo?"*`,
    };
  }
}
