import axios from 'axios';
import { ENV } from '../_core/env';

// Configuração Pluggy
const PLUGGY_API_KEY = process.env.PLUGGY_API_KEY || '';
const PLUGGY_CLIENT_ID = process.env.PLUGGY_CLIENT_ID || '';
const PLUGGY_BASE_URL = 'https://api.pluggy.ai';

interface PluggyAccount {
  id: string;
  type: 'BANK' | 'CREDIT';
  subtype: 'CHECKING_ACCOUNT' | 'SAVINGS_ACCOUNT' | 'CREDIT_CARD';
  number: string;
  balance: number;
  currencyCode: string;
  name: string;
}

interface PluggyTransaction {
  id: string;
  description: string;
  amount: number;
  date: string;
  category: string;
  type: 'DEBIT' | 'CREDIT';
  accountId: string;
}

interface OpenFinanceMetrics {
  averageIncome: number; // Receita média mensal (últimos 3 meses)
  averageExpense: number; // Despesa média mensal
  incomeStability: number; // 0-1 (regularidade de receitas)
  cashFlowPositive: number; // % de meses com saldo positivo
  cashFlowTrend: 'increasing' | 'stable' | 'decreasing';
  totalBalance: number; // Saldo total em todas as contas
}

/**
 * Cria token de conexão para usuário conectar conta bancária
 */
export async function createConnectToken(userId: number): Promise<{
  connectToken: string;
  connectUrl: string;
}> {
  try {
    const { data } = await axios.post(
      `${PLUGGY_BASE_URL}/connect_token`,
      {
        clientUserId: userId.toString(),
      },
      {
        headers: {
          'X-API-KEY': PLUGGY_API_KEY,
          'X-CLIENT-ID': PLUGGY_CLIENT_ID,
        },
      }
    );

    return {
      connectToken: data.accessToken,
      connectUrl: `https://connect.pluggy.ai?connectToken=${data.accessToken}`,
    };
  } catch (error: any) {
    console.error('[OpenFinance] Erro ao criar connect token:', error.response?.data || error.message);
    throw new Error('Falha ao criar token de conexão bancária');
  }
}

/**
 * Busca contas bancárias conectadas
 */
export async function getAccounts(itemId: string): Promise<PluggyAccount[]> {
  try {
    const { data } = await axios.get(
      `${PLUGGY_BASE_URL}/accounts`,
      {
        params: { itemId },
        headers: {
          'X-API-KEY': PLUGGY_API_KEY,
        },
      }
    );

    return data.results || [];
  } catch (error: any) {
    console.error('[OpenFinance] Erro ao buscar contas:', error.response?.data || error.message);
    return [];
  }
}

/**
 * Busca transações bancárias (últimos 90 dias)
 */
export async function getTransactions(itemId: string): Promise<PluggyTransaction[]> {
  try {
    const from = getDate90DaysAgo();
    const { data } = await axios.get(
      `${PLUGGY_BASE_URL}/transactions`,
      {
        params: { 
          itemId,
          from,
        },
        headers: {
          'X-API-KEY': PLUGGY_API_KEY,
        },
      }
    );

    return data.results || [];
  } catch (error: any) {
    console.error('[OpenFinance] Erro ao buscar transações:', error.response?.data || error.message);
    return [];
  }
}

/**
 * Calcula métricas financeiras baseadas em transações
 */
export function calculateMetrics(transactions: PluggyTransaction[]): OpenFinanceMetrics {
  if (transactions.length === 0) {
    return {
      averageIncome: 0,
      averageExpense: 0,
      incomeStability: 0,
      cashFlowPositive: 0,
      cashFlowTrend: 'stable',
      totalBalance: 0,
    };
  }

  // Separar créditos (receitas) e débitos (despesas)
  const credits = transactions.filter(t => t.type === 'CREDIT' && t.amount > 0);
  const debits = transactions.filter(t => t.type === 'DEBIT' && t.amount < 0);

  // Agrupar por mês
  const monthlyData = groupTransactionsByMonth(transactions);
  const monthlyIncomes = monthlyData.map(m => m.income);
  const monthlyExpenses = monthlyData.map(m => m.expense);
  const monthlyBalances = monthlyData.map(m => m.balance);

  // Calcular médias (últimos 3 meses)
  const averageIncome = monthlyIncomes.length > 0 
    ? monthlyIncomes.reduce((sum, val) => sum + val, 0) / monthlyIncomes.length
    : 0;

  const averageExpense = monthlyExpenses.length > 0
    ? monthlyExpenses.reduce((sum, val) => sum + val, 0) / monthlyExpenses.length
    : 0;

  // Calcular estabilidade de renda (1 - coeficiente de variação)
  const incomeStability = calculateStability(monthlyIncomes);

  // % de meses com saldo positivo
  const positiveMonths = monthlyBalances.filter(b => b > 0).length;
  const cashFlowPositive = monthlyBalances.length > 0
    ? positiveMonths / monthlyBalances.length
    : 0;

  // Tendência de fluxo de caixa (regressão linear simples)
  const cashFlowTrend = detectTrend(monthlyBalances);

  // Saldo total (última transação)
  const totalBalance = monthlyBalances[monthlyBalances.length - 1] || 0;

  return {
    averageIncome,
    averageExpense,
    incomeStability,
    cashFlowPositive,
    cashFlowTrend,
    totalBalance,
  };
}

