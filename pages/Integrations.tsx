import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, ExternalLink, Code, CheckCircle2, Clock } from "lucide-react";

export default function Integrations() {
  const integrations = [
    {
      name: 'WooCommerce',
      category: 'E-commerce',
      status: 'available',
      description: 'Plugin oficial para integrar ParcelToken em lojas WooCommerce',
      features: ['Checkout embarcado', 'Sincronização de pedidos', 'Webhooks', 'Dashboard'],
      icon: '🛒',
      downloadUrl: '#',
      docsUrl: '#'
    },
    {
      name: 'Shopify',
      category: 'E-commerce',
      status: 'coming',
      description: 'App Shopify para aceitar ParcelToken como método de pagamento',
      features: ['Integração nativa', 'Análise de vendas', 'Suporte a múltiplas lojas'],
      icon: '🏪',
      downloadUrl: '#',
      docsUrl: '#'
    },
    {
      name: 'Magento',
      category: 'E-commerce',
      status: 'coming',
      description: 'Extensão para Magento 2.x com suporte completo a ParcelToken',
      features: ['Checkout avançado', 'Relatórios detalhados', 'API REST'],
      icon: '📦',
      downloadUrl: '#',
      docsUrl: '#'
    },
    {
      name: 'JavaScript SDK',
      category: 'Desenvolvimento',
      status: 'available',
      description: 'Biblioteca JavaScript para integração em qualquer site',
      features: ['Checkout embarcado', 'Suporte a TypeScript', 'Callbacks', 'Webhooks'],
      icon: '⚙️',
      downloadUrl: '#',
      docsUrl: '/sdk'
    },
    {
      name: 'REST API',
      category: 'Desenvolvimento',
      status: 'available',
      description: 'API REST completa para integração backend',
      features: ['Autenticação OAuth2', 'Rate limiting', 'Webhooks', 'Sandbox'],
      icon: '🔌',
      downloadUrl: '#',
      docsUrl: '/api-docs'
    },
    {
      name: 'Python SDK',
      category: 'Desenvolvimento',
      status: 'coming',
      description: 'Biblioteca Python para integração em aplicações backend',
      features: ['Type hints', 'Async support', 'Logging completo'],
      icon: '🐍',
      downloadUrl: '#',
      docsUrl: '#'
    },
    {
      name: 'Nuvemshop',
      category: 'E-commerce',
      status: 'coming',
      description: 'App Nuvemshop para lojas brasileiras',
      features: ['Integração 1-click', 'Suporte em português', 'Chat ao vivo'],
      icon: '☁️',
      downloadUrl: '#',
      docsUrl: '#'
    },
    {
      name: 'Zapier',
      category: 'Automação',
      status: 'coming',
      description: 'Integração com Zapier para automações',
      features: ['Triggers', 'Actions', 'Suporte a 5000+ apps'],
      icon: '⚡',
      downloadUrl: '#',
      docsUrl: '#'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 dark:bg-green-900 text-green-900 dark:text-green-100';
      case 'coming':
        return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-900 dark:text-yellow-100';
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'available':
        return 'Disponível';
      case 'coming':
        return 'Em Breve';
      default:
        return 'Beta';
    }
  };

  const getStatusIcon = (status: string) => {
    return status === 'available' ? (
      <CheckCircle2 className="w-4 h-4" />
    ) : (
      <Clock className="w-4 h-4" />
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <Code className="w-8 h-8 text-blue-600" />
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
              Integrações
            </h1>
          </div>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Integre ParcelToken em sua plataforma com plugins, SDKs e APIs prontos para usar
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-8 flex-wrap">
          {['Todos', 'E-commerce', 'Desenvolvimento', 'Automação'].map((category) => (
            <Button
              key={category}
              variant="outline"
              className="rounded-full"
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Integrations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {integrations.map((integration, idx) => (
            <Card
              key={idx}
              className="p-6 bg-white dark:bg-slate-900 hover:shadow-lg transition-shadow"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="text-4xl">{integration.icon}</div>
                <Badge className={getStatusColor(integration.status)}>
                  <span className="flex items-center gap-1">
                    {getStatusIcon(integration.status)}
                    {getStatusLabel(integration.status)}
                  </span>
                </Badge>
              </div>

              {/* Title and Category */}
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                {integration.name}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
                {integration.category}
              </p>

              {/* Description */}
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                {integration.description}
              </p>

              {/* Features */}
              <div className="mb-4">
                <p className="text-xs font-semibold text-slate-900 dark:text-white mb-2">
                  Recursos:
                </p>
                <div className="flex flex-wrap gap-1">
                  {integration.features.map((feature, fidx) => (
                    <Badge
                      key={fidx}
                      variant="outline"
                      className="text-xs"
                    >
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                {integration.status === 'available' && (
                  <>
                    <Button
                      size="sm"
                      className="flex-1"
                      variant="outline"
                      asChild
                    >
                      <a href={integration.downloadUrl}>
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </a>
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1"
                      variant="outline"
                      asChild
                    >
                      <a href={integration.docsUrl}>
                        <ExternalLink className="w-4 h-4 mr-1" />
                        Docs
                      </a>
                    </Button>
                  </>
                )}
                {integration.status === 'coming' && (
                  <Button
                    size="sm"
                    className="w-full"
                    disabled
                  >
                    Em Breve
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>

        {/* Quick Start Section */}
        <Card className="p-8 bg-white dark:bg-slate-900 mb-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
            Comece Rapidamente
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                step: '1',
                title: 'Escolha sua integração',
                description: 'Selecione o plugin ou SDK que melhor se adequa à sua plataforma'
              },
              {
                step: '2',
                title: 'Instale e configure',
                description: 'Siga as instruções de instalação e configure suas credenciais'
              },
              {
                step: '3',
                title: 'Comece a aceitar pagamentos',
                description: 'Seus clientes podem agora pagar com ParcelToken'
              }
            ].map((item, idx) => (
              <div key={idx} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-100 font-bold text-lg mb-4">
                  {item.step}
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </Card>

        {/* Support Section */}
        <Card className="p-8 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border border-blue-200 dark:border-blue-900">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                Precisa de Ajuda?
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Nossa equipe está pronta para ajudar você a integrar ParcelToken em sua plataforma.
              </p>
              <div className="space-y-3">
                <Button asChild>
                  <a href="https://docs.parceltoken.com" target="_blank" rel="noopener noreferrer">
                    Ver Documentação Completa
                  </a>
                </Button>
                <Button variant="outline" asChild>
                  <a href="mailto:support@parceltoken.com">
                    Contatar Suporte
                  </a>
                </Button>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                Recursos Disponíveis
              </h3>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li className="flex gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span>Documentação detalhada</span>
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span>Exemplos de código</span>
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span>Suporte técnico 24/7</span>
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span>Comunidade ativa</span>
                </li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
