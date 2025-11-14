# 📦 Guia Completo de Deployment - ParcelToken

**Versão:** 1.0  
**Data:** 10 de Novembro de 2025  
**Status:** ✅ Pronto para Produção

---

## 📋 Índice

1. [Pré-requisitos](#pré-requisitos)
2. [Variáveis de Ambiente](#variáveis-de-ambiente)
3. [Instalação Local](#instalação-local)
4. [Setup do Banco de Dados](#setup-do-banco-de-dados)
5. [Configuração de Secrets](#configuração-de-secrets)
6. [Deploy em Produção](#deploy-em-produção)
7. [Monitoramento](#monitoramento)
8. [Troubleshooting](#troubleshooting)

---

## 🔧 Pré-requisitos

**Software Necessário:**
- Node.js 18+ (recomendado 20+)
- pnpm 8+ (gerenciador de pacotes)
- MySQL 8+ ou TiDB
- Git

**Contas Externas Necessárias:**
- Efi Bank (Gerencianet) - Para PIX
- Pluggy - Para Open Finance
- Resend - Para envio de emails
- Manus - Para OAuth e infraestrutura

---

## 🔐 Variáveis de Ambiente

### Arquivo `.env.production`

```bash
# ===== DATABASE =====
DATABASE_URL=mysql://user:password@host:3306/parceltoken

# ===== AUTHENTICATION =====
JWT_SECRET=seu_jwt_secret_muito_seguro_aqui
VITE_APP_ID=seu_app_id_manus
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://portal.manus.im
OWNER_OPEN_ID=seu_owner_open_id
OWNER_NAME=ParcelToken

# ===== PIX / EFI BANK =====
EFI_CLIENT_ID=seu_client_id
EFI_CLIENT_SECRET=seu_client_secret
EFI_PIX_KEY=sua_chave_pix
EFI_CERT_PATH=/path/to/producao-851390-ParcelToken.pem
EFI_KEY_PATH=/path/to/producao-851390-ParcelToken-key.pem

# ===== OPEN FINANCE =====
PLUGGY_API_KEY=sua_pluggy_api_key
PLUGGY_CLIENT_ID=seu_pluggy_client_id

# ===== EMAIL =====
RESEND_API_KEY=sua_resend_api_key
RESEND_FROM_EMAIL=noreply@parceltoken.com

# ===== FRONTEND =====
VITE_APP_TITLE=ParcelToken Pay
VITE_APP_LOGO=https://seu-dominio.com/logo.svg
VITE_FRONTEND_FORGE_API_KEY=sua_forge_api_key
VITE_FRONTEND_FORGE_API_URL=https://api.manus.im
VITE_ANALYTICS_ENDPOINT=https://analytics.seu-dominio.com
VITE_ANALYTICS_WEBSITE_ID=seu_website_id

# ===== BUILT-IN APIS =====
BUILT_IN_FORGE_API_KEY=sua_forge_api_key_backend
BUILT_IN_FORGE_API_URL=https://api.manus.im
```

---

## 💻 Instalação Local

### 1. Clonar Repositório

```bash
git clone https://github.com/seu-usuario/parceltoken.git
cd parceltoken-platform
```

### 2. Instalar Dependências

```bash
pnpm install
```

### 3. Configurar Variáveis de Ambiente

```bash
cp .env.example .env.local
# Editar .env.local com suas credenciais
```

### 4. Iniciar em Desenvolvimento

```bash
pnpm dev
```

Acesse: `http://localhost:3000`

---

## 🗄️ Setup do Banco de Dados

### 1. Criar Banco de Dados

```sql
CREATE DATABASE parceltoken CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. Aplicar Migrações

```bash
pnpm db:push
```

Isso executará todas as migrações do Drizzle ORM.

### 3. Seed de Dados (Opcional)

```bash
pnpm db:seed
```

Popula banco com dados de teste.

### 4. Verificar Schema

```bash
pnpm db:studio
```

Abre interface visual do banco de dados.

---

## 🔑 Configuração de Secrets

### Efi Bank (PIX)

1. Acesse: https://dashboard.gerencianet.com.br
2. Gere certificado digital `.p12`
3. Converta para PEM:
   ```bash
   openssl pkcs12 -in producao-851390-ParcelToken.p12 -out efi-cert.pem -clcerts -nokeys
   openssl pkcs12 -in producao-851390-ParcelToken.p12 -out efi-key.pem -nocerts -nodes
   ```
4. Adicione caminhos ao `.env`

### Pluggy (Open Finance)

1. Acesse: https://dashboard.pluggy.ai
2. Crie aplicação
3. Copie `API_KEY` e `CLIENT_ID`
4. Adicione ao `.env`

### Resend (Email)

1. Acesse: https://resend.com
2. Crie API key
3. Adicione ao `.env`

---

## 🚀 Deploy em Produção

### Opção 1: Docker

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

COPY . .

RUN pnpm build

EXPOSE 3000

CMD ["pnpm", "start"]
```

Build e deploy:
```bash
docker build -t parceltoken:latest .
docker run -p 3000:3000 --env-file .env.production parceltoken:latest
```

### Opção 2: Vercel/Railway

1. Conecte repositório Git
2. Configure variáveis de ambiente
3. Deploy automático

### Opção 3: VPS (Ubuntu)

```bash
# 1. SSH no servidor
ssh user@seu-servidor.com

# 2. Instalar dependências
curl -fsSL https://get.pnpm.io/install.sh | sh -
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 3. Clonar e configurar
git clone https://github.com/seu-usuario/parceltoken.git
cd parceltoken-platform
pnpm install

# 4. Criar .env.production
nano .env.production

# 5. Rodar migrações
pnpm db:push

# 6. Build
pnpm build

# 7. Iniciar com PM2
npm install -g pm2
pm2 start "pnpm start" --name "parceltoken"
pm2 save
pm2 startup
```

---

## 📊 Monitoramento

### Logs

```bash
# Desenvolvimento
pnpm dev

# Produção (PM2)
pm2 logs parceltoken

# Docker
docker logs -f container_id
```

### Métricas

- **Uptime:** Monitorar com Uptime Robot
- **Performance:** New Relic ou Datadog
- **Erros:** Sentry ou LogRocket
- **Database:** MySQL Workbench

### Health Check

```bash
curl https://seu-dominio.com/api/health
```

---

## 🔧 Troubleshooting

### Erro: "Cannot find module"

```bash
pnpm install
pnpm build
```

### Erro: "Database connection failed"

- Verificar `DATABASE_URL`
- Testar conexão: `mysql -u user -p -h host`
- Verificar firewall

### Erro: "PIX não funciona"

- Verificar certificado `.pem`
- Testar com `test-pix.mjs`
- Validar secrets Efi Bank

### Erro: "Webhook não recebido"

- Verificar URL pública
- Testar com `ngrok` em dev
- Validar assinatura HMAC

---

## 📝 Checklist de Deploy

- [ ] Variáveis de ambiente configuradas
- [ ] Banco de dados criado e migrado
- [ ] Certificados PIX em lugar seguro
- [ ] Testes E2E passando
- [ ] SSL/HTTPS configurado
- [ ] Backup automático do banco
- [ ] Monitoramento ativo
- [ ] Logs centralizados
- [ ] Rate limiting ativo
- [ ] CORS configurado

---

## 🆘 Suporte

**Documentação:** https://docs.parceltoken.com  
**Issues:** https://github.com/seu-usuario/parceltoken/issues  
**Email:** support@parceltoken.com

---

**Última atualização:** 10 de Novembro de 2025