/**
 * Agrupa transações por mês
 */
function groupTransactionsByMonth(transactions: PluggyTransaction[]): Array<{
  month: string;
  income: number;
  expense: number;
  balance: number;
}> {
  const grouped: Record<string, { income: number; expense: number }> = {};

  transactions.forEach(t => {
    const month = t.date.substring(0, 7); // YYYY-MM
    if (!grouped[month]) {
      grouped[month] = { income: 0, expense: 0 };
    }

    if (t.type === 'CREDIT' && t.amount > 0) {
      grouped[month].income += t.amount;
    } else if (t.type === 'DEBIT' && t.amount < 0) {
      grouped[month].expense += Math.abs(t.amount);
    }
  });

  return Object.entries(grouped)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, data]) => ({
      month,
      income: data.income,
      expense: data.expense,
      balance: data.income - data.expense,
    }));
}

/**
 * Calcula estabilidade (1 - coeficiente de variação)
 * Retorna valor entre 0 (muito instável) e 1 (muito estável)
 */
function calculateStability(values: number[]): number {
  if (values.length < 2) return 0;

  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  if (mean === 0) return 0;

  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);
  const coefficientOfVariation = stdDev / mean;

  // Inverter e normalizar (0-1)
  return Math.max(0, Math.min(1, 1 - coefficientOfVariation));
}

/**
 * Detecta tendência usando regressão linear simples
 */
function detectTrend(values: number[]): 'increasing' | 'stable' | 'decreasing' {
  if (values.length < 2) return 'stable';

  // Calcular slope (inclinação) da regressão linear
  const n = values.length;
  const xMean = (n - 1) / 2; // Índices médios
  const yMean = values.reduce((sum, val) => sum + val, 0) / n;

  let numerator = 0;
  let denominator = 0;

  values.forEach((y, x) => {
    numerator += (x - xMean) * (y - yMean);
    denominator += Math.pow(x - xMean, 2);
  });

  const slope = denominator !== 0 ? numerator / denominator : 0;

  // Determinar tendência baseada na inclinação
  if (slope > 100) return 'increasing'; // Crescendo mais de R$ 100/mês
  if (slope < -100) return 'decreasing'; // Decrescendo mais de R$ 100/mês
  return 'stable';
}

/**
 * Retorna data de 90 dias atrás no formato YYYY-MM-DD
 */
function getDate90DaysAgo(): string {
  const date = new Date();
  date.setDate(date.getDate() - 90);
  return date.toISOString().split('T')[0];
}

/**
 * Busca dados completos de Open Finance para um usuário
 */
export async function getOpenFinanceData(itemId: string): Promise<{
  accounts: PluggyAccount[];
  transactions: PluggyTransaction[];
  metrics: OpenFinanceMetrics;
}> {
  const accounts = await getAccounts(itemId);
  const transactions = await getTransactions(itemId);
  const metrics = calculateMetrics(transactions);

  return {
    accounts,
    transactions,
    metrics,
  };
}

/**
 * Mock de dados para desenvolvimento (quando não há API key)
 */
export function getMockOpenFinanceData(): {
  accounts: PluggyAccount[];
  transactions: PluggyTransaction[];
  metrics: OpenFinanceMetrics;
} {
  const mockTransactions: PluggyTransaction[] = [
    // Mês 1 - Janeiro
    { id: '1', description: 'Salário', amount: 5000, date: '2024-01-05', category: 'Salário', type: 'CREDIT', accountId: 'acc1' },
    { id: '2', description: 'Aluguel', amount: -1500, date: '2024-01-10', category: 'Moradia', type: 'DEBIT', accountId: 'acc1' },
    { id: '3', description: 'Mercado', amount: -800, date: '2024-01-15', category: 'Alimentação', type: 'DEBIT', accountId: 'acc1' },
    
    // Mês 2 - Fevereiro
    { id: '4', description: 'Salário', amount: 5000, date: '2024-02-05', category: 'Salário', type: 'CREDIT', accountId: 'acc1' },
    { id: '5', description: 'Freelance', amount: 1200, date: '2024-02-12', category: 'Renda Extra', type: 'CREDIT', accountId: 'acc1' },
    { id: '6', description: 'Aluguel', amount: -1500, date: '2024-02-10', category: 'Moradia', type: 'DEBIT', accountId: 'acc1' },
    
    // Mês 3 - Março
    { id: '7', description: 'Salário', amount: 5200, date: '2024-03-05', category: 'Salário', type: 'CREDIT', accountId: 'acc1' },
    { id: '8', description: 'Aluguel', amount: -1500, date: '2024-03-10', category: 'Moradia', type: 'DEBIT', accountId: 'acc1' },
    { id: '9', description: 'Mercado', amount: -750, date: '2024-03-15', category: 'Alimentação', type: 'DEBIT', accountId: 'acc1' },
  ];

  return {
    accounts: [
      {
        id: 'acc1',
        type: 'BANK',
        subtype: 'CHECKING_ACCOUNT',
        number: '12345-6',
        balance: 3500,
        currencyCode: 'BRL',
        name: 'Conta Corrente',
      },
    ],
    transactions: mockTransactions,
    metrics: calculateMetrics(mockTransactions),
  };
}
