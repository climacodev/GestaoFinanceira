import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FinanceService {
  constructor(private prisma: PrismaService) {}

  // ==================== ACCOUNTS ====================
  async getAccounts(userId: number) {
    return this.prisma.account.findMany({
      where: { userId },
      orderBy: { name: 'asc' },
    });
  }

  async createAccount(userId: number, data: any) {
    return this.prisma.account.create({
      data: {
        name: data.name,
        type: data.type,
        balance: parseFloat(data.balance || 0),
        userId,
      },
    });
  }

  async updateAccount(userId: number, id: number, data: any) {
    const account = await this.prisma.account.findFirst({ where: { id, userId } });
    if (!account) throw new NotFoundException('Account not found');

    return this.prisma.account.update({
      where: { id },
      data: {
        name: data.name,
        type: data.type,
        balance: data.balance !== undefined ? parseFloat(data.balance) : undefined,
      },
    });
  }

  async deleteAccount(userId: number, id: number) {
    const account = await this.prisma.account.findFirst({ where: { id, userId } });
    if (!account) throw new NotFoundException('Account not found');

    await this.prisma.account.delete({ where: { id } });
    return { success: true };
  }

  // ==================== CREDIT CARDS ====================
  async getCreditCards(userId: number) {
    return this.prisma.creditCard.findMany({
      where: { userId },
      orderBy: { name: 'asc' },
    });
  }

  async createCreditCard(userId: number, data: any) {
    return this.prisma.creditCard.create({
      data: {
        name: data.name,
        limit: parseFloat(data.limit),
        closingDay: parseInt(data.closingDay),
        dueDay: parseInt(data.dueDay),
        userId,
      },
    });
  }

  async updateCreditCard(userId: number, id: number, data: any) {
    const card = await this.prisma.creditCard.findFirst({ where: { id, userId } });
    if (!card) throw new NotFoundException('Credit card not found');

    return this.prisma.creditCard.update({
      where: { id },
      data: {
        name: data.name,
        limit: data.limit !== undefined ? parseFloat(data.limit) : undefined,
        closingDay: data.closingDay !== undefined ? parseInt(data.closingDay) : undefined,
        dueDay: data.dueDay !== undefined ? parseInt(data.dueDay) : undefined,
      },
    });
  }

  async deleteCreditCard(userId: number, id: number) {
    const card = await this.prisma.creditCard.findFirst({ where: { id, userId } });
    if (!card) throw new NotFoundException('Credit card not found');

    await this.prisma.creditCard.delete({ where: { id } });
    return { success: true };
  }

  // ==================== TRANSACTIONS ====================
  async getTransactions(userId: number, filters: any = {}) {
    const where: any = { userId };

    if (filters.type) where.type = filters.type;
    if (filters.category) where.category = filters.category;
    if (filters.accountId) where.accountId = parseInt(filters.accountId);
    if (filters.creditCardId) where.creditCardId = parseInt(filters.creditCardId);
    if (filters.status) where.status = filters.status;

    if (filters.startDate || filters.endDate) {
      where.date = {};
      if (filters.startDate) where.date.gte = new Date(filters.startDate);
      if (filters.endDate) where.date.lte = new Date(filters.endDate);
    }

    return this.prisma.transaction.findMany({
      where,
      orderBy: { date: 'desc' },
      include: {
        account: true,
        creditCard: true,
      },
    });
  }

  async createTransaction(userId: number, data: any) {
    const amount = parseFloat(data.amount);
    const date = data.date ? new Date(data.date) : new Date();

    if (isNaN(amount) || amount <= 0) {
      throw new BadRequestException('Amount must be positive');
    }

    let accountId = data.accountId ? parseInt(data.accountId) : null;
    let creditCardId = data.creditCardId ? parseInt(data.creditCardId) : null;

    if (accountId) {
      const account = await this.prisma.account.findFirst({ where: { id: accountId, userId } });
      if (!account) throw new NotFoundException('Account not found');
    }

    if (creditCardId) {
      const card = await this.prisma.creditCard.findFirst({ where: { id: creditCardId, userId } });
      if (!card) throw new NotFoundException('Credit card not found');
    }

    // Handle Installments (split transaction)
    if (data.isInstallment && data.totalInstallments && data.totalInstallments > 1) {
      const totalInstallments = parseInt(data.totalInstallments);
      const installmentAmount = parseFloat((amount / totalInstallments).toFixed(2));
      const createdTransactions = [];

      for (let i = 1; i <= totalInstallments; i++) {
        const installmentDate = new Date(date);
        installmentDate.setMonth(installmentDate.getMonth() + (i - 1));

        const newTx = await this.prisma.transaction.create({
          data: {
            description: `${data.description} (${i}/${totalInstallments})`,
            amount: installmentAmount,
            date: installmentDate,
            type: data.type,
            category: data.category,
            subcategory: data.subcategory,
            status: creditCardId ? 'PENDING' : data.status || 'PAID',
            isInstallment: true,
            installmentNumber: i,
            totalInstallments,
            attachmentUrl: data.attachmentUrl,
            userId,
            accountId: creditCardId ? null : accountId,
            creditCardId,
          },
        });

        // Update Account Balance immediately if PAID and not credit card
        if (!creditCardId && newTx.status === 'PAID' && accountId) {
          await this.prisma.account.update({
            where: { id: accountId },
            data: {
              balance: {
                [data.type === 'INCOME' ? 'increment' : 'decrement']: installmentAmount,
              },
            },
          });
        }

        createdTransactions.push(newTx);
      }

      return createdTransactions[0];
    }

    // Standard Transaction
    const transaction = await this.prisma.transaction.create({
      data: {
        description: data.description,
        amount,
        date,
        type: data.type,
        category: data.category,
        subcategory: data.subcategory,
        status: data.status || 'PAID',
        isRecurring: data.isRecurring || false,
        recurrencePeriod: data.recurrencePeriod,
        attachmentUrl: data.attachmentUrl,
        userId,
        accountId: creditCardId ? null : accountId,
        creditCardId,
      },
    });

    // Update Account Balance immediately if PAID and not credit card
    if (!creditCardId && transaction.status === 'PAID' && accountId) {
      await this.prisma.account.update({
        where: { id: accountId },
        data: {
          balance: {
            [data.type === 'INCOME' ? 'increment' : 'decrement']: amount,
          },
        },
      });
    }

    return transaction;
  }

  async updateTransaction(userId: number, id: number, data: any) {
    const tx = await this.prisma.transaction.findFirst({ where: { id, userId } });
    if (!tx) throw new NotFoundException('Transaction not found');

    const prevAmount = tx.amount;
    const prevType = tx.type;
    const prevStatus = tx.status;
    const prevAccountId = tx.accountId;

    const updatedAmount = data.amount !== undefined ? parseFloat(data.amount) : prevAmount;
    const updatedType = data.type || prevType;
    const updatedStatus = data.status || prevStatus;
    const updatedAccountId = data.accountId !== undefined ? (data.accountId ? parseInt(data.accountId) : null) : prevAccountId;

    // We first revert the old account balance if it was PAID and associated with an account
    if (prevStatus === 'PAID' && prevAccountId) {
      await this.prisma.account.update({
        where: { id: prevAccountId },
        data: {
          balance: {
            [prevType === 'INCOME' ? 'decrement' : 'increment']: prevAmount,
          },
        },
      });
    }

    const updatedTx = await this.prisma.transaction.update({
      where: { id },
      data: {
        description: data.description,
        amount: updatedAmount,
        date: data.date ? new Date(data.date) : undefined,
        type: updatedType,
        category: data.category,
        subcategory: data.subcategory,
        status: updatedStatus,
        accountId: updatedAccountId,
        creditCardId: data.creditCardId !== undefined ? (data.creditCardId ? parseInt(data.creditCardId) : null) : undefined,
      },
    });

    // We apply the new account balance adjustments if the updated transaction is PAID
    if (updatedStatus === 'PAID' && updatedAccountId) {
      await this.prisma.account.update({
        where: { id: updatedAccountId },
        data: {
          balance: {
            [updatedType === 'INCOME' ? 'increment' : 'decrement']: updatedAmount,
          },
        },
      });
    }

    return updatedTx;
  }

  async deleteTransaction(userId: number, id: number) {
    const tx = await this.prisma.transaction.findFirst({ where: { id, userId } });
    if (!tx) throw new NotFoundException('Transaction not found');

    // Revert account balance if PAID
    if (tx.status === 'PAID' && tx.accountId) {
      await this.prisma.account.update({
        where: { id: tx.accountId },
        data: {
          balance: {
            [tx.type === 'INCOME' ? 'decrement' : 'increment']: tx.amount,
          },
        },
      });
    }

    await this.prisma.transaction.delete({ where: { id } });
    return { success: true };
  }

  // ==================== FINANCIAL GOALS ====================
  async getGoals(userId: number) {
    return this.prisma.financialGoal.findMany({
      where: { userId },
      orderBy: { name: 'asc' },
    });
  }

  async createGoal(userId: number, data: any) {
    return this.prisma.financialGoal.create({
      data: {
        name: data.name,
        targetAmount: parseFloat(data.targetAmount),
        currentAmount: parseFloat(data.currentAmount || 0),
        deadline: data.deadline ? new Date(data.deadline) : null,
        userId,
      },
    });
  }

  async updateGoal(userId: number, id: number, data: any) {
    const goal = await this.prisma.financialGoal.findFirst({ where: { id, userId } });
    if (!goal) throw new NotFoundException('Goal not found');

    return this.prisma.financialGoal.update({
      where: { id },
      data: {
        name: data.name,
        targetAmount: data.targetAmount !== undefined ? parseFloat(data.targetAmount) : undefined,
        currentAmount: data.currentAmount !== undefined ? parseFloat(data.currentAmount) : undefined,
        deadline: data.deadline ? new Date(data.deadline) : undefined,
      },
    });
  }

  async deleteGoal(userId: number, id: number) {
    const goal = await this.prisma.financialGoal.findFirst({ where: { id, userId } });
    if (!goal) throw new NotFoundException('Goal not found');

    await this.prisma.financialGoal.delete({ where: { id } });
    return { success: true };
  }

  // ==================== DASHBOARD METRICS ====================
  async getDashboardData(userId: number) {
    const accounts = await this.getAccounts(userId);
    const creditCards = await this.getCreditCards(userId);
    const goals = await this.getGoals(userId);

    const totalBalance = accounts.reduce((acc, curr) => acc + curr.balance, 0);

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const endOfMonth = new Date(startOfMonth.getFullYear(), startOfMonth.getMonth() + 1, 0, 23, 59, 59, 999);

    const monthlyTransactions = await this.prisma.transaction.findMany({
      where: {
        userId,
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
    });

    const monthlyIncome = monthlyTransactions
      .filter((tx) => tx.type === 'INCOME' && tx.status === 'PAID')
      .reduce((acc, curr) => acc + curr.amount, 0);

    const monthlyExpenses = monthlyTransactions
      .filter((tx) => tx.type === 'EXPENSE')
      .reduce((acc, curr) => acc + curr.amount, 0);

    // Group expenses by category
    const categoriesMap: Record<string, number> = {};
    monthlyTransactions
      .filter((tx) => tx.type === 'EXPENSE')
      .forEach((tx) => {
        categoriesMap[tx.category] = (categoriesMap[tx.category] || 0) + tx.amount;
      });

    const categoryDistribution = Object.entries(categoriesMap).map(([name, value]) => ({
      name,
      value,
    }));

    // Cash flow: last 6 months
    const cashFlow = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const mStart = new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);
      const mEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);

      const txs = await this.prisma.transaction.findMany({
        where: {
          userId,
          date: { gte: mStart, lte: mEnd },
        },
      });

      const inc = txs.filter((t) => t.type === 'INCOME' && t.status === 'PAID').reduce((a, c) => a + c.amount, 0);
      const exp = txs.filter((t) => t.type === 'EXPENSE').reduce((a, c) => a + c.amount, 0);

      const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      cashFlow.push({
        month: monthNames[d.getMonth()],
        receitas: inc,
        despesas: exp,
        saldo: inc - exp,
      });
    }

    // Recent transactions
    const recentTransactions = await this.prisma.transaction.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      take: 6,
      include: {
        account: true,
        creditCard: true,
      },
    });

    return {
      totalBalance,
      monthlyIncome,
      monthlyExpenses,
      netFlow: monthlyIncome - monthlyExpenses,
      cashFlow,
      categoryDistribution,
      accounts,
      creditCards,
      goals,
      recentTransactions,
    };
  }
}
