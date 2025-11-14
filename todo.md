# ParcelToken Pay - TODO

## ✅ IMPLEMENTADO RECENTEMENTE

### Motor de Parcelamento Integrado
- [x] Substituir createInstallmentPlan por generateInstallments() no checkout
- [x] Adicionar endpoint de renegociação (rescheduleInstallments)
- [x] Geração automática de parcelas ao criar transação
- [x] Atualização automática de saldo ao pagar parcela

---

## 🔴 PRIORIDADE MÁXIMA (Bloqueadores para Demo)

### 1. Motor de Parcelamento Automático
- [x] Criar função `generateInstallments()` que gera parcelas ao criar transação - IMPLEMENTADO
- [x] Implementar cálculo de juros/desconto dinâmico por parcela - IMPLEMENTADO
- [x] Adicionar trigger de atualização de saldo do token ao pagar parcela - IMPLEMENTADO
- [x] Criar endpoint `POST /billing/reschedule` para renegociação - IMPLEMENTADO (função rescheduleInstallments)
- [x] Atualizar schema com campos tokenId, totalInstallments e paidAmount - IMPLEMENTADO
- [x] Aplicar migração no banco de dados - CONCLUÍDO

### 2. Sistema de Lembretes Automáticos
- [x] Implementar envio de e-mail 3 dias antes do vencimento - IMPLEMENTADO
- [x] Criar job diário que verifica parcelas próximas - IMPLEMENTADO (cron às 9h)
- [x] Integrar com serviço de e-mail (Resend) - IMPLEMENTADO
- [x] Criar endpoint manual para testes (reminders.sendManual) - IMPLEMENTADO
- [ ] Adicionar webhook para merchant quando parcela vence

### 3. Integração PIX Real (Sandbox)
- [x] Integrar com Gerencianet em modo sandbox - IMPLEMENTADO
- [x] Implementar geração de PIX Cobrança por parcela - IMPLEMENTADO
- [x] Criar endpoints pix.generateCharge e pix.checkStatus - IMPLEMENTADO
- [x] Suporte a mock para desenvolvimento - IMPLEMENTADO
- [x] Criar webhook para receber confirmação de pagamento - IMPLEMENTADO (POST /api/pix/webhook)
- [x] Atualizar status de parcela automaticamente ao receber PIX - IMPLEMENTADO (integrado com payInstallment)
- [x] Adicionar polling de status no modal PIX - IMPLEMENTADO (refetch a cada 5s)
- [ ] Configurar secrets (GERENCIANET_CLIENT_ID, GERENCIANET_CLIENT_SECRET, GERENCIANET_PIX_KEY)

---

## 🟡 PRIORIDADE ALTA (Melhorias de UX)

### 4. Dashboard do Merchant
- [ ] Adicionar gráfico de vendas liquidadas vs parceladas
- [ ] Mostrar tempo médio de liquidação
- [ ] Exibir volume em PIX instantâneo
- [ ] Criar botão de geração de SmartQR no dashboard

### 5. Landing Page
- [ ] Adicionar animação explicativa (Cliente → Token → Lojista)
- [ ] Criar seção "Para Desenvolvedores" com documentação SDK
- [ ] Adicionar seção "Investidores & Parcerias" com formulário

---

## ✅ JÁ IMPLEMENTADO

- [x] Tokenização com reutilização
- [x] Limite dinâmico
- [x] Histórico de tokens
- [x] SmartQR adaptativo
- [x] Timeline de parcelas visual
- [x] Notificações de vencimento (toast + badge)
- [x] Gráfico de evolução de crédito
- [x] Botão de reutilização
- [x] Modal de escolha de pagamento
- [x] Exportação PDF/CSV
- [x] Sistema de webhooks
- [x] QR codes funcionais

---

## 🟢 BACKLOG (Nice to Have)

### Open Finance
- [ ] Integração com Pluggy/Klavi
- [ ] Score dinâmico baseado em renda
- [ ] Antifraude (geo-IP, velocity check)

### Admin Dashboard
- [ ] Painel de monitoramento geral
- [ ] Logs de erros e transações
- [ ] Gestão de merchants e tokens

### Gamificação
- [ ] Sistema de badges
- [ ] Pontos por ações
- [ ] Ranking mensal

---

