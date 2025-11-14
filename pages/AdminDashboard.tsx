import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, BarChart3, Lock, LogOut, Search, Shield, TrendingUp, Users } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  // Verificar se é admin
  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 flex items-center justify-center p-4">
        <Card className="p-8 max-w-md text-center bg-white dark:bg-slate-900">
          <Lock className="w-16 h-16 mx-auto mb-4 text-red-600" />
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Acesso Negado
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Você não tem permissão para acessar o painel administrativo.
          </p>
          <Button onClick={() => navigate('/')} className="w-full">
            Voltar para Home
          </Button>
        </Card>
      </div>
    );
  }

  const mockStats = [
    { label: 'Usuários Ativos', value: '12,547', change: '+12.5%', icon: Users },
    { label: 'Merchants', value: '328', change: '+8.2%', icon: TrendingUp },
    { label: 'Volume Mensal', value: 'R$ 28.4M', change: '+24.1%', icon: BarChart3 },
    { label: 'Alertas de Fraude', value: '23', change: '+3', icon: AlertCircle }
  ];

  const mockUsers = [
    { id: 1, name: 'João Silva', email: 'joao@example.com', status: 'active', joined: '2024-01-15' },
    { id: 2, name: 'Maria Santos', email: 'maria@example.com', status: 'active', joined: '2024-02-20' },
    { id: 3, name: 'Pedro Oliveira', email: 'pedro@example.com', status: 'suspended', joined: '2024-03-10' },
    { id: 4, name: 'Ana Costa', email: 'ana@example.com', status: 'active', joined: '2024-04-05' }
  ];

  const mockMerchants = [
    { id: 1, name: 'Loja ABC', cnpj: '12.345.678/0001-90', status: 'active', volume: 'R$ 1.2M' },
    { id: 2, name: 'E-commerce XYZ', cnpj: '98.765.432/0001-10', status: 'active', volume: 'R$ 5.6M' },
    { id: 3, name: 'Varejo 123', cnpj: '55.555.555/0001-55', status: 'pending', volume: 'R$ 0' }
  ];

  const mockTransactions = [
    { id: 1, user: 'João Silva', merchant: 'Loja ABC', amount: 'R$ 250,00', status: 'completed', date: '2025-01-09' },
    { id: 2, user: 'Maria Santos', merchant: 'E-commerce XYZ', amount: 'R$ 1.500,00', status: 'completed', date: '2025-01-09' },
    { id: 3, user: 'Pedro Oliveira', merchant: 'Varejo 123', amount: 'R$ 750,00', status: 'failed', date: '2025-01-08' }
  ];

  const mockAlerts = [
    { id: 1, type: 'fraud', severity: 'high', message: 'Múltiplas transações suspeitas de usuário', user: 'ID: 456', time: '5 min atrás' },
    { id: 2, type: 'compliance', severity: 'medium', message: 'Merchant sem KYC completo', merchant: 'ID: 789', time: '1 hora atrás' },
    { id: 3, type: 'system', severity: 'low', message: 'Backup de banco de dados concluído', detail: 'Sucesso', time: '2 horas atrás' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Painel Administrativo
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-600 dark:text-slate-400">
              {user?.name}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                logout();
                navigate('/');
              }}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {mockStats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <Card key={idx} className="p-6 bg-white dark:bg-slate-900">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                      {stat.label}
                    </p>
                    <p className="text-3xl font-bold text-slate-900 dark:text-white">
                      {stat.value}
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                      {stat.change}
                    </p>
                  </div>
                  <Icon className="w-8 h-8 text-blue-600 opacity-50" />
                </div>
              </Card>
            );
          })}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6 mb-6">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="users">Usuários</TabsTrigger>
            <TabsTrigger value="merchants">Merchants</TabsTrigger>
            <TabsTrigger value="transactions">Transações</TabsTrigger>
            <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
            <TabsTrigger value="alerts">Alertas</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <Card className="p-6 bg-white dark:bg-slate-900">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                Resumo Executivo
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                    Taxa de Crescimento
                  </p>
                  <p className="text-2xl font-bold text-green-600">+18.5%</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Comparado ao mês anterior
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                    Taxa de Conversão
                  </p>
                  <p className="text-2xl font-bold text-blue-600">56.7%</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    ParcelToken vs Cartão
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                    Saúde do Sistema
                  </p>
                  <p className="text-2xl font-bold text-green-600">99.8%</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Uptime
                  </p>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-4">
            <Card className="p-6 bg-white dark:bg-slate-900">
              <div className="flex items-center gap-2 mb-4">
                <Search className="w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Buscar usuário..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1"
                />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">
                        Nome
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">
                        Email
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">
                        Status
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">
                        Data de Entrada
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockUsers.map((user) => (
                      <tr key={user.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800">
                        <td className="py-3 px-4 text-slate-900 dark:text-white">{user.name}</td>
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{user.email}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            user.status === 'active'
                              ? 'bg-green-100 dark:bg-green-900 text-green-900 dark:text-green-100'
                              : 'bg-red-100 dark:bg-red-900 text-red-900 dark:text-red-100'
                          }`}>
                            {user.status === 'active' ? 'Ativo' : 'Suspenso'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{user.joined}</td>
                        <td className="py-3 px-4">
                          <Button variant="ghost" size="sm">
                            Ver Detalhes
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>

          {/* Merchants Tab */}
          <TabsContent value="merchants" className="space-y-4">
            <Card className="p-6 bg-white dark:bg-slate-900">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Merchants Registrados
                </h2>
                <Button>+ Novo Merchant</Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">
                        Nome
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">
                        CNPJ
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">
                        Status
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">
                        Volume
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockMerchants.map((merchant) => (
                      <tr key={merchant.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800">
                        <td className="py-3 px-4 text-slate-900 dark:text-white">{merchant.name}</td>
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{merchant.cnpj}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            merchant.status === 'active'
                              ? 'bg-green-100 dark:bg-green-900 text-green-900 dark:text-green-100'
                              : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-900 dark:text-yellow-100'
                          }`}>
                            {merchant.status === 'active' ? 'Ativo' : 'Pendente'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{merchant.volume}</td>
                        <td className="py-3 px-4">
                          <Button variant="ghost" size="sm">
                            Gerenciar
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions" className="space-y-4">
            <Card className="p-6 bg-white dark:bg-slate-900">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                Transações Recentes
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">
                        ID
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">
                        Usuário
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">
                        Merchant
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">
                        Valor
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">
                        Status
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">
                        Data
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockTransactions.map((tx) => (
                      <tr key={tx.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800">
                        <td className="py-3 px-4 text-slate-900 dark:text-white font-mono">#{tx.id}</td>
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{tx.user}</td>
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{tx.merchant}</td>
                        <td className="py-3 px-4 text-slate-900 dark:text-white font-semibold">{tx.amount}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            tx.status === 'completed'
                              ? 'bg-green-100 dark:bg-green-900 text-green-900 dark:text-green-100'
                              : 'bg-red-100 dark:bg-red-900 text-red-900 dark:text-red-100'
                          }`}>
                            {tx.status === 'completed' ? 'Concluída' : 'Falhou'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{tx.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>

          {/* Webhooks Tab */}
          <TabsContent value="webhooks" className="space-y-6">
            <Card className="p-6 bg-white dark:bg-slate-900">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                🔗 Logs de Webhooks (Sistema)
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Monitore todos os webhooks enviados pela plataforma para merchants.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 dark:bg-slate-800">
                    <tr>
                      <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">
                        Timestamp
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">
                        Merchant
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">
                        Evento
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">
                        Status
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">
                        Tentativas
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">
                        HTTP
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Mock data - em produção, buscar do backend */}
                    {[
                      { id: 1, merchant: 'Tech Store', event: 'transaction.completed', status: 'success', retries: 0, httpStatus: 200, time: '2024-01-15 14:32' },
                      { id: 2, merchant: 'Fashion Shop', event: 'installment.paid', status: 'success', retries: 0, httpStatus: 200, time: '2024-01-15 14:28' },
                      { id: 3, merchant: 'Food Delivery', event: 'payment.received', status: 'failed', retries: 3, httpStatus: 500, time: '2024-01-15 14:15' },
                      { id: 4, merchant: 'Tech Store', event: 'smartqr.scanned', status: 'success', retries: 0, httpStatus: 200, time: '2024-01-15 13:45' },
                      { id: 5, merchant: 'Fashion Shop', event: 'webhook.test', status: 'success', retries: 0, httpStatus: 200, time: '2024-01-15 13:20' },
                    ].map((log) => (
                      <tr key={log.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800">
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">{log.time}</td>
                        <td className="py-3 px-4 text-slate-900 dark:text-white font-medium">{log.merchant}</td>
                        <td className="py-3 px-4">
                          <code className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                            {log.event}
                          </code>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            log.status === 'success'
                              ? 'bg-green-100 dark:bg-green-900 text-green-900 dark:text-green-100'
                              : 'bg-red-100 dark:bg-red-900 text-red-900 dark:text-red-100'
                          }`}>
                            {log.status === 'success' ? '✓ Sucesso' : '✗ Falhou'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                          {log.retries > 0 ? `${log.retries} tentativa${log.retries > 1 ? 's' : ''}` : '-'}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`font-mono text-sm ${
                            log.httpStatus === 200
                              ? 'text-green-600 dark:text-green-400'
                              : 'text-red-600 dark:text-red-400'
                          }`}>
                            {log.httpStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-900 dark:text-blue-100">
                  <strong>💡 Dica:</strong> Webhooks com falha são automaticamente reenviados até 3 vezes com backoff exponencial.
                  Merchants podem configurar suas URLs em <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">/webhooks</code>.
                </p>
              </div>
            </Card>
          </TabsContent>

          {/* Alerts Tab */}
          <TabsContent value="alerts" className="space-y-4">
            {mockAlerts.map((alert) => (
              <Card key={alert.id} className={`p-4 border-l-4 ${
                alert.severity === 'high'
                  ? 'border-red-500 bg-red-50 dark:bg-red-950'
                  : alert.severity === 'medium'
                  ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950'
                  : 'border-blue-500 bg-blue-50 dark:bg-blue-950'
              }`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        alert.severity === 'high'
                          ? 'bg-red-200 dark:bg-red-900 text-red-900 dark:text-red-100'
                          : alert.severity === 'medium'
                          ? 'bg-yellow-200 dark:bg-yellow-900 text-yellow-900 dark:text-yellow-100'
                          : 'bg-blue-200 dark:bg-blue-900 text-blue-900 dark:text-blue-100'
                      }`}>
                        {alert.severity === 'high' ? 'CRÍTICO' : alert.severity === 'medium' ? 'AVISO' : 'INFO'}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {alert.time}
                      </span>
                    </div>
                    <p className="font-semibold text-slate-900 dark:text-white mb-1">
                      {alert.message}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {alert.user || alert.merchant || alert.detail}
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Investigar
                  </Button>
                </div>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
