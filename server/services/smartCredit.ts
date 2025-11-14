import * as tf from '@tensorflow/tfjs-node';
import * as db from '../db';

/**
 * Smart Credit Score - Modelo de IA para limite dinâmico evolutivo
 * 
 * Features (7 variáveis):
 * 1. avg_income: Receita média mensal (Open Finance)
 * 2. income_stability: Estabilidade de renda 0-1 (Open Finance)
 * 3. cash_flow_positive: % meses positivos 0-1 (Open Finance)
 * 4. parceltoken_history: Taxa de pagamentos em dia 0-1 (Interno)
 * 5. usage_frequency: Compras/mês 0-10+ (Interno)
 * 6. gamification_score: Pontos + badges + nível 0-1 (Interno)
 * 7. time_as_customer: Meses desde primeiro token 0-24+ (Interno)
 * 
 * Output:
 * - score: 0-1000 (score de crédito)
 * - recommendedLimit: 0-5000000 centavos (R$ 0-50k)
 * - confidence: 0-1 (confiança da predição)
 */

interface CreditFeatures {
  avgIncome: number; // R$ (será normalizado)
  incomeStability: number; // 0-1
  cashFlowPositive: number; // 0-1
  parcelTokenHistory: number; // 0-1
  usageFrequency: number; // compras/mês
  gamificationScore: number; // 0-1000 (será normalizado)
  timeAsCustomer: number; // meses
}

interface CreditScore {
  score: number; // 0-1000
  recommendedLimit: number; // centavos
  confidence: number; // 0-1
  breakdown: {
    openFinanceScore: number;
    behaviorScore: number;
    historyScore: number;
  };
}

let model: tf.LayersModel | null = null;

/**
 * Carrega modelo pré-treinado (ou cria modelo inicial)
 */
export async function loadModel(): Promise<void> {
  try {
    // Tentar carregar modelo salvo
    model = await tf.loadLayersModel('file://./models/credit_score_model/model.json');
    console.log('[SmartCredit] Modelo carregado com sucesso');
  } catch (error) {
    // Se não existir, criar modelo inicial
    console.log('[SmartCredit] Criando novo modelo...');
    model = createModel();
    console.log('[SmartCredit] Modelo criado com sucesso');
  }
}

/**
 * Cria modelo de rede neural
 */
function createModel(): tf.LayersModel {
  const model = tf.sequential({
    layers: [
      // Camada de entrada: 7 features
      tf.layers.dense({
        inputShape: [7],
        units: 64,
        activation: 'relu',
        kernelInitializer: 'heNormal',
      }),
      tf.layers.dropout({ rate: 0.2 }),
      
      // Camada oculta 1
      tf.layers.dense({
        units: 32,
        activation: 'relu',
        kernelInitializer: 'heNormal',
      }),
      tf.layers.dropout({ rate: 0.2 }),
      
      // Camada oculta 2
      tf.layers.dense({
        units: 16,
        activation: 'relu',
        kernelInitializer: 'heNormal',
      }),
      
      // Camada de saída: 1 valor (limite normalizado 0-1)
      tf.layers.dense({
        units: 1,
        activation: 'sigmoid',
      }),
    ],
  });

  model.compile({
    optimizer: tf.train.adam(0.001),
    loss: 'meanSquaredError',
    metrics: ['mae'],
  });

  return model;
}

/**
 * Normaliza features para range 0-1
 */
function normalizeFeatures(features: CreditFeatures): number[] {
  return [
    Math.min(features.avgIncome / 10000, 1), // Normalizar receita (max R$ 10k)
    features.incomeStability, // Já está 0-1
    features.cashFlowPositive, // Já está 0-1
    features.parcelTokenHistory, // Já está 0-1
    Math.min(features.usageFrequency / 10, 1), // Normalizar frequência (max 10 compras/mês)
    Math.min(features.gamificationScore / 1000, 1), // Normalizar pontos (max 1000)
    Math.min(features.timeAsCustomer / 24, 1), // Normalizar tempo (max 24 meses)
  ];
}