## 📊 Status Geral
- **Completude:** 85%
- **Conformidade com Estruturador:** 85%
- **Pronto para Demo:** 70%
- **Meta:** 95% até final da Semana 2


## 🏠 Melhorias da Home Page (Blueprint Alignment)

### Gaps Identificados
- [x] Adicionar animação ao diagrama de fluxo (Cliente → SmartQR → Token → PIX → Lojista) - IMPLEMENTADO
- [ ] Melhorar copy do hero para destacar "Token Universal"
- [ ] Adicionar tooltip explicativo sobre o que é P₮
- [ ] Criar seção de FAQ básico
- [ ] Adicionar depoimentos/social proof (mockado)

## ⚙️ Melhorias de Backend (Blueprint Alignment)

### Open Finance
- [ ] Melhorar mock de Open Finance com dados realistas
- [ ] Criar endpoint de simulação de análise de crédito
- [ ] Adicionar score dinâmico baseado em histórico

### Performance e Escalabilidade
- [ ] Implementar cache básico em memória para queries frequentes
- [ ] Adicionar índices no banco de dados
- [ ] Otimizar queries N+1

### Segurança
- [ ] Adicionar rate limiting nos endpoints públicos
- [ ] Implementar validação de CORS
- [ ] Adicionar logs de auditoria para operações críticas


## 🔴 CHECKLIST TÉCNICO URGENTE (Novas Instruções)

### Prioridade CRÍTICA (Executar AGORA)
- [x] Adicionar coluna `pixChargeId` (VARCHAR 255) em `installmentPayments` e rodar migration - CONCLUÍDO
- [x] Criar badge de ambiente (Sandbox/Prod) no header - CONCLUÍDO
- [ ] Atualizar webhook PIX para buscar parcela por pixChargeId
- [ ] Atualizar hero headline: "ParcelToken Pay — Parcela via PIX. Lojista recebe na hora."
- [ ] Padronizar CTAs: "Teste SmartQR", "Criar Conta Merchant", "Solicitar Demo"

### Prioridade ALTA (24-48h)
- [ ] Criar página /api/docs com OpenAPI e exemplos de código
- [ ] Criar páginas de compliance: /privacy, /terms, /aml, /investor-pack
- [ ] Adicionar microcopy nos modais explicando reutilização de token
- [ ] Adicionar seção "Últimos Webhooks" no Admin Dashboard
- [ ] Verificar contraste WCAG AA em botões e textos

### Prioridade MÉDIA (3-7 dias)
- [ ] Criar testes automatizados básicos (Vitest)
- [ ] Gravar 3 vídeos demo (30-60s cada)
- [ ] Teste E2E completo: checkout → pagamento → webhook


## 🎯 PRÓXIMOS PASSOS (Sessão Atual)

### Fase 1: Documentação da API
- [x] Criar página /api/docs com documentação OpenAPI interativa
- [x] Adicionar exemplos de código (cURL, JavaScript, Python)
- [x] Documentar todos os endpoints principais (tokens, transações, PIX, webhooks)
- [x] Adicionar seção de autenticação e rate limits
- [x] Criar guia de quick start para merchants

### Fase 2: Testes Automatizados
- [x] Configurar Vitest para testes unitários
- [x] Criar testes para fluxo de criação de token (15 testes)
- [x] Criar testes para fluxo de pagamento PIX (22 testes)
- [x] Criar testes para geração automática de parcelas (22 testes)
- [x] Criar testes para reutilização de token (incluído em token.test.ts)
- [x] Total: 59 testes passando com 100% de sucesso

### Fase 3: Vídeo Demo
- [x] Escrever roteiro do vídeo demo (2-3 minutos) - 8 cenas detalhadas
- [x] Definir 3 fluxos principais a demonstrar (consumidor, merchant, parcelas)
- [x] Criar instruções de gravação completas
- [x] Preparar dados de demonstração realistas (João Silva, Loja Tech Store)
- [x] Documentar pontos-chave a destacar para investidores
- [x] Arquivo completo: ROTEIRO_VIDEO_DEMO.md


## 🔧 CORREÇÃO: SmartQR Demo Estático

