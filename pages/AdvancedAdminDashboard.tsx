import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { AlertCircle, CheckCircle, Activity, Database, Server, Shield, Download, Filter, Search } from "lucide-react";
import { useState } from "react";

export default function AdvancedAdminDashboard() {
  const [selectedAlert, setSelectedAlert] = useState<string | null>(null);
  const [filterSeverity, setFilterSeverity] = useState<string>("ALL");

  // Health Check Data
  const healthChecks = [
    {
      id: "api-pix",
      name: "API PIX",
      status: "HEALTHY",
      latency: 145,
      uptime: 99.98,
      lastCheck: "2 minutos atrás"
    },
    {
      id: "db-primary",
      name: "Database Primary",
      status: "HEALTHY",
      latency: 12,
      uptime: 99.99,
      lastCheck: "1 minuto atrás"
    },
    {
      id: "cache-redis",
      name: "Cache Redis",
      status: "HEALTHY",
      latency: 3,
      uptime: 99.95,
      lastCheck: "30 segundos atrás"
    },
    {
      id: "payment-gateway",
      name: "Payment Gateway",
      status: "WARNING",
      latency: 2450,
      uptime: 98.5,
      lastCheck: "1 minuto atrás"
    },
    {
      id: "email-service",
      name: "Email Service",
      status: "HEALTHY",
      latency: 890,
      uptime: 99.9,
      lastCheck: "5 minutos atrás"
    },
    {
      id: "sms-service",
      name: "SMS Service",
      status: "HEALTHY",
      latency: 1200,
      uptime: 99.7,
      lastCheck: "3 minutos atrás"
    }
  ];

  // Audit Logs
  const auditLogs = [
    {
      id: "AUD-001",
      timestamp: "2 minutos atrás",
      eventType: "TRANSACTION_COMPLETED",
      severity: "INFO",
      userId: "USR-12345",
      action: "Transação de R$ 2.500 aprovada",
      status: "SUCCESS",
      ipAddress: "192.168.1.100"
    },
    {
      id: "AUD-002",
      timestamp: "5 minutos atrás",
      eventType: "FRAUD_DETECTED",
      severity: "CRITICAL",
      userId: "USR-67890",
      action: "Fraude detectada: múltiplas transações em locais diferentes",
      status: "PENDING",
      ipAddress: "203.0.113.45"
    },
    {
      id: "AUD-003",
      timestamp: "8 minutos atrás",
      eventType: "USER_LOGIN",
      severity: "INFO",
      userId: "MERCHANT-555",
      action: "Merchant fez login via OAuth",
      status: "SUCCESS",
      ipAddress: "198.51.100.23"
    },
    {
      id: "AUD-004",
      timestamp: "12 minutos atrás",
      eventType: "PAYMENT_FAILED",
      severity: "WARNING",
      userId: "USR-11111",
      action: "Pagamento falhou: saldo insuficiente",
      status: "FAILED",
      ipAddress: "192.0.2.88"
    },
    {
      id: "AUD-005",
      timestamp: "15 minutos atrás",
      eventType: "TOKEN_CREATED",
      severity: "INFO",
      userId: "USR-22222",
      action: "Novo ParcelToken criado (GOLD tier)",
      status: "SUCCESS",
      ipAddress: "192.168.1.50"
    }
  ];

  // Alerts
  const alerts = [
    {
      id: "ALT-001",
      severity: "CRITICAL",
      title: "Fraude Detectada",
      description: "Múltiplas transações suspeitas do usuário USR-67890 em 2 minutos",
      timestamp: "2 minutos atrás",
      action: "Revisar"
    },
    {
      id: "ALT-002",
      severity: "WARNING",
      title: "Payment Gateway Lento",
      description: "Latência acima de 2s detectada (2.45s atual)",
      timestamp: "1 minuto atrás",
      action: "Monitorar"
    },
    {
      id: "ALT-003",
      severity: "WARNING",
      title: "Taxa de Erro Elevada",
      description: "Taxa de erro de pagamento em 5%",
      timestamp: "5 minutos atrás",
      action: "Investigar"
    },
    {
      id: "ALT-004",
      severity: "INFO",
      title: "Backup Concluído",
      description: "Backup diário do banco de dados concluído com sucesso",
      timestamp: "1 hora atrás",
      action: "Visualizar"
    }
  ];

  // Dados de auditoria por hora
  const auditByHour = [
    { hour: "00:00", events: 120, errors: 5 },
    { hour: "04:00", events: 85, errors: 2 },
    { hour: "08:00", events: 450, errors: 12 },
    { hour: "12:00", events: 680, errors: 18 },
    { hour: "16:00", events: 920, errors: 25 },
    { hour: "20:00", events: 750, errors: 20 },
    { hour: "23:00", events: 300, errors: 8 }
  ];

  // Distribuição de eventos por tipo
  const eventDistribution = [
    { name: "LOGIN", value: 35, color: "#10b981" },
    { name: "TRANSACTION", value: 40, color: "#3b82f6" },
    { name: "TOKEN", value: 15, color: "#8b5cf6" },
    { name: "ERROR", value: 10, color: "#ef4444" }
  ];

  const getStatusColor = (status: string) => {
    switch(status) {
      case "HEALTHY":
        return "bg-green-100 dark:bg-green-900 text-green-900 dark:text-green-100";
      case "WARNING":
        return "bg-yellow-100 dark:bg-yellow-900 text-yellow-900 dark:text-yellow-100";
      case "CRITICAL":
        return "bg-red-100 dark:bg-red-900 text-red-900 dark:text-red-100";
      default:
        return "bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100";
    }
  };

  const getSeverityColor = (severity: string) => {
    switch(severity) {
      case "CRITICAL":
        return "bg-red-100 dark:bg-red-900 text-red-900 dark:text-red-100";
      case "WARNING":
        return "bg-yellow-100 dark:bg-yellow-900 text-yellow-900 dark:text-yellow-100";
      case "INFO":
        return "bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100";
      default:
        return "bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100";
    }
  };

  const filteredAlerts = filterSeverity === "ALL" 
    ? alerts 
    : alerts.filter(a => a.severity === filterSeverity);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-8 h-8 text-blue-600" />
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
              Admin Dashboard Avançado
            </h1>
          </div>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Monitoramento completo, auditoria e health checks
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            {
              label: "Eventos Auditados",
              value: "4.847",
              change: "+12% hoje",
              icon: "📊"
            },
            {
              label: "Serviços Saudáveis",
              value: "5/6",
              change: "1 em aviso",
              icon: "✅"
            },
            {
              label: "Taxa de Erro",
              value: "0.8%",
              change: "-0.2% vs ontem",
              icon: "⚠️"
            },
            {
              label: "Uptime Médio",
              value: "99.7%",
              change: "Excelente",
              icon: "📈"
            }
          ].map((kpi, idx) => (
            <Card key={idx} className="p-6 bg-white dark:bg-slate-900">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                    {kpi.label}
                  </p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Eventos por Hora */}
          <Card className="p-6 bg-white dark:bg-slate-900 lg:col-span-2">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
              Eventos de Auditoria (Últimas 24h)
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={auditByHour}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="events" fill="#3b82f6" name="Total de Eventos" />
                <Bar dataKey="errors" fill="#ef4444" name="Erros" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Distribuição de Eventos */}
          <Card className="p-6 bg-white dark:bg-slate-900">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
              Distribuição de Eventos
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={eventDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {eventDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {eventDistribution.map((event, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">{event.name}</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{event.value}%</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Health Checks */}
        <Card className="p-6 bg-white dark:bg-slate-900 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Health Checks de Serviços
            </h2>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
              Atualizar Agora
            </Button>
          </div>

          <div className="space-y-3">
            {healthChecks.map((service) => (
              <div
                key={service.id}
                className="p-4 rounded-lg border bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-slate-900 dark:text-white">
                        {service.name}
                      </h3>
                      <Badge className={getStatusColor(service.status)}>
                        {service.status === "HEALTHY" ? "Saudável" : "Aviso"}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-slate-500 dark:text-slate-500">Latência</p>
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {service.latency}ms
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-500 dark:text-slate-500">Uptime</p>
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {service.uptime}%
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-500 dark:text-slate-500">Último Check</p>
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {service.lastCheck}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="ml-4">
                    {service.status === "HEALTHY" ? (
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    ) : (
                      <AlertCircle className="w-6 h-6 text-yellow-600" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Alerts */}
        <Card className="p-6 bg-white dark:bg-slate-900 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Alertas do Sistema
            </h2>
            <div className="flex gap-2">
              <select
                value={filterSeverity}
                onChange={(e) => setFilterSeverity(e.target.value)}
                className="px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded text-sm"
              >
                <option value="ALL">Todos</option>
                <option value="CRITICAL">Crítico</option>
                <option value="WARNING">Aviso</option>
                <option value="INFO">Info</option>
              </select>
            </div>
          </div>

          <div className="space-y-3">
            {filteredAlerts.map((alert) => (
              <div
                key={alert.id}
                onClick={() => setSelectedAlert(alert.id)}
                className={`p-4 rounded-lg border cursor-pointer transition-all ${
                  selectedAlert === alert.id
                    ? "bg-blue-50 dark:bg-blue-950 border-blue-300 dark:border-blue-700"
                    : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={getSeverityColor(alert.severity)}>
                        {alert.severity}
                      </Badge>
                      <h3 className="font-semibold text-slate-900 dark:text-white">
                        {alert.title}
                      </h3>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                      {alert.description}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-500">
                      {alert.timestamp}
                    </p>
                  </div>
                  <Button size="sm" variant="outline" className="ml-4">
                    {alert.action}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Audit Logs */}
        <Card className="p-6 bg-white dark:bg-slate-900">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Database className="w-5 h-5" />
              Logs de Auditoria Recentes
            </h2>
            <div className="flex gap-2">
              <Button size="sm" variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                Filtrar
              </Button>
              <Button size="sm" variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Exportar CSV
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="text-left py-3 px-4 text-slate-600 dark:text-slate-400">ID</th>
                  <th className="text-left py-3 px-4 text-slate-600 dark:text-slate-400">Timestamp</th>
                  <th className="text-left py-3 px-4 text-slate-600 dark:text-slate-400">Evento</th>
                  <th className="text-left py-3 px-4 text-slate-600 dark:text-slate-400">Severidade</th>
                  <th className="text-left py-3 px-4 text-slate-600 dark:text-slate-400">Usuário</th>
                  <th className="text-left py-3 px-4 text-slate-600 dark:text-slate-400">Ação</th>
                  <th className="text-left py-3 px-4 text-slate-600 dark:text-slate-400">Status</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map((log) => (
                  <tr key={log.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800">
                    <td className="py-3 px-4 text-slate-900 dark:text-white font-mono text-xs">
                      {log.id}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                      {log.timestamp}
                    </td>
                    <td className="py-3 px-4 text-slate-900 dark:text-white">
                      {log.eventType}
                    </td>
                    <td className="py-3 px-4">
                      <Badge className={getSeverityColor(log.severity)}>
                        {log.severity}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400 font-mono text-xs">
                      {log.userId}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                      {log.action}
                    </td>
                    <td className="py-3 px-4">
                      <Badge className={log.status === "SUCCESS" ? "bg-green-100 dark:bg-green-900 text-green-900 dark:text-green-100" : log.status === "FAILED" ? "bg-red-100 dark:bg-red-900 text-red-900 dark:text-red-100" : "bg-yellow-100 dark:bg-yellow-900 text-yellow-900 dark:text-yellow-100"}>
                        {log.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
