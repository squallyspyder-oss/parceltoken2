import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { DollarSign, TrendingDown, AlertTriangle, CheckCircle2 } from "lucide-react";

export default function BillingDashboard() {
  // Dados de cobrança
  const billingMetrics = {
    totalInstallments: 1250,
    paidInstallments: 1050,
    pendingInstallments: 150,
    overdueInstallments: 50,
    totalAmount: 500000,
    totalPaid: 420000,
    totalInterest: 12500,
    totalFines: 8750,
    delinquencyRate: 4.0,
    averageDaysOverdue: 15
  };

  const installmentData = [
    { name: "Seg", paid: 45, pending: 12, overdue: 3 },
    { name: "Ter", paid: 48, pending: 10, overdue: 2 },
    { name: "Qua", paid: 52, pending: 8, overdue: 4 },
    { name: "Qui", paid: 50, pending: 9, overdue: 1 },
    { name: "Sex", paid: 55, pending: 7, overdue: 3 },
    { name: "Sab", paid: 42, pending: 5, overdue: 2 },
    { name: "Dom", paid: 38, pending: 4, overdue: 1 }
  ];

  const delinquencyData = [
    { name: "1-7 dias", value: 15, color: "#fbbf24" },
    { name: "8-15 dias", value: 12, color: "#f97316" },
    { name: "16-30 dias", value: 13, color: "#ef4444" },
    { name: "31-60 dias", value: 8, color: "#dc2626" },
    { name: "60+ dias", value: 2, color: "#7f1d1d" }
  ];

  const recentInstallments = [
    {
      id: 1,
      transactionId: "TRX-001",
      amount: 500,
      dueDate: "2025-11-15",
      status: "paid",
      paidDate: "2025-11-14",
      interest: 0,
      fine: 0
    },
    {
      id: 2,
      transactionId: "TRX-002",
      amount: 750,
      dueDate: "2025-11-20",
      status: "pending",
      interest: 0,
      fine: 0
    },
    {
      id: 3,
      transactionId: "TRX-003",
      amount: 600,
      dueDate: "2025-11-10",
      status: "overdue",
      interest: 18,
      fine: 12,
      daysOverdue: 5
    },
    {
      id: 4,
      transactionId: "TRX-004",
      amount: 1000,
      dueDate: "2025-11-25",
      status: "pending",
      interest: 0,
      fine: 0
    },
    {
      id: 5,
      transactionId: "TRX-005",
      amount: 450,
      dueDate: "2025-11-05",
      status: "overdue",
      interest: 27,
      fine: 18,
      daysOverdue: 10
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 dark:bg-green-900 text-green-900 dark:text-green-100";
      case "pending":
        return "bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100";
      case "overdue":
        return "bg-red-100 dark:bg-red-900 text-red-900 dark:text-red-100";
      default:
        return "bg-slate-100 dark:bg-slate-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "paid":
        return "Pago";
      case "pending":
        return "Pendente";
      case "overdue":
        return "Atrasado";
      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <DollarSign className="w-8 h-8 text-green-600" />
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
              Billing & Collections
            </h1>
          </div>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Gerencie cobranças, juros, multas e renegociações de parcelas
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            {
              label: "Total de Parcelas",
              value: billingMetrics.totalInstallments.toLocaleString(),
              change: "+45 esta semana",
              icon: "📊",
              color: "bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800"
            },
            {
              label: "Parcelas Pagas",
              value: `${((billingMetrics.paidInstallments / billingMetrics.totalInstallments) * 100).toFixed(1)}%`,
              change: `R$ ${(billingMetrics.totalPaid / 1000).toFixed(0)}k recebido`,
              icon: "✅",
              color: "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800"
            },
            {
              label: "Parcelas Atrasadas",
              value: billingMetrics.overdueInstallments,
              change: `${billingMetrics.delinquencyRate.toFixed(1)}% de inadimplência`,
              icon: "⚠️",
              color: "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800"
            },
            {
              label: "Juros + Multas",
              value: `R$ ${((billingMetrics.totalInterest + billingMetrics.totalFines) / 1000).toFixed(1)}k`,
              change: "Cobrado este mês",
              icon: "💰",
              color: "bg-orange-50 dark:bg-orange-950 border-orange-200 dark:border-orange-800"
            }
          ].map((kpi, idx) => (
            <Card key={idx} className={`p-6 ${kpi.color} border`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                    {kpi.label}
                  </p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white">
                    {kpi.value}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">
                    {kpi.change}
                  </p>
                </div>
                <span className="text-3xl">{kpi.icon}</span>
              </div>
            </Card>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Installments por Status */}
          <Card className="p-6 bg-white dark:bg-slate-900">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
              Parcelas por Status (Últimos 7 dias)
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={installmentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="paid" fill="#10b981" name="Pagas" />
                <Bar dataKey="pending" fill="#3b82f6" name="Pendentes" />
                <Bar dataKey="overdue" fill="#ef4444" name="Atrasadas" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Distribuição de Atraso */}
          <Card className="p-6 bg-white dark:bg-slate-900">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
              Distribuição de Atraso
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={delinquencyData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {delinquencyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Parcelas Recentes */}
        <Card className="p-6 bg-white dark:bg-slate-900 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Parcelas Recentes
            </h2>
            <Button variant="outline" size="sm">
              Ver Todas
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-900 dark:text-white">
                    ID Transação
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-900 dark:text-white">
                    Valor
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-900 dark:text-white">
                    Vencimento
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-900 dark:text-white">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-900 dark:text-white">
                    Juros + Multa
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-900 dark:text-white">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentInstallments.map((inst) => (
                  <tr key={inst.id} className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800">
                    <td className="py-3 px-4 text-sm text-slate-900 dark:text-white">
                      {inst.transactionId}
                    </td>
                    <td className="py-3 px-4 text-sm font-semibold text-slate-900 dark:text-white">
                      R$ {inst.amount.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400">
                      {new Date(inst.dueDate).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="py-3 px-4">
                      <Badge className={getStatusColor(inst.status)}>
                        {getStatusLabel(inst.status)}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400">
                      R$ {(inst.interest + inst.fine).toFixed(2)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        {inst.status === "overdue" && (
                          <>
                            <Button size="sm" variant="outline" className="text-xs">
                              Pagar
                            </Button>
                            <Button size="sm" variant="outline" className="text-xs">
                              Renegociar
                            </Button>
                          </>
                        )}
                        {inst.status === "pending" && (
                          <Button size="sm" variant="outline" className="text-xs">
                            Pagar
                          </Button>
                        )}
                        {inst.status === "paid" && (
                          <Button size="sm" variant="outline" disabled className="text-xs">
                            Pago
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Renegociação */}
        <Card className="p-6 bg-white dark:bg-slate-900">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            Renegociação de Parcelas
          </h2>

          <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-900 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-900 dark:text-blue-100">
              <strong>Como funciona:</strong> Parcelas atrasadas podem ser renegociadas com juros de 1% sobre o saldo. 
              Você pode adiar o vencimento ou dividir em múltiplas parcelas.
            </p>
          </div>

          <div className="space-y-3">
            {recentInstallments.filter(i => i.status === "overdue").map((inst) => (
              <div key={inst.id} className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {inst.transactionId} - R$ {inst.amount.toFixed(2)}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Atrasado há {inst.daysOverdue} dias | Juros: R$ {inst.interest.toFixed(2)} | Multa: R$ {inst.fine.toFixed(2)}
                    </p>
                  </div>
                  <Badge className="bg-red-100 dark:bg-red-900 text-red-900 dark:text-red-100">
                    Atrasado
                  </Badge>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                    Adiar Vencimento
                  </Button>
                  <Button size="sm" variant="outline">
                    Dividir em Parcelas
                  </Button>
                  <Button size="sm" variant="outline">
                    Pagar Agora
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