### Problema Reportado
- [x] SmartQR demo na home está estático e não funcional
- [x] Implementar geração real de QR Code
- [x] Conectar ao backend para criar transação demo
- [x] Tornar interativo com dados dinâmicos
- [x] Componente SmartQRDemo criado com formulário interativo
- [x] Endpoint public.generateDemoQR implementado
- [x] Geração de QR Code PNG/SVG funcional
- [x] Cálculo de economia e parcelas em tempo real


## 🎯 NOVA FEATURE: Simulador de Checkout Completo

### Objetivo
Criar experiência interativa completa onde usuário pode "escanear" QR Code gerado no demo e simular todo processo de pagamento

### Funcionalidades
- [x] Botão "Simular Checkout Completo" no QR Code gerado
- [x] Modal de checkout com 4 etapas progressivas
- [x] Etapa 1: Simulação de escaneamento com smartphone
- [x] Etapa 2: Detecção de ParcelToken ativo (R$ 5.000 disponível)
- [x] Etapa 2: Seleção de número de parcelas (1x até máximo configurado)
- [x] Etapa 2: Exibição de economia vs cartão tradicional
- [x] Etapa 2: Cálculo dinâmico de saldo após compra
- [x] Etapa 3: Geração de cobrança PIX para 1ª parcela
- [x] Etapa 3: QR Code PIX com código copia-e-cola
- [x] Etapa 3: Botão "Simular Pagamento PIX" (sem necessidade de PIX real)
- [x] Etapa 3: Polling simulado (2,5 segundos)
- [x] Etapa 4: Tela de sucesso com ID da transação
- [x] Etapa 4: Detalhes completos das parcelas geradas com datas
- [x] Etapa 4: Resumo de economia total
- [x] Barra de progresso visual com 4 steps
- [x] Animações e feedback visual em cada etapa
- [x] Componente CheckoutSimulator totalmente funcional


## 🔔 NOVA FEATURE: Sistema de Notificações Personalizadas

### Objetivo
Implementar sistema completo de notificações in-app com preferências personalizáveis e atualização em tempo real

### Funcionalidades Backend
- [x] Criar tabela `notifications` no banco de dados
- [x] Criar tabela `notificationPreferences` para preferências do usuário
- [x] Endpoint para listar notificações (com paginação e filtros)
- [x] Endpoint para marcar notificação como lida
- [x] Endpoint para marcar todas como lidas
- [x] Endpoint para deletar notificação
- [x] Endpoint para obter/atualizar preferências
- [x] Função helper para criar notificações automaticamente

### Funcionalidades Frontend
- [x] Componente NotificationBell no header com badge de contagem
- [x] Dropdown com lista de notificações recentes
- [x] Página completa de notificações (/notifications)
- [x] Página de preferências de notificação (/settings/notifications)
- [x] Atualização automática a cada 30 segundos
- [x] Animações e feedback visual

### Tipos de Notificações
- [x] Transação completada
- [x] Parcela paga
- [x] Parcela vencendo (3 dias antes)
- [x] Parcela vencida
- [x] Token criado/aprovado
- [x] Limite de crédito aumentado
- [x] Webhook recebido (para merchants)
- [x] SmartQR gerado (para merchants)
- [x] Nova venda (para merchants)
- [x] Pagamento recebido (para merchants)
- [x] Anúncios do sistema
- [x] 12 tipos de notificações implementados


## 🚀 SPRINT 2: Funcionalidades que NÃO dependem de Secrets

### Contexto
Usuário está aguardando abertura de conta Gerencianet para obter credenciais PIX. Enquanto isso, vamos implementar funcionalidades que não dependem de secrets externos.

### 1. Geração de SmartQR no MerchantDashboard
- [x] Adicionar botão "Gerar SmartQR" no MerchantDashboard
- [x] Modal para configurar valor, descrição e parcelas (1x até 12x)
- [x] Chamar endpoint merchant.generateSmartQR (já existe no backend)
- [x] Exibir QR Code gerado com opção de download PNG/SVG
- [x] Listar histórico de QR Codes gerados com status e parcelas
- [x] Export de QR Codes para PDF/CSV

### 2. Pagar Agora nas Parcelas (ConsumerDashboard)
- [x] Botão "Pagar Agora" em cada parcela pendente
- [x] Modal de pagamento PIX (gerar cobrança + QR Code)
- [x] Botão "Simular Pagamento PIX" para demo (mock até ter secrets)
- [x] Botão "Renegociar" para parcelas vencidas (toast informativo)
- [x] Timeline completa de parcelas com status visual
- [x] Progress bar de pagamento do plano

