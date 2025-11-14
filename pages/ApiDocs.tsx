import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Code2, Download, ExternalLink, FileJson } from "lucide-react";
import { useState } from "react";

export default function ApiDocs() {
  const { isAuthenticated } = useAuth();
  const [selectedEndpoint, setSelectedEndpoint] = useState('auth');

  const endpoints = [
    {
      id: 'auth',
      name: 'Autenticação',
      description: 'Endpoints de autenticação e sessão',
      methods: [
        {
          method: 'GET',
          path: '/api/trpc/auth.me',
          description: 'Obter dados do usuário autenticado',
          auth: true,
          response: {
            id: 1,
            openId: 'user_123',
            name: 'João Silva',
            email: 'joao@example.com',
            role: 'user'
          }
        },
        {
          method: 'POST',
          path: '/api/trpc/auth.logout',
          description: 'Fazer logout',
          auth: true,
          response: {
            success: true
          }
        }
      ]
    },
    {
      id: 'user',
      name: 'Consumidor',
      description: 'Operações relacionadas a consumidores',
      methods: [
        {
          method: 'GET',
          path: '/api/trpc/user.profile',
          description: 'Obter perfil do consumidor',
          auth: true,
          response: {
            id: 1,
            name: 'João Silva',
            email: 'joao@example.com',
            stats: {
              totalTransactions: 45,
              totalSpent: 15000000,
              totalSavings: 375000,
              activeTokens: 1
            }
          }
        },
        {
          method: 'GET',
          path: '/api/trpc/user.getActiveToken',
          description: 'Obter ParcelToken ativo',
          auth: true,
          response: {
            id: 1,
            creditLimit: 5000000,
            usedAmount: 2500000,
            status: 'active',
            expiresAt: '2025-12-31T23:59:59Z'
          }
        },
        {
          method: 'POST',
          path: '/api/trpc/user.createToken',
          description: 'Criar novo ParcelToken',
          auth: true,
          body: {
            requestedLimit: 5000000,
            maxInstallments: 4
          },
          response: {
            tokenId: 1,
            creditLimit: 5000000,
            maxInstallments: 4,
            status: 'active'
          }
        }
      ]
    },
    {
      id: 'merchant',
      name: 'Merchant',
      description: 'Operações relacionadas a merchants',
      methods: [
        {
          method: 'POST',
          path: '/api/trpc/merchant.createSmartQR',
          description: 'Gerar SmartQR para receber pagamentos',
          auth: true,
          body: {
            amount: 50000,
            description: 'Venda de produto',
            maxInstallments: 3,
            cashbackPercentage: 0,
            discountPercentage: 0
          },
          response: {
            qrId: 123,
            qrData: {
              version: '1.0',
              merchantId: 1,
              amount: 50000,
              maxInstallments: 3
            },
            qrCode: 'parceltoken://qr/123'
          }
        },
        {
          method: 'GET',
          path: '/api/trpc/merchant.transactions',
          description: 'Listar transações do merchant',
          auth: true,
          response: [
            {
              id: 1,
              amount: 50000,
              paymentMethod: 'parceltoken',
              status: 'completed',
              createdAt: '2025-01-09T10:30:00Z'
            }
          ]
        },
        {
          method: 'GET',
          path: '/api/trpc/merchant.analytics',
          description: 'Obter analytics do merchant',
          auth: true,
          response: {
            summary: {
              totalTransactions: 150,
              totalVolume: 750000,
              parcelTokenTransactions: 85,
              conversionRate: 56.7,
              roi: 3750
            }
          }
        }
      ]
    },
    {
      id: 'payment',
      name: 'Pagamento',
      description: 'Operações de pagamento',
      methods: [
        {
          method: 'POST',
          path: '/api/trpc/payment.execute',
          description: 'Executar pagamento',
          auth: true,
          body: {
            qrId: 123,
            installments: 3,
            paymentMethod: 'parceltoken'
          },
          response: {
            transactionId: 456,
            status: 'completed',
            amount: 50000,
            installments: 3,
            installmentAmount: 16667,
            savings: 1400
          }
        }
      ]
    }
  ];

  const currentEndpoint = endpoints.find(e => e.id === selectedEndpoint);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <Code2 className="w-8 h-8 text-blue-600" />
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
              Documentação da API
            </h1>
          </div>
          <p className="text-lg text-slate-600 dark:text-slate-400 mb-6">
            Integre ParcelToken Pay em sua aplicação com nossa API REST completa
          </p>

          {isAuthenticated && (
            <div className="flex gap-3">
              <Button variant="default" size="lg">
                <Download className="w-4 h-4 mr-2" />
                Baixar OpenAPI Spec
              </Button>
              <Button variant="outline" size="lg">
                <FileJson className="w-4 h-4 mr-2" />
                Swagger UI
              </Button>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4 p-4">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-4">
                Categorias
              </h3>
              <div className="space-y-2">
                {endpoints.map(endpoint => (
                  <button
                    key={endpoint.id}
                    onClick={() => setSelectedEndpoint(endpoint.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      selectedEndpoint === endpoint.id
                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100 font-semibold'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                    }`}
                  >
                    {endpoint.name}
                  </button>
                ))}
              </div>
            </Card>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            {currentEndpoint && (
              <div className="space-y-6">
                {/* Category Header */}
                <Card className="p-6 bg-white dark:bg-slate-900 border-blue-200 dark:border-blue-900">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                    {currentEndpoint.name}
                  </h2>
                  <p className="text-slate-600 dark:text-slate-400">
                    {currentEndpoint.description}
                  </p>
                </Card>

                {/* Endpoints */}
                {currentEndpoint.methods.map((method: any, idx) => (
                  <Card key={idx} className="p-6 bg-white dark:bg-slate-900">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            method.method === 'GET'
                              ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100'
                              : 'bg-green-100 dark:bg-green-900 text-green-900 dark:text-green-100'
                          }`}>
                            {method.method}
                          </span>
                          <code className="text-slate-900 dark:text-white font-mono text-sm">
                            {method.path}
                          </code>
                        </div>
                        <p className="text-slate-600 dark:text-slate-400">
                          {method.description}
                        </p>
                      </div>
                      {method.auth && (
                        <span className="text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-900 dark:text-yellow-100 px-2 py-1 rounded">
                          Requer Auth
                        </span>
                      )}
                    </div>

                    <Tabs defaultValue="response" className="mt-4">
                      <TabsList className="grid w-full grid-cols-3">
                        {(method as any).body && <TabsTrigger value="request">Request</TabsTrigger>}
                        <TabsTrigger value="response">Response</TabsTrigger>
                        <TabsTrigger value="curl">cURL</TabsTrigger>
                      </TabsList>

                      {(method as any).body && (
                        <TabsContent value="request" className="mt-4">
                          <pre className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg overflow-x-auto">
                            <code className="text-sm text-slate-800 dark:text-slate-200">
                              {JSON.stringify(method.body, null, 2)}
                            </code>
                          </pre>
                        </TabsContent>
                      )}

                      <TabsContent value="response" className="mt-4">
                        <pre className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg overflow-x-auto">
                          <code className="text-sm text-slate-800 dark:text-slate-200">
                            {JSON.stringify(method.response, null, 2)}
                          </code>
                        </pre>
                      </TabsContent>

                      <TabsContent value="curl" className="mt-4">
                        <pre className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg overflow-x-auto">
                          <code className="text-sm text-slate-800 dark:text-slate-200">
                            {`curl -X ${method.method} "${method.path}" \\\n  -H "Authorization: Bearer YOUR_TOKEN" \\\n  -H "Content-Type: application/json"`}
                            {method.body && `\\\n  -d '${JSON.stringify(method.body)}'`}
                          </code>
                        </pre>
                      </TabsContent>
                    </Tabs>
                  </Card>
                ))}

                {/* SDK Section */}
                <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-blue-200 dark:border-blue-900">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                    SDKs Disponíveis
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {['JavaScript', 'Python', 'Java'].map(sdk => (
                      <Button
                        key={sdk}
                        variant="outline"
                        className="justify-between"
                      >
                        {sdk}
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    ))}
                  </div>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
