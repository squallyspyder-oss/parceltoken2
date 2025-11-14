import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Code2, Copy, ExternalLink, Key, Shield, Zap, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Link } from "wouter";

export default function ApiDocsNew() {
  const { isAuthenticated } = useAuth();
  const [selectedEndpoint, setSelectedEndpoint] = useState('quickstart');

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Código copiado!");
  };

  const sections = [
    {
      id: 'quickstart',
      name: '🚀 Quick Start',
      description: 'Comece em 5 minutos',
      content: (
        <div className="space-y-6">
          <Card className="p-6 bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
            <h3 className="text-xl font-bold mb-4">Integração em 3 Passos</h3>
            
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">1</div>
                <div>
                  <h4 className="font-semibold mb-2">Obtenha suas credenciais</h4>
                  <p className="text-sm text-gray-600 mb-2">Crie uma conta merchant e gere sua API key no dashboard</p>
                  <Link href="/merchant">
                    <Button size="sm" variant="outline">Acessar Dashboard</Button>
                  </Link>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">2</div>
                <div>
                  <h4 className="font-semibold mb-2">Instale o SDK (opcional)</h4>
                  <pre className="bg-slate-900 text-green-400 p-3 rounded text-sm mt-2 relative group">
                    <code>npm install @parceltoken/sdk</code>
                    <button 
                      onClick={() => copyToClipboard('npm install @parceltoken/sdk')}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Copy className="w-4 h-4 text-gray-400 hover:text-white" />
                    </button>
                  </pre>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">3</div>
                <div>
                  <h4 className="font-semibold mb-2">Gere seu primeiro SmartQR</h4>
                  <Tabs defaultValue="curl" className="mt-2">
                    <TabsList>
                      <TabsTrigger value="curl">cURL</TabsTrigger>
                      <TabsTrigger value="js">JavaScript</TabsTrigger>
                      <TabsTrigger value="python">Python</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="curl">
                      <pre className="bg-slate-900 text-green-400 p-4 rounded text-xs overflow-x-auto relative group">
                        <code>{`curl -X POST https://api.parceltoken.com.br/api/trpc/merchant.createSmartQR \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "amount": 50000,
    "description": "Venda de produto",
    "maxInstallments": 4
  }'`}</code>
                        <button 
                          onClick={() => copyToClipboard(`curl -X POST https://api.parceltoken.com.br/api/trpc/merchant.createSmartQR -H "Authorization: Bearer YOUR_API_KEY" -H "Content-Type: application/json" -d '{"amount": 50000, "description": "Venda de produto", "maxInstallments": 4}'`)}
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Copy className="w-4 h-4 text-gray-400 hover:text-white" />
                        </button>
                      </pre>
                    </TabsContent>

                    <TabsContent value="js">
                      <pre className="bg-slate-900 text-green-400 p-4 rounded text-xs overflow-x-auto relative group">
                        <code>{`import ParcelToken from '@parceltoken/sdk';

const client = new ParcelToken('YOUR_API_KEY');

const qr = await client.createSmartQR({
  amount: 50000, // R$ 500,00 em centavos
  description: 'Venda de produto',
  maxInstallments: 4
});

console.log('QR Code:', qr.qrCode);
console.log('QR ID:', qr.qrId);`}</code>
                        <button 
                          onClick={() => copyToClipboard(`import ParcelToken from '@parceltoken/sdk';\n\nconst client = new ParcelToken('YOUR_API_KEY');\n\nconst qr = await client.createSmartQR({\n  amount: 50000,\n  description: 'Venda de produto',\n  maxInstallments: 4\n});`)}
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Copy className="w-4 h-4 text-gray-400 hover:text-white" />
                        </button>
                      </pre>
                    </TabsContent>

                    <TabsContent value="python">
                      <pre className="bg-slate-900 text-green-400 p-4 rounded text-xs overflow-x-auto relative group">
                        <code>{`from parceltoken import ParcelToken

client = ParcelToken(api_key='YOUR_API_KEY')

qr = client.create_smart_qr(
    amount=50000,  # R$ 500,00 em centavos
    description='Venda de produto',
    max_installments=4
)

print(f"QR Code: {qr['qrCode']}")
print(f"QR ID: {qr['qrId']}")`}</code>
                        <button 
                          onClick={() => copyToClipboard(`from parceltoken import ParcelToken\n\nclient = ParcelToken(api_key='YOUR_API_KEY')\n\nqr = client.create_smart_qr(\n    amount=50000,\n    description='Venda de produto',\n    max_installments=4\n)`)}
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Copy className="w-4 h-4 text-gray-400 hover:text-white" />
                        </button>
                      </pre>
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-xl font-bold mb-4">Próximos Passos</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <button 
                onClick={() => setSelectedEndpoint('auth')}
                className="p-4 border rounded-lg hover:border-blue-500 transition-colors text-left"
              >
                <Key className="w-6 h-6 text-blue-600 mb-2" />
                <h4 className="font-semibold mb-1">Autenticação</h4>
                <p className="text-sm text-gray-600">Aprenda sobre API keys e segurança</p>
              </button>

              <button 
                onClick={() => setSelectedEndpoint('webhooks')}
                className="p-4 border rounded-lg hover:border-green-500 transition-colors text-left"
              >
                <Zap className="w-6 h-6 text-green-600 mb-2" />
                <h4 className="font-semibold mb-1">Webhooks</h4>
                <p className="text-sm text-gray-600">Receba notificações em tempo real</p>
              </button>

              <button 
                onClick={() => setSelectedEndpoint('tokens')}
                className="p-4 border rounded-lg hover:border-purple-500 transition-colors text-left"
              >
                <Shield className="w-6 h-6 text-purple-600 mb-2" />
                <h4 className="font-semibold mb-1">ParcelTokens</h4>
                <p className="text-sm text-gray-600">Entenda o sistema de tokens</p>
              </button>
            </div>
          </Card>
        </div>
      )
    },
    {
      id: 'auth',
      name: '🔐 Autenticação',
      description: 'API Keys e segurança',
      content: (
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-xl font-bold mb-4">Autenticação via API Key</h3>
            <p className="text-gray-600 mb-4">
              Todas as requisições à API devem incluir sua API key no header <code className="bg-slate-100 px-2 py-1 rounded">Authorization</code>.
            </p>

            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-4">
              <p className="text-sm">
                <strong>⚠️ Importante:</strong> Nunca exponha sua API key em código client-side. Use variáveis de ambiente e mantenha-a no backend.
              </p>
            </div>

            <h4 className="font-semibold mb-2">Exemplo de Requisição</h4>
            <pre className="bg-slate-900 text-green-400 p-4 rounded text-sm overflow-x-auto">
              <code>{`Authorization: Bearer pt_live_abc123xyz456`}</code>
            </pre>

            <h4 className="font-semibold mt-6 mb-2">Tipos de API Keys</h4>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-semibold">SANDBOX</span>
                  <code className="text-sm">pt_test_...</code>
                </div>
                <p className="text-sm text-gray-600">Para testes e desenvolvimento. Não processa pagamentos reais.</p>
              </div>

              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-semibold">PRODUÇÃO</span>
                  <code className="text-sm">pt_live_...</code>
                </div>
                <p className="text-sm text-gray-600">Para ambiente de produção. Processa pagamentos reais.</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-xl font-bold mb-4">Rate Limits</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded">
                <span className="font-semibold">Requisições por minuto</span>
                <span className="text-blue-600 font-bold">100</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded">
                <span className="font-semibold">Requisições por hora</span>
                <span className="text-blue-600 font-bold">5.000</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded">
                <span className="font-semibold">Requisições por dia</span>
                <span className="text-blue-600 font-bold">50.000</span>
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-4">
              Se você precisar de limites maiores, entre em contato com nosso time comercial.
            </p>
          </Card>
        </div>
      )
    },
    {
      id: 'tokens',
      name: '🎫 ParcelTokens',
      description: 'Sistema de tokens reutilizáveis',
      content: (
        <div className="space-y-6">
          <Card className="p-6 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
            <h3 className="text-xl font-bold mb-4">O que é um ParcelToken?</h3>
            <p className="text-gray-700 mb-4">
              O ParcelToken (P₮) é um token digital reutilizável que representa um limite de crédito pré-aprovado. 
              O consumidor cria o token uma vez e pode usá-lo em múltiplas compras, em diferentes merchants.
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg">
                <CheckCircle2 className="w-6 h-6 text-green-600 mb-2" />
                <h4 className="font-semibold mb-1">Reutilizável</h4>
                <p className="text-sm text-gray-600">Use em múltiplas compras até esgotar o limite</p>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <CheckCircle2 className="w-6 h-6 text-blue-600 mb-2" />
                <h4 className="font-semibold mb-1">Universal</h4>
                <p className="text-sm text-gray-600">Funciona em todos os merchants parceiros</p>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <CheckCircle2 className="w-6 h-6 text-purple-600 mb-2" />
                <h4 className="font-semibold mb-1">Dinâmico</h4>
                <p className="text-sm text-gray-600">Saldo liberado conforme parcelas são pagas</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-xl font-bold mb-4">Endpoints de ParcelToken</h3>
            
            <div className="space-y-4">
              <div className="border-l-4 border-blue-500 pl-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-semibold">GET</span>
                  <code className="text-sm">/api/trpc/user.getActiveToken</code>
                </div>
                <p className="text-sm text-gray-600 mb-2">Obter ParcelToken ativo do usuário</p>
                <Tabs defaultValue="response">
                  <TabsList>
                    <TabsTrigger value="response">Response</TabsTrigger>
                    <TabsTrigger value="curl">cURL</TabsTrigger>
                  </TabsList>
                  <TabsContent value="response">
                    <pre className="bg-slate-900 text-green-400 p-3 rounded text-xs overflow-x-auto mt-2">
                      <code>{JSON.stringify({
                        id: 1,
                        creditLimit: 5000000,
                        usedAmount: 2500000,
                        availableAmount: 2500000,
                        status: "active",
                        tier: "GOLD",
                        expiresAt: "2025-12-31T23:59:59Z",
                        createdAt: "2025-01-01T00:00:00Z"
                      }, null, 2)}</code>
                    </pre>
                  </TabsContent>
                  <TabsContent value="curl">
                    <pre className="bg-slate-900 text-green-400 p-3 rounded text-xs overflow-x-auto mt-2">
                      <code>{`curl -X GET https://api.parceltoken.com.br/api/trpc/user.getActiveToken \\
  -H "Authorization: Bearer YOUR_API_KEY"`}</code>
                    </pre>
                  </TabsContent>
                </Tabs>
              </div>

              <div className="border-l-4 border-green-500 pl-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-semibold">POST</span>
                  <code className="text-sm">/api/trpc/user.reuseToken</code>
                </div>
                <p className="text-sm text-gray-600 mb-2">Reutilizar token em nova compra</p>
                <Tabs defaultValue="request">
                  <TabsList>
                    <TabsTrigger value="request">Request</TabsTrigger>
                    <TabsTrigger value="response">Response</TabsTrigger>
                  </TabsList>
                  <TabsContent value="request">
                    <pre className="bg-slate-900 text-green-400 p-3 rounded text-xs overflow-x-auto mt-2">
                      <code>{JSON.stringify({
                        amount: 150000,
                        merchantId: 5,
                        installments: 3,
                        description: "Nova compra"
                      }, null, 2)}</code>
                    </pre>
                  </TabsContent>
                  <TabsContent value="response">
                    <pre className="bg-slate-900 text-green-400 p-3 rounded text-xs overflow-x-auto mt-2">
                      <code>{JSON.stringify({
                        transactionId: 789,
                        status: "completed",
                        newBalance: 1000000,
                        installmentPlan: {
                          totalInstallments: 3,
                          installmentAmount: 50000,
                          firstDueDate: "2025-02-09"
                        }
                      }, null, 2)}</code>
                    </pre>
                  </TabsContent>
                </Tabs>
              </div>

              <div className="border-l-4 border-purple-500 pl-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-semibold">GET</span>
                  <code className="text-sm">/api/trpc/user.tokenHistory</code>
                </div>
                <p className="text-sm text-gray-600 mb-2">Histórico de uso do token</p>
                <pre className="bg-slate-900 text-green-400 p-3 rounded text-xs overflow-x-auto mt-2">
                  <code>{JSON.stringify([
                    {
                      transactionId: 123,
                      merchantName: "Loja ABC",
                      amount: 250000,
                      installments: 4,
                      date: "2025-01-05T14:30:00Z"
                    },
                    {
                      transactionId: 456,
                      merchantName: "Loja XYZ",
                      amount: 100000,
                      installments: 2,
                      date: "2025-01-08T10:15:00Z"
                    }
                  ], null, 2)}</code>
                </pre>
              </div>
            </div>
          </Card>
        </div>
      )
    },
    {
      id: 'smartqr',
      name: '📱 SmartQR',
      description: 'Geração e processamento de QR codes',
      content: (
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-xl font-bold mb-4">Criar SmartQR</h3>
            <div className="border-l-4 border-green-500 pl-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-semibold">POST</span>
                <code className="text-sm">/api/trpc/merchant.createSmartQR</code>
              </div>
              <p className="text-sm text-gray-600 mb-4">Gera um SmartQR para receber pagamentos</p>
              
              <Tabs defaultValue="request">
                <TabsList>
                  <TabsTrigger value="request">Request Body</TabsTrigger>
                  <TabsTrigger value="response">Response</TabsTrigger>
                  <TabsTrigger value="curl">cURL</TabsTrigger>
                  <TabsTrigger value="js">JavaScript</TabsTrigger>
                </TabsList>

                <TabsContent value="request">
                  <pre className="bg-slate-900 text-green-400 p-4 rounded text-xs overflow-x-auto mt-2">
                    <code>{JSON.stringify({
                      amount: 50000,
                      description: "Venda de produto X",
                      maxInstallments: 4,
                      cashbackPercentage: 0,
                      discountPercentage: 5
                    }, null, 2)}</code>
                  </pre>
                  <div className="mt-4 space-y-2 text-sm">
                    <p><strong>amount</strong> (number): Valor em centavos (50000 = R$ 500,00)</p>
                    <p><strong>description</strong> (string): Descrição da compra</p>
                    <p><strong>maxInstallments</strong> (number): Máximo de parcelas permitidas (1-12)</p>
                    <p><strong>cashbackPercentage</strong> (number, opcional): Percentual de cashback (0-10)</p>
                    <p><strong>discountPercentage</strong> (number, opcional): Percentual de desconto (0-20)</p>
                  </div>
                </TabsContent>

                <TabsContent value="response">
                  <pre className="bg-slate-900 text-green-400 p-4 rounded text-xs overflow-x-auto mt-2">
                    <code>{JSON.stringify({
                      qrId: 123,
                      qrCode: "parceltoken://qr/123",
                      qrData: {
                        version: "1.0",
                        merchantId: 1,
                        merchantName: "Loja ABC",
                        amount: 50000,
                        description: "Venda de produto X",
                        maxInstallments: 4,
                        expiresAt: "2025-01-09T23:59:59Z"
                      },
                      qrImageUrl: "https://api.parceltoken.com.br/qr/123.svg",
                      createdAt: "2025-01-09T14:30:00Z"
                    }, null, 2)}</code>
                  </pre>
                </TabsContent>

                <TabsContent value="curl">
                  <pre className="bg-slate-900 text-green-400 p-4 rounded text-xs overflow-x-auto mt-2 relative group">
                    <code>{`curl -X POST https://api.parceltoken.com.br/api/trpc/merchant.createSmartQR \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "amount": 50000,
    "description": "Venda de produto X",
    "maxInstallments": 4,
    "discountPercentage": 5
  }'`}</code>
                    <button 
                      onClick={() => copyToClipboard(`curl -X POST https://api.parceltoken.com.br/api/trpc/merchant.createSmartQR -H "Authorization: Bearer YOUR_API_KEY" -H "Content-Type: application/json" -d '{"amount": 50000, "description": "Venda de produto X", "maxInstallments": 4}'`)}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Copy className="w-4 h-4 text-gray-400 hover:text-white" />
                    </button>
                  </pre>
                </TabsContent>

                <TabsContent value="js">
                  <pre className="bg-slate-900 text-green-400 p-4 rounded text-xs overflow-x-auto mt-2 relative group">
                    <code>{`const qr = await client.createSmartQR({
  amount: 50000,
  description: 'Venda de produto X',
  maxInstallments: 4,
  discountPercentage: 5
});

// Exibir QR Code na tela
document.getElementById('qr-image').src = qr.qrImageUrl;
console.log('QR ID:', qr.qrId);`}</code>
                    <button 
                      onClick={() => copyToClipboard(`const qr = await client.createSmartQR({\n  amount: 50000,\n  description: 'Venda de produto X',\n  maxInstallments: 4\n});`)}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Copy className="w-4 h-4 text-gray-400 hover:text-white" />
                    </button>
                  </pre>
                </TabsContent>
              </Tabs>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-xl font-bold mb-4">Processar Pagamento via SmartQR</h3>
            <div className="border-l-4 border-blue-500 pl-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-semibold">POST</span>
                <code className="text-sm">/api/trpc/smartqr.process</code>
              </div>
              <p className="text-sm text-gray-600 mb-4">Processa pagamento escaneando SmartQR (detecta token ativo automaticamente)</p>
              
              <pre className="bg-slate-900 text-green-400 p-4 rounded text-xs overflow-x-auto">
                <code>{JSON.stringify({
                  qrId: 123,
                  useExistingToken: true,
                  installments: 3
                }, null, 2)}</code>
              </pre>
            </div>
          </Card>
        </div>
      )
    },
    {
      id: 'webhooks',
      name: '⚡ Webhooks',
      description: 'Notificações em tempo real',
      content: (
        <div className="space-y-6">
          <Card className="p-6 bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
            <h3 className="text-xl font-bold mb-4">Como Funcionam os Webhooks</h3>
            <p className="text-gray-700 mb-4">
              Webhooks permitem que você receba notificações em tempo real sobre eventos importantes, como pagamentos confirmados, 
              parcelas vencidas ou tokens revogados.
            </p>
            <div className="bg-white p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Eventos Disponíveis</h4>
              <div className="grid md:grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <code>qr.scanned</code>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <code>payment.completed</code>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <code>installment.paid</code>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <code>installment.overdue</code>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <code>token.issued</code>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <code>token.revoked</code>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-xl font-bold mb-4">Configurar Webhook</h3>
            <p className="text-sm text-gray-600 mb-4">
              Configure webhooks no dashboard ou via API:
            </p>
            
            <Tabs defaultValue="dashboard">
              <TabsList>
                <TabsTrigger value="dashboard">Via Dashboard</TabsTrigger>
                <TabsTrigger value="api">Via API</TabsTrigger>
              </TabsList>

              <TabsContent value="dashboard">
                <div className="space-y-4">
                  <p className="text-sm">Acesse <Link href="/webhook-management"><a className="text-blue-600 underline">Webhook Management</a></Link> no dashboard e:</p>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                    <li>Insira a URL do seu endpoint (ex: https://seusite.com/webhooks)</li>
                    <li>Selecione os eventos que deseja monitorar</li>
                    <li>Copie o secret para validar assinaturas</li>
                    <li>Clique em "Criar Webhook"</li>
                  </ol>
                </div>
              </TabsContent>

              <TabsContent value="api">
                <pre className="bg-slate-900 text-green-400 p-4 rounded text-xs overflow-x-auto">
                  <code>{`curl -X POST https://api.parceltoken.com.br/api/trpc/webhook.register \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "url": "https://seusite.com/webhooks",
    "events": ["payment.completed", "installment.paid"],
    "active": true
  }'`}</code>
                </pre>
              </TabsContent>
            </Tabs>
          </Card>

          <Card className="p-6">
            <h3 className="text-xl font-bold mb-4">Validar Assinatura do Webhook</h3>
            <p className="text-sm text-gray-600 mb-4">
              Todos os webhooks incluem uma assinatura HMAC-SHA256 no header <code className="bg-slate-100 px-2 py-1 rounded">X-ParcelToken-Signature</code>. 
              Valide para garantir que a requisição veio da ParcelToken.
            </p>

            <Tabs defaultValue="nodejs">
              <TabsList>
                <TabsTrigger value="nodejs">Node.js</TabsTrigger>
                <TabsTrigger value="python">Python</TabsTrigger>
              </TabsList>

              <TabsContent value="nodejs">
                <pre className="bg-slate-900 text-green-400 p-4 rounded text-xs overflow-x-auto relative group">
                  <code>{`const crypto = require('crypto');

function validateWebhook(payload, signature, secret) {
  const hmac = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');
  
  return hmac === signature;
}

// No seu endpoint de webhook
app.post('/webhooks', (req, res) => {
  const signature = req.headers['x-parceltoken-signature'];
  const secret = process.env.WEBHOOK_SECRET;
  
  if (!validateWebhook(req.body, signature, secret)) {
    return res.status(401).send('Invalid signature');
  }
  
  // Processar evento
  const { event, data } = req.body;
  console.log('Evento recebido:', event, data);
  
  res.status(200).send('OK');
});`}</code>
                  <button 
                    onClick={() => copyToClipboard(`const crypto = require('crypto');\n\nfunction validateWebhook(payload, signature, secret) {\n  const hmac = crypto.createHmac('sha256', secret).update(JSON.stringify(payload)).digest('hex');\n  return hmac === signature;\n}`)}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Copy className="w-4 h-4 text-gray-400 hover:text-white" />
                  </button>
                </pre>
              </TabsContent>

              <TabsContent value="python">
                <pre className="bg-slate-900 text-green-400 p-4 rounded text-xs overflow-x-auto relative group">
                  <code>{`import hmac
import hashlib
import json

def validate_webhook(payload, signature, secret):
    hmac_obj = hmac.new(
        secret.encode(),
        json.dumps(payload).encode(),
        hashlib.sha256
    )
    return hmac_obj.hexdigest() == signature

# No seu endpoint de webhook
@app.route('/webhooks', methods=['POST'])
def webhook():
    signature = request.headers.get('X-ParcelToken-Signature')
    secret = os.getenv('WEBHOOK_SECRET')
    
    if not validate_webhook(request.json, signature, secret):
        return 'Invalid signature', 401
    
    # Processar evento
    event = request.json.get('event')
    data = request.json.get('data')
    print(f'Evento recebido: {event}', data)
    
    return 'OK', 200`}</code>
                  <button 
                    onClick={() => copyToClipboard(`import hmac\nimport hashlib\nimport json\n\ndef validate_webhook(payload, signature, secret):\n    hmac_obj = hmac.new(secret.encode(), json.dumps(payload).encode(), hashlib.sha256)\n    return hmac_obj.hexdigest() == signature`)}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Copy className="w-4 h-4 text-gray-400 hover:text-white" />
                  </button>
                </pre>
              </TabsContent>
            </Tabs>
          </Card>

          <Card className="p-6">
            <h3 className="text-xl font-bold mb-4">Exemplo de Payload</h3>
            <pre className="bg-slate-900 text-green-400 p-4 rounded text-xs overflow-x-auto">
              <code>{JSON.stringify({
                event: "payment.completed",
                timestamp: "2025-01-09T14:30:00Z",
                data: {
                  transactionId: 789,
                  merchantId: 1,
                  amount: 50000,
                  installments: 3,
                  paymentMethod: "parceltoken",
                  status: "completed"
                }
              }, null, 2)}</code>
            </pre>
          </Card>
        </div>
      )
    },
    {
      id: 'pix',
      name: '💰 PIX',
      description: 'Integração com PIX',
      content: (
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-xl font-bold mb-4">Gerar Cobrança PIX</h3>
            <div className="border-l-4 border-green-500 pl-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-semibold">POST</span>
                <code className="text-sm">/api/trpc/pix.generateCharge</code>
              </div>
              <p className="text-sm text-gray-600 mb-4">Gera cobrança PIX para pagamento de parcela</p>
              
              <Tabs defaultValue="request">
                <TabsList>
                  <TabsTrigger value="request">Request</TabsTrigger>
                  <TabsTrigger value="response">Response</TabsTrigger>
                </TabsList>

                <TabsContent value="request">
                  <pre className="bg-slate-900 text-green-400 p-4 rounded text-xs overflow-x-auto mt-2">
                    <code>{JSON.stringify({
                      installmentPaymentId: 123,
                      amount: 16667,
                      description: "Parcela 1/3 - Compra Loja ABC"
                    }, null, 2)}</code>
                  </pre>
                </TabsContent>

                <TabsContent value="response">
                  <pre className="bg-slate-900 text-green-400 p-4 rounded text-xs overflow-x-auto mt-2">
                    <code>{JSON.stringify({
                      chargeId: "PIX123456",
                      qrCode: "00020126580014br.gov.bcb.pix...",
                      qrCodeImage: "data:image/png;base64,iVBORw0KGgo...",
                      expiresAt: "2025-01-09T15:30:00Z",
                      amount: 16667,
                      status: "pending"
                    }, null, 2)}</code>
                  </pre>
                </TabsContent>
              </Tabs>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-xl font-bold mb-4">Verificar Status da Cobrança</h3>
            <div className="border-l-4 border-blue-500 pl-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-semibold">GET</span>
                <code className="text-sm">/api/trpc/pix.checkStatus</code>
              </div>
              <p className="text-sm text-gray-600 mb-4">Verifica status de pagamento da cobrança PIX</p>
              
              <pre className="bg-slate-900 text-green-400 p-4 rounded text-xs overflow-x-auto">
                <code>{`// Request
{ "chargeId": "PIX123456" }

// Response
{
  "status": "paid",
  "paidAt": "2025-01-09T14:35:00Z",
  "amount": 16667
}`}</code>
              </pre>
            </div>
          </Card>

          <Card className="p-6 bg-blue-50 border-blue-200">
            <h3 className="text-xl font-bold mb-4">Webhook de Confirmação PIX</h3>
            <p className="text-gray-700 mb-4">
              Quando um pagamento PIX é confirmado, enviamos um webhook <code className="bg-white px-2 py-1 rounded">payment.completed</code> 
              para sua URL configurada. O status da parcela é atualizado automaticamente.
            </p>
            <pre className="bg-slate-900 text-green-400 p-4 rounded text-xs overflow-x-auto">
              <code>{JSON.stringify({
                event: "payment.completed",
                data: {
                  chargeId: "PIX123456",
                  installmentPaymentId: 123,
                  amount: 16667,
                  paidAt: "2025-01-09T14:35:00Z"
                }
              }, null, 2)}</code>
            </pre>
          </Card>
        </div>
      )
    }
  ];

  const currentSection = sections.find(s => s.id === selectedEndpoint);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <Code2 className="w-10 h-10 text-blue-600" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Documentação da API
            </h1>
          </div>
          <p className="text-xl text-gray-600 mb-6">
            Integre ParcelToken Pay em minutos com nossa API REST completa e SDKs oficiais
          </p>

          <div className="flex gap-3">
            <Link href="/sdk">
              <Button variant="outline" size="lg">
                <ExternalLink className="w-4 h-4 mr-2" />
                SDK JavaScript
              </Button>
            </Link>
            <Link href="/integrations">
              <Button variant="outline" size="lg">
                <ExternalLink className="w-4 h-4 mr-2" />
                Integrações
              </Button>
            </Link>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4 p-4">
              <h3 className="font-semibold text-gray-900 mb-4">
                Navegação
              </h3>
              <div className="space-y-1">
                {sections.map(section => (
                  <button
                    key={section.id}
                    onClick={() => setSelectedEndpoint(section.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors text-sm ${
                      selectedEndpoint === section.id
                        ? 'bg-blue-100 text-blue-900 font-semibold'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {section.name}
                  </button>
                ))}
              </div>
            </Card>
          </div>

          {/* Content */}
          <div className="lg:col-span-4">
            {currentSection && (
              <div>
                <Card className="p-6 bg-white border-blue-200 mb-6">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    {currentSection.name}
                  </h2>
                  <p className="text-gray-600">
                    {currentSection.description}
                  </p>
                </Card>
                {currentSection.content}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
