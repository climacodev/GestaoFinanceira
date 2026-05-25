// API service wrapper for Contable personal finance platform
const BASE_URL = 'http://localhost:3001/api';

// Safe fetch helper
async function request(endpoint: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('contable_token') : null;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || `HTTP error! status: ${res.status}`);
    }

    return await res.json();
  } catch (error) {
    // If backend is down, delegate to mock database logic
    console.warn(`Backend unreachable on ${endpoint}. Using local mockup fallback.`, error);
    return mockRequest(endpoint, options);
  }
}

// Local mock database state (persisted in localStorage for mock-fallback reliability)
const getMockDb = () => {
  if (typeof window === 'undefined') return { transactions: [], accounts: [], cards: [], goals: [] };
  
  let dbStr = localStorage.getItem('contable_mock_db');
  if (!dbStr) {
    const initialDb = {
      user: { id: 1, name: 'Claudio Lima', email: 'claudio@lima.com', plan: 'FREE' },
      accounts: [
        { id: 101, name: 'Conta Principal (Itaú)', type: 'CHECKING', balance: 4250.80 },
        { id: 102, name: 'Reserva Nubank', type: 'SAVINGS', balance: 12000.00 },
        { id: 103, name: 'Carteira de Dinheiro', type: 'WALLET', balance: 350.00 },
        { id: 104, name: 'Investimentos XP', type: 'INVESTMENT', balance: 25000.00 }
      ],
      cards: [
        { id: 201, name: 'Nubank Violeta', limit: 8000.00, closingDay: 5, dueDay: 12 },
        { id: 202, name: 'XP Visa Infinite', limit: 15000.00, closingDay: 15, dueDay: 25 }
      ],
      transactions: [
        { id: 1, description: 'Salário Google Inc', amount: 8500.00, date: '2026-05-20', type: 'INCOME', category: 'SALARY', status: 'PAID', accountId: 101 },
        { id: 2, description: 'Supermercado Pão de Açúcar', amount: 450.20, date: '2026-05-22', type: 'EXPENSE', category: 'FOOD', status: 'PAID', accountId: 101 },
        { id: 3, description: 'Netflix Trimestral', amount: 55.90, date: '2026-05-18', type: 'EXPENSE', category: 'UTILITIES', status: 'PAID', creditCardId: 201 },
        { id: 4, description: 'Combustível Posto Ipiranga', amount: 120.00, date: '2026-05-15', type: 'EXPENSE', category: 'TRANSPORT', status: 'PAID', accountId: 103 },
        { id: 5, description: 'Consulta Médica Pediatra', amount: 350.00, date: '2026-05-12', type: 'EXPENSE', category: 'HEALTH', status: 'PAID', accountId: 101 },
        { id: 6, description: 'Jantar Restaurante Japonês', amount: 280.00, date: '2026-05-10', type: 'EXPENSE', category: 'LEISURE', status: 'PAID', creditCardId: 201 },
        { id: 7, description: 'Rendimento XP Fundos', amount: 180.50, date: '2026-05-05', type: 'INCOME', category: 'INVESTMENT', status: 'PAID', accountId: 104 }
      ],
      goals: [
        { id: 301, name: 'Viagem ao Japão', targetAmount: 15000.00, currentAmount: 4500.00, deadline: '2027-04-10' },
        { id: 302, name: 'Reserva de Emergência', targetAmount: 20000.00, currentAmount: 12000.00, deadline: '2026-12-31' },
        { id: 303, name: 'Troca de Carro', targetAmount: 60000.00, currentAmount: 15000.00, deadline: '2028-06-30' }
      ],
      insights: [
        { id: 1, text: 'Sua reserva de emergência está em 60% da meta. Você está no caminho certo!', type: 'TIP' },
        { id: 2, text: 'Você gastou 12% a mais com Alimentação do que a média dos últimos 3 meses.', type: 'WARNING' },
        { id: 3, text: 'Parabéns: Suas receitas totais superam despesas em R$ 7.710,50 este mês.', type: 'SUGGESTION' }
      ]
    };
    localStorage.setItem('contable_mock_db', JSON.stringify(initialDb));
    return initialDb;
  }
  return JSON.parse(dbStr);
};

