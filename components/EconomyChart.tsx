import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, DollarSign } from "lucide-react";

interface EconomyChartProps {
  data?: Array<{
    month: string;
    parceltoken: number;
    traditional: number;
    savings: number;
  }>;
}

export default function EconomyChart({ data }: EconomyChartProps) {
  // Dados padrão de demonstração
  const defaultData = [
    { month: "Jan", parceltoken: 1200, traditional: 1800, savings: 600 },
    { month: "Fev", parceltoken: 1900, traditional: 2800, savings: 900 },
    { month: "Mar", parceltoken: 2500, traditional: 3500, savings: 1000 },
    { month: "Abr", parceltoken: 3200, traditional: 4800, savings: 1600 },
    { month: "Mai", parceltoken: 4100, traditional: 6200, savings: 2100 },
    { month: "Jun", parceltoken: 5300, traditional: 8100, savings: 2800 },
  ];

  const chartData = data || defaultData;
  const totalSavings = chartData.reduce((sum, item) => sum + item.savings, 0);
  const avgSavings = Math.round(totalSavings / chartData.length);

  return (
    <div className="space-y-6">
      {/* Resumo de Economia */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Economia Total</CardTitle>
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              R$ {totalSavings.toLocaleString('pt-BR')}
            </div>
            <p className="text-sm text-gray-600 mt-2">
              em {chartData.length} meses usando ParcelToken
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Economia Média Mensal</CardTitle>
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              R$ {avgSavings.toLocaleString('pt-BR')}
            </div>
            <p className="text-sm text-gray-600 mt-2">
              {Math.round((avgSavings / 2000) * 100)}% de economia vs cartão
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Linha - Comparação */}
      <Card>
        <CardHeader>
          <CardTitle>Comparação de Custos</CardTitle>
          <CardDescription>
            ParcelToken vs Cartão Tradicional (últimos 6 meses)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px"
                }}
                formatter={(value) => `R$ ${value.toLocaleString('pt-BR')}`}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="parceltoken"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ fill: "#10b981", r: 4 }}
                activeDot={{ r: 6 }}
                name="ParcelToken"
              />
              <Line
                type="monotone"
                dataKey="traditional"
                stroke="#ef4444"
                strokeWidth={2}
                dot={{ fill: "#ef4444", r: 4 }}
                activeDot={{ r: 6 }}
                name="Cartão Tradicional"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Gráfico de Barras - Economia */}
      <Card>
        <CardHeader>
          <CardTitle>Economia Mensal</CardTitle>
          <CardDescription>
            Quanto você economizou a cada mês com ParcelToken
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px"
                }}
                formatter={(value) => `R$ ${value.toLocaleString('pt-BR')}`}
              />
              <Bar
                dataKey="savings"
                fill="#8b5cf6"
                radius={[8, 8, 0, 0]}
                name="Economia"
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
