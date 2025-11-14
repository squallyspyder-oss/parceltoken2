import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";
import { 
  Activity, 
  ArrowDown, 
  ArrowUp, 
  Brain, 
  CreditCard, 
  LineChart, 
  Sparkles, 
  TrendingUp,
  Wallet
} from "lucide-react";
import { Link } from "wouter";

export default function CreditScore() {
  const { user, loading: authLoading } = useAuth();
  
  // Buscar score de crédito
  const { data: scoreData, isLoading: scoreLoading, refetch } = trpc.smartCredit.calculateScore.useQuery(
    undefined,
    { enabled: !!user, refetchInterval: 30000 } // Atualiza a cada 30s
  );
  
  // Mutation para atualizar limite automaticamente
  const updateLimitMutation = trpc.smartCredit.updateLimitAutomatically.useMutation({
    onSuccess: () => {
      refetch();
    }
  });

  if (authLoading || scoreLoading) {
    return (
      <div className="container mx-auto py-8 space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto py-16 text-center">
        <Brain className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">Acesso Restrito</h2>
        <p className="text-muted-foreground mb-6">
          Faça login para visualizar seu score de crédito inteligente
        </p>
        <Button asChild>
          <Link href="/">Voltar para Home</Link>
        </Button>
      </div>
    );
  }

  if (!scoreData) {
    return (
      <div className="container mx-auto py-16 text-center">
        <Activity className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">Calculando Score</h2>
        <p className="text-muted-foreground">
          Aguarde enquanto analisamos seu perfil...
        </p>
      </div>
    );
  }

  const { score, recommendedLimit, breakdown } = scoreData;
  
  // Gerar insights baseados no score
  const insights: string[] = [];
  if (score < 700) {
    insights.push("Conecte sua conta bancária via Open Finance para aumentar seu score em até 40%");
  }
  if (breakdown.historyScore < 200) {
    insights.push("Pague suas parcelas em dia para melhorar seu histórico e aumentar seu limite");
  }
  if (breakdown.behaviorScore < 100) {
    insights.push("Use o ParcelToken com mais frequência para aumentar seu score de comportamento");
  }
  if (score >= 700) {
    insights.push("🎉 Parabéns! Seu score é excelente. Continue assim para manter seu limite alto.");
  }
  
  // Calcular porcentagem do score (0-1000 → 0-100%)
  const scorePercentage = (score / 1000) * 100;
  
  // Determinar cor do score
  const getScoreColor = (s: number) => {
    if (s >= 700) return "text-green-600";
    if (s >= 400) return "text-yellow-600";
    return "text-red-600";
  };
  
  const getScoreLabel = (s: number) => {
    if (s >= 700) return "Excelente";
    if (s >= 400) return "Bom";
    return "Regular";
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Brain className="h-8 w-8 text-primary" />
            Score de Crédito Inteligente
          </h1>
          <p className="text-muted-foreground mt-1">
            Análise baseada em IA, Open Finance e comportamento
          </p>
        </div>
        <Button
          onClick={() => updateLimitMutation.mutate()}
          disabled={updateLimitMutation.isPending}
          variant="outline"
        >
          <Sparkles className="mr-2 h-4 w-4" />
          {updateLimitMutation.isPending ? "Atualizando..." : "Atualizar Limite"}
        </Button>
      </div>

      {/* Score Principal */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Seu Score Atual
          </CardTitle>
          <CardDescription>
            Calculado em tempo real com base em múltiplos fatores
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-baseline gap-2">
                <span className={`text-6xl font-bold ${getScoreColor(score)}`}>
                  {score}
                </span>
                <span className="text-2xl text-muted-foreground">/1000</span>
              </div>
              <p className={`text-lg font-semibold mt-1 ${getScoreColor(score)}`}>
                {getScoreLabel(score)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Limite Recomendado</p>
              <p className="text-3xl font-bold text-primary">
                R$ {recommendedLimit.toLocaleString('pt-BR')}
              </p>
              {user.creditLimit && recommendedLimit > user.creditLimit && (
                <p className="text-sm text-green-600 flex items-center gap-1 mt-1">
                  <ArrowUp className="h-4 w-4" />
                  +R$ {(recommendedLimit - user.creditLimit).toLocaleString('pt-BR')}
                </p>
              )}
              {user.creditLimit && recommendedLimit < user.creditLimit && (
                <p className="text-sm text-red-600 flex items-center gap-1 mt-1">
                  <ArrowDown className="h-4 w-4" />
                  -R$ {(user.creditLimit - recommendedLimit).toLocaleString('pt-BR')}
                </p>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progresso</span>
              <span className="font-medium">{scorePercentage.toFixed(1)}%</span>
            </div>
            <Progress value={scorePercentage} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Breakdown por Categoria */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Wallet className="h-5 w-5 text-blue-600" />
              Open Finance
            </CardTitle>
            <CardDescription>Análise de fluxo de caixa</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Contribuição</span>
                  <span className="text-sm font-medium">{breakdown.openFinanceScore.toFixed(0)} pts</span>
                </div>
                <Progress value={(breakdown.openFinanceScore / score) * 100} className="h-2" />
              </div>
              <div className="text-sm space-y-1">
                <p className="flex justify-between">
                  <span className="text-muted-foreground">Peso:</span>
                  <span className="font-medium">40%</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <span className="font-medium text-green-600">Conectado</span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-purple-600" />
              Histórico ParcelToken
            </CardTitle>
            <CardDescription>Pagamentos e uso</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Contribuição</span>
                  <span className="text-sm font-medium">{breakdown.historyScore.toFixed(0)} pts</span>
                </div>
                <Progress value={(breakdown.historyScore / score) * 100} className="h-2" />
              </div>
              <div className="text-sm space-y-1">
                <p className="flex justify-between">
                  <span className="text-muted-foreground">Peso:</span>
                  <span className="font-medium">35%</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-muted-foreground">Pontualidade:</span>
                  <span className="font-medium text-green-600">95%</span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <LineChart className="h-5 w-5 text-orange-600" />
              Gamificação
            </CardTitle>
            <CardDescription>Nível e conquistas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Contribuição</span>
                  <span className="text-sm font-medium">{breakdown.behaviorScore.toFixed(0)} pts</span>
                </div>
                <Progress value={(breakdown.behaviorScore / score) * 100} className="h-2" />
              </div>
              <div className="text-sm space-y-1">
                <p className="flex justify-between">
                  <span className="text-muted-foreground">Peso:</span>
                  <span className="font-medium">25%</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-muted-foreground">Nível:</span>
                  <span className="font-medium text-purple-600">{user.level || 1}</span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Insights e Recomendações */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-yellow-600" />
            Recomendações Personalizadas
          </CardTitle>
          <CardDescription>
            Dicas da IA para aumentar seu score e limite de crédito
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {insights.map((insight, index) => (
              <div key={index} className="flex gap-3 p-4 bg-muted/50 rounded-lg">
                <div className="flex-shrink-0 mt-1">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm">{insight}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Como Funciona */}
      <Card>
        <CardHeader>
          <CardTitle>Como Calculamos Seu Score</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-semibold mb-2">Modelo de IA (TensorFlow.js)</h4>
              <p className="text-sm text-muted-foreground">
                Rede neural com 7 features analisa seu perfil em tempo real, considerando:
              </p>
              <ul className="text-sm text-muted-foreground mt-2 space-y-1 ml-4">
                <li>• Fluxo de caixa médio (Open Finance)</li>
                <li>• Estabilidade de receitas</li>
                <li>• Histórico de pagamentos</li>
                <li>• Frequência de uso</li>
                <li>• Nível e pontos de gamificação</li>
                <li>• Tempo como cliente</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Atualização Automática</h4>
              <p className="text-sm text-muted-foreground">
                Seu limite evolui automaticamente baseado em 3 regras:
              </p>
              <ul className="text-sm text-muted-foreground mt-2 space-y-1 ml-4">
                <li>• <span className="text-green-600 font-medium">Score &gt; 700:</span> Aumento de 20%</li>
                <li>• <span className="text-yellow-600 font-medium">Score &lt; 400:</span> Redução de 15%</li>
                <li>• <span className="text-red-600 font-medium">3+ atrasos:</span> Congelamento</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
