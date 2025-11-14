import { useAuth } from "@/_core/hooks/useAuth";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatDate, getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { 
  ArrowRight, 
  Award,
  Bell,
  CreditCard, 
  DollarSign, 
  Download,
  LineChart, 
  QrCode,
  TrendingUp,
  Wallet,
  Zap,
  Shield,
  CheckCircle2,
  Clock,
  Sparkles
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { QRCodeDisplay } from "@/components/QRCodeDisplay";
import { EnvironmentBadge } from "@/components/EnvironmentBadge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function ConsumerDashboard() {
  const { user, isAuthenticated, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [isRequesting, setIsRequesting] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showReuseModal, setShowReuseModal] = useState(false);
  const [reuseAmount, setReuseAmount] = useState('');
  const [reuseInstallments, setReuseInstallments] = useState(1);
  const [reuseMerchantId, setReuseMerchantId] = useState(1);
  const [showPixModal, setShowPixModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [pollingActive, setPollingActive] = useState(false);

  const { data: profile, refetch: refetchProfile } = trpc.user.profile.useQuery(undefined, {
    enabled: isAuthenticated
  });
  
  const { data: activeToken, refetch: refetchToken } = trpc.user.getActiveToken.useQuery(undefined, {
    enabled: isAuthenticated
  });

  const { data: transactions } = trpc.user.transactions.useQuery({ limit: 10 }, {
    enabled: isAuthenticated
  });

  const { data: badges } = trpc.user.badges.useQuery(undefined, {
    enabled: isAuthenticated
  });

  const { data: installmentPlans } = trpc.user.activeInstallmentPlans.useQuery(undefined, {
    enabled: isAuthenticated
  });

  const { data: tokenHistory } = trpc.user.tokenHistory.useQuery(
    { tokenId: activeToken?.id },
    { enabled: isAuthenticated && !!activeToken }
  );

  const { data: upcomingInstallments } = trpc.user.upcomingInstallments.useQuery(undefined, {
    enabled: isAuthenticated
  });

  const requestTokenMutation = trpc.user.requestToken.useMutation({
    onSuccess: () => {
      toast.success("ParcelToken criado com sucesso!");
      refetchToken();
      refetchProfile();
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  const generatePixMutation = trpc.pix.generateCharge.useMutation({
    onSuccess: (data) => {
      setSelectedPayment({ ...selectedPayment, pixData: data });
      toast.success('PIX gerado com sucesso!');
      // Iniciar polling de status
      startPixPolling(data.chargeId);
    },
    onError: (error) => {
      toast.error(`Erro ao gerar PIX: ${error.message}`);
    }
  });

  const [pollingChargeId, setPollingChargeId] = useState<string | null>(null);

  const { data: pixStatus } = trpc.pix.checkStatus.useQuery(
    { chargeId: pollingChargeId! },
    { 
      enabled: !!pollingChargeId,
      refetchInterval: 5000, // Poll a cada 5 segundos
    }
  );

  // Detectar pagamento confirmado
  useEffect(() => {
    if (pixStatus?.status === 'paid') {
      toast.success('✅ Pagamento confirmado!');
      setShowPixModal(false);
      setPollingChargeId(null);
      refetchToken();
    }
  }, [pixStatus]);

  const startPixPolling = (chargeId: string) => {
    setPollingChargeId(chargeId);
  };

  // Limpar polling ao fechar modal
  useEffect(() => {
    if (!showPixModal) {
      setPollingChargeId(null);
    }
  }, [showPixModal]);

  const reuseTokenMutation = trpc.user.reuseToken.useMutation({
    onSuccess: () => {
      toast.success("Token reutilizado com sucesso!");
      setShowReuseModal(false);
      setReuseAmount('');
      setReuseInstallments(1);
      refetchToken();
      refetchProfile();
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  // Show notification toast for upcoming installments
  useEffect(() => {
    if (upcomingInstallments && upcomingInstallments.length > 0) {
      const count = upcomingInstallments.length;
      toast.warning(`Você tem ${count} parcela${count > 1 ? 's' : ''} vencendo nos próximos 3 dias!`, {
        duration: 5000,
      });
    }
  }, [upcomingInstallments]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    window.location.href = getLoginUrl('/dashboard');
    return null;
  }

  const handleReuseToken = async () => {
    if (!activeToken) return;
    
    const amount = parseFloat(reuseAmount) * 100; // Convert to cents
    if (isNaN(amount) || amount <= 0) {
      toast.error('Digite um valor válido');
      return;
    }
    
    const available = activeToken.creditLimit - (activeToken.usedAmount || 0);
    if (amount > available) {
      toast.error('Valor maior que o saldo disponível');
      return;
    }
    
    await reuseTokenMutation.mutateAsync({
      tokenId: activeToken.id,
      merchantId: reuseMerchantId,
      amount,
      installments: reuseInstallments
    });
  };

  const handleRequestToken = async () => {
    setIsRequesting(true);
    try {
      await requestTokenMutation.mutateAsync({
        requestedLimit: 200000
      });
    } finally {
      setIsRequesting(false);
    }
  };

  const stats = profile?.stats;
  const totalSavings = stats?.totalSavings || 0;
  const totalTransactions = stats?.totalTransactions || 0;
  const level = stats?.level || 1;
  const points = stats?.points || 0;
  const nextLevelPoints = level * 1000;
  const progressToNextLevel = (points / nextLevelPoints) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <div className="flex items-center gap-3 cursor-pointer">
                  <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-xl">PT</span>
                  </div>
                  <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                    ParcelToken
                  </span>
                </div>
              </Link>
              <EnvironmentBadge />
              {upcomingInstallments && upcomingInstallments.length > 0 && (
                <div className="relative">
                  <Bell className="w-5 h-5 text-orange-500 animate-pulse" />
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    {upcomingInstallments.length}
                  </span>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-3">
              <Link href="/checkout">
                <Button className="bg-gradient-to-r from-green-600 to-blue-600">
                  <QrCode className="w-4 h-4 mr-2" />
                  Testar Checkout
                </Button>
              </Link>
              <Link href="/merchant">
                <Button variant="outline">Área Merchant</Button>
              </Link>
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg">
                <div className="w-8 h-8 bg-gradient-to-r from-green-600 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {user?.name?.[0] || 'U'}
                </div>
                <span className="text-sm font-medium">{user?.name}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Olá, {user?.name?.split(' ')[0] || 'Usuário'}! 👋
          </h1>
          <p className="text-gray-600 text-lg">
            Acompanhe sua economia e gerencie seus pagamentos
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <DollarSign className="w-10 h-10 opacity-80" />
                <TrendingUp className="w-6 h-6" />
              </div>
              <div className="text-4xl font-bold mb-1">
                {formatCurrency(totalSavings)}
              </div>
              <div className="text-green-100 text-sm">
                Economia Total Acumulada
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Zap className="w-10 h-10 opacity-80" />
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="text-4xl font-bold mb-1">
                {totalTransactions}
              </div>
              <div className="text-blue-100 text-sm">
                Transações Realizadas
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Award className="w-10 h-10 opacity-80" />
                <Sparkles className="w-6 h-6" />
              </div>
              <div className="text-4xl font-bold mb-1">
                Nível {level}
              </div>
              <div className="text-purple-100 text-sm">
                {points} pontos acumulados
              </div>
              <Progress value={progressToNextLevel} className="mt-2 h-2 bg-purple-400" />
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {activeToken ? (
              <Card className="border-2 border-green-200 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <CreditCard className="w-6 h-6 text-green-600" />
                        Seu ParcelToken
                      </CardTitle>
                      <CardDescription>Token ativo e pronto para uso</CardDescription>
                    </div>
                    <Badge className="bg-green-100 text-green-700 border-green-300">
                      <CheckCircle2 className="w-4 h-4 mr-1" />
                      Ativo
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Limite Total</div>
                      <div className="text-3xl font-bold text-gray-900">
                        {formatCurrency(activeToken.creditLimit)}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Disponível</div>
                      <div className="text-3xl font-bold text-green-600">
                        {formatCurrency(activeToken.creditLimit - (activeToken.usedAmount || 0))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border-2 border-purple-200">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Sparkles className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-purple-900 mb-1">Token Reutilizável</h4>
                        <p className="text-sm text-purple-700">
                          Use este ParcelToken em <strong>qualquer merchant parceiro</strong>. 
                          Sem precisar criar um novo token a cada compra!
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Parcelas disponíveis</span>
                      <span className="font-semibold">até {activeToken.maxInstallments}x sem juros</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Taxa de juros</span>
                      <span className="font-semibold text-green-600">
                        {(activeToken.interestRate || 0) === 0 ? '0% (sem juros)' : `${(activeToken.interestRate || 0) / 100}%`}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Validade</span>
                      <span className="font-semibold">{formatDate(activeToken.expiresAt)}</span>
                    </div>
                  </div>

                  <div className="mt-6 flex gap-3">
                    <Button 
                      className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600"
                      onClick={() => setShowReuseModal(true)}
                    >
                      <Zap className="w-4 h-4 mr-2" />
                      Reutilizar Token
                    </Button>
                    <Button 
                      variant="outline"
                      className="flex-1"
                      onClick={() => setShowQRModal(!showQRModal)}
                    >
                      <QrCode className="w-4 h-4 mr-2" />
                      Ver QR Code
                    </Button>
                  </div>
                  <div className="mt-3">
                    <Button variant="outline" className="w-full" onClick={() => setShowDetailsModal(true)}>
                      Ver Detalhes
                    </Button>
                  </div>

                  {showQRModal && (
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-semibold text-blue-900">Seu QR Code</h4>
                        <button 
                          onClick={() => setShowQRModal(false)}
                          className="text-gray-500 hover:text-gray-700 text-xl"
                        >
                          ×
                        </button>
                      </div>
                      <div className="bg-white p-4 rounded border border-blue-300 flex justify-center mb-3">
                        <QRCodeDisplay 
                          value={`PT-TOKEN-${activeToken.id}`}
                          size={192}
                          showActions={false}
                        />
                      </div>
                      <div className="text-sm text-blue-700 space-y-1 mb-3">
                        <p><strong>ID do Token:</strong> {activeToken.id}</p>
                        <p><strong>Limite:</strong> {formatCurrency(activeToken.creditLimit)}</p>
                        <p><strong>Disponível:</strong> {formatCurrency(activeToken.creditLimit - (activeToken.usedAmount || 0))}</p>
                      </div>
                      <p className="text-xs text-blue-600 text-center mb-3">
                        Escaneie este QR code em qualquer loja parceira para usar seu ParcelToken
                      </p>
                      <QRCodeDisplay 
                        value={`PT-TOKEN-${activeToken.id}`}
                        size={0}
                        showActions={true}
                        label={`ParcelToken-${activeToken.id}`}
                      />
                    </div>
                  )}

                  {showDetailsModal && (
                    <div className="mt-6 p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border-2 border-blue-200">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="font-bold text-lg text-blue-900">Detalhes Completos do ParcelToken</h4>
                        <button 
                          onClick={() => setShowDetailsModal(false)}
                          className="text-gray-500 hover:text-gray-700 text-xl font-bold"
                        >
                          ×
                        </button>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div className="bg-white p-4 rounded-lg shadow-sm">
                          <div className="text-sm text-gray-500 mb-1">ID do Token</div>
                          <div className="font-semibold text-gray-900">{activeToken.id}</div>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow-sm">
                          <div className="text-sm text-gray-500 mb-1">Status</div>
                          <div className="font-semibold text-green-600">✓ Ativo</div>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow-sm">
                          <div className="text-sm text-gray-500 mb-1">Limite Total</div>
                          <div className="font-semibold text-gray-900">{formatCurrency(activeToken.creditLimit)}</div>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow-sm">
                          <div className="text-sm text-gray-500 mb-1">Limite Disponível</div>
                          <div className="font-semibold text-green-600">{formatCurrency(activeToken.creditLimit - (activeToken.usedAmount || 0))}</div>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow-sm">
                          <div className="text-sm text-gray-500 mb-1">Valor Utilizado</div>
                          <div className="font-semibold text-blue-600">{formatCurrency(activeToken.usedAmount || 0)}</div>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow-sm">
                          <div className="text-sm text-gray-500 mb-1">Parcelas Máximas</div>
                          <div className="font-semibold text-gray-900">{activeToken.maxInstallments}x sem juros</div>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow-sm">
                          <div className="text-sm text-gray-500 mb-1">Taxa de Juros</div>
                          <div className="font-semibold text-green-600">{(activeToken.interestRate || 0) === 0 ? '0% (sem juros)' : `${(activeToken.interestRate || 0) / 100}%`}</div>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow-sm">
                          <div className="text-sm text-gray-500 mb-1">Validade</div>
                          <div className="font-semibold text-gray-900">{formatDate(activeToken.expiresAt)}</div>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow-sm">
                          <div className="text-sm text-gray-500 mb-1">Data de Criação</div>
                          <div className="font-semibold text-gray-900">{formatDate(activeToken.createdAt)}</div>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow-sm">
                          <div className="text-sm text-gray-500 mb-1">Última Atualização</div>
                          <div className="font-semibold text-gray-900">{formatDate(activeToken.updatedAt)}</div>
                        </div>
                      </div>

                      {/* Histórico de Uso do Token */}
                      {tokenHistory && tokenHistory.length > 0 && (
                        <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
                          <h5 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <Clock className="w-5 h-5 text-blue-600" />
                            Histórico de Uso
                          </h5>
                          <div className="space-y-2">
                            {tokenHistory.map((usage: any, index: number) => (
                              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                    <DollarSign className="w-5 h-5 text-blue-600" />
                                  </div>
                                  <div>
                                    <div className="font-medium text-gray-900">
                                      Merchant #{usage.merchantId}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      {formatDate(usage.createdAt)}
                                    </div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="font-semibold text-gray-900">
                                    {formatCurrency(usage.amount)}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {usage.installments}x parcelas
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="bg-white p-4 rounded-lg shadow-sm">
                        <h5 className="font-semibold text-gray-900 mb-3">Benefícios do seu ParcelToken</h5>
                        <ul className="space-y-2 text-sm text-gray-700">
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <span>Parcele suas compras em até {activeToken.maxInstallments}x sem juros</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <span>Aprovação instantânea em menos de 2 segundos</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <span>Economia de até 85% vs cartão de crédito tradicional</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <span>Aceito em milhares de lojas parceiras</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <span>Segurança PCI-DSS e compliance LGPD</span>
                          </li>
                        </ul>
                      </div>

                      <div className="mt-4 flex gap-3">
                        <Button 
                          className="flex-1 bg-gradient-to-r from-green-600 to-blue-600"
                          onClick={() => {
                            setShowDetailsModal(false);
                            setShowQRModal(true);
                          }}
                        >
                          <QrCode className="w-4 h-4 mr-2" />
                          Ver QR Code
                        </Button>
                        <Button 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => setShowDetailsModal(false)}
                        >
                          Fechar
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card className="border-2 border-dashed border-gray-300">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CreditCard className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Crie seu ParcelToken</h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    Gere seu token de parcelamento em menos de 2 segundos e comece a economizar agora mesmo!
                  </p>
                  <Button 
                    size="lg" 
                    onClick={handleRequestToken}
                    disabled={isRequesting}
                    className="bg-gradient-to-r from-green-600 to-blue-600"
                  >
                    {isRequesting ? (
                      <>
                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                        Gerando Token...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 mr-2" />
                        Gerar Meu ParcelToken
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="w-5 h-5" />
                      Transações Recentes
                    </CardTitle>
                    <CardDescription>Histórico das suas últimas compras</CardDescription>
                  </div>
                  {transactions && transactions.length > 0 && (
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          const { exportTransactionsToPDF } = require('@/lib/pdfExport');
                          exportTransactionsToPDF(transactions, `minhas-transacoes-${new Date().toISOString().split('T')[0]}.pdf`);
                        }}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        PDF
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          const { exportTransactionsToCSV } = require('@/lib/csvExport');
                          exportTransactionsToCSV(transactions, `minhas-transacoes-${new Date().toISOString().split('T')[0]}.csv`);
                        }}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        CSV
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {transactions && transactions.length > 0 ? (
                  <div className="space-y-4">
                    {transactions.map((tx) => (
                      <div key={tx.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            tx.status === 'completed' ? 'bg-green-100' : 'bg-gray-200'
                          }`}>
                            {tx.status === 'completed' ? (
                              <CheckCircle2 className="w-5 h-5 text-green-600" />
                            ) : (
                              <Clock className="w-5 h-5 text-gray-600" />
                            )}
                          </div>
                          <div>
                            <div className="font-semibold">{tx.description || 'Compra'}</div>
                            <div className="text-sm text-gray-500">
                              {formatDate(tx.createdAt)} • {tx.installments}x de {formatCurrency(tx.installmentAmount)}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">{formatCurrency(tx.amount)}</div>
                          {(tx.savingsAmount || 0) > 0 && (
                            <div className="text-sm text-green-600">
                              Economizou {formatCurrency(tx.savingsAmount || 0)}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Wallet className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Nenhuma transação ainda</p>
                    <p className="text-sm">Suas compras aparecerão aqui</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {/* Gráfico de Evolução de Crédito */}
            {activeToken && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Evolução do Crédito
                  </CardTitle>
                  <CardDescription>Acompanhe seu limite disponível ao longo do tempo</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Barras de progresso */}
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-600">Limite Total</span>
                          <span className="font-semibold">{formatCurrency(activeToken.creditLimit)}</span>
                        </div>
                        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-blue-500 to-blue-600"
                            style={{ width: '100%' }}
                          />
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-600">Utilizado</span>
                          <span className="font-semibold text-orange-600">{formatCurrency(activeToken.usedAmount || 0)}</span>
                        </div>
                        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-orange-500 to-red-500"
                            style={{ width: `${((activeToken.usedAmount || 0) / activeToken.creditLimit) * 100}%` }}
                          />
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-600">Disponível</span>
                          <span className="font-semibold text-green-600">
                            {formatCurrency(activeToken.creditLimit - (activeToken.usedAmount || 0))}
                          </span>
                        </div>
                        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                            style={{ width: `${((activeToken.creditLimit - (activeToken.usedAmount || 0)) / activeToken.creditLimit) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* Projeção */}
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-start gap-3">
                        <LineChart className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>
                          <h4 className="font-semibold text-blue-900 mb-1">Projeção de Liberação</h4>
                          <p className="text-sm text-blue-700">
                            Conforme você quita suas parcelas, seu limite disponível aumenta automaticamente.
                            {installmentPlans && installmentPlans.length > 0 && (
                              <span className="block mt-1">
                                <strong>Próxima liberação:</strong> Após pagamento da próxima parcela
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Timeline de Parcelas */}
            {installmentPlans && installmentPlans.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Minhas Parcelas
                  </CardTitle>
                  <CardDescription>Acompanhe o pagamento das suas parcelas</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {installmentPlans.map((plan) => (
                      <div key={plan.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <div className="font-semibold">
                              {formatCurrency(plan.totalAmount)} em {plan.installments}x
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {plan.paidInstallments || 0} de {plan.installments} parcelas pagas
                            </div>
                          </div>
                          <Badge variant={plan.status === 'active' ? 'default' : 'secondary'}>
                            {plan.status === 'active' ? 'Ativo' : plan.status === 'completed' ? 'Concluído' : 'Inadimplente'}
                          </Badge>
                        </div>
                        
                        <Progress value={((plan.paidInstallments || 0) / plan.installments) * 100} className="mb-4" />
                        
                        <div className="space-y-2">
                          {plan.payments && plan.payments.map((payment: any) => (
                            <div 
                              key={payment.id} 
                              className={`flex items-center justify-between p-3 rounded-lg border ${
                                payment.status === 'paid' ? 'bg-green-50 border-green-200' :
                                payment.status === 'overdue' ? 'bg-red-50 border-red-200' :
                                'bg-gray-50 border-gray-200'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                {payment.status === 'paid' ? (
                                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                                ) : (
                                  <Clock className="w-5 h-5 text-gray-400" />
                                )}
                                <div>
                                  <div className="font-medium">
                                    Parcela {payment.installmentNumber}/{plan.installments}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    Vencimento: {formatDate(payment.dueDate)}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="text-right">
                                  <div className="font-semibold">
                                    {formatCurrency(payment.amount)}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    {payment.status === 'paid' ? 'Pago' : 
                                     payment.status === 'overdue' ? 'Atrasado' : 'Pendente'}
                                  </div>
                                </div>
                                {payment.status === 'overdue' && (
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => {
                                      toast.info('Renegociação em desenvolvimento. Entre em contato com o suporte.');
                                    }}
                                  >
                                    Renegociar
                                  </Button>
                                )}
                                {payment.status === 'pending' && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      setSelectedPayment(payment);
                                      setShowPixModal(true);
                                      generatePixMutation.mutate({
                                        installmentId: payment.id,
                                        amount: payment.amount,
                                        description: `Parcela ${payment.installmentNumber}`,
                                        payerName: user?.name || undefined,
                                      });
                                    }}
                                    className="bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700"
                                  >
                                    <QrCode className="w-4 h-4 mr-1" />
                                    Gerar PIX
                                  </Button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="w-5 h-5" />
                  Sua Economia
                </CardTitle>
                <CardDescription>Comparado com cartão tradicional</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="text-sm text-green-700 mb-1">Você pagaria com cartão</div>
                    <div className="text-2xl font-bold text-gray-400 line-through">
                      {formatCurrency(totalSavings + (stats?.totalSpent || 0))}
                    </div>
                  </div>
                  
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="text-sm text-blue-700 mb-1">Você pagou com ParcelToken</div>
                    <div className="text-2xl font-bold text-blue-600">
                      {formatCurrency(stats?.totalSpent || 0)}
                    </div>
                  </div>

                  <div className="p-4 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg text-white">
                    <div className="text-sm opacity-90 mb-1">Economia Total</div>
                    <div className="text-3xl font-bold">
                      {formatCurrency(totalSavings)}
                    </div>
                    <div className="text-sm opacity-90 mt-2">
                      Isso é {((totalSavings / (stats?.totalSpent || 1)) * 100).toFixed(1)}% de economia!
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Conquistas
                </CardTitle>
                <CardDescription>Suas badges desbloqueadas</CardDescription>
              </CardHeader>
              <CardContent>
                {badges && badges.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3">
                    {badges.map((badge) => (
                      <div 
                        key={badge.id} 
                        className="p-3 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg border border-yellow-200 text-center"
                      >
                        <div className="text-3xl mb-1">{badge.iconUrl}</div>
                        <div className="text-sm font-semibold">{badge.title}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    <Award className="w-10 h-10 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Realize transações para desbloquear badges!</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <Shield className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold mb-1">Seus dados estão seguros</h4>
                    <p className="text-sm text-gray-600">
                      Criptografia de ponta a ponta, compliance com LGPD e certificação PCI-DSS.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Modal de Reutilização de Token */}
      <Dialog open={showReuseModal} onOpenChange={setShowReuseModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-purple-600" />
              Reutilizar ParcelToken
            </DialogTitle>
            <DialogDescription>
              Use seu saldo disponível para uma nova compra
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="text-sm text-purple-700 mb-1">Saldo Disponível</div>
              <div className="text-2xl font-bold text-purple-900">
                {activeToken && formatCurrency(activeToken.creditLimit - (activeToken.usedAmount || 0))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Valor da Compra (R$)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0,00"
                value={reuseAmount}
                onChange={(e) => setReuseAmount(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="installments">Número de Parcelas</Label>
              <Select 
                value={reuseInstallments.toString()} 
                onValueChange={(v) => setReuseInstallments(parseInt(v))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {activeToken && Array.from({ length: activeToken.maxInstallments || 4 }, (_, i) => i + 1).map((n) => (
                    <SelectItem key={n} value={n.toString()}>
                      {n}x de {formatCurrency((parseFloat(reuseAmount || '0') * 100) / n)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="merchant">Merchant (Demo)</Label>
              <Select 
                value={reuseMerchantId.toString()} 
                onValueChange={(v) => setReuseMerchantId(parseInt(v))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Loja Demo 1</SelectItem>
                  <SelectItem value="2">Loja Demo 2</SelectItem>
                  <SelectItem value="3">Loja Demo 3</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-3 pt-4">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => setShowReuseModal(false)}
              >
                Cancelar
              </Button>
              <Button 
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600"
                onClick={handleReuseToken}
                disabled={reuseTokenMutation.isPending}
              >
                {reuseTokenMutation.isPending ? 'Processando...' : 'Confirmar Compra'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de PIX */}
      <Dialog open={showPixModal} onOpenChange={setShowPixModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <QrCode className="w-5 h-5 text-green-600" />
              Pagar com PIX
            </DialogTitle>
            <DialogDescription>
              Escaneie o QR Code ou copie o código PIX para pagar
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {generatePixMutation.isPending ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
              </div>
            ) : selectedPayment?.pixData ? (
              <>
                {/* QR Code */}
                <div className="flex justify-center">
                  <img 
                    src={selectedPayment.pixData.qrCodeImage} 
                    alt="QR Code PIX" 
                    className="w-64 h-64 border-2 border-gray-200 rounded-lg"
                  />
                </div>

                {/* Informações */}
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Valor:</span>
                    <span className="font-semibold">{formatCurrency(selectedPayment.pixData.amount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Parcela:</span>
                    <span className="font-semibold">#{selectedPayment.installmentNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Expira em:</span>
                    <span className="font-semibold">{formatDate(selectedPayment.pixData.expiresAt)}</span>
                  </div>
                </div>

                {/* Código PIX Copia e Cola */}
                <div>
                  <Label>Código PIX (Copia e Cola)</Label>
                  <div className="flex gap-2 mt-1">
                    <Input 
                      value={selectedPayment.pixData.qrCode} 
                      readOnly 
                      className="font-mono text-xs"
                    />
                    <Button
                      onClick={() => {
                        navigator.clipboard.writeText(selectedPayment.pixData.qrCode);
                        toast.success('Código PIX copiado!');
                      }}
                      variant="outline"
                    >
                      Copiar
                    </Button>
                  </div>
                </div>

                {/* Botão Simular Pagamento (para demo) */}
                <Button
                  className="w-full bg-gradient-to-r from-green-600 to-blue-600"
                  onClick={() => {
                    toast.success('Pagamento simulado com sucesso! Em produção, aguardaríamos confirmação do PIX.');
                    setShowPixModal(false);
                    setSelectedPayment(null);
                    setTimeout(() => {
                      refetchProfile();
                    }, 1000);
                  }}
                >
                  🎭 Simular Pagamento PIX (Demo)
                </Button>

                {/* Instruções */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-900">
                    <strong>Como pagar:</strong>
                  </p>
                  <ol className="text-sm text-blue-800 mt-2 space-y-1 list-decimal list-inside">
                    <li>Abra o app do seu banco</li>
                    <li>Escolha pagar com PIX</li>
                    <li>Escaneie o QR Code ou cole o código</li>
                    <li>Confirme o pagamento</li>
                    <li>Aguarde a confirmação automática (ou use botão demo acima)</li>
                  </ol>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Gerando QR Code PIX...
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
