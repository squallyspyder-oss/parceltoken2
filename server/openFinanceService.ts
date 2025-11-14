/**
 * Open Finance Service
 * 
 * Mock melhorado de integração com Open Finance (Pluggy/Klavi)
 * Simula análise de crédito baseada em dados bancários
 */

export interface OpenFinanceAccount {
  id: string;
  bank: string;
  type: 'checking' | 'savings';
  balance: number;
  averageMonthlyIncome: number;
  averageMonthlyExpense: number;
}

export interface CreditAnalysis {
  score: number; // 0-1000
  recommendedLimit: number;
  riskLevel: 'low' | 'medium' | 'high';
  monthlyIncome: number;
  debtToIncomeRatio: number;
  factors: {
    positiveFactors: string[];
    negativeFactors: string[];
  };
}

/**
 * Simula análise de crédito via Open Finance
 * Em produção, integraria com Pluggy ou Klavi
 */
export async function analyzeCredit(userId: string): Promise<CreditAnalysis> {
  // Simular delay de API real
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Gerar dados mockados mas realistas
  const monthlyIncome = Math.floor(Math.random() * 8000) + 2000; // R$ 2.000 - R$ 10.000
  const monthlyExpense = monthlyIncome * (0.5 + Math.random() * 0.3); // 50-80% da renda
  const debtToIncomeRatio = monthlyExpense / monthlyIncome;

  // Calcular score baseado em fatores
  let score = 500; // Base

  // Fatores positivos
  const positiveFactors: string[] = [];
  const negativeFactors: string[] = [];

  if (monthlyIncome > 5000) {
    score += 150;
    positiveFactors.push('Renda mensal acima de R$ 5.000');
  }

  if (debtToIncomeRatio < 0.6) {
    score += 100;
    positiveFactors.push('Baixo comprometimento de renda');
  } else if (debtToIncomeRatio > 0.8) {
    score -= 100;
    negativeFactors.push('Alto comprometimento de renda');
  }

  // Simular histórico de pagamentos (sempre positivo no mock)
  score += 150;
  positiveFactors.push('Histórico de pagamentos em dia');

  // Simular tempo de relacionamento bancário
  score += 100;
  positiveFactors.push('Relacionamento bancário consolidado');

  // Limitar score entre 300 e 900
  score = Math.max(300, Math.min(900, score));

  // Calcular limite recomendado
  let recommendedLimit = 0;
  let riskLevel: 'low' | 'medium' | 'high' = 'medium';

  if (score >= 700) {
    recommendedLimit = Math.floor(monthlyIncome * 2.5); // 2.5x renda
    riskLevel = 'low';
  } else if (score >= 500) {
    recommendedLimit = Math.floor(monthlyIncome * 1.5); // 1.5x renda
    riskLevel = 'medium';
  } else {
    recommendedLimit = Math.floor(monthlyIncome * 0.8); // 0.8x renda
    riskLevel = 'high';
  }

  // Arredondar para múltiplo de 500
  recommendedLimit = Math.round(recommendedLimit / 500) * 500;

  // Limitar entre R$ 500 e R$ 20.000
  recommendedLimit = Math.max(500, Math.min(20000, recommendedLimit));

  return {
    score,
    recommendedLimit,
    riskLevel,
    monthlyIncome,
    debtToIncomeRatio: Math.round(debtToIncomeRatio * 100) / 100,
    factors: {
      positiveFactors,
      negativeFactors
    }
  };
}

/**
 * Simula conexão com banco via Open Finance
 * Em produção, usaria Pluggy Connect ou Klavi SDK
 */
export async function connectBank(userId: string, bankCode: string): Promise<OpenFinanceAccount> {
  // Simular delay de autenticação
  await new Promise(resolve => setTimeout(resolve, 2000));

  const banks = [
    'Nubank',
    'Banco do Brasil',
    'Itaú',
    'Bradesco',
    'Santander',
    'Caixa Econômica',
    'Inter',
    'C6 Bank'
  ];

  const randomBank = banks[Math.floor(Math.random() * banks.length)];
  const balance = Math.floor(Math.random() * 10000) + 500;
  const income = Math.floor(Math.random() * 8000) + 2000;
  const expense = income * (0.5 + Math.random() * 0.3);

  return {
    id: `acc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    bank: randomBank,
    type: Math.random() > 0.5 ? 'checking' : 'savings',
    balance,
    averageMonthlyIncome: income,
    averageMonthlyExpense: expense
  };
}

/**
 * Atualiza score do usuário baseado em comportamento de pagamento
 */
export function updateScoreBasedOnPaymentHistory(
  currentScore: number,
  onTimePayments: number,
  latePayments: number,
  missedPayments: number
): number {
  let newScore = currentScore;

  // Pagamentos em dia aumentam score
  newScore += onTimePayments * 5;

  // Pagamentos atrasados diminuem score
  newScore -= latePayments * 10;

  // Pagamentos não realizados diminuem muito
  newScore -= missedPayments * 30;

  // Limitar entre 300 e 1000
  return Math.max(300, Math.min(1000, newScore));
}
