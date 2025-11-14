import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import SmartQRDemo from "@/components/SmartQRDemo";
import { APP_LOGO, APP_TITLE, formatCurrency, formatPercentage, getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { 
  ArrowRight, 
  CheckCircle2, 
  CreditCard, 
  DollarSign, 
  LineChart, 
  QrCode, 
  Shield, 
  TrendingUp,
  Zap,
  Users,
  Store,
  Sparkles
} from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const { data: stats } = trpc.public.stats.useQuery();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">PT</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                {APP_TITLE}
              </span>
            </div>
            
            <nav className="hidden md:flex items-center gap-6">
              <a href="#como-funciona" className="text-gray-600 hover:text-primary transition-colors">
                Como Funciona
              </a>
              <a href="#beneficios" className="text-gray-600 hover:text-primary transition-colors">
                Benefícios
              </a>
              <a href="#comparacao" className="text-gray-600 hover:text-primary transition-colors">
                Comparação
              </a>
            </nav>

            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <>
                  <Link href="/dashboard">
                    <Button variant="outline">Dashboard</Button>
                  </Link>
                  <Link href="/merchant">
                    <Button>Área Merchant</Button>
                  </Link>
                </>
              ) : (
                <>
                  <a href={getLoginUrl('/dashboard')}>
                    <Button variant="outline">Entrar</Button>
                  </a>
                  <a href={getLoginUrl('/dashboard')}>
                    <Button className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700">
                      Começar Agora
                    </Button>
                  </a>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              <span>Revolucionando pagamentos no Brasil</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
              ParcelToken Pay —{" "}
              <span className="bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                Parcela via PIX. Lojista recebe na hora.
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 leading-relaxed">
              <strong>Sem cartão. Sem burocracia.</strong> Parcelamento inteligente com <strong>token reutilizável</strong>. 
              Crie seu ParcelToken uma vez e use em <strong>qualquer loja parceira</strong>. 
              Você parcela, o lojista recebe à vista via PIX.
            </p>
            
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Shield className="w-4 h-4" />
              <span>Tecnologia baseada em <strong>Open Finance</strong> | Compliance LGPD e AML</span>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <a href="#smartqr-demo">
                <Button size="lg" className="w-full sm:w-auto text-lg bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700">
                  Teste SmartQR — Demo
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </a>
              <Link href="/merchant">
                <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg">
                  Criar Conta Merchant
                </Button>
              </Link>
            </div>

            {/* Stats */}
            {stats && (
              <div className="grid grid-cols-3 gap-6 pt-8 border-t">
                <div>
                  <div className="text-3xl font-bold text-green-600">
                    {stats.totalUsers.toLocaleString('pt-BR')}+
                  </div>
                  <div className="text-sm text-gray-600">Usuários Ativos</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-blue-600">
                    {stats.totalMerchants.toLocaleString('pt-BR')}+
                  </div>
                  <div className="text-sm text-gray-600">Merchants</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-purple-600">
                    {formatCurrency(stats.totalSavings)}
                  </div>
                  <div className="text-sm text-gray-600">Economizados</div>
                </div>
              </div>
            )}
          </div>

          <div className="relative">
            <div className="bg-gradient-to-br from-green-500 via-blue-500 to-purple-500 rounded-3xl p-8 shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-300">
              <div className="bg-white rounded-2xl p-8 transform -rotate-3">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">ParcelToken Ativo</span>
                    <Shield className="w-5 h-5 text-green-600" />
                  </div>
                  
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Limite Disponível</div>
                    <div className="text-4xl font-bold text-gray-900">R$ 2.000,00</div>
                  </div>

                  <div className="bg-gray-100 rounded-xl p-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Parcelas</span>
                      <span className="font-semibold">até 4x sem juros</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Taxa</span>
                      <span className="font-semibold text-green-600">0,5% (vs 3,5%)</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Economia</span>
                      <span className="font-semibold text-green-600">+R$ 247,89</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-2 bg-green-50 text-green-700 py-3 rounded-lg">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="font-medium">Aprovado Instantaneamente</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Diagrama Animado do Fluxo */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-blue-50 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Veja Como É Simples</h2>
            <p className="text-lg text-gray-600">Do escaneamento ao pagamento em segundos</p>
          </div>

          {/* Diagrama Animado */}
          <div className="relative max-w-6xl mx-auto">
            {/* Linha de conexão animada */}
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-green-200 via-blue-200 to-purple-200 -translate-y-1/2 hidden md:block">
              <div className="h-full bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 animate-pulse"></div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-8 relative">
              {/* Cliente */}
              <div className="flex flex-col items-center group">
                <div className="w-20 h-20 md:w-24 md:h-24 bg-white rounded-full shadow-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 border-4 border-green-500 animate-bounce" style={{animationDelay: '0s', animationDuration: '2s'}}>
                  <Users className="w-10 h-10 md:w-12 md:h-12 text-green-600" />
                </div>
                <span className="text-sm md:text-base font-semibold text-center">Cliente</span>
              </div>

              {/* Seta 1 */}
              <div className="hidden md:flex items-center justify-center">
                <ArrowRight className="w-8 h-8 text-green-500 animate-pulse" style={{animationDelay: '0.5s'}} />
              </div>

              {/* SmartQR */}
              <div className="flex flex-col items-center group">
                <div className="w-20 h-20 md:w-24 md:h-24 bg-white rounded-full shadow-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 border-4 border-blue-500 animate-bounce" style={{animationDelay: '0.5s', animationDuration: '2s'}}>
                  <QrCode className="w-10 h-10 md:w-12 md:h-12 text-blue-600" />
                </div>
                <span className="text-sm md:text-base font-semibold text-center">SmartQR</span>
              </div>

              {/* Seta 2 */}
              <div className="hidden md:flex items-center justify-center">
                <ArrowRight className="w-8 h-8 text-blue-500 animate-pulse" style={{animationDelay: '1s'}} />
              </div>

              {/* Token P₮ */}
              <div className="flex flex-col items-center group">
                <div className="w-20 h-20 md:w-24 md:h-24 bg-white rounded-full shadow-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 border-4 border-purple-500 animate-bounce" style={{animationDelay: '1s', animationDuration: '2s'}}>
                  <div className="text-2xl md:text-3xl font-bold text-purple-600">P₮</div>
                </div>
                <span className="text-sm md:text-base font-semibold text-center">Token P₮</span>
              </div>

              {/* Seta 3 */}
              <div className="hidden md:flex items-center justify-center">
                <ArrowRight className="w-8 h-8 text-purple-500 animate-pulse" style={{animationDelay: '1.5s'}} />
              </div>

              {/* PIX */}
              <div className="flex flex-col items-center group">
                <div className="w-20 h-20 md:w-24 md:h-24 bg-white rounded-full shadow-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 border-4 border-teal-500 animate-bounce" style={{animationDelay: '1.5s', animationDuration: '2s'}}>
                  <Zap className="w-10 h-10 md:w-12 md:h-12 text-teal-600" />
                </div>
                <span className="text-sm md:text-base font-semibold text-center">PIX Instantâneo</span>
              </div>

              {/* Seta 4 */}
              <div className="hidden md:flex items-center justify-center">
                <ArrowRight className="w-8 h-8 text-teal-500 animate-pulse" style={{animationDelay: '2s'}} />
              </div>

              {/* Lojista */}
              <div className="flex flex-col items-center group">
                <div className="w-20 h-20 md:w-24 md:h-24 bg-white rounded-full shadow-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 border-4 border-orange-500 animate-bounce" style={{animationDelay: '2s', animationDuration: '2s'}}>
                  <Store className="w-10 h-10 md:w-12 md:h-12 text-orange-600" />
                </div>
                <span className="text-sm md:text-base font-semibold text-center">Lojista</span>
              </div>
            </div>
          </div>

          {/* Texto explicativo abaixo do diagrama */}
          <div className="mt-16 max-w-3xl mx-auto text-center">
            <p className="text-lg md:text-xl text-gray-700 leading-relaxed">
              Com <strong>ParcelToken Pay</strong>, você parcela sua compra via PIX e o lojista recebe na hora.
              <br />
              <span className="text-green-600 font-semibold">Sem cartão, sem burocracia, sem esperar.</span>
            </p>
          </div>
        </div>
      </section>

      {/* Como Funciona */}
      <section id="como-funciona" className="bg-white py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Como Funciona</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Três passos simples para revolucionar seus pagamentos
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="relative overflow-hidden group hover:shadow-xl transition-shadow">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-green-600"></div>
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <CreditCard className="w-8 h-8 text-green-600" />
                </div>
                <div className="text-6xl font-bold text-gray-100 absolute top-4 right-4">01</div>
                <h3 className="text-2xl font-bold mb-4">Gere seu ParcelToken</h3>
                <p className="text-gray-600">
                  Aprovação instantânea em menos de 2 segundos. Análise inteligente com Open Banking 
                  define seu limite de crédito automaticamente.
                </p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden group hover:shadow-xl transition-shadow">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-blue-600"></div>
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <QrCode className="w-8 h-8 text-blue-600" />
                </div>
                <div className="text-6xl font-bold text-gray-100 absolute top-4 right-4">02</div>
                <h3 className="text-2xl font-bold mb-4">Escaneie o SmartQR</h3>
                <p className="text-gray-600">
                  QR Code inteligente mostra todas as opções: parcelas, cashback, ofertas especiais. 
                  Escolha a melhor forma de pagamento para você.
                </p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden group hover:shadow-xl transition-shadow">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-purple-600"></div>
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Zap className="w-8 h-8 text-purple-600" />
                </div>
                <div className="text-6xl font-bold text-gray-100 absolute top-4 right-4">03</div>
                <h3 className="text-2xl font-bold mb-4">Pagamento Instantâneo</h3>
                <p className="text-gray-600">
                  Merchant recebe à vista via PIX (D+0). Você parcela sem juros. 
                  Todo mundo ganha, todo mundo economiza.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefícios */}
      <section id="beneficios" className="py-20 bg-gradient-to-br from-green-50 to-blue-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Por Que ParcelToken?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Benefícios reais para todos os envolvidos
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* Para Consumidores */}
            <div className="bg-white rounded-3xl p-8 shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold">Para Você</h3>
              </div>

              <ul className="space-y-4">
                {[
                  "Parcelamento sem cartão de crédito",
                  "Aprovação instantânea (< 2s)",
                  "Token reutilizável em múltiplos merchants",
                  "Transparência total de economia",
                  "Programa de recompensas gamificado",
                  "Até 85% de economia vs cartão tradicional"
                ].map((benefit, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Para Merchants */}
            <div className="bg-white rounded-3xl p-8 shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Store className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold">Para Seu Negócio</h3>
              </div>

              <ul className="space-y-4">
                {[
                  "Recebimento à vista via PIX (D+0)",
                  "MDR 60-70% menor (0,5% vs 2,5-4,5%)",
                  "Maior conversão no checkout (+15-25%)",
                  "Integração simples (SDK + API)",
                  "Dashboard completo de gestão",
                  "Redução de abandono de carrinho"
                ].map((benefit, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Comparação */}
      <section id="comparacao" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Comparação com Métodos Tradicionais</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Veja por que somos a melhor escolha
            </p>
          </div>

          <div className="max-w-5xl mx-auto overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-4 px-6 font-bold text-gray-700">Aspecto</th>
                  <th className="text-center py-4 px-6 font-bold text-green-600">ParcelToken</th>
                  <th className="text-center py-4 px-6 font-bold text-gray-500">Cartão Tradicional</th>
                  <th className="text-center py-4 px-6 font-bold text-gray-500">BNPL Tradicional</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { aspect: "MDR para Merchant", parcel: "0,5% - 1,5%", card: "2,5% - 4,5%", bnpl: "2% - 5%" },
                  { aspect: "Liquidação", parcel: "Instantânea (D+0)", card: "14-30 dias", bnpl: "1-3 dias" },
                  { aspect: "Aprovação", parcel: "< 2 segundos", card: "5-10 segundos", bnpl: "30s - 2min" },
                  { aspect: "Reutilização", parcel: "Token permanente", card: "Sim", bnpl: "Não" },
                  { aspect: "Integração", parcel: "API aberta", card: "Complexa", bnpl: "Média" },
                  { aspect: "Experiência", parcel: "1 clique", card: "Formulário", bnpl: "Formulário" },
                ].map((row, i) => (
                  <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-6 font-medium text-gray-700">{row.aspect}</td>
                    <td className="py-4 px-6 text-center">
                      <span className="inline-flex items-center gap-2 text-green-600 font-semibold">
                        <CheckCircle2 className="w-5 h-5" />
                        {row.parcel}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center text-gray-500">{row.card}</td>
                    <td className="py-4 px-6 text-center text-gray-500">{row.bnpl}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Inclusão Financeira */}
      <section className="py-20 bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
                <Shield className="w-4 h-4" />
                <span>Inclusão Financeira</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-4">Crédito para Todos, Sem Burocracia</h2>
              <p className="text-xl text-gray-600">
                Parcele suas compras mesmo sem cartão de crédito ou score tradicional
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <Card className="p-6 border-2 border-purple-200 bg-white">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Zap className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Aprovação Instantânea</h3>
                    <p className="text-gray-600">
                      Análise de crédito em <strong>menos de 2 segundos</strong> usando Open Finance. 
                      Sem consulta ao SPC/Serasa, sem burocracia.
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 border-2 border-blue-200 bg-white">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <LineChart className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Score Alternativo</h3>
                    <p className="text-gray-600">
                      Usamos <strong>Open Banking</strong> para analisar seu histórico financeiro real, 
                      não apenas seu score de crédito tradicional.
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 border-2 border-green-200 bg-white">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Users className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Sem Cartão de Crédito</h3>
                    <p className="text-gray-600">
                      Não precisa ter cartão de crédito ou limite bancário. 
                      Seu <strong>ParcelToken</strong> funciona como um crédito pessoal reutilizável.
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 border-2 border-orange-200 bg-white">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Construa seu Histórico</h3>
                    <p className="text-gray-600">
                      Cada pagamento em dia <strong>melhora seu limite</strong> e condições. 
                      Construa seu histórico de crédito positivo.
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            <div className="mt-12 p-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl text-white text-center">
              <h3 className="text-2xl font-bold mb-4">Democratizando o Acesso ao Crédito</h3>
              <p className="text-lg mb-6 opacity-90">
                Mais de <strong>45 milhões de brasileiros</strong> não têm acesso a cartão de crédito. 
                O ParcelToken muda isso.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href={getLoginUrl('/dashboard')}>
                  <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100">
                    Criar Meu ParcelToken Agora
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SmartQR Demo Section */}
      <section id="smartqr-demo" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Teste o SmartQR Agora
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Veja como é simples gerar um QR Code inteligente e processar pagamentos
            </p>
          </div>

          <SmartQRDemo />
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 bg-gradient-to-r from-green-600 via-blue-600 to-purple-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Pronto para Revolucionar Seus Pagamentos?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Junte-se a milhares de usuários e centenas de merchants que já estão economizando com ParcelToken.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href={getLoginUrl()}>
              <Button size="lg" className="w-full sm:w-auto text-lg bg-white text-green-600 hover:bg-gray-100">
                Começar Agora - É Grátis
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </a>
            <a href="/simulation">
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg border-white text-white hover:bg-white/10">
                Ver Simulacao Interativa
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">PT</span>
                </div>
                <span className="text-white font-bold">{APP_TITLE}</span>
              </div>
              <p className="text-sm">
                A revolução dos pagamentos no Brasil.
              </p>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Produto</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/simulacao" className="hover:text-white transition-colors">Como Funciona</Link></li>
                <li><Link href="/merchant" className="hover:text-white transition-colors">Para Merchants</Link></li>
                <li><Link href="/api-docs" className="hover:text-white transition-colors">API</Link></li>
                <li><Link href="/integrations" className="hover:text-white transition-colors">Integrações</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Empresa</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
                <li><Link href="/analytics" className="hover:text-white transition-colors">Analytics</Link></li>
                <li><Link href="/admin" className="hover:text-white transition-colors">Admin</Link></li>
                <li><a href="mailto:contato@parceltoken.com.br" className="hover:text-white transition-colors">Contato</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/privacy-policy" className="hover:text-white transition-colors">Política de Privacidade</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Termos de Uso</Link></li>
                <li><Link href="/aml" className="hover:text-white transition-colors">Política AML</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition-colors">Configurações LGPD</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm">
              © 2025 ParcelToken. Todos os direitos reservados.
            </p>
            <div className="flex items-center gap-4">
              <Shield className="w-5 h-5" />
              <span className="text-sm">Certificado PCI-DSS | LGPD Compliant</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
