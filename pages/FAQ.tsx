import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronDown, Search, MessageCircle, Shield, Zap, DollarSign, Lock, BarChart3 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { APP_TITLE } from "@/const";

const faqs = [
  {
    category: "Geral",
    icon: MessageCircle,
    questions: [
      {
        q: "O que é ParcelToken?",
        a: "ParcelToken é uma plataforma de pagamentos inteligente que permite consumidores criar tokens de crédito reutilizáveis e merchants aceitar pagamentos parcelados via PIX com liquidação D+0. Combinamos tecnologia de Open Finance, IA e blockchain para oferecer experiência superior."
      },
      {
        q: "Como funciona o ParcelToken?",
        a: "1) Consumidor cria um token de crédito (ParcelToken) com limite aprovado por IA; 2) Merchant gera SmartQR com valor e parcelas; 3) Consumidor escaneia QR Code e paga via PIX; 4) Sistema gera parcelas automáticas; 5) Merchant recebe em tempo real."
      },
      {
        q: "Qual é a diferença entre ParcelToken e cartão de crédito?",
        a: "ParcelToken oferece: (1) Juros 50-70% menores, (2) Aprovação em minutos via IA, (3) Sem anuidade, (4) Reutilizável em múltiplos merchants, (5) Liquidação D+0 para merchants, (6) Limite dinâmico baseado em Open Finance."
      },
      {
        q: "Quem pode usar ParcelToken?",
        a: "Qualquer pessoa com conta bancária brasileira e CPF pode criar um ParcelToken. Merchants precisam de CNPJ ativo. Ambos precisam passar por verificação KYC básica (nome, email, documento)."
      }
    ]
  },
  {
    category: "Segurança",
    icon: Shield,
    questions: [
      {
        q: "Meus dados estão seguros?",
        a: "Sim. Usamos criptografia AES-256, autenticação OAuth 2.0, certificado digital mTLS com Efi Bank, e conformidade com LGPD. Todos os dados são armazenados em servidores seguros com backup automático."
      },
      {
        q: "Como funciona a autenticação?",
        a: "Usamos OAuth 2.0 com Manus Auth. Você faz login uma única vez e recebe um token seguro. Nenhuma senha é armazenada em nossos servidores. Cada transação requer confirmação adicional."
      },
      {
        q: "O ParcelToken é regulado?",
        a: "ParcelToken segue regulamentações de Resolução COAF (Lei 9.613/1998) para AML/KYC, LGPD para proteção de dados, e Resolução BCB para PIX. Estamos em processo de licenciamento como Instituição de Pagamento."
      },
      {
        q: "Posso perder meu dinheiro?",
        a: "Não. Seu saldo em ParcelToken é garantido. Se houver qualquer fraude, reembolsamos 100%. Mantemos fundo de reserva equivalente a 5% do volume processado."
      }
    ]
  },
  {
    category: "Funcionalidades",
    icon: Zap,
    questions: [
      {
        q: "Como criar um ParcelToken?",
        a: "1) Faça login na plataforma; 2) Clique em 'Criar Token'; 3) Informe renda mensal e dados bancários (via Open Finance); 4) Sistema calcula limite em segundos; 5) Token aprovado e pronto para usar."
      },
      {
        q: "Qual é o limite máximo de crédito?",
        a: "O limite é calculado dinamicamente pela IA baseado em: (1) Renda mensal (40%), (2) Histórico de pagamentos (35%), (3) Comportamento gamificado (25%). Varia de R$ 500 a R$ 50.000, com possibilidade de aumento automático."
      },
      {
        q: "Como funciona o parcelamento automático?",
        a: "Ao fazer uma compra, o sistema gera automaticamente parcelas mensais com juros progressivos. Ex: 3x = 0% + 1% + 2%. Você pode renegociar parcelas vencidas sem juros adicionais."
      },
      {
        q: "Posso usar o mesmo ParcelToken em vários merchants?",
        a: "Sim! Esse é o grande diferencial. Seu token é reutilizável em qualquer merchant que aceite ParcelToken. Quanto mais usa, maior seu limite cresce automaticamente."
      },
      {
        q: "Como funciona o SmartQR?",
        a: "SmartQR é um QR Code dinâmico que merchants geram com valor e número de parcelas. Consumidor escaneia, vê economia vs cartão, seleciona parcelas, paga via PIX. Tudo em 30 segundos."
      }
    ]
  },
  {
    category: "Pagamentos",
    icon: DollarSign,
    questions: [
      {
        q: "Quais são as formas de pagamento?",
        a: "Atualmente: PIX (instantâneo). Em breve: Cartão de crédito, Boleto, Open Finance (débito automático). Todos os pagamentos são processados via Efi Bank com certificado digital."
      },
      {
        q: "Quanto tempo leva para o merchant receber?",
        a: "Liquidação D+0 (mesmo dia). Pagamentos recebidos até 17h são creditados em conta corrente do merchant no mesmo dia. Após 17h, no dia útil seguinte."
      },
      {
        q: "Qual é a taxa para merchants?",
        a: "Taxa padrão: 2,5% por transação. Merchants com volume >R$ 100k/mês: 2%. Com volume >R$ 500k/mês: 1,5%. Sem taxa de setup, sem anuidade, sem taxas ocultas."
      },
      {
        q: "Há juros para o consumidor?",
        a: "Sim, juros progressivos por parcela: 1ª parcela = 0%, 2ª = 1%, 3ª = 2%, etc. Máximo 12 parcelas com 11% de juros. Sempre inferior a cartão de crédito (média 15-20%)."
      },
      {
        q: "O que acontece se eu não pagar uma parcela?",
        a: "Sistema envia notificação no 1º dia de atraso. Após 3 dias: multa de 2%. Após 10 dias: juros de mora 1% ao mês. Após 30 dias: limite congelado até regularização. Sem negativação em bureau de crédito."
      }
    ]
  },
  {
    category: "Integração",
    icon: Lock,
    questions: [
      {
        q: "Como integrar ParcelToken na minha loja?",
        a: "Oferecemos: (1) API REST completa com documentação; (2) SDKs para JavaScript/Python/Node; (3) Plugins para Shopify/WooCommerce; (4) Checkout pré-construído. Integração leva 30 minutos."
      },
      {
        q: "Qual é a documentação da API?",
        a: "Documentação completa em /api/docs com exemplos em cURL, JavaScript, Python. Inclui autenticação, endpoints de tokens, transações, webhooks, rate limits e troubleshooting."
      },
      {
        q: "Como receber notificações de pagamento?",
        a: "Via webhooks HTTPS. Configurar URL no dashboard. Enviamos eventos: payment.confirmed, payment.failed, installment.due, installment.overdue. Cada webhook é assinado com HMAC-SHA256."
      },
      {
        q: "Qual é o tempo de resposta da API?",
        a: "Média: 200ms. P99: 500ms. Garantimos 99.9% de uptime. Rate limit: 1000 requests/minuto por API key. Retry automático com backoff exponencial para falhas transitórias."
      },
      {
        q: "Preciso de aprovação para integrar?",
        a: "Não. Sandbox está disponível imediatamente após cadastro. Produção requer: (1) Teste de integração bem-sucedido, (2) Verificação KYC completa, (3) Assinatura de contrato. Processo leva 2-3 dias úteis."
      }
    ]
  },
  {
    category: "Analytics",
    icon: BarChart3,
    questions: [
      {
        q: "Que métricas posso acompanhar?",
        a: "Consumidor: limite, saldo, histórico de parcelas, score de crédito, economia total. Merchant: volume processado, ticket médio, taxa de conversão, ROI, previsão de receita, análise de cohort."
      },
      {
        q: "Como funciona o score de crédito?",
        a: "Score 0-1000 calculado por IA com 7 features: (1) Open Finance (40%), (2) Histórico de pagamentos (35%), (3) Comportamento gamificado (25%). Atualizado diariamente. Limite aumenta automaticamente com score >700."
      },
      {
        q: "Posso exportar relatórios?",
        a: "Sim. Formatos: CSV, PDF, Excel. Períodos: diário, semanal, mensal, customizado. Dados: transações, parcelas, clientes, receita, comissões. Acesso via dashboard ou API."
      },
      {
        q: "Como funciona o programa de referral?",
        a: "Ganhe R$ 50 por cada consumidor referido que cria token. Merchants: R$ 500 por referência com volume >R$ 10k. Sem limite de ganho. Pagamento mensal via PIX."
      }
    ]
  },
  {
    category: "Suporte",
    icon: MessageCircle,
    questions: [
      {
        q: "Como entro em contato com suporte?",
        a: "Chat em tempo real (9h-18h, seg-sex), Email: suporte@parceltoken.com.br, Telefone: 0800-PARCEL (0800-727235), Documentação: /api/docs, FAQ: /faq"
      },
      {
        q: "Qual é o tempo de resposta?",
        a: "Chat: <5 minutos. Email: <2 horas (dias úteis). Telefone: <1 minuto. Problemas críticos (fraude, downtime): resposta imediata 24/7."
      },
      {
        q: "Há SLA garantido?",
        a: "Sim. Uptime: 99.9%. Resposta suporte: <2h. Resolução: <24h. Compensação automática em caso de violação (crédito de 1 dia de taxa)."
      },
      {
        q: "Como reportar um bug?",
        a: "Use o formulário em /report-bug ou envie para bugs@parceltoken.com.br. Inclua: descrição, passos para reproduzir, screenshot/vídeo, navegador/versão. Críticos são corrigidos em <4h."
      }
    ]
  }
];

