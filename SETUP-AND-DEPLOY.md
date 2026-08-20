# Guia Para Setup Inicial, Configurações Gerais & Deploy (Vercel)

Passo-a-passo completo para rodar o repositório **localmente** e fazer o **deploy em uma conta Vercel nova**.

---

## 1. Visão Geral

| Item | Detalhe |
|---|---|
| **Repositório** | `https://github.com/funewagency/gislainelozano.git` |
| **Framework** | Next.js 16 (App Router, `output: "standalone"`) |
| **Linguagem** | TypeScript (modo estrito) |
| **Estilo** | Tailwind CSS 4 + shadcn/ui |
| **Runtime / PM** | **Bun** (obrigatório — `packageManager: bun@1.3.14`, lockfile `bun.lock`) |
| **Banco de dados** | PostgreSQL gerenciado no **Supabase** (via Prisma ORM) |
| **Auth** | NextAuth.js (credentials + hash SHA-256) |
| **Analytics** | PostHog (+ Umami opcional) |
| **Erros** | Sentry (opcional) |
| **Deploy** | Vercel (produção) |

### O que o sistema faz

1. **Landing page** de alta conversão (hero, serviços, bio, FAQ, depoimentos).
2. **Formulário de contato** → salva lead no PostgreSQL (Supabase) e notifica um CMS remoto opcional.
3. **Painel administrativo** em `/admin` — gerenciar conteúdo do site (todas as seções), leads (paginação, busca, exclusão em lote), configurações de analytics e preview ao vivo.
4. **Webhook de revalidação** (`/api/revalidate`) para cache do Next.js.

---

## 2. Pré-requisitos

Instale antes de começar:

- **Bun** `>= 1.3` → https://bun.sh (`curl -fsSL https://bun.sh/install | bash`)
- **Git**
- Conta no **Supabase** (gratuita) → https://supabase.com
- Conta no **Vercel** (a nova conta onde fará o deploy) → https://vercel.com
- (Opcional) Conta no **PostHog** → https://posthog.com

---

## 3. Setup Local (primeira execução)

### 3.1 Clonar e instalar dependências

```bash
git clone https://github.com/funewagency/gislainelozano.git
cd gislaine-lozano

bun install
```

### 3.2 Criar o banco no Supabase

1. Acesse https://supabase.com → **New project**.
2. Escolha nome (ex.: `gislaine-lozano`), senha forte do banco e região (ex.: `South America (São Paulo)`).
3. Aguarde o projeto ser provisionado.
4. Em **Project Settings → Database → Connection string**, copie as **duas** URLs:

| Tipo | Porta | Para que serve |
|---|---|---|
| **Pooler / transaction** (`DATABASE_URL`) | `6543` com `?pgbouncer=true` | Conexão em runtime no Vercel |
| **Direct** (`DIRECT_URL`) | `5432` | Migrations e seed do Prisma |

Exemplo:

```
DATABASE_URL="postgresql://postgres.xxxx:senha@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.xxxx:senha@aws-0-sa-east-1.pooler.supabase.com:5432/postgres"
```

### 3.3 Criar o arquivo `.env`

Não existe `.env.example` versionado (`.env` está no `.gitignore`). Crie o `.env` na raiz:

```bash
# === Banco (Supabase) ===
DATABASE_URL="postgresql://postgres.xxxx:senha@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.xxxx:senha@aws-0-sa-east-1.pooler.supabase.com:5432/postgres"
DATABASE_PROVIDER="postgresql"

# === Admin / Auth ===
ADMIN_USERNAME="admin"
# Hash SHA-256 da senha. Gere com:  echo -n "sua-senha" | shasum -a 256
ADMIN_PASSWORD_HASH="gere_seu_hash_sha256_aqui"
# Gere um segredo aleatório:  bunx openssl rand -base64 32  (ou: openssl rand -base64 32)
NEXTAUTH_SECRET="troque-por-um-segredo-aleatorio"
NEXTAUTH_URL="http://localhost:3000"

# === CMS remoto (opcional — magma-saas) ===
NEXT_PUBLIC_CMS_URL=""
NEXT_PUBLIC_TENANT_SLUG="gislaine"
WEBHOOK_SECRET=""

# === PostHog (opcional) ===
NEXT_PUBLIC_POSTHOG_KEY=""
NEXT_PUBLIC_POSTHOG_HOST="https://us.i.posthog.com"
NEXT_PUBLIC_POSTHOG_API_KEY=""
NEXT_PUBLIC_POSTHOG_PROJECT_ID=""
POSTHOG_API_KEY=""

# === Site ===
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=""

# === Sentry (opcional) ===
SENTRY_DSN=""
NEXT_PUBLIC_SENTRY_DSN=""

# === Rate limit do formulário ===
RATE_LIMIT_CONTACT_MAX="10"
```