/**
 * Coleta features de Open Finance
 */
async function getOpenFinanceFeatures(userId: number): Promise<{
  avgIncome: number;
  incomeStability: number;
  cashFlowPositive: number;
}> {
  const metrics = await db.getOpenFinanceMetrics(userId);
  
  if (!metrics) {
    // Valores padrão se não houver Open Finance conectado
    return {
      avgIncome: 0,
      incomeStability: 0,
      cashFlowPositive: 0,
    };
  }

  return {
    avgIncome: metrics.averageIncome,
    incomeStability: metrics.incomeStability,
    cashFlowPositive: metrics.cashFlowPositive,
  };
}

/**
 * Coleta features internas do ParcelToken
 */
async function getInternalFeatures(userId: number): Promise<{
  parcelTokenHistory: number;
  usageFrequency: number;
  gamificationScore: number;
  timeAsCustomer: number;
}> {
  // Buscar histórico de parcelas pagas
  const installments = await db.getInstallmentPlansByUser(userId);
  const paidOnTime = installments.filter((i: any) => i.status === 'paid' && !i.isOverdue).length;
  const total = installments.length;
  const parcelTokenHistory = total > 0 ? paidOnTime / total : 0;

  // Buscar transações para calcular frequência
  const transactions = await db.getTransactionsByUser(userId);
  const firstTransaction = transactions[transactions.length - 1];
  const monthsSinceFirst = firstTransaction 
    ? Math.max(1, Math.floor((Date.now() - new Date(firstTransaction.createdAt).getTime()) / (30 * 24 * 60 * 60 * 1000)))
    : 1;
  const usageFrequency = transactions.length / monthsSinceFirst;

  // Buscar dados de gamificação
  const profile = await db.getUserById(userId);
  const points = profile?.points || 0;
  const level = profile?.level || 1;
  const gamificationScore = points + (level * 100); // Combinar pontos e nível

  // Tempo como cliente
  const timeAsCustomer = profile 
    ? Math.floor((Date.now() - new Date(profile.createdAt).getTime()) / (30 * 24 * 60 * 60 * 1000))
    : 0;

  return {
    parcelTokenHistory,
    usageFrequency,
    gamificationScore,
    timeAsCustomer,
  };
}

/**
 * Calcula score de crédito usando IA
 */
export async function calculateSmartScore(userId: number): Promise<CreditScore> {
  if (!model) {
    await loadModel();
  }

  // Coletar features
  const openFinanceFeatures = await getOpenFinanceFeatures(userId);
  const internalFeatures = await getInternalFeatures(userId);

  const features: CreditFeatures = {
    ...openFinanceFeatures,
    ...internalFeatures,
  };

  // Normalizar features
  const normalizedFeatures = normalizeFeatures(features);

  // Criar tensor de entrada
  const inputTensor = tf.tensor2d([normalizedFeatures]);

  // Fazer predição
  const prediction = model!.predict(inputTensor) as tf.Tensor;
  const limitNormalized = (await prediction.data())[0];

  // Limpar tensors
  inputTensor.dispose();
  prediction.dispose();

  // Converter para valores reais
  const MAX_LIMIT = 5000000; // R$ 50.000 em centavos
  const recommendedLimit = Math.round(limitNormalized * MAX_LIMIT);
  const score = Math.round(limitNormalized * 1000); // Score 0-1000

  // Calcular breakdown (contribuição de cada categoria)
  const openFinanceScore = Math.round(
    (openFinanceFeatures.avgIncome / 10000 * 0.25 +
     openFinanceFeatures.incomeStability * 0.20 +
     openFinanceFeatures.cashFlowPositive * 0.15) * 1000
  );

  const behaviorScore = Math.round(
    (internalFeatures.usageFrequency / 10 * 0.10 +
     internalFeatures.gamificationScore / 1000 * 0.05) * 1000
  );

  const historyScore = Math.round(
    (internalFeatures.parcelTokenHistory * 0.20 +
     internalFeatures.timeAsCustomer / 24 * 0.05) * 1000
  );

  // Confiança baseada em quantidade de dados
  const hasOpenFinance = openFinanceFeatures.avgIncome > 0;
  const hasHistory = internalFeatures.parcelTokenHistory > 0;
  const hasUsage = internalFeatures.usageFrequency > 0;
  
  let confidence = 0.5; // Base
  if (hasOpenFinance) confidence += 0.3;
  if (hasHistory) confidence += 0.15;
  if (hasUsage) confidence += 0.05;

  return {
    score,
    recommendedLimit,
    confidence: Math.min(confidence, 1),
    breakdown: {
      openFinanceScore,
      behaviorScore,
      historyScore,
    },
  };
}