export default function FAQ() {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filteredFaqs = faqs
    .map(category => ({
      ...category,
      questions: category.questions.filter(
        q => q.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
             q.a.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }))
    .filter(category => category.questions.length > 0 || !activeCategory);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">Perguntas Frequentes</h1>
          <p className="text-lg opacity-90 mb-8">
            Encontre respostas para as dúvidas mais comuns sobre {APP_TITLE}
          </p>
          
          {/* Search */}
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-3 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Buscar pergunta..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 py-3 text-base"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        {filteredFaqs.map((category, categoryIndex) => (
          <div key={categoryIndex} className="mb-12">
            {/* Category Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg">
                <category.icon className="w-6 h-6 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">{category.category}</h2>
            </div>

            {/* Questions */}
            <div className="space-y-3">
              {category.questions.map((faq, qIndex) => {
                const globalIndex = categoryIndex * 100 + qIndex;
                const isExpanded = expandedIndex === globalIndex;

                return (
                  <Card
                    key={qIndex}
                    className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => setExpandedIndex(isExpanded ? null : globalIndex)}
                  >
                    <div className="p-4 bg-white hover:bg-gray-50">
                      <div className="flex items-start justify-between gap-4">
                        <h3 className="font-semibold text-gray-900 text-left flex-1">
                          {faq.q}
                        </h3>
                        <ChevronDown
                          className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform ${
                            isExpanded ? "rotate-180" : ""
                          }`}
                        />
                      </div>

                      {isExpanded && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                            {faq.a}
                          </p>
                        </div>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        ))}

        {filteredFaqs.every(c => c.questions.length === 0) && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg mb-4">
              Nenhuma pergunta encontrada para "{searchTerm}"
            </p>
            <Button
              variant="outline"
              onClick={() => setSearchTerm("")}
            >
              Limpar busca
            </Button>
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12 px-4 mt-12">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">Ainda tem dúvidas?</h2>
          <p className="text-lg opacity-90 mb-6">
            Nossa equipe de suporte está pronta para ajudar
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary">
              Abrir Chat
            </Button>
            <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10">
              Enviar Email
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