> 🔑 Só `DATABASE_URL` é **obrigatória** para rodar (o validador em `src/lib/env.ts` exige `DATABASE_URL` e `WEBHOOK_SECRET`). O restante é opcional e degrada com graça.

### 3.4 Migrations + seed

```bash
# Aplica as migrations no banco (usa DIRECT_URL)
bunx prisma migrate deploy

# Gera o Prisma Client (necessário após install/clone)
bunx prisma generate

# Seed: cria AnalyticsSetting + CmsState inicial com o conteúdo padrão
bun run db:seed
```

> Se preferir sincronizar o schema direto (sem histórico de migrations): `bunx prisma db push`.

### 3.5 Rodar

```bash
bun run dev        # http://localhost:3000
```

Verifique:

- **Site público:** http://localhost:3000
- **Painel admin:** http://localhost:3000/admin/login → usuário `admin` + a senha que você definiu no hash
- **Health check:** http://localhost:3000/api/health

---

## 4. Testes e Build

```bash
bun run lint              # ESLint
bun test                  # Unit tests (Vitest)
bun run build             # Build de produção (gera .next/standalone)
bun run test:e2e          # Build + testes E2E (Playwright)
```

> O build usa **Bun** (lockfile `bun.lock`). Não use `npm`/`pnpm`/`yarn` — o `package.json` define `packageManager: bun@1.3.14` e o build depende de dependências hoisted pelo Bun.

---

## 5. Deploy em uma NOVA conta Vercel

### 5.1 Opção A — Importar pelo GitHub (recomendada)

1. **Transfira o repositório** para o GitHub da nova conta (fork privado, ou transfira a propriedade em Settings → Danger Zone → Transfer). Como alternativa, `git push` para um repositório novo seu.
2. Acesse https://vercel.com (login com a **nova conta**) → **Add New → Project**.
3. Importe o repositório.
4. **Framework Preset:** Next.js (detectado automaticamente).
5. **Build settings** (padrão já basta):
   - Install Command: `bun install`
   - Build Command: `bun run build`
   - Output Directory: `.next/standalone`
   - Node.js Version: `24.x` (ou `22.x`)
6. Configure as **variáveis de ambiente** (mesma tabela da seção 3.3, com valores de produção):

| Variável | Valor de produção (exemplo) |
|---|---|
| `DATABASE_URL` | URL do pooler Supabase (porta 6543, `?pgbouncer=true`) |
| `DIRECT_URL` | URL direta Supabase (porta 5432) |
| `DATABASE_PROVIDER` | `postgresql` |
| `ADMIN_USERNAME` | `admin` |
| `ADMIN_PASSWORD_HASH` | hash SHA-256 da senha de produção |
| `NEXTAUTH_SECRET` | segredo aleatório |
| `NEXTAUTH_URL` | `https://SEU-DOMINIO.vercel.app` |
| `NEXT_PUBLIC_SITE_URL` | `https://SEU-DOMINIO.vercel.app` |
| `WEBHOOK_SECRET` | segredo do webhook (recomendado) |
| `NEXT_PUBLIC_TENANT_SLUG` | `gislaine` |
| PostHog / Sentry / Umami | opcionais, se quiser telemetria |

7. Clique em **Deploy**.

### 5.2 Opção B — CLI (sem transferir o repositório)

```bash
npm i -g vercel
cd gislaine-lozano
vercel login          # login na NOVA conta
vercel link           # cria projeto novo (ou seleciona existente)
vercel env add DATABASE_URL            # repita para cada variável
vercel env add ADMIN_USERNAME
vercel env add ADMIN_PASSWORD_HASH
vercel env add NEXTAUTH_SECRET
vercel env add NEXTAUTH_URL
vercel env add NEXT_PUBLIC_SITE_URL
vercel env add WEBHOOK_SECRET
vercel env add DATABASE_PROVIDER
vercel env add NEXT_PUBLIC_TENANT_SLUG
vercel --prod
```

> O CLI envia os arquivos locais respeitando `.gitignore` e `.vercelignore` (que já excluem lockfiles de pnpm/yarn e session files).

### 5.3 Após o deploy — migrations no banco de produção

O banco do Supabase de produção precisa das tabelas. Rode as migrations apontando para o banco de produção (**de sua máquina**, com as variáveis de produção no ambiente):

```bash
DATABASE_URL="<pooler-url>" DIRECT_URL="<direct-url>" bunx prisma migrate deploy
DATABASE_URL="<pooler-url>" DIRECT_URL="<direct-url>" bun run db:seed
```

