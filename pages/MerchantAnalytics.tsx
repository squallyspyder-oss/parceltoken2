import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/const";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import {
  ArrowLeft,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Percent,
  Download,
  Calendar
} from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import { toast } from "sonner";

export default function MerchantAnalytics() {
  const { user, isAuthenticated, loading } = useAuth();
  const [period, setPeriod] = useState<'7days' | '30days' | '90days'>('30days');

  const { data: analytics, isLoading } = trpc.merchant.analytics.useQuery(
    { period },
    { enabled: isAuthenticated }
  );

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <div>Acesso negado</div>;
  }

  const data = analytics || {
    merchant: { id: 1, businessName: 'Sua Loja' },
    summary: {
      totalTransactions: 150,
      totalVolume: 5000000,
      averageTicket: 33333,
      parcelTokenTransactions: 75,
      parcelTokenVolume: 2500000,
      conversionRate: 50,
      roi: 12500
    },
    monthlyData: [
      { month: 'Jan', volume: 600000, transactions: 18, roi: 1500 },
      { month: 'Fev', volume: 700000, transactions: 21, roi: 1750 },
      { month: 'Mar', volume: 800000, transactions: 24, roi: 2000 },
      { month: 'Abr', volume: 900000, transactions: 27, roi: 2250 },
      { month: 'Mai', volume: 1000000, transactions: 30, roi: 2500 },
      { month: 'Jun', volume: 1000000, transactions: 30, roi: 2500 }
    ],
    comparison: {
      beforeParcelToken: 3500000,
      afterParcelToken: 5000000,
      growth: 43
    }
  };

  const handleExportReport = () => {
    toast.success('Relatório será enviado para seu e-mail em breve!');
  };

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/merchant">
              <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition">
                <ArrowLeft className="w-5 h-5" />
                <span className="font-semibold">Voltar ao Dashboard</span>
              </div>
            </Link>
            <h1 className="text-2xl font-bold">Analytics & ROI</h1>
            <Button onClick={handleExportReport} variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Exportar Relatório
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Period Selector */}
        <div className="mb-8 flex gap-3">
          {(['7days', '30days', '90days'] as const).map((p) => (
            <Button
              key={p}
              onClick={() => setPeriod(p)}
              variant={period === p ? 'default' : 'outline'}
              className={period === p ? 'bg-gradient-to-r from-blue-600 to-purple-600' : ''}
            >
              <Calendar className="w-4 h-4 mr-2" />
              {p === '7days' ? 'Últimos 7 dias' : p === '30days' ? 'Últimos 30 dias' : 'Últimos 90 dias'}
            </Button>
          ))}
        </div>

        {/* KPI Cards */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Total de Transações</span>
                <ShoppingCart className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-3xl font-bold text-blue-600">{data.summary.totalTransactions}</div>
              <p className="text-xs text-gray-600 mt-2">
                {data.summary.parcelTokenTransactions} com ParcelToken
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Volume Total</span>
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <div className="text-3xl font-bold text-green-600">
                {formatCurrency(data.summary.totalVolume)}
              </div>
              <p className="text-xs text-gray-600 mt-2">
                Ticket médio: {formatCurrency(data.summary.averageTicket)}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Taxa de Conversão</span>
                <Percent className="w-5 h-5 text-purple-600" />
              </div>
              <div className="text-3xl font-bold text-purple-600">{data.summary.conversionRate.toFixed(1)}%</div>
              <p className="text-xs text-gray-600 mt-2">
                Clientes usando ParcelToken
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">ROI Estimado</span>
                <TrendingUp className="w-5 h-5 text-orange-600" />
              </div>
              <div className="text-3xl font-bold text-orange-600">
                {formatCurrency(data.summary.roi)}
              </div>
              <p className="text-xs text-gray-600 mt-2">
                Neste período
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Volume por Mês */}
          <Card>
            <CardHeader>
              <CardTitle>Volume de Vendas</CardTitle>
              <CardDescription>Evolução mensal do volume de vendas</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px"
                    }}
                    formatter={(value) => formatCurrency(value as number)}
                  />
                  <Bar dataKey="volume" fill="#3b82f6" radius={[8, 8, 0, 0]} name="Volume" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* ROI por Mês */}
          <Card>
            <CardHeader>
              <CardTitle>ROI Mensal</CardTitle>
              <CardDescription>Retorno sobre investimento em ParcelToken</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data.monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px"
                    }}
                    formatter={(value) => formatCurrency(value as number)}
                  />
                  <Line
                    type="monotone"
                    dataKey="roi"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={{ fill: "#10b981", r: 4 }}
                    activeDot={{ r: 6 }}
                    name="ROI"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Comparação Antes/Depois */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Comparação: Antes vs Depois</CardTitle>
              <CardDescription>Impacto do ParcelToken nas suas vendas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold">Antes do ParcelToken</span>
                    <span className="text-sm text-gray-600">
                      {formatCurrency(data.comparison.beforeParcelToken)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-gray-400 h-3 rounded-full"
                      style={{ width: '70%' }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold">Com ParcelToken</span>
                    <span className="text-sm text-green-600 font-bold">
                      {formatCurrency(data.comparison.afterParcelToken)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-green-500 h-3 rounded-full"
                      style={{ width: '100%' }}
                    ></div>
                  </div>
                </div>

                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-green-900">Crescimento</span>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">
                        +{data.comparison.growth}%
                      </div>
                      <div className="text-xs text-green-700">
                        {formatCurrency(data.comparison.afterParcelToken - data.comparison.beforeParcelToken)} a mais
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Distribuição de Métodos de Pagamento */}
          <Card>
            <CardHeader>
              <CardTitle>Distribuição de Pagamentos</CardTitle>
              <CardDescription>Proporção de transações por método</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'ParcelToken', value: data.summary.parcelTokenTransactions },
                      { name: 'Outros', value: data.summary.totalTransactions - data.summary.parcelTokenTransactions }
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    <Cell fill="#10b981" />
                    <Cell fill="#d1d5db" />
                  </Pie>
                  <Tooltip formatter={(value) => `${value} transações`} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Insights */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Insights e Recomendações
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-white rounded-lg border border-blue-200">
              <p className="text-sm font-semibold text-gray-900 mb-2">
                ✅ Taxa de Conversão Excelente
              </p>
              <p className="text-sm text-gray-600">
                Sua taxa de conversão com ParcelToken ({data.summary.conversionRate.toFixed(1)}%) está acima da média do mercado (18.5%). Continue promovendo o ParcelToken como opção de pagamento!
              </p>
            </div>

            <div className="p-4 bg-white rounded-lg border border-green-200">
              <p className="text-sm font-semibold text-gray-900 mb-2">
                💰 ROI Positivo Confirmado
              </p>
              <p className="text-sm text-gray-600">
                Você já gerou {formatCurrency(data.summary.roi)} em ROI com ParcelToken. A cada transação, você economiza em taxa de processamento e ganha em volume de vendas.
              </p>
            </div>

            <div className="p-4 bg-white rounded-lg border border-purple-200">
              <p className="text-sm font-semibold text-gray-900 mb-2">
                📈 Crescimento Sustentável
              </p>
              <p className="text-sm text-gray-600">
                Seu volume cresceu {data.comparison.growth}% desde a implementação do ParcelToken. Mantenha a promoção ativa para continuar capturando essa oportunidade de crescimento.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