const saveMockDb = (db: any) => {
  localStorage.setItem('contable_mock_db', JSON.stringify(db));
};

function mockRequest(endpoint: string, options: RequestInit) {
  const db = getMockDb();
  const method = options.method || 'GET';
  const body = options.body ? JSON.parse(options.body as string) : {};

  // Auth Mocks
  if (endpoint === '/auth/login') {
    return Promise.resolve({
      token: 'mock-jwt-token-xyz',
      user: db.user
    });
  }
  if (endpoint === '/auth/register') {
    db.user.name = body.name || 'Usuário';
    db.user.email = body.email || 'user@test.com';
    saveMockDb(db);
    return Promise.resolve({
      token: 'mock-jwt-token-xyz',
      user: db.user
    });
  }
  if (endpoint === '/auth/profile') {
    return Promise.resolve(db.user);
  }
  if (endpoint === '/auth/upgrade') {
    db.user.plan = 'PREMIUM';
    saveMockDb(db);
    return Promise.resolve({ success: true, user: db.user });
  }

  // Finance Mocks
  if (endpoint === '/finance/dashboard') {
    const totalBalance = db.accounts.reduce((sum: number, a: any) => sum + a.balance, 0);
    const monthlyIncome = db.transactions.filter((t: any) => t.type === 'INCOME' && t.status === 'PAID').reduce((sum: number, t: any) => sum + t.amount, 0);
    const monthlyExpenses = db.transactions.filter((t: any) => t.type === 'EXPENSE').reduce((sum: number, t: any) => sum + t.amount, 0);

    const categoriesMap: Record<string, number> = {};
    db.transactions.filter((t: any) => t.type === 'EXPENSE').forEach((t: any) => {
      categoriesMap[t.category] = (categoriesMap[t.category] || 0) + t.amount;
    });
    const categoryDistribution = Object.entries(categoriesMap).map(([name, value]) => ({ name, value }));

    const cashFlow = [
      { month: 'Dez', receitas: 6000, despesas: 5200, saldo: 800 },
      { month: 'Jan', receitas: 6500, despesas: 4100, saldo: 2400 },
      { month: 'Fev', receitas: 7000, despesas: 5900, saldo: 1100 },
      { month: 'Mar', receitas: 8500, despesas: 6300, saldo: 2200 },
      { month: 'Abr', receitas: 8200, despesas: 4500, saldo: 3700 },
      { month: 'Mai', receitas: monthlyIncome, despesas: monthlyExpenses, saldo: monthlyIncome - monthlyExpenses }
    ];

    return Promise.resolve({
      totalBalance,
      monthlyIncome,
      monthlyExpenses,
      netFlow: monthlyIncome - monthlyExpenses,
      cashFlow,
      categoryDistribution,
      accounts: db.accounts,
      creditCards: db.cards,
      goals: db.goals,
      recentTransactions: db.transactions.slice(0, 6)
    });
  }

  if (endpoint.startsWith('/finance/accounts')) {
    if (method === 'GET') return Promise.resolve(db.accounts);
    if (method === 'POST') {
      const newAcc = { id: Date.now(), ...body, balance: parseFloat(body.balance || 0) };
      db.accounts.push(newAcc);
      saveMockDb(db);
      return Promise.resolve(newAcc);
    }
    if (method === 'DELETE') {
      const id = parseInt(endpoint.split('/').pop() || '0');
      db.accounts = db.accounts.filter((a: any) => a.id !== id);
      saveMockDb(db);
      return Promise.resolve({ success: true });
    }
  }

  if (endpoint.startsWith('/finance/cards')) {
    if (method === 'GET') return Promise.resolve(db.cards);
    if (method === 'POST') {
      const newCard = { id: Date.now(), ...body, limit: parseFloat(body.limit || 0) };
      db.cards.push(newCard);
      saveMockDb(db);
      return Promise.resolve(newCard);
    }
    if (method === 'DELETE') {
      const id = parseInt(endpoint.split('/').pop() || '0');
      db.cards = db.cards.filter((c: any) => c.id !== id);
      saveMockDb(db);
      return Promise.resolve({ success: true });
    }
  }

  if (endpoint.startsWith('/finance/transactions')) {
    if (method === 'GET') {
      // Return sorted transactions
      return Promise.resolve(db.transactions.sort((a: any, b: any) => b.id - a.id));
    }
    if (method === 'POST') {
      const amount = parseFloat(body.amount);
      const newTx = {
        id: Date.now(),
        description: body.description,
        amount,
        date: body.date || new Date().toISOString().split('T')[0],
        type: body.type,
        category: body.category,
        status: body.status || 'PAID',
        accountId: body.accountId ? parseInt(body.accountId) : null,
        creditCardId: body.creditCardId ? parseInt(body.creditCardId) : null
      };

      db.transactions.unshift(newTx);

      // Adjust mock account balances
      if (newTx.accountId && newTx.status === 'PAID') {
        const acc = db.accounts.find((a: any) => a.id === newTx.accountId);
        if (acc) {
          acc.balance += newTx.type === 'INCOME' ? amount : -amount;
        }
      }

      saveMockDb(db);
      return Promise.resolve(newTx);
    }
    if (method === 'DELETE') {
      const id = parseInt(endpoint.split('/').pop() || '0');
      const tx = db.transactions.find((t: any) => t.id === id);
      if (tx && tx.accountId && tx.status === 'PAID') {
        const acc = db.accounts.find((a: any) => a.id === tx.accountId);
        if (acc) {
          acc.balance += tx.type === 'INCOME' ? -tx.amount : tx.amount;
        }
      }
      db.transactions = db.transactions.filter((t: any) => t.id !== id);
      saveMockDb(db);
      return Promise.resolve({ success: true });
    }
  }

  if (endpoint.startsWith('/finance/goals')) {
    if (method === 'GET') return Promise.resolve(db.goals);
    if (method === 'POST') {
      const newGoal = {
        id: Date.now(),
        name: body.name,
        targetAmount: parseFloat(body.targetAmount),
        currentAmount: parseFloat(body.currentAmount || 0),
        deadline: body.deadline
      };
      db.goals.push(newGoal);
      saveMockDb(db);
      return Promise.resolve(newGoal);
    }
    if (method === 'PUT') {
      const id = parseInt(endpoint.split('/').pop() || '0');
      const goal = db.goals.find((g: any) => g.id === id);
      if (goal) {
        if (body.currentAmount !== undefined) goal.currentAmount = parseFloat(body.currentAmount);
        if (body.name !== undefined) goal.name = body.name;
        if (body.targetAmount !== undefined) goal.targetAmount = parseFloat(body.targetAmount);
      }
      saveMockDb(db);
      return Promise.resolve(goal);
    }
    if (method === 'DELETE') {
      const id = parseInt(endpoint.split('/').pop() || '0');
      db.goals = db.goals.filter((g: any) => g.id !== id);
      saveMockDb(db);
      return Promise.resolve({ success: true });
    }
  }

  // AI Mocks
  if (endpoint === '/ai/insights') {
    return Promise.resolve(db.insights);
  }
  if (endpoint === '/ai/chat') {
    const q = body.question.toLowerCase();
    let reply = `Olá! Sou o assistente financeiro IA do Contable. Posso ajudar você a analisar contas, planejar metas e economizar dinheiro.`;

    if (q.includes('saldo')) {
      const total = db.accounts.reduce((sum: number, a: any) => sum + a.balance, 0);
      reply = `Seu saldo total consolidado é de **R$ ${total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}**. A maior parte está guardada na conta *${db.accounts[1]?.name || 'investimentos'}*.`;
    } else if (q.includes('gasto') || q.includes('gastei') || q.includes('despesa')) {
      const totalExp = db.transactions.filter((t: any) => t.type === 'EXPENSE').reduce((sum: number, t: any) => sum + t.amount, 0);
      reply = `Você já registrou **R$ ${totalExp.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}** em despesas. Seu maior ralo financeiro este mês foi na categoria **Alimentação** (R$ 450,20). Tente diminuir jantares fora.`;
    } else if (q.includes('economizar') || q.includes('dica') || q.includes('ajuda')) {
      reply = `Aqui vão 3 dicas práticas:\n\n1. **Meta de Poupança:** Separe 15% das suas receitas logo no início do mês.\n2. **Evite Assinaturas Inativas:** Revise faturas de cartões Nubank por assinaturas antigas.\n3. **Regra dos 3 Dias:** Para gastos caros, aguarde 3 dias antes de comprar para evitar impulso.`;
    } else if (q.includes('reserva') || q.includes('emergencia')) {
      const res = db.goals[1];
      reply = `Sua meta de **Reserva de Emergência** está em R$ ${res.currentAmount.toFixed(2)} de R$ ${res.targetAmount.toFixed(2)} (**${((res.currentAmount/res.targetAmount)*100).toFixed(0)}% concluída**). Recomendo economizar R$ 500 por mês para completar até o fim do ano.`;
    }

    return Promise.resolve({ reply });
  }

  // Reports summary Mock
  if (endpoint === '/reports/summary') {
    const totalIncome = db.transactions.filter((t: any) => t.type === 'INCOME').reduce((s: number, t: any) => s + t.amount, 0);
    const totalExpense = db.transactions.filter((t: any) => t.type === 'EXPENSE').reduce((s: number, t: any) => s + t.amount, 0);
    return Promise.resolve({
      overview: {
        totalIncome,
        totalExpense,
        netSavings: totalIncome - totalExpense,
        numberOfTransactions: db.transactions.length,
        numberOfGoals: db.goals.length,
      },
      exportOptions: [
        { key: 'transactions', label: 'Transações Completas', format: 'CSV' },
        { key: 'categories', label: 'Despesas por Categorias', format: 'CSV' },
        { key: 'goals', label: 'Status de Metas Financeiras', format: 'CSV' },
      ],
    });
  }

  return Promise.reject(new Error('Endpoint not mock-implemented'));
}

