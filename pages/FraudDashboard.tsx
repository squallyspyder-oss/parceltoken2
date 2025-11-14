import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, TrendingUp, Shield, Lock } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function FraudDashboard() {
  // Dados simulados de fraude
  const fraudMetrics = [
    { name: "Seg", blocked: 2, reviewed: 5, approved: 48 },
    { name: "Ter", blocked: 3, reviewed: 6, approved: 51 },
    { name: "Qua", blocked: 1, reviewed: 4, approved: 55 },
    { name: "Qui", blocked: 4, reviewed: 8, approved: 48 },
    { name: "Sex", blocked: 2, reviewed: 3, approved: 60 },
    { name: "Sab", blocked: 1, reviewed: 2, approved: 42 },
    { name: "Dom", blocked: 0, reviewed: 1, approved: 38 }
  ];

  const riskScoreData = [
    { name: "0-25", count: 450, color: "#10b981" },
    { name: "25-50", count: 280, color: "#3b82f6" },
    { name: "50-75", count: 120, color: "#f59e0b" },
    { name: "75-100", count: 30, color: "#ef4444" }
  ];

  const recentAlerts = [
    {
      id: 1,
      type: "VELOCITY_EXCEEDED",
      severity: "HIGH",
      message: "Usuário excedeu limite de transações por hora",
      user: "user@example.com",
      timestamp: "2 minutos atrás"
    },
    {
      id: 2,
      type: "NEW_DEVICE",
      severity: "MEDIUM",
      message: "Novo dispositivo detectado",
      user: "merchant@shop.com",
      timestamp: "15 minutos atrás"
    },
    {
      id: 3,
      type: "SUSPICIOUS_LOCATION",
      severity: "HIGH",
      message: "Transação de localização suspeita (1200km)",
      user: "user2@example.com",
      timestamp: "1 hora atrás"
    },
    {
      id: 4,
      type: "BLACKLIST_HIT",
      severity: "CRITICAL",
      message: "Dispositivo na blacklist tentou realizar transação",
      user: "fraud@test.com",
      timestamp: "2 horas atrás"
    },
    {
      id: 5,
      type: "HIGH_AMOUNT",
      severity: "MEDIUM",
      message: "Transação com valor elevado (R$ 8.500)",
      user: "user3@example.com",
      timestamp: "3 horas atrás"
    }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "CRITICAL":
        return "bg-red-100 dark:bg-red-900 text-red-900 dark:text-red-100";
      case "HIGH":
        return "bg-orange-100 dark:bg-orange-900 text-orange-900 dark:text-orange-100";
      case "MEDIUM":
        return "bg-yellow-100 dark:bg-yellow-900 text-yellow-900 dark:text-yellow-100";
      default:
        return "bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100";
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "CRITICAL":
        return "🔴";
      case "HIGH":
        return "🟠";
      case "MEDIUM":
        return "🟡";
      default:
        return "🔵";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-8 h-8 text-red-600" />
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
              Fraud & Risk Dashboard
            </h1>
          </div>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Monitore fraudes, riscos e alertas em tempo real
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            {
              label: "Transações Bloqueadas",
              value: "13",
              change: "+2 hoje",
              icon: "🚫",
              color: "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800"
            },
            {
              label: "Sob Revisão",
              value: "29",
              change: "+5 hoje",
              icon: "🔍",
              color: "bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800"
            },
            {
              label: "Taxa de Fraude",
              value: "0.8%",
              change: "-0.2% vs semana",
              icon: "📊",
              color: "bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800"
            },
            {
              label: "Alertas Ativos",
              value: "5",
              change: "3 críticos",
              icon: "⚠️",
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
          {/* Transações por Status */}
          <Card className="p-6 bg-white dark:bg-slate-900">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
              Transações por Status (Últimos 7 dias)
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={fraudMetrics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="blocked" fill="#ef4444" name="Bloqueadas" />
                <Bar dataKey="reviewed" fill="#f59e0b" name="Sob Revisão" />
                <Bar dataKey="approved" fill="#10b981" name="Aprovadas" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Distribuição de Risk Score */}
          <Card className="p-6 bg-white dark:bg-slate-900">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
              Distribuição de Risk Score
            </h2>
            <div className="space-y-3">
              {riskScoreData.map((item, idx) => (
                <div key={idx}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {item.name} ({item.count})
                    </span>
                    <span className="text-sm text-slate-500 dark:text-slate-500">
                      {Math.round((item.count / 880) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                    <div
                      className="h-2 rounded-full"
                      style={{
                        width: `${(item.count / 880) * 100}%`,
                        backgroundColor: item.color
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Alertas Recentes */}
        <Card className="p-6 bg-white dark:bg-slate-900">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              Alertas Recentes
            </h2>
            <Button variant="outline" size="sm">
              Ver Todos
            </Button>
          </div>

          <div className="space-y-3">
            {recentAlerts.map((alert) => (
              <div
                key={alert.id}
                className="flex items-start gap-4 p-4 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              >
                <span className="text-2xl">{getSeverityIcon(alert.severity)}</span>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {alert.type.replace(/_/g, " ")}
                    </p>
                    <Badge className={getSeverityColor(alert.severity)}>
                      {alert.severity}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                    {alert.message}
                  </p>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-slate-500 dark:text-slate-500">
                      Usuário: {alert.user}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-500">
                      {alert.timestamp}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    Revisar
                  </Button>
                  <Button size="sm" variant="outline">
                    Ação
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Regras de Fraude */}
        <Card className="p-6 bg-white dark:bg-slate-900 mt-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Regras de Detecção Ativas
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                name: "Velocity Check",
                description: "Máx 5 transações/hora, R$ 10k/hora",
                enabled: true
              },
              {
                name: "Device Fingerprinting",
                description: "Detecta novos dispositivos e blacklist",
                enabled: true
              },
              {
                name: "Geo-Fence",
                description: "Alerta para distâncias > 500km",
                enabled: true
              },
              {
                name: "IP Reputation",
                description: "Verifica proxy, VPN e blacklist de IP",
                enabled: true
              },
              {
                name: "Amount Check",
                description: "Alerta para transações > R$ 5k",
                enabled: true
              },
              {
                name: "Email Blacklist",
                description: "Bloqueia emails conhecidos como fraude",
                enabled: true
              }
            ].map((rule, idx) => (
              <div key={idx} className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-slate-900 dark:text-white">
                    {rule.name}
                  </h3>
                  <Badge className={rule.enabled ? "bg-green-100 dark:bg-green-900 text-green-900 dark:text-green-100" : "bg-slate-100 dark:bg-slate-800"}>
                    {rule.enabled ? "Ativa" : "Inativa"}
                  </Badge>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {rule.description}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