> ⚠️ **Importante:** o pooler do Supabase não suporta transações de migration — por isso o Prisma usa `DIRECT_URL` (porta 5432) para migrations e seed.

### 5.4 Verificar o deploy

- **Site:** `https://SEU-DOMINIO.vercel.app` → deve carregar a landing page.
- **Health:** `https://SEU-DOMINIO.vercel.app/api/health` → `200`.
- **Admin:** `https://SEU-DOMINIO.vercel.app/admin/login` → login com `admin` + senha de produção.
- **Leads:** depois de enviar um formulário de contato, eles devem aparecer em `/admin/dashboard/leads` (persistidos no PostgreSQL do Supabase).

### 5.5 Domínio customizado (opcional)

1. No projeto Vercel: **Settings → Domains** → **Add Domain**.
2. Adicione `gislainelozano.com.br` (ou o domínio novo).
3. Configure os registros DNS no provedor (A/ALIAS para `76.76.21.21` ou CNAME `cname.vercel-dns.com`).
4. Atualize `NEXTAUTH_URL` e `NEXT_PUBLIC_SITE_URL` para o domínio final e **redeploy** (`vercel --prod`).

---

## 6. Manutenção e operação

### Fluxo de atualização de conteúdo (via painel)

1. Cliente loga em `/admin` e edita as seções (editor Lexical para textos ricos).
2. Salvar → API `/api/admin/cms` grava no PostgreSQL (`CmsState` + `CmsRevision`).
3. O front busca conteúdo via API do CMS (cache in-memory 30s) — atualiza em até ~30s.

### Fluxo de leads

- Formulário → `POST /api/contact` → `Contact` no PostgreSQL (com UTM: source/medium/campaign).
- Painel `/admin/dashboard/leads` → paginação, busca e exclusão em lote (rate-limited).

### Comandos úteis

| Comando | Descrição |
|---|---|
| `bun run dev` | Dev server |
| `bun run build` | Build produção |
| `bun run start` | Serve `.next/standalone` localmente |
| `bun run lint` | ESLint |
| `bun test` | Unit tests |
| `bun run test:e2e` | E2E Playwright |
| `bunx prisma migrate deploy` | Aplica migrations no banco |
| `bun run db:seed` | Seed (CmsState + AnalyticsSetting) |
| `bun run db:generate` | Gera Prisma Client |
| `bunx prisma studio` | Inspecionar banco via UI |

### Trocar a senha do admin

```bash
echo -n "nova-senha" | shasum -a 256    # macOS
# ou
echo -n "nova-senha" | sha256sum        # Linux
```

Atualize `ADMIN_PASSWORD_HASH` no `.env` local **e** nas env vars da Vercel, depois redeploy.

---

## 7. Solução de Problemas

| Problema | Causa provável | Solução |
|---|---|---|
| Build falha com "module not found @lexical/..." | Instalou com npm/pnpm (resolução estrita) | `rm -rf node_modules bun.lock && bun install` |
| Vercel usa pnpm/npm | Lockfile `pnpm-lock.yaml`/`package-lock.json` presente | Deletar e adicionar ao `.vercelignore` (já configurado) |
| `Error: Can't reach database server` | `DATABASE_URL`/`DIRECT_URL` errados | Conferir credenciais no painel do Supabase (pooler 6543 / direct 5432) |
| Migration falha no pooler | Prisma tentando usar porta 6543 | Usar `DIRECT_URL` (porta 5432) para `migrate deploy` |
| Login admin falha | Hash errado ou `ADMIN_USERNAME` não bate | Regenerar hash e atualizar env vars |
| Página não atualiza após salvar no CMS | Cache in-memory de 30s | Aguardar ~30s; verificar `WEBHOOK_SECRET` do `/api/revalidate` |
| Formulário retorna erro | Rate limit (`RATE_LIMIT_CONTACT_MAX`) ou banco inacessível | Aumentar limite temporariamente; conferir logs no Vercel |

---

## 8. Segurança (checklist antes de publicar)

- [ ] Trocar `NEXTAUTH_SECRET` (nunca reutilizar o mesmo entre ambientes).
- [ ] Definir `ADMIN_PASSWORD_HASH` com uma senha forte **sua** (a documentada aqui é a de produção atual).
- [ ] Rotacionar credenciais do Supabase se o repositório for público (o `.env` **não** é versionado, mas credenciais antigas podem ter vazado em prints/PRs).
- [ ] `WEBHOOK_SECRET` forte se o CMS remoto estiver em uso.
- [ ] Manter `.env` e `.env.local` fora do git (já no `.gitignore`).

---

*Documento gerado para onboarding do novo proprietário. Qualquer dúvida: comece pelo `README.md` e por este guia.*
