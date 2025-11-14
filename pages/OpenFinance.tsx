import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Building2, TrendingUp, TrendingDown, Minus, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";
import { useState } from "react";

export default function OpenFinance() {
  const { user, isAuthenticated, loading } = useAuth();
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const { data: connection, refetch: refetchConnection } = trpc.openFinance.getConnection.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const { data: metrics, refetch: refetchMetrics } = trpc.openFinance.getMetrics.useQuery(undefined, {
    enabled: isAuthenticated && !!connection,
  });

  const { data: mockData } = trpc.openFinance.getMockData.useQuery(undefined, {
    enabled: isAuthenticated && !connection,
  });

  const createConnectTokenMutation = trpc.openFinance.createConnectToken.useMutation();
  const syncDataMutation = trpc.openFinance.syncData.useMutation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    window.location.href = getLoginUrl('/open-finance');
    return null;
  }

  const handleConnectBank = async () => {
    setIsConnecting(true);
    try {
      const { connectUrl } = await createConnectTokenMutation.mutateAsync();
      
      // Abrir Pluggy Connect em nova janela
      const width = 600;
      const height = 800;
      const left = (window.screen.width - width) / 2;
      const top = (window.screen.height - height) / 2;
      
      const popup = window.open(
        connectUrl,
        'PluggyConnect',
        `width=${width},height=${height},left=${left},top=${top}`
      );

      // Listener para quando usuário completar conexão
      window.addEventListener('message', async (event) => {
        if (event.data.type === 'PLUGGY_CONNECT_SUCCESS') {
          popup?.close();
          toast.success('Conta bancária conectada com sucesso!');
          await refetchConnection();
          await handleSyncData();
        }
      });

    } catch (error: any) {
      toast.error(error.message || 'Erro ao conectar conta bancária');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleSyncData = async () => {
    setIsSyncing(true);
    try {
      await syncDataMutation.mutateAsync();
      await refetchMetrics();
      toast.success('Dados sincronizados com sucesso!');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao sincronizar dados');
    } finally {
      setIsSyncing(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${(value * 100).toFixed(0)}%`;
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return <TrendingUp className="w-5 h-5 text-green-600" />;
      case 'decreasing':
        return <TrendingDown className="w-5 h-5 text-red-600" />;
      default:
        return <Minus className="w-5 h-5 text-gray-600" />;
    }
  };

  const getTrendLabel = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return 'Crescendo';
      case 'decreasing':
        return 'Decrescendo';
      default:
        return 'Estável';
    }
  };

  // Usar métricas reais ou mock
  const displayMetrics = metrics || (mockData ? {
    averageIncome: mockData.metrics.averageIncome,
    averageExpense: mockData.metrics.averageExpense,
    totalBalance: mockData.metrics.totalBalance,
    incomeStability: mockData.metrics.incomeStability,
    cashFlowPositive: mockData.metrics.cashFlowPositive,
    cashFlowTrend: mockData.metrics.cashFlowTrend,
  } : null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Open Finance
                </h1>
                <p className="text-sm text-slate-600">
                  Conecte sua conta bancária para análise de crédito inteligente
                </p>
              </div>
            </div>
            {connection && (
              <Button 
                onClick={handleSyncData} 
                disabled={isSyncing}
                variant="outline"
                size="sm"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
                Sincronizar
              </Button>
            )}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {!connection ? (
          // Estado: Sem conexão
          <div className="max-w-2xl mx-auto space-y-6">
            <Card className="border-2 border-dashed">
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <Building2 className="w-8 h-8 text-blue-600" />
                </div>
                <CardTitle>Conecte sua Conta Bancária</CardTitle>
                <CardDescription>
                  Conecte sua conta para receber análise de crédito inteligente e limites personalizados
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-2">🔒 Segurança Garantida</h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Conexão criptografada via Open Finance Brasil</li>
                    <li>• Não armazenamos suas credenciais bancárias</li>
                    <li>• Você pode revogar o acesso a qualquer momento</li>
                    <li>• Regulamentado pelo Banco Central</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold text-slate-900">Benefícios:</h3>
                  <div className="grid gap-3">
                    <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                      <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                      <div>
                        <div className="font-medium text-green-900">Limite Dinâmico</div>
                        <div className="text-sm text-green-700">Seu limite aumenta automaticamente baseado no seu fluxo de caixa</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                      <CheckCircle2 className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <div className="font-medium text-blue-900">Análise Inteligente</div>
                        <div className="text-sm text-blue-700">IA analisa seu comportamento financeiro em tempo real</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                      <CheckCircle2 className="w-5 h-5 text-purple-600 mt-0.5" />
                      <div>
                        <div className="font-medium text-purple-900">Aprovação Instantânea</div>
                        <div className="text-sm text-purple-700">Sem burocracia, sem espera</div>
                      </div>
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={handleConnectBank}
                  disabled={isConnecting}
                  className="w-full"
                  size="lg"
                >
                  {isConnecting ? (
                    <>
                      <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                      Conectando...
                    </>
                  ) : (
                    <>
                      <Building2 className="w-5 h-5 mr-2" />
                      Conectar Conta Bancária
                    </>
                  )}
                </Button>

                <p className="text-xs text-center text-slate-500">
                  Ao conectar, você concorda com o compartilhamento de dados financeiros conforme a{' '}
                  <Link href="/privacy-policy" className="text-blue-600 hover:underline">
                    Política de Privacidade
                  </Link>
                </p>
              </CardContent>
            </Card>

            {/* Preview com dados mock */}
            {displayMetrics && (
              <Card className="border-yellow-200 bg-yellow-50">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-yellow-600" />
                    <CardTitle className="text-yellow-900">Preview (Dados de Exemplo)</CardTitle>
                  </div>
                  <CardDescription className="text-yellow-700">
                    Veja como suas métricas aparecerão após conectar sua conta
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <MetricsDisplay metrics={displayMetrics} isPreview />
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          // Estado: Conectado
          <div className="space-y-6">
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-green-900">
                        {connection.connectorName || 'Banco Conectado'}
                      </div>
                      <div className="text-sm text-green-700">
                        Última sincronização: {connection.lastSyncAt ? new Date(connection.lastSyncAt).toLocaleString('pt-BR') : 'Nunca'}
                      </div>
                    </div>
                  </div>
                  <Badge className="bg-green-600 text-white">
                    <CheckCircle2 className="w-4 h-4 mr-1" />
                    Conectado
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {displayMetrics && <MetricsDisplay metrics={displayMetrics} />}
          </div>
        )}
      </div>
    </div>
  );
}

function MetricsDisplay({ metrics, isPreview = false }: { 
  metrics: any; 
  isPreview?: boolean;
}) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${(value * 100).toFixed(0)}%`;
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return <TrendingUp className="w-5 h-5 text-green-600" />;
      case 'decreasing':
        return <TrendingDown className="w-5 h-5 text-red-600" />;
      default:
        return <Minus className="w-5 h-5 text-gray-600" />;
    }
  };

  const getTrendLabel = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return 'Crescendo';
      case 'decreasing':
        return 'Decrescendo';
      default:
        return 'Estável';
    }
  };

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card className={isPreview ? 'opacity-75' : ''}>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-slate-600">Receita Média Mensal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-green-600">
            {formatCurrency(metrics.averageIncome)}
          </div>
          <p className="text-xs text-slate-500 mt-1">Últimos 3 meses</p>
        </CardContent>
      </Card>

      <Card className={isPreview ? 'opacity-75' : ''}>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-slate-600">Despesa Média Mensal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-red-600">
            {formatCurrency(metrics.averageExpense)}
          </div>
          <p className="text-xs text-slate-500 mt-1">Últimos 3 meses</p>
        </CardContent>
      </Card>

      <Card className={isPreview ? 'opacity-75' : ''}>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-slate-600">Saldo Total</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-blue-600">
            {formatCurrency(metrics.totalBalance)}
          </div>
          <p className="text-xs text-slate-500 mt-1">Todas as contas</p>
        </CardContent>
      </Card>

      <Card className={isPreview ? 'opacity-75' : ''}>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-slate-600">Estabilidade de Renda</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-purple-600">
            {formatPercent(metrics.incomeStability)}
          </div>
          <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-purple-600 transition-all duration-500"
              style={{ width: formatPercent(metrics.incomeStability) }}
            />
          </div>
          <p className="text-xs text-slate-500 mt-1">Regularidade de receitas</p>
        </CardContent>
      </Card>

      <Card className={isPreview ? 'opacity-75' : ''}>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-slate-600">Meses Positivos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-indigo-600">
            {formatPercent(metrics.cashFlowPositive)}
          </div>
          <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-indigo-600 transition-all duration-500"
              style={{ width: formatPercent(metrics.cashFlowPositive) }}
            />
          </div>
          <p className="text-xs text-slate-500 mt-1">Com saldo positivo</p>
        </CardContent>
      </Card>

      <Card className={isPreview ? 'opacity-75' : ''}>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-slate-600">Tendência</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            {getTrendIcon(metrics.cashFlowTrend)}
            <div className="text-2xl font-bold text-slate-900">
              {getTrendLabel(metrics.cashFlowTrend)}
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-1">Fluxo de caixa</p>
        </CardContent>
      </Card>
    </div>
  );
}
