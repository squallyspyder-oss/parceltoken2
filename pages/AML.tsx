import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield, AlertTriangle, CheckCircle } from "lucide-react";

export default function AML() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <Link href="/">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Voltar para Home
            </Button>
          </Link>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="flex items-center gap-4 mb-8">
          <Shield className="w-12 h-12 text-blue-600" />
          <h1 className="text-4xl font-bold">Política de Prevenção à Lavagem de Dinheiro (AML)</h1>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
            <p className="text-gray-700">
              <strong>Compromisso:</strong> A ParcelToken Pay está comprometida em prevenir, detectar e reportar atividades 
              suspeitas de lavagem de dinheiro e financiamento ao terrorismo, em conformidade com a legislação brasileira.
            </p>
          </div>

          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Legislação Aplicável</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              Nossa política AML está em conformidade com:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li><strong>Lei nº 9.613/1998:</strong> Lei de Lavagem de Dinheiro (alterada pela Lei 12.683/2012)</li>
              <li><strong>Resolução COAF nº 40/2021:</strong> Obrigações de prevenção para instituições financeiras</li>
              <li><strong>Circular BCB nº 3.978/2020:</strong> Políticas e procedimentos de prevenção</li>
              <li><strong>Lei nº 13.260/2016:</strong> Lei Antiterrorismo</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Conheça Seu Cliente (KYC)</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              Implementamos procedimentos rigorosos de identificação e verificação:
            </p>
            
            <div className="grid md:grid-cols-2 gap-4 mt-4">
              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <h3 className="font-semibold">Identificação Básica</h3>
                </div>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Nome completo</li>
                  <li>• CPF/CNPJ</li>
                  <li>• Data de nascimento</li>
                  <li>• Endereço residencial</li>
                  <li>• E-mail e telefone</li>
                </ul>
              </div>

              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold">Verificação Avançada</h3>
                </div>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Validação de documento (OCR + Liveness)</li>
                  <li>• Consulta a bureaus de crédito</li>
                  <li>• Verificação de listas restritivas</li>
                  <li>• Análise de Open Finance</li>
                  <li>• Prova de endereço</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. Monitoramento de Transações</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              Todas as transações são monitoradas em tempo real por nosso sistema de detecção de fraudes:
            </p>
            
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-4">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-800 mb-2">Alertas Automáticos para:</p>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Transações acima de R$ 10.000,00</li>
                    <li>• Múltiplas transações em curto período (velocity check)</li>
                    <li>• Padrões atípicos de comportamento</li>
                    <li>• Tentativas de fracionamento (smurfing)</li>
                    <li>• Transações com países de alto risco</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Listas Restritivas</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              Verificamos automaticamente todos os usuários contra:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li><strong>PEP (Pessoas Politicamente Expostas):</strong> Lista do TCU e Receita Federal</li>
              <li><strong>OFAC (Office of Foreign Assets Control):</strong> Lista de sanções internacionais</li>
              <li><strong>ONU:</strong> Lista consolidada de sanções do Conselho de Segurança</li>
              <li><strong>Interpol:</strong> Mandados de prisão internacionais</li>
              <li><strong>COAF:</strong> Comunicações de operações suspeitas</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Comunicação de Operações Suspeitas</h2>
            <p className="text-gray-700 leading-relaxed">
              Somos obrigados a reportar ao COAF (Conselho de Controle de Atividades Financeiras) operações que apresentem 
              indícios de lavagem de dinheiro ou financiamento ao terrorismo, independentemente do valor.
            </p>
            
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mt-4">
              <p className="text-gray-700">
                <strong>Importante:</strong> Conforme a lei, não podemos informar ao usuário sobre a comunicação de operações 
                suspeitas ao COAF. A quebra deste sigilo constitui crime.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Limites e Controles</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-3">Limites Transacionais</h3>
                <ul className="text-sm text-gray-700 space-y-2">
                  <li>• <strong>Diário:</strong> R$ 5.000,00</li>
                  <li>• <strong>Mensal:</strong> R$ 20.000,00</li>
                  <li>• <strong>Por transação:</strong> R$ 2.000,00</li>
                  <li className="text-xs text-gray-500 mt-2">* Limites podem ser aumentados após verificação adicional</li>
                </ul>
              </div>

              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-3">Controles Adicionais</h3>
                <ul className="text-sm text-gray-700 space-y-2">
                  <li>• Verificação biométrica para valores acima de R$ 1.000</li>
                  <li>• Análise manual para transações suspeitas</li>
                  <li>• Bloqueio preventivo em caso de fraude</li>
                  <li>• Revisão periódica de perfil de risco</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Due Diligence Reforçada</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              Aplicamos procedimentos reforçados para:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Pessoas Politicamente Expostas (PEP) e seus familiares</li>
              <li>Clientes de países de alto risco (lista GAFI/FATF)</li>
              <li>Transações acima de R$ 50.000,00</li>
              <li>Merchants com alto volume de chargebacks</li>
              <li>Usuários com histórico de atividades suspeitas</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Treinamento e Compliance</h2>
            <p className="text-gray-700 leading-relaxed">
              Nossa equipe passa por treinamentos regulares sobre:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 mt-3">
              <li>Identificação de operações suspeitas</li>
              <li>Procedimentos de KYC e due diligence</li>
              <li>Legislação AML/CFT atualizada</li>
              <li>Tipologias de lavagem de dinheiro</li>
              <li>Ética e confidencialidade</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. Retenção de Registros</h2>
            <p className="text-gray-700 leading-relaxed">
              Mantemos registros de todas as transações e documentos de identificação por no mínimo <strong>5 anos</strong> 
              após o encerramento da relação comercial, conforme exigido pela legislação.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">10. Cooperação com Autoridades</h2>
            <p className="text-gray-700 leading-relaxed">
              Cooperamos plenamente com:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 mt-3">
              <li>COAF (Conselho de Controle de Atividades Financeiras)</li>
              <li>Banco Central do Brasil</li>
              <li>Polícia Federal</li>
              <li>Ministério Público</li>
              <li>Receita Federal</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">11. Contato do Compliance Officer</h2>
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
              <p className="text-gray-700">
                <strong>Oficial de Compliance AML:</strong><br />
                Nome: Dr. João Silva (OAB/SP 123.456)<br />
                E-mail: compliance@parceltoken.com.br<br />
                Telefone: +55 (11) 3000-0001<br />
                Horário: Segunda a Sexta, 9h às 18h
              </p>
            </div>
          </section>

          <div className="text-sm text-gray-500 mt-8 pt-6 border-t">
            <p>Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>
            <p className="mt-2">Versão 2.1 | Revisão Anual Obrigatória</p>
          </div>
        </div>
      </div>
    </div>
  );
}