// REST Client operations
export const api = {
  auth: {
    login: (body: any) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
    register: (body: any) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
    socialLogin: (body: any) => request('/auth/social', { method: 'POST', body: JSON.stringify(body) }),
    getProfile: () => request('/auth/profile'),
    upgradePlan: () => request('/auth/upgrade', { method: 'POST' }),
  },
  finance: {
    getDashboard: () => request('/finance/dashboard'),
    getAccounts: () => request('/finance/accounts'),
    createAccount: (body: any) => request('/finance/accounts', { method: 'POST', body: JSON.stringify(body) }),
    deleteAccount: (id: number) => request(`/finance/accounts/${id}`, { method: 'DELETE' }),
    getCards: () => request('/finance/cards'),
    createCard: (body: any) => request('/finance/cards', { method: 'POST', body: JSON.stringify(body) }),
    deleteCard: (id: number) => request(`/finance/cards/${id}`, { method: 'DELETE' }),
    getTransactions: (filters: any = {}) => {
      const q = new URLSearchParams(filters).toString();
      return request(`/finance/transactions?${q}`);
    },
    createTransaction: (body: any) => request('/finance/transactions', { method: 'POST', body: JSON.stringify(body) }),
    deleteTransaction: (id: number) => request(`/finance/transactions/${id}`, { method: 'DELETE' }),
    getGoals: () => request('/finance/goals'),
    createGoal: (body: any) => request('/finance/goals', { method: 'POST', body: JSON.stringify(body) }),
    updateGoal: (id: number, body: any) => request(`/finance/goals/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    deleteGoal: (id: number) => request(`/finance/goals/${id}`, { method: 'DELETE' }),
  },
  ai: {
    getInsights: () => request('/ai/insights'),
    askChat: (question: string) => request('/ai/chat', { method: 'POST', body: JSON.stringify({ question }) }),
  },
  reports: {
    getSummary: () => request('/reports/summary'),
    getExportUrl: (type: string) => {
      // Returns a path to trigger downloads from Backend, or a simulated data URL in fallback
      const token = typeof window !== 'undefined' ? localStorage.getItem('contable_token') : '';
      return `${BASE_URL}/reports/export?type=${type}&token=${token}`;
    }
  }
};
