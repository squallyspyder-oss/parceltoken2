import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Zap, 
  Shield, 
  BarChart3,
  ArrowRight,
  CheckCircle2,
  Download,
  Mail,
  Phone
} from "lucide-react";
import { Link } from "wouter";

export default function InvestorPage() {
  const metrics = [
    { icon: Users, label: "Usuários Ativos", value: "12.547", growth: "+45% YoY" },
    { icon: DollarSign, label: "Volume Processado", value: "R$ 71.875M", growth: "+120% YoY" },
    { icon: BarChart3, label: "Taxa de Conversão", value: "8.2%", growth: "+2.1pp" },
    { icon: Zap, label: "Transações/Dia", value: "2.847", growth: "+89% YoY" }
  ];

  const roadmap = [
    {
      quarter: "Q4 2024",
      status: "Em Progresso",
      items: [
        "Integração Open Finance (Pluggy)",
        "Smart Credit Layer com IA",
        "Blockchain Backend (Hyperledger)",
        "Dashboard de Crédito Inteligente"
      ]
    },
    {
      quarter: "Q1 2025",
      status: "Planejado",
      items: [
        "Integração com Stripe (Cartão)",
        "Programa de Referral Gamificado",
        "API v2 com WebSockets",
        "Certificação PCI-DSS"
      ]
    },
    {
      quarter: "Q2 2025",
      status: "Planejado",
      items: [
        "Expansão para Argentina/Colômbia",
        "Tokenização em DeFi (Polygon)",
        "Marketplace de Merchants",
        "Integração com Open Banking Global"
      ]
    },
    {
      quarter: "Q3 2025",
      status: "Planejado",
      items: [
        "Série A - Rodada de Investimento",
        "Expansão para 5 países",
        "Parcerias com Fintechs",
        "IPO Roadshow"
      ]
    }
  ];

  const team = [
    { name: "João Silva", role: "CEO & Fundador", bio: "Ex-Nubank, 10 anos em Fintech" },
    { name: "Maria Santos", role: "CTO", bio: "Ex-Stone, especialista em blockchain" },
    { name: "Pedro Costa", role: "CFO", bio: "Ex-BTG Pactual, MBA Stanford" },
    { name: "Ana Oliveira", role: "Head of Product", bio: "Ex-Itaú, 8 anos em produtos financeiros" }
  ];

  const highlights = [
    { icon: Shield, title: "Segurança", desc: "Certificado digital mTLS, LGPD, AML/KYC" },
    { icon: TrendingUp, title: "Crescimento", desc: "45% MoM, 120% YoY, Rentável" },
    { icon: Zap, title: "Inovação", desc: "IA, Open Finance, Blockchain" },
    { icon: Users, title: "Rede", desc: "12k+ usuários, 500+ merchants" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-black text-white">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10" />
        <div className="relative max-w-6xl mx-auto px-4 py-20">
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Revolucionando Pagamentos no Brasil
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              ParcelToken é a plataforma de pagamentos inteligente que combina IA, Open Finance e blockchain 
              para oferecer crédito acessível e liquidação D+0 para merchants.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                <Download className="w-5 h-5 mr-2" />
                Baixar Pitch Deck
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                <Mail className="w-5 h-5 mr-2" />
                Agendar Demo
              </Button>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid md:grid-cols-4 gap-4 mt-16">
            {metrics.map((metric, i) => (
              <Card key={i} className="bg-white/5 border-white/10 backdrop-blur">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <metric.icon className="w-8 h-8 text-blue-400" />
                    <span className="text-green-400 text-sm font-semibold">{metric.growth}</span>
                  </div>
                  <p className="text-gray-400 text-sm mb-2">{metric.label}</p>
                  <p className="text-3xl font-bold">{metric.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Highlights */}
      <div className="max-w-6xl mx-auto px-4 py-20">
        <h2 className="text-4xl font-bold mb-12 text-center">Por Que Investir em ParcelToken?</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {highlights.map((h, i) => (
            <Card key={i} className="bg-white/5 border-white/10 hover:bg-white/10 transition">
              <CardContent className="p-6">
                <h.icon className="w-8 h-8 text-blue-400 mb-4" />
                <h3 className="text-lg font-bold mb-2">{h.title}</h3>
                <p className="text-gray-400 text-sm">{h.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Market Opportunity */}
      <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 py-20">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-4xl font-bold mb-12 text-center">Oportunidade de Mercado</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <p className="text-gray-400 mb-2">TAM (Total Addressable Market)</p>
              <p className="text-4xl font-bold text-green-400">R$ 2.3 Trilhões</p>
              <p className="text-sm text-gray-400 mt-2">Mercado de crédito pessoa física Brasil</p>
            </div>
            <div>
              <p className="text-gray-400 mb-2">SAM (Serviceable Addressable Market)</p>
              <p className="text-4xl font-bold text-blue-400">R$ 450 Bilhões</p>
              <p className="text-sm text-gray-400 mt-2">Crédito parcelado sem garantia</p>
            </div>
            <div>
              <p className="text-gray-400 mb-2">SOM (Serviceable Obtainable Market)</p>
              <p className="text-4xl font-bold text-purple-400">R$ 15 Bilhões</p>
              <p className="text-sm text-gray-400 mt-2">Meta 2027 (3.3% de penetração)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Roadmap */}
      <div className="max-w-6xl mx-auto px-4 py-20">
        <h2 className="text-4xl font-bold mb-12 text-center">Roadmap 24 Meses</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {roadmap.map((phase, i) => (
            <Card key={i} className="bg-white/5 border-white/10">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold">{phase.quarter}</h3>
                  <span className={`text-xs px-2 py-1 rounded ${
                    phase.status === "Em Progresso" ? "bg-blue-500/30 text-blue-200" : "bg-gray-500/30 text-gray-200"
                  }`}>
                    {phase.status}
                  </span>
                </div>
                <ul className="space-y-2">
                  {phase.items.map((item, j) => (
                    <li key={j} className="flex gap-2 text-sm text-gray-300">
                      <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Team */}
      <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 py-20">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-4xl font-bold mb-12 text-center">Time Experiente</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((member, i) => (
              <Card key={i} className="bg-white/5 border-white/10">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full mx-auto mb-4" />
                  <h3 className="font-bold text-lg mb-1">{member.name}</h3>
                  <p className="text-blue-400 text-sm mb-2">{member.role}</p>
                  <p className="text-gray-400 text-sm">{member.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Financiamento */}
      <div className="max-w-6xl mx-auto px-4 py-20">
        <h2 className="text-4xl font-bold mb-12 text-center">Histórico de Financiamento</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-8">
              <p className="text-gray-400 mb-2">Seed Round (2023)</p>
              <p className="text-3xl font-bold text-green-400 mb-4">R$ 2.5M</p>
              <p className="text-sm text-gray-400">Investors: Venture Capital, Angel Investors</p>
            </CardContent>
          </Card>
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-8">
              <p className="text-gray-400 mb-2">Series A (2024)</p>
              <p className="text-3xl font-bold text-blue-400 mb-4">R$ 15M</p>
              <p className="text-sm text-gray-400">Investors: Sequoia, Accel, Nubank</p>
            </CardContent>
          </Card>
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-8">
              <p className="text-gray-400 mb-2">Series B (2025)</p>
              <p className="text-3xl font-bold text-purple-400 mb-4">R$ 50M+</p>
              <p className="text-sm text-gray-400">Buscando investidores estratégicos</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Pronto para Revolucionar Pagamentos?</h2>
          <p className="text-xl text-white/80 mb-8">
            Junte-se a nós na missão de democratizar crédito e pagamentos no Brasil
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
              <Mail className="w-5 h-5 mr-2" />
              Enviar Proposta
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              <Phone className="w-5 h-5 mr-2" />
              (11) 3000-0000
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-white/10 py-8 px-4">
        <div className="max-w-6xl mx-auto text-center text-gray-400 text-sm">
          <p>© 2024 ParcelToken. Todos os direitos reservados.</p>
          <p className="mt-2">
            <Link href="/privacy-policy" className="hover:text-white">Privacidade</Link>
            {" • "}
            <Link href="/terms" className="hover:text-white">Termos</Link>
            {" • "}
            <Link href="/aml" className="hover:text-white">Compliance</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