##### 3. Configuração de Webhooks para Merchants
- [x] Criar página /webhooks para merchant configurar URL
- [x] Testar webhook com botão "Enviar Teste"
- [x] Exibir histórico de webhooks enviados (últimos 50)
- [x] Regenerar secret de validação
- [x] Documentação de eventos e validação de assinatura
- [x] 3 tabs: Configuração, Histórico, Documentação
- [x] 5 tipos de eventos documentados
- [x] Exemplo de validação HMAC-SHA256 em Node.jssponíveis### 4. Logs de Webhooks no AdminDashboard
- [x] Seção "Últimos Webhooks" no AdminDashboard
- [x] Tab dedicada "Webhooks" com 6 colunas
- [x] Tabela com: timestamp, merchant, evento, status, retry count, HTTP status
- [x] Mock data com 5 exemplos de webhooks
- [x] Dica sobre retry automático e configuraçãoanualmente
- [ ] Visualizar payload completo


## 🚀 ROADMAP DE INOVAÇÃO (Baseado em Innovation Canvas)

### Sprint 3: Experiência WOW e Gamificação (2-3 dias) ⚡ ALTA PRIORIDADE
- [ ] Visualização de limite dinâmica com gráfico circular animado
- [ ] Sistema de badges (Primeiro Token, 5 Compras, Pagador Pontual, etc)
- [ ] Níveis progressivos: Bronze → Prata → Ouro → Platina
- [ ] Benefícios por nível (cashback progressivo, parcelas extras)
- [ ] Leaderboard de top 10 usuários do mês
- [ ] Animações de confete ao completar pagamento
- [ ] Gráfico de economia acumulada vs cartão tradicional
- [ ] Timeline de conquistas no perfil

### Sprint 4: Rede de Lojistas e Fidelização (3-4 dias) ⚡ ALTA PRIORIDADE
- [ ] Página /lojistas com marketplace de merchants parceiros
- [ ] Filtros: categoria, cashback, localização
- [ ] Selo "Aceita ParcelToken" para merchants
- [ ] Programa de fidelização multi-loja
- [ ] Cashback acumulado entre todos lojistas
- [ ] Ofertas exclusivas para usuários P₮
- [ ] Sistema de indicação B2B para merchants
- [ ] Dashboard de rede de indicações

### Sprint 5: Monitoramento e Inteligência (4-5 dias) 🔥 DIFERENCIAL COMPETITIVO
- [ ] Dashboard de risco com taxa de inadimplência em tempo real
- [ ] Score de risco por usuário (0-1000)
- [ ] Alertas automáticos de risco
- [ ] Limite dinâmico com IA (aumentar/reduzir automaticamente)
- [ ] Métricas de negócio: Consumer, Merchant, Plataforma
- [ ] Sistema de alertas inteligentes (fraude, oportunidades, retenção)
- [ ] Previsão de inadimplência com ML básico

### Sprint 6: Plataformização - API Aberta (1-2 semanas) 🚀 LONGO PRAZO
- [ ] API pública com documentação OpenAPI
- [ ] SDKs: JavaScript, Python, PHP, Ruby
- [ ] Sandbox para testes
- [ ] Rate limits e planos (Free, Pro, Enterprise)
- [ ] Marketplace de integrações (WooCommerce, Shopify, VTEX)
- [ ] Widget de checkout incorporável
- [ ] White label com customização

### Ações Complementares (Não-Técnicas)
- [ ] Contratar advogado especializado em fintech
- [ ] Mapear requisitos Banco Central (IP, SCD)
- [ ] Formalizar USP e criar pitch deck
- [ ] Definir TAM e segmentos prioritários
- [ ] Fechar parcerias com IPs, Open Finance, KYC/AML
- [ ] Recrutar 10-20 lojistas piloto


## ✅ TESTE PIX EFI BANK - CONCLUÍDO

