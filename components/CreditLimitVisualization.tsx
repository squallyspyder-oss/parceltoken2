import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Award, Zap } from "lucide-react";
import { useEffect, useState } from "react";

interface CreditLimitVisualizationProps {
  creditLimit: number; // em centavos
  availableCredit: number; // em centavos
  level: number;
  points: number;
  totalSavings: number; // em centavos
}

const LEVELS = [
  { name: "Bronze", min: 0, max: 1000, color: "from-amber-700 to-amber-500", icon: "🥉" },
  { name: "Prata", min: 1000, max: 5000, color: "from-gray-400 to-gray-200", icon: "🥈" },
  { name: "Ouro", min: 5000, max: 20000, color: "from-yellow-500 to-yellow-300", icon: "🥇" },
  { name: "Platina", min: 20000, max: Infinity, color: "from-cyan-500 to-blue-400", icon: "💎" },
];

export default function CreditLimitVisualization({
  creditLimit,
  availableCredit,
  level,
  points,
  totalSavings
}: CreditLimitVisualizationProps) {
  const [animatedAvailable, setAnimatedAvailable] = useState(0);
  const [animatedUsed, setAnimatedUsed] = useState(0);

  const usedCredit = creditLimit - availableCredit;
  const usagePercentage = creditLimit > 0 ? (usedCredit / creditLimit) * 100 : 0;
  const availablePercentage = 100 - usagePercentage;

  // Determinar nível baseado em crédito total (em reais)
  const creditInReais = creditLimit / 100;
  const currentLevel = LEVELS.find(l => creditInReais >= l.min && creditInReais < l.max) || LEVELS[0];
  const nextLevel = LEVELS[LEVELS.findIndex(l => l.name === currentLevel.name) + 1];

  // Progresso para próximo nível
  const progressToNextLevel = nextLevel 
    ? ((creditInReais - currentLevel.min) / (nextLevel.min - currentLevel.min)) * 100
    : 100;

  // Animação de entrada
  useEffect(() => {
    const timer1 = setTimeout(() => {
      setAnimatedAvailable(availableCredit);
      setAnimatedUsed(usedCredit);
    }, 100);

    return () => clearTimeout(timer1);
  }, [availableCredit, usedCredit]);

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(cents / 100);
  };

  return (
    <div className="space-y-6">
      {/* Card Principal - Limite Disponível */}
      <Card className={`relative overflow-hidden bg-gradient-to-br ${currentLevel.color} p-6 text-white`}>
        <div className="absolute top-0 right-0 text-9xl opacity-10">
          {currentLevel.icon}
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5" />
              <span className="text-sm font-medium opacity-90">Nível {currentLevel.name}</span>
            </div>
            <div className="flex items-center gap-1 text-sm">
              <Zap className="w-4 h-4" />
              <span>{points} pontos</span>
            </div>
          </div>

          <div className="mb-2">
            <div className="text-sm opacity-90 mb-1">Crédito Disponível</div>
            <div className="text-4xl font-bold">
              {formatCurrency(animatedAvailable)}
            </div>
          </div>

          <div className="text-sm opacity-90">
            de {formatCurrency(creditLimit)} total
          </div>

          {/* Barra de Progresso */}
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-xs opacity-90">
              <span>Usado: {formatCurrency(animatedUsed)}</span>
              <span>{usagePercentage.toFixed(0)}%</span>
            </div>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white transition-all duration-1000 ease-out"
                style={{ width: `${usagePercentage}%` }}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Progresso para Próximo Nível */}
      {nextLevel && (
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{currentLevel.icon}</span>
              <div>
                <div className="text-sm font-semibold text-slate-900 dark:text-white">
                  {currentLevel.name}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Nível atual
                </div>
              </div>
            </div>

            <div className="text-center px-4">
              <TrendingUp className="w-5 h-5 mx-auto mb-1 text-green-600" />
              <div className="text-xs text-slate-500 dark:text-slate-400">
                {progressToNextLevel.toFixed(0)}%
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="text-right">
                <div className="text-sm font-semibold text-slate-900 dark:text-white">
                  {nextLevel.name}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Próximo nível
                </div>
              </div>
              <span className="text-2xl opacity-50">{nextLevel.icon}</span>
            </div>
          </div>

          <Progress value={progressToNextLevel} className="h-2" />

          <div className="mt-2 text-xs text-center text-slate-600 dark:text-slate-400">
            Faltam {formatCurrency((nextLevel.min * 100) - creditLimit)} para desbloquear {nextLevel.name}
          </div>
        </Card>
      )}

      {/* Estatísticas */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4 text-center">
          <div className="text-2xl mb-1">💰</div>
          <div className="text-lg font-bold text-green-600">
            {formatCurrency(totalSavings)}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Economia Total
          </div>
        </Card>

        <Card className="p-4 text-center">
          <div className="text-2xl mb-1">⚡</div>
          <div className="text-lg font-bold text-blue-600">
            {points}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Pontos
          </div>
        </Card>

        <Card className="p-4 text-center">
          <div className="text-2xl mb-1">{currentLevel.icon}</div>
          <div className="text-lg font-bold text-purple-600">
            {currentLevel.name}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Nível Atual
          </div>
        </Card>
      </div>
    </div>
  );
}
