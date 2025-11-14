import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency, formatDate, getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { 
  ArrowRight, 
  BarChart3,
  CheckCircle2, 
  Clock, 
  DollarSign, 
  QrCode,
  Shield,
  Store,
  TrendingUp,
  Users,
  Zap,
  Download,
  Printer
} from "lucide-react";
import { Link } from "wouter";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { toast } from "sonner";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { QRCodeDisplay } from "@/components/QRCodeDisplay";

export default function MerchantDashboard() {
  const { user, isAuthenticated, loading } = useAuth();
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [qrAmount, setQrAmount] = useState("");
  const [qrDescription, setQrDescription] = useState("");
  const [qrInstallments, setQrInstallments] = useState("4");
  const [selectedQR, setSelectedQR] = useState<any>(null);

  const { data: merchant, refetch: refetchMerchant } = trpc.merchant.profile.useQuery(undefined, {
    enabled: isAuthenticated,
    retry: false
  });

  const { data: transactions } = trpc.merchant.transactions.useQuery({ limit: 10 }, {
    enabled: isAuthenticated && !!merchant
  });

  const { data: qrCodes } = trpc.merchant.qrCodes.useQuery({ limit: 5 }, {
    enabled: isAuthenticated && !!merchant
  });

  const registerMutation = trpc.merchant.register.useMutation({
    onSuccess: () => {
      toast.success("Conta merchant criada com sucesso!");
      refetchMerchant();
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  const generateQRMutation = trpc.merchant.generateQR.useMutation({
    onSuccess: (data) => {
      toast.success("SmartQR gerado com sucesso!");
      setQrDialogOpen(false);
      setQrAmount("");
      setQrDescription("");
      setSelectedQR(data);
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    window.location.href = getLoginUrl('/merchant');
    return null;
  }

  const handleRegister = async () => {
    await registerMutation.mutateAsync({
      businessName: user?.name || "Meu Negócio",
      tradeName: user?.name || "Meu Negócio"
    });
  };

  const handleGenerateQR = async () => {
    const amount = parseFloat(qrAmount) * 100;
    if (isNaN(amount) || amount < 100) {
      toast.error("Valor mínimo: R$ 1,00");
      return;
    }

    try {
      const result = await generateQRMutation.mutateAsync({
        amount: Math.floor(amount),
        description: qrDescription || "Compra",
        maxInstallments: parseInt(qrInstallments) || 4,
        cashbackPercentage: 0,
        discountPercentage: 0
      });
      if (result) {
        setSelectedQR(result);
      }
    } catch (error) {
      console.error("Erro ao gerar QR:", error);
    }
  };

  const generateQRImage = (qrId: string) => {
    return `data:image/svg+xml;base64,${btoa(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="150" height="150"><rect fill="white" width="200" height="200"/><g fill="black"><rect x="10" y="10" width="50" height="50"/><rect x="20" y="20" width="30" height="30" fill="white"/><rect x="140" y="10" width="50" height="50"/><rect x="150" y="20" width="30" height="30" fill="white"/><rect x="10" y="140" width="50" height="50"/><rect x="20" y="150" width="30" height="30" fill="white"/></g><text x="100" y="100" text-anchor="middle" font-size="12" fill="black">${qrId.substring(0, 8)}</text></svg>`)}`;
  };

  const stats = merchant?.stats;

  const SalesBreakdownChart = ({ stats }: { stats: any }) => {
    if (!stats || (!stats.salesBreakdown.liquidated && !stats.salesBreakdown.installment)) {
      return (
        <div className="flex items-center justify-center h-full text-gray-500">
          Sem dados de vendas para exibir.
        </div>
      );
    }

    const data = [
      { name: 'Liquidadas (1x)', value: stats.salesBreakdown.liquidated, color: '#10b981' }, // green-500
      { name: 'Parceladas (>1x)', value: stats.salesBreakdown.installment, color: '#3b82f6' }, // blue-500
    ];

    return (
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={80}
            fill="#8884d8"
            labelLine={false}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip formatter={(value: number) => formatCurrency(value)} />
          <Legend layout="horizontal" verticalAlign="bottom" align="center" />
        </PieChart>
      </ResponsiveContainer>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
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
            
            <div className="flex items-center gap-3">
              <Link href="/analytics">
                <Button variant="outline" className="gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Analytics
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="outline">Dashboard Consumidor</Button>
              </Link>
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg">
                <Store className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium">{user?.name}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {!merchant ? (
          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Store className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Crie sua Conta Merchant</h2>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Comece a aceitar pagamentos com ParcelToken e aumente suas vendas com taxas até 70% menores.
              </p>
              <Button 
                size="lg" 
                onClick={handleRegister}
                disabled={registerMutation.isPending}
                className="bg-gradient-to-r from-blue-600 to-purple-600"
              >
                {registerMutation.isPending ? "Criando..." : "Criar Conta Merchant"}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="mb-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold mb-2">
                    {merchant.businessName}
                  </h1>
                  <p className="text-gray-600 text-lg">
                    Gerencie suas vendas e acompanhe seu crescimento
                  </p>
                </div>
                <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="lg" className="bg-green-600 hover:bg-green-700 gap-2">
                      <QrCode className="w-5 h-5" />
                      Gerar SmartQR
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Gerar Novo SmartQR</DialogTitle>
                      <DialogDescription>
                        Crie um QR Code para uma transação específica.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="amount" className="text-right">
                          Valor (R$)
                        </Label>
                        <Input
                          id="amount"
                          type="number"
                          value={qrAmount}
                          onChange={(e) => setQrAmount(e.target.value)}
                          className="col-span-3"
                          placeholder="Ex: 150.00"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="description" className="text-right">
                          Descrição
                        </Label>
                        <Input
                          id="description"
                          value={qrDescription}
                          onChange={(e) => setQrDescription(e.target.value)}
                          className="col-span-3"
                          placeholder="Ex: Compra de Notebook"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="installments" className="text-right">
                          Max. Parcelas
                        </Label>
                        <Input
                          id="installments"
                          type="number"
                          value={qrInstallments}
                          onChange={(e) => setQrInstallments(e.target.value)}
                          className="col-span-3"
                          placeholder="Ex: 4"
                        />
                      </div>
                    </div>
                    <Button 
                      onClick={handleGenerateQR} 
                      disabled={generateQRMutation.isPending}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {generateQRMutation.isPending ? "Gerando..." : "Confirmar Geração"}
                    </Button>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

	              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 mb-8">
              <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <DollarSign className="w-10 h-10 opacity-80" />
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <div className="text-3xl font-bold mb-1">
                    {formatCurrency(stats?.totalVolume || 0)}
                  </div>
                  <div className="text-blue-100 text-sm">
                    Volume Total
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Zap className="w-10 h-10 opacity-80" />
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div className="text-3xl font-bold mb-1">
                    {stats?.totalTransactions || 0}
                  </div>
                  <div className="text-purple-100 text-sm">
                    Transações
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <BarChart3 className="w-10 h-10 opacity-80" />
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <div className="text-3xl font-bold mb-1">
                    {formatCurrency(stats?.averageTicket || 0)}
                  </div>
                  <div className="text-green-100 text-sm">
                    Ticket Médio
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Users className="w-10 h-10 opacity-80" />
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div className="text-3xl font-bold mb-1">
                    {Math.floor((stats?.totalTransactions || 0) * 0.7)}
                  </div>
                  <div className="text-orange-100 text-sm">
                    Clientes Únicos
                  </div>
                </CardContent>
              </Card>
              
              {/* NOVO: Tempo Médio de Liquidação */}
              <Card className="bg-gradient-to-br from-pink-500 to-pink-600 text-white border-0 shadow-xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Clock className="w-10 h-10 opacity-80" />
                    <Zap className="w-6 h-6" />
                  </div>
                  <div className="text-3xl font-bold mb-1">
                    {stats?.averageLiquidationTimeHours !== undefined ? 
                      `${Math.floor(stats.averageLiquidationTimeHours)}h ${Math.round((stats.averageLiquidationTimeHours % 1) * 60)}m` 
                      : 'N/A'}
                  </div>
                  <div className="text-pink-100 text-sm">
                    Tempo Médio de Liquidação
                  </div>
                </CardContent>
              </Card>
              
              {/* NOVO: Volume em PIX Instantâneo */}
              <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white border-0 shadow-xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Zap className="w-10 h-10 opacity-80" />
                    <DollarSign className="w-6 h-6" />
                  </div>
                  <div className="text-3xl font-bold mb-1">
                    {formatCurrency(stats?.pixInstantVolume || 0)}
                  </div>
                  <div className="text-yellow-100 text-sm">
                    Volume em PIX Instantâneo
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <Card className="border-2 border-blue-200 shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Clock className="w-5 h-5" />
                          Transações Recentes
                        </CardTitle>
                        <CardDescription>Últimas vendas realizadas</CardDescription>
                      </div>
                      {transactions && transactions.length > 0 && (
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              const { exportTransactionsToPDF } = require('@/lib/pdfExport');
                              exportTransactionsToPDF(transactions, `transacoes-${new Date().toISOString().split('T')[0]}.pdf`);
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
                              exportTransactionsToCSV(transactions, `transacoes-${new Date().toISOString().split('T')[0]}.csv`);
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
                          <div key={tx.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
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
                                <div className="font-semibold">{tx.description || 'Venda'}</div>
                                <div className="text-sm text-gray-500">
                                  {formatDate(tx.createdAt)} • {tx.paymentMethod}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-green-600">{formatCurrency(tx.netAmount)}</div>
                              <div className="text-sm text-gray-500">
                                Taxa: {formatCurrency(tx.feeAmount || 0)}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <QrCode className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>Nenhuma transação ainda</p>
                        <p className="text-sm">Gere um SmartQR para começar a vender</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-green-600" />
                      Vendas por Modalidade
                    </CardTitle>
                    <CardDescription>
                      Liquidadas (1x) vs Parceladas (>1x)
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="h-64">
                    <SalesBreakdownChart stats={stats} />
                  </CardContent>
                </Card>

                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <QrCode className="w-5 h-5 text-purple-600" />
                      SmartQR Recentes
                    </CardTitle>
                    <CardDescription>
                      Últimos 5 QR Codes gerados
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {qrCodes?.map((qr) => (
                      <div key={qr.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                        <div className="flex flex-col">
                          <span className="font-semibold">{formatCurrency(qr.amount)}</span>
                          <span className="text-xs text-gray-500">{qr.description}</span>
                        </div>
                        <Badge variant="secondary">{qr.maxInstallments}x</Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5" />
                      Suas Vantagens
                    </CardTitle>
                    <CardDescription>Comparado com cartão tradicional</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                        <div className="text-sm text-red-700 mb-1">Você pagaria com cartão</div>
                        <div className="text-2xl font-bold text-gray-400 line-through">
                          {formatCurrency(Math.floor((stats?.totalVolume || 0) * 0.035))}
                        </div>
                        <div className="text-xs text-red-600 mt-1">MDR 3,5% + 14-30 dias</div>
                      </div>
                      
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="text-sm text-blue-700 mb-1">Você paga com ParcelToken</div>
                        <div className="text-2xl font-bold text-blue-600">
                          {formatCurrency(Math.floor((stats?.totalVolume || 0) * 0.005))}
                        </div>
                        <div className="text-xs text-blue-600 mt-1">MDR 0,5% + D+0 via PIX</div>
                      </div>

                      <div className="p-4 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg text-white">
                        <div className="text-sm opacity-90 mb-1">Economia Total</div>
                        <div className="text-3xl font-bold">
                          {formatCurrency(Math.floor((stats?.totalVolume || 0) * 0.03))}
                        </div>
                        <div className="text-sm opacity-90 mt-2">
                          Isso é 85% de economia em taxas!
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <QrCode className="w-5 h-5" />
                          SmartQRs Ativos
                        </CardTitle>
                        <CardDescription>Últimos QR Codes gerados</CardDescription>
                      </div>
                      {qrCodes && qrCodes.length > 0 && (
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              const { exportSmartQRsToPDF } = require('@/lib/pdfExport');
                              exportSmartQRsToPDF(qrCodes, `smartqrs-${new Date().toISOString().split('T')[0]}.pdf`);
                            }}
                          >
                            <Download className="w-4 h-4 mr-2" />
                            PDF
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              const { exportSmartQRsToCSV } = require('@/lib/csvExport');
                              exportSmartQRsToCSV(qrCodes, `smartqrs-${new Date().toISOString().split('T')[0]}.csv`);
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
                    {qrCodes && qrCodes.length > 0 ? (
                      <div className="space-y-4">
                        {qrCodes.map((qr) => (
                          <div key={qr.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <span className="font-semibold text-lg">{formatCurrency(qr.amount)}</span>
                                <div className="text-sm text-gray-500 mt-1">
                                  {qr.description || 'Sem descrição'}
                                </div>
                                <div className="text-xs text-gray-400 mt-1">
                                  Até {qr.maxInstallments || 4}x sem juros
                                </div>
                              </div>
                              <Badge variant={qr.status === 'paid' ? 'default' : 'secondary'}>
                                {qr.status === 'paid' ? 'Pago' : 'Pendente'}
                              </Badge>
                            </div>
                            <div className="bg-white p-3 rounded border border-gray-300 flex justify-center mb-3">
                              <QRCodeDisplay 
                                value={qr.qrCode || `PT-QR-${qr.id}`}
                                size={96}
                                showActions={false}
                              />
                            </div>
                            <QRCodeDisplay 
                              value={qr.qrCode || `PT-QR-${qr.id}`}
                              size={0}
                              showActions={true}
                              label={`SmartQR-${qr.id}-${qr.description || 'QR'}`}
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-gray-500">
                        <QrCode className="w-10 h-10 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Nenhum QR Code gerado ainda</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3">
                      <Shield className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                      <div>
                        <h4 className="font-semibold mb-1">Pagamentos Seguros</h4>
                        <p className="text-sm text-gray-600">
                          Todas as transações são criptografadas e protegidas por nossa infraestrutura PCI-DSS.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