/**
 * Atualiza limite de crédito automaticamente baseado no score
 */
export async function updateCreditLimitAutomatically(userId: number): Promise<{
  updated: boolean;
  oldLimit: number;
  newLimit: number;
  reason: string;
}> {
  const currentUser = await db.getUserProfile(userId);
  const currentLimit = currentUser?.creditLimit || 0;

  const { score, recommendedLimit } = await calculateSmartScore(userId);

  // Regra 1: Aumentar limite para bons pagadores (score > 700)
  if (score > 700 && recommendedLimit > currentLimit * 1.2) {
    const newLimit = Math.min(recommendedLimit, currentLimit * 1.5); // Max 50% aumento
    await db.updateUserCreditLimit(userId, newLimit);
    
    return {
      updated: true,
      oldLimit: currentLimit,
      newLimit,
      reason: 'Parabéns! Seu histórico de pagamentos desbloqueou mais crédito.',
    };
  }

  // Regra 2: Reduzir limite para risco alto (score < 400)
  if (score < 400 && currentLimit > 0) {
    const newLimit = Math.max(recommendedLimit, currentLimit * 0.7); // Max 30% redução
    await db.updateUserCreditLimit(userId, newLimit);
    
    return {
      updated: true,
      oldLimit: currentLimit,
      newLimit,
      reason: 'Detectamos mudanças no seu perfil de crédito. Seu limite foi ajustado.',
    };
  }

  // Regra 3: Congelar limite para inadimplência
  const installments = await db.getInstallmentPlansByUser(userId);
  const overdueCount = installments.filter((i: any) => i.isOverdue).length;
  
  if (overdueCount >= 3) {
    await db.updateUserCreditLimit(userId, 0);
    
    return {
      updated: true,
      oldLimit: currentLimit,
      newLimit: 0,
      reason: 'Limite congelado devido a parcelas em atraso. Regularize seus pagamentos.',
    };
  }

  return {
    updated: false,
    oldLimit: currentLimit,
    newLimit: currentLimit,
    reason: 'Limite mantido.',
  };
}

/**
 * Treina modelo com dados históricos (para uso futuro)
 */
export async function trainModel(trainingData: Array<{
  features: CreditFeatures;
  actualLimit: number; // Limite real que funcionou bem
}>): Promise<void> {
  if (!model) {
    await loadModel();
  }

  // Preparar dados de treino
  const xs = trainingData.map(d => normalizeFeatures(d.features));
  const ys = trainingData.map(d => d.actualLimit / 5000000); // Normalizar limite

  const xsTensor = tf.tensor2d(xs);
  const ysTensor = tf.tensor2d(ys, [ys.length, 1]);

  // Treinar modelo
  await model!.fit(xsTensor, ysTensor, {
    epochs: 100,
    batchSize: 32,
    validationSplit: 0.2,
    callbacks: {
      onEpochEnd: (epoch, logs) => {
        console.log(`[SmartCredit] Epoch ${epoch}: loss = ${logs?.loss.toFixed(4)}`);
      },
    },
  });

  // Salvar modelo treinado
  await model!.save('file://./models/credit_score_model');

  // Limpar tensors
  xsTensor.dispose();
  ysTensor.dispose();

  console.log('[SmartCredit] Modelo treinado e salvo com sucesso');
}

// Inicializar modelo ao carregar módulo
loadModel().catch(console.error);