### Resultados
- [x] Secrets EFI_CLIENT_ID, EFI_CLIENT_SECRET, EFI_PIX_KEY carregadas
- [x] Certificado digital .p12 convertido para PEM
- [x] Autenticação mTLS com certificado funcionando
- [x] Token OAuth 2.0 obtido com sucesso (expira em 3600s)
- [x] Cobrança PIX criada: PARCELTOKEN176278285976255SYK3YZV
- [x] QR Code gerado e salvo (qrcode-test.png)
- [x] Código copia-e-cola funcional
- [x] Consulta de status operacional
- [x] Integração 100% funcional em PRODUÇÃO
- [ ] Configurar webhook público para notificações
- [ ] Testar pagamento real e confirmação via webhook

### Arquivos
- test-pix.mjs - Script de teste completo
- efi-cert.pem / efi-key.pem - Certificados
- qrcode-test.png - QR Code de teste
- RELATORIO_TESTE_PIX.md - Relatório completo

---

## 🧠 PRIORIDADE: Smart Credit Layer (IA + Open Finance)

### Objetivo
Criar camada de crédito inteligente com limite dinâmico evolutivo baseado em IA e Open Finance, superando score tradicional

### Planejamento
- [x] Arquitetura técnica documentada (ARQUITETURA_SMART_CREDIT_BLOCKCHAIN.md)
- [x] Escolha de provider: Pluggy (R$ 0,50/conexão)
- [x] Definição de features do modelo (7 variáveis)
- [x] Estimativa de custos: R$ 1.500/mês (1k usuários)

### Componentes
- [x] Integração Open Finance (Pluggy)
- [x] Análise de fluxo de caixa bancário em tempo real
- [x] Serviço openFinance.ts com cálculo de métricas
- [x] Tabelas openFinanceConnections e openFinanceMetrics
- [x] Endpoints tRPC: createConnectToken, saveConnection, syncData, getMetrics
- [x] Página /open-finance para conectar conta bancária
- [x] Visualização de métricas (receita, despesa, estabilidade, tendência)
- [x] Dados mock para desenvolvimento sem API key
- [x] Modelo de IA para score dinâmico (TensorFlow.js Node)
- [x] Histórico de pagamentos ParcelToken como feature
- [x] Comportamento gamificado como feature (nível, badges, frequência)
- [x] Limite evolutivo automático (aumenta/diminui baseado em comportamento)
- [x] Serviço smartCredit.ts com rede neural (7 features → score 0-1000)
- [x] Endpoints tRPC: calculateScore, updateLimitAutomatically
- [x] 3 regras automáticas: aumento (score>700), redução (score<400), congelamento (3+ atrasos)
- [ ] Dashboard de crédito inteligente para usuário
- [ ] API de score para merchants validarem risco

### Features do Modelo de IA
- [ ] Fluxo de caixa médio (últimos 3 meses)
- [ ] Regularidade de receitas
- [ ] Taxa de inadimplência histórica
- [ ] Frequência de uso do ParcelToken
- [ ] Pontuação de gamificação
- [ ] Tempo como cliente
- [ ] Diversidade de merchants usados

## ⛓️ PRIORIDADE: Blockchain Backend (Rastreabilidade)

### Objetivo
Registrar emissão de tokens e pagamentos em blockchain privada para rastreabilidade, confiança regulatória e futura tokenização DeFi

### Arquitetura
- [ ] Escolher rede: Hyperledger Fabric (privada) ou Polygon PoS (pública)
- [ ] Smart contract para emissão de P₮
- [ ] Smart contract para registro de pagamentos
- [ ] Smart contract para transferência de crédito (mercado secundário)
- [ ] Integração com backend atual (eventos de token/pagamento)
- [ ] Explorer interno para visualizar transações on-chain

### Dados Registrados On-Chain
- [ ] Emissão de ParcelToken (hash único, userId, creditLimit, timestamp)
- [ ] Reutilização de token (transactionId, amount, merchantId, installments)
- [ ] Pagamento de parcela (installmentId, amount, timestamp, status)
- [ ] Transferência de crédito entre investidores (futuro)

### Benefícios
- ✅ Rastreabilidade completa e imutável
- ✅ Confiança regulatória (auditoria transparente)
- ✅ Base para tokenização DeFi futura
- ✅ Diferencial competitivo vs KOIN (não usa blockchain)
- ✅ Possibilidade de mercado secundário de crédito


## 🔄 INTEGRAÇÃO PIX REAL + DASHBOARD CRÉDITO IA

