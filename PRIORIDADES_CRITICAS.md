# 🎯 Prioridades Críticas - ParcelToken Pay

**Baseado nas instruções do ChatGPT Estruturador**  
**Data:** 09/11/2025  
**Status Atual:** 85% funcional  
**Objetivo:** Tornar operacional e validável para investidores

---

## ✅ JÁ IMPLEMENTADO (85%)

### Backend
- [x] Tokenização básica (criar, buscar, atualizar)
- [x] Endpoint de reutilização de token (`POST /user.reuseToken`)
- [x] Histórico de tokens (`GET /user.tokenHistory`)
- [x] Limite dinâmico (saldo reduz conforme uso)
- [x] SmartQR adaptativo (detecta token ativo)
- [x] Tabelas de installmentPlans e installmentPayments
- [x] Endpoints de parcelas (listar, pagar, histórico)
- [x] Sistema de webhooks

### Frontend
- [x] Dashboard do consumidor com token ativo
- [x] Timeline de parcelas com barras de progresso
- [x] Notificações de vencimento (toast + badge)
- [x] Gráfico de evolução de crédito
- [x] Histórico de uso do token por merchant
- [x] Botão de reutilização de token
- [x] Modal de escolha (usar saldo vs novo parcelamento)
- [x] Exportação de relatórios (PDF/CSV)

---

## ❌ GAPS CRÍTICOS (15% faltante)

### 🔴 PRIORIDADE MÁXIMA (Bloqueadores para Demo)

#### 1. Motor de Parcelamento Real
**Status:** Parcial (50%)  
**Faltando:**
- [ ] Geração automática de parcelas ao criar transação
- [ ] Cálculo de juros compostos/desconto dinâmico
- [ ] Atualização automática de saldo do token ao pagar parcela
- [ ] Endpoint de renegociação (`POST /billing/reschedule`)

**Impacto:** Sem isso, parcelas não são criadas automaticamente e o fluxo fica quebrado.

---

#### 2. Integração PIX Real
**Status:** 0% (Mock)  
**Faltando:**
- [ ] Integração com gateway PIX (Gerencianet/Asaas)
- [ ] Geração de PIX Cobrança por parcela
- [ ] Webhook de confirmação de pagamento
- [ ] Atualização de status de parcela ao receber PIX

**Impacto:** Demonstração não é validável sem liquidação real.

---

#### 3. Lembretes Automáticos
**Status:** 30% (só notificação visual)  
**Faltando:**
- [ ] Envio de e-mail 3 dias antes do vencimento
- [ ] Webhook para merchant quando parcela vence
- [ ] Notificação push (opcional)

**Impacto:** Usuário não é lembrado de pagar, aumenta inadimplência.

---

### 🟡 PRIORIDADE ALTA (Melhorias de UX)

#### 4. Dashboard do Merchant
**Status:** 70%  
**Faltando:**
- [ ] Gráfico de vendas liquidadas vs parceladas
- [ ] Tempo médio de liquidação
- [ ] Volume em PIX instantâneo
- [ ] Botão de geração de SmartQR no dashboard

---

#### 5. Landing Page
**Status:** 80%  
**Faltando:**
- [ ] Animação explicativa (Cliente → Token → Lojista)
- [ ] Seção "Para Desenvolvedores" com SDK
- [ ] Seção "Investidores & Parcerias"

---

### 🟢 PRIORIDADE MÉDIA (Nice to Have)

#### 6. Open Finance
**Status:** 0%  
**Faltando:**
- [ ] Integração com Pluggy/Klavi
- [ ] Score dinâmico baseado em renda
- [ ] Antifraude básico (geo-IP, velocity)

---

#### 7. Admin Dashboard
**Status:** 0%  
**Faltando:**
- [ ] Painel de monitoramento geral
- [ ] Logs de erros e transações
- [ ] Gestão de merchants e tokens

---

## 📋 PLANO DE AÇÃO IMEDIATO

### Semana 1 (Agora)
1. ✅ Implementar geração automática de parcelas
2. ✅ Criar lógica de atualização de saldo ao pagar
3. ✅ Adicionar lembretes por e-mail
4. ✅ Ajustar dashboards para dados reais

### Semana 2
1. Integrar PIX em sandbox (Gerencianet)
2. Implementar webhook de confirmação
3. Testar fluxo completo end-to-end
4. Criar vídeo de demonstração

---

## 🎯 DEFINIÇÃO DE "PRONTO PARA DEMO"

- [x] Token reutilizável funcionando
- [x] SmartQR adaptativo
- [ ] Parcelas geradas automaticamente
- [ ] PIX real (sandbox)
- [ ] Lembretes de vencimento
- [x] Dashboards navegáveis
- [ ] Fluxo completo testado

**Meta:** 95% de conformidade até final da Semana 2
