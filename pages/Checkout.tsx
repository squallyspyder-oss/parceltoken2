import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { 
  ArrowLeft,
  ArrowRight,
  CheckCircle2, 
  CreditCard, 
  DollarSign,
  QrCode,
  Shield,
  Sparkles,
  TrendingDown,
  Zap
} from "lucide-react";
import { Link, useLocation, useParams } from "wouter";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export default function Checkout() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const params = useParams();
  const qrId = params.qrId ? parseInt(params.qrId) : null;
  
  // Se o qrId for NaN (por exemplo, se params.qrId for uma string não numérica), forçar para null
  const validQrId = (qrId !== null && !isNaN(qrId)) ? qrId : null;

  const [selectedInstallments, setSelectedInstallments] = useState(1);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'parceltoken' | 'pix' | 'card'>('parceltoken');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [transactionId, setTransactionId] = useState<number | null>(null);

  // Buscar QR Code real pelo ID
  const { data: qrData, isLoading: qrLoading } = trpc.merchant.getQRById.useQuery(
    { qrId: validQrId || 0 },
    { enabled: isAuthenticated && validQrId !== null }
  );

  // Fallback para demo QR
  const [demoQR] = useState({
    id: 999,
    amount: 15000,
    description: "Compra Demo - Produto Exemplo",
    maxInstallments: 4,
    merchantName: "Loja Demo"
  });

  // Usar QR real se encontrado, senão usar demo
  const currentQR = qrData || demoQR;

  const { data: activeToken } = trpc.user.getActiveToken.useQuery(undefined, {
    enabled: isAuthenticated
  });

  // **NEW** Check if user can use existing token
  const { data: smartQRCheck } = trpc.user.processSmartQR.useMutation();
  const [showTokenChoiceModal, setShowTokenChoiceModal] = useState(false);
  const [tokenChoice, setTokenChoice] = useState<'use-existing' | 'create-new' | null>(null);

  const { data: simulation } = trpc.user.simulatePayment.useQuery({
    amount: currentQR.amount,
    installments: selectedInstallments
  }, {
    enabled: true
  });

  const executePaymentMutation = trpc.payment.execute.useMutation({
    onSuccess: (data) => {
      setTransactionId(data.transactionId || null);
      setPaymentSuccess(true);
      toast.success("Pagamento realizado com sucesso!");
    },
    onError: (error) => {
      toast.error(error.message);
      setIsProcessing(false);
    }
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      window.location.href = getLoginUrl('/checkout');
    }
  }, [authLoading, isAuthenticated]);

  // **NEW** Check for active token when page loads
  useEffect(() => {
    if (isAuthenticated && activeToken) {
      const availableCredit = activeToken.creditLimit - (activeToken.usedAmount || 0);
      if (availableCredit >= currentQR.amount) {
        setShowTokenChoiceModal(true);
      }
    }
  }, [isAuthenticated, activeToken, currentQR.amount]);

  if (authLoading || qrLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const handlePayment = async () => {
    if (!activeToken && selectedPaymentMethod === 'parceltoken') {
      toast.error("Você precisa criar um ParcelToken primeiro!");
      setTimeout(() => setLocation('/dashboard'), 2000);
      return;
    }

    setIsProcessing(true);

    await new Promise(resolve => setTimeout(resolve, 2000));

    try {
      await executePaymentMutation.mutateAsync({
        qrId: qrId || currentQR.id,
        installments: selectedInstallments,
        paymentMethod: selectedPaymentMethod
      });
    } catch (error) {
      // Error handled in onError
    }
  };

  const installmentAmount = simulation?.installmentAmount || Math.ceil(currentQR.amount / selectedInstallments);
  const savings = simulation?.savings || 0;
  const savingsPercentage = simulation?.savingsPercentage || 0;

  if (paymentSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
              <CheckCircle2 className="w-12 h-12 text-green-600" />
            </div>
            
            <h1 className="text-3xl font-bold mb-2">Pagamento Aprovado!</h1>
            <p className="text-gray-600 mb-8">
              Sua transação foi processada com sucesso
            </p>

            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-6 mb-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Valor Total</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {formatCurrency(currentQR.amount)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Parcelamento</div>
                  <div className="text-2xl font-bold text-blue-600">
                    {selectedInstallments}x de {formatCurrency(installmentAmount)}
                  </div>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="flex items-center justify-between">
                <span className="text-gray-700">Você economizou</span>
                <span className="text-2xl font-bold text-green-600">
                  {formatCurrency(savings)}
                </span>
              </div>
            </div>

            <div className="space-y-3 mb-8">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">ID da Transação</span>
                <span className="font-mono text-sm font-semibold">#{transactionId || '999999'}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Método de Pagamento</span>
                <Badge className="bg-green-100 text-green-700">
                  {selectedPaymentMethod === 'parceltoken' ? 'ParcelToken' : selectedPaymentMethod.toUpperCase()}
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Merchant</span>
                <span className="text-sm font-semibold">{demoQR.merchantName}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <Link href="/dashboard" className="flex-1">
                <Button variant="outline" className="w-full">
                  Ver Minhas Transações
                </Button>
              </Link>
              <Link href="/" className="flex-1">
                <Button className="w-full bg-gradient-to-r from-green-600 to-blue-600">
                  Voltar ao Início
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
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
            
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg">
              <div className="w-8 h-8 bg-gradient-to-r from-green-600 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                {user?.name?.[0] || 'U'}
              </div>
              <span className="text-sm font-medium hidden sm:inline">{user?.name}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Link href="/dashboard">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </Link>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <QrCode className="w-6 h-6 text-blue-600" />
                  SmartQR - Detalhes da Compra
                </CardTitle>
                <CardDescription>Informações do pagamento</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl p-6 text-white">
                  <div className="bg-white rounded-xl p-6 mb-4">
                    <div className="aspect-square bg-gray-900 rounded-lg flex items-center justify-center">
                      <QrCode className="w-32 h-32 text-white" />
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm opacity-90 mb-1">Merchant</div>
                    <div className="text-xl font-bold">{demoQR.merchantName}</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Descrição</span>
                    <span className="font-semibold text-right">{demoQR.description}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Valor Total</span>
                    <span className="text-2xl font-bold text-gray-900">{formatCurrency(demoQR.amount)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-200">
                    <span className="text-green-700">Parcelas Disponíveis</span>
                    <span className="font-semibold text-green-700">até {demoQR.maxInstallments}x sem juros</span>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    Vantagens desta Compra
                  </h4>
                  <ul className="space-y-2 text-sm text-blue-700">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                      <span>Parcelamento sem juros</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                      <span>Aprovação instantânea</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                      <span>Economia de até 85% vs cartão</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                      <span>Transação 100% segura</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-6 h-6 text-green-600" />
                  Método de Pagamento
                </CardTitle>
                <CardDescription>Escolha como deseja pagar</CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup value={selectedPaymentMethod} onValueChange={(value: any) => setSelectedPaymentMethod(value)}>
                  <div className="space-y-3">
                    <div className={`relative flex items-start space-x-3 p-4 rounded-lg border-2 transition-all cursor-pointer ${
                      selectedPaymentMethod === 'parceltoken' 
                        ? 'border-green-500 bg-green-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}>
                      <RadioGroupItem value="parceltoken" id="parceltoken" className="mt-1" />
                      <Label htmlFor="parceltoken" className="flex-1 cursor-pointer">
                        <div className="flex items-center gap-2 mb-1">
                          <Zap className="w-5 h-5 text-green-600" />
                          <span className="font-semibold">ParcelToken</span>
                          <Badge className="bg-green-100 text-green-700 text-xs">Recomendado</Badge>
                        </div>
                        <p className="text-sm text-gray-600">
                          {activeToken 
                            ? `Disponível: ${formatCurrency(activeToken.creditLimit - (activeToken.usedAmount || 0))}`
                            : 'Crie seu token para usar esta opção'
                          }
                        </p>
                      </Label>
                    </div>

                    <div className={`relative flex items-start space-x-3 p-4 rounded-lg border-2 transition-all cursor-pointer ${
                      selectedPaymentMethod === 'pix' 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}>
                      <RadioGroupItem value="pix" id="pix" className="mt-1" />
                      <Label htmlFor="pix" className="flex-1 cursor-pointer">
                        <div className="flex items-center gap-2 mb-1">
                          <QrCode className="w-5 h-5 text-blue-600" />
                          <span className="font-semibold">PIX</span>
                        </div>
                        <p className="text-sm text-gray-600">Pagamento instantâneo</p>
                      </Label>
                    </div>

                    <div className={`relative flex items-start space-x-3 p-4 rounded-lg border-2 transition-all cursor-pointer ${
                      selectedPaymentMethod === 'card' 
                        ? 'border-purple-500 bg-purple-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}>
                      <RadioGroupItem value="card" id="card" className="mt-1" />
                      <Label htmlFor="card" className="flex-1 cursor-pointer">
                        <div className="flex items-center gap-2 mb-1">
                          <CreditCard className="w-5 h-5 text-purple-600" />
                          <span className="font-semibold">Cartão de Crédito</span>
                        </div>
                        <p className="text-sm text-gray-600">Crédito ou débito</p>
                      </Label>
                    </div>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-6 h-6 text-blue-600" />
                  Escolha o Parcelamento
                </CardTitle>
                <CardDescription>Selecione o número de parcelas</CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup value={selectedInstallments.toString()} onValueChange={(value) => setSelectedInstallments(parseInt(value))}>
                  <div className="space-y-2">
                    {[1, 2, 3, 4].map((installments) => {
                      const amount = Math.ceil(demoQR.amount / installments);
                      const isSelected = selectedInstallments === installments;
                      
                      return (
                        <div 
                          key={installments}
                          className={`relative flex items-center justify-between p-4 rounded-lg border-2 transition-all cursor-pointer ${
                            isSelected 
                              ? 'border-blue-500 bg-blue-50' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <RadioGroupItem value={installments.toString()} id={`installment-${installments}`} />
                            <Label htmlFor={`installment-${installments}`} className="cursor-pointer">
                              <div className="font-semibold">
                                {installments}x de {formatCurrency(amount)}
                              </div>
                              <div className="text-sm text-gray-600">
                                {installments === 1 ? 'À vista' : 'Sem juros'}
                              </div>
                            </Label>
                          </div>
                          {installments === 1 && (
                            <Badge className="bg-green-100 text-green-700">
                              Melhor economia
                            </Badge>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-blue-50">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingDown className="w-6 h-6 text-green-600" />
                  <h3 className="text-lg font-bold">Sua Economia</h3>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Valor da compra</span>
                    <span className="font-semibold">{formatCurrency(demoQR.amount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Parcelamento</span>
                    <span className="font-semibold">{selectedInstallments}x de {formatCurrency(installmentAmount)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Você economiza</span>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">{formatCurrency(savings)}</div>
                      <div className="text-sm text-green-600">{savingsPercentage.toFixed(1)}% de economia</div>
                    </div>
                  </div>
                </div>

                <Button 
                  className="w-full text-lg h-14 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                  onClick={handlePayment}
                  disabled={isProcessing || (!activeToken && selectedPaymentMethod === 'parceltoken')}
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                      Processando Pagamento...
                    </>
                  ) : (
                    <>
                      Confirmar Pagamento
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </>
                  )}
                </Button>

                {!activeToken && selectedPaymentMethod === 'parceltoken' && (
                  <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800 text-center">
                      Você precisa criar um ParcelToken primeiro.{' '}
                      <Link href="/dashboard" className="font-semibold underline">
                        Criar agora
                      </Link>
                    </p>
                  </div>
                )}

                <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-600">
                  <Shield className="w-4 h-4" />
                  <span>Pagamento 100% seguro e criptografado</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Modal de Escolha de Token */}
      {showTokenChoiceModal && activeToken && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-lg w-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-purple-600" />
                Token Ativo Detectado!
              </CardTitle>
              <CardDescription>
                Você possui saldo disponível. Escolha como deseja pagar:
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 border-2 border-purple-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Saldo Disponível</span>
                  <span className="text-2xl font-bold text-green-600">
                    {formatCurrency(activeToken.creditLimit - (activeToken.usedAmount || 0))}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Valor da Compra</span>
                  <span className="text-lg font-semibold">
                    {formatCurrency(demoQR.amount)}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  className="w-full h-14 text-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  onClick={() => {
                    setTokenChoice('use-existing');
                    setShowTokenChoiceModal(false);
                    toast.success("✅ Usando saldo do ParcelToken existente!");
                  }}
                >
                  <Zap className="w-5 h-5 mr-2" />
                  Usar Saldo Disponível
                </Button>

                <Button
                  variant="outline"
                  className="w-full h-14 text-lg"
                  onClick={() => {
                    setTokenChoice('create-new');
                    setShowTokenChoiceModal(false);
                    toast.info("🆕 Gerando novo parcelamento...");
                  }}
                >
                  <CreditCard className="w-5 h-5 mr-2" />
                  Gerar Novo Parcelamento
                </Button>
              </div>

              <Button
                variant="ghost"
                className="w-full"
                onClick={() => setShowTokenChoiceModal(false)}
              >
                Fechar
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