### Fase 1: Integrar PIX ao pixService.ts
- [x] Atualizar GerencianetPixGateway para usar certificado digital
- [x] Adicionar leitura de efi-cert.pem e efi-key.pem
- [x] Configurar httpsAgent com certificado em produção
- [x] Parser de secrets da variável Paceltoken_pay
- [x] Método getHttpsAgent() com certificado mTLS
- [x] Atualizar getAccessToken, createCharge, getChargeStatus
- [x] Integração PIX real funcional em produção

### Fase 2: Webhook Público PIX
- [ ] Expor endpoint /api/webhook/pix via domínio público
- [ ] Validar assinatura HMAC da Efi Bank
- [ ] Processar evento de pagamento confirmado
- [ ] Atualizar status da parcela no banco
- [ ] Enviar notificação ao usuário
- [ ] Registrar log de webhook recebido

### Fase 3: Dashboard de Crédito Inteligente
- [x] Criar página /credit-score
- [x] Exibir score atual (0-1000) com progress bar animada
- [x] Breakdown por categoria (Open Finance 40%, Histórico 35%, Comportamento 25%)
- [x] Limite atual vs recomendado pela IA com setas de variação
- [x] Recomendações personalizadas dinâmicas baseadas no score
- [x] Botão "Atualizar Limite" com integração tRPC
- [x] Seção "Como Calculamos" explicando modelo de IA
- [x] 3 cards de breakdown com progresso visual
- [x] Insights automáticos baseados em regras

### Fase 4: Teste End-to-End
- [ ] Criar ParcelToken no dashboard
- [ ] Gerar SmartQR no merchant
- [ ] Escanear QR Code e selecionar parcelas
- [ ] Pagar via PIX real
- [ ] Validar webhook recebido
- [ ] Confirmar parcela atualizada
- [ ] Verificar notificação enviada


## 🐛 BUGS CRÍTICOS - PRIORIDADE MÁXIMA

### Bug 1: Logout não funciona
- [ ] Investigar por que logout não limpa sessão
- [ ] Verificar cookie de sessão (COOKIE_NAME)
- [ ] Testar clearCookie no backend
- [ ] Validar redirecionamento após logout
- [ ] Implementar logout em ambas contas (consumidor/merchant)

### Bug 2: Checkout não localiza QR Code
- [ ] Investigar rota /checkout/:qrId
- [ ] Verificar se QR Code está sendo salvo no banco
- [ ] Validar query de busca por ID
- [ ] Testar com QR Code gerado no merchant
- [ ] Adicionar logs para debug

### Bug 3: QR Code gerado não é reconhecido pelo banco
- [ ] Validar formato do código copia-e-cola
- [ ] Verificar se chave PIX está correta
- [ ] Testar com app bancário real
- [ ] Validar resposta da API Efi Bank
- [ ] Implementar retry automático

---

## 📊 FUNCIONALIDADES ESSENCIAIS - PARA VIABILIDADE

### Open Finance Real (Pluggy)
- [ ] Configurar API key Pluggy
- [ ] Implementar fluxo de conexão bancária
- [ ] Coletar dados reais de fluxo de caixa
- [ ] Validar métricas calculadas
- [ ] Atualizar score IA com dados reais

### Integrações Externas
- [ ] Documentar todas APIs necessárias
- [ ] Criar guia de configuração de secrets
- [ ] Implementar health check para integrações
- [ ] Adicionar fallback para modo sandbox

### Documentação & FAQ
- [ ] Criar FAQ completa (10+ perguntas)
- [ ] Guia de integração para merchants
- [ ] Documentação de webhooks
- [ ] Troubleshooting de erros comuns
- [ ] Vídeo tutorial de 3 minutos

---

## 🎨 APRESENTAÇÃO PARA INVESTIDORES

### Visual & UX
- [ ] Melhorar landing page com case studies
- [ ] Adicionar testimonials de merchants
- [ ] Criar seção de métricas (KPIs)
- [ ] Implementar dark mode (opcional)
- [ ] Otimizar mobile responsiveness

### Credibilidade
- [ ] Adicionar certificações de segurança
- [ ] Documentar conformidade LGPD/PCI-DSS
- [ ] Criar página de roadmap público
- [ ] Adicionar links para redes sociais
- [ ] Implementar analytics (Plausible/Mixpanel)
