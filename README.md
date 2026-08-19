# Gislaine Lozano — Landing Page

> Landing page profissional de alta conversão para Mentoria Estratégica de Vendas. Design premium, animações fluidas, formulário de contato com persistência em PostgreSQL (Supabase) e painel administrativo completo. Stack moderna Next.js 16.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38bdf8?logo=tailwindcss)](https://tailwindcss.com)
[![Prisma](https://img.shields.io/badge/Prisma-PostgreSQL-2d3748?logo=prisma)](https://prisma.io)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase)](https://supabase.com)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-12-ff0088?logo=framer)](https://framer.com/motion)

---

## Seções da Página

| Seção | Componente | Descrição |
|---|---|---|
| **Navbar** | `navbar.tsx` | Navegação fixa (72px) com logo icon+text, links âncora e CTA |
| **Hero** | `hero.tsx` | Impacto visual 100vh com parallax, partículas animadas, botão CTA e hero-boxes (xl+) |
| **Para Quem É** | `pain-points.tsx` | Identificação das dores do público-alvo com cards com hover glow |
| **Sobre (Bio)** | `bio.tsx` | Foto profissional com 6 camadas de sobreposição (opacidade φ‑escalada), métricas e tags |
| **Posicionamento** | `posicionamento.tsx` | Diferenciais de mercado e proposta de valor |
| **Serviços** | `services.tsx` | Catálogo com 5 cards de serviço (E-book, Aula, Comunidade, Agência, Mentoria) com CTAs |
| **Resultados** | `results.tsx` | Prova social com métricas animadas (contadores) e depoimentos |
| **FAQ** | `faq.tsx` | Acordeão com 6 perguntas frequentes e CTA final para WhatsApp |
| **Footer** | `footer.tsx` | Rodapé com logo e links de navegação |
| **WhatsApp FAB** | `whatsapp-fab.tsx` | Botão flutuante com scroll-to-top |

---

## Tech Stack

| Tecnologia | Uso |
|---|---|
| **Next.js 16** | Framework React com App Router + standalone output |
| **TypeScript 5** | Tipagem estática |
| **Tailwind CSS 4** | Estilização utility-first |
| **shadcn/ui** | Componentes UI (New York style) |
| **Framer Motion 12** | Animações, micro-interações e `useInView` |
| **Prisma ORM 6** | PostgreSQL (Supabase) — dados de contato, CMS e analytics |
| **Supabase** | Banco PostgreSQL gerenciado (pooler + conexão direta) |
| **PostHog** | Analytics de eventos e pageviews |
| **Umami** | Analytics alternativo (opcional, via env vars) |
| **next-intl** | Internacionalização |
| **next-auth** | Autenticação |
| **Zustand** | Gerenciamento de estado global |
| **React Query** | Cache e fetching de dados |

### Animações Customizadas

| Animação | Uso |
|---|---|
| `shimmer` | Brilho varredor em overlays de imagem |
| `float` | Flutuação suave (elementos decorativos) |
| `pulse-glow` | Brilho pulsante em cards e CTAs |
| `particle-float` | Partículas de fundo no hero |
| `counter-glow` | Brilho pulsante em contadores |
| `slide-up-blur` | Entrada com blur em elementos |
| `gradient-shift` | Gradiente animado em backgrounds |

---

## Design System

### Paleta de Cores

| Token | Cor | Uso |
|---|---|---|
| `primary` | `#19396C` | Background navy principal |
| `primaryLight` | `#1E4680` | Gradient navy secundário |
| `accent` | `#DF823C` | Laranja principal (CTAs, destaques) |
| `accentLight` | `#EF9648` | Laranja claro (gradients) |
| `accentDark` | `#C46A25` | Laranja escuro (hovers) |
| `cta` | `#B35C1A` | Botões CTA |
| `base` | `#FAF6EF` | Creme (background light sections) |
| `baseDark` | `#F0EAE0` | Creme escuro |
| `text` | `#1A1C20` | Texto principal |

### Tipografia

| Fonte | Uso | CSS Variable |
|---|---|---|
| **Outfit** | Headings | `--font-outfit` |
| **Syne** | Headings bold | `--font-syne` |
| **Plus Jakarta Sans** | Body text | `--font-jakarta` |
| **Inter** | Body text alternativo | `--font-inter` |

---

## Arquitetura

### Fluxo de Dados do Formulário de Contato

```
Usuário → POST /api/contact
             ├── validação (nome, email, phone obrigatórios)
             ├── trackServerSide ('lead_created')
             ├── db.contact.create (PostgreSQL — Supabase via Prisma)
             └── POST /api/v1/gislaine/leads (CMS remoto — magma-saas)
                  └── retorna syncedToCms no response
```

Persistência única: o formulário salva o lead no PostgreSQL (Supabase) via Prisma. Em paralelo, notifica o CMS remoto; se o CMS falhar, o lead permanece salvo no banco sem perda de dados.

### Banco de Dados (Supabase / PostgreSQL)

O banco de produção é um **PostgreSQL gerenciado no Supabase**, acessado pelo Prisma ORM com duas URLs:

| Variável | Uso |
|---|---|
| `DATABASE_URL` | Conexão via **pooler** (Supavisor/PgBouncer) — usada em runtime no Vercel |
| `DIRECT_URL` | Conexão **direta** (porta 5432) — usada pelo Prisma para migrations (`prisma migrate`) |

Schema gerenciado em `prisma/schema.prisma` (provider `postgresql`). Modelos:

- `Contact` — leads do formulário (com UTM: source, medium, campaign)
- `CmsState` / `CmsRevision` — estado atual do CMS + histórico de revisões
- `CmsSetting` — pares chave/valor (configurações gerais)
- `AnalyticsSetting` — IDs de GA4, Facebook Pixel, Google Ads

### Integração CMS (magma-saas)

O CMS remoto fica em `NEXT_PUBLIC_CMS_URL` e fornece:

- **Sections** — conteúdo dinâmico por tipo
- **Services** — cards de serviço gerenciáveis
- **Testimonials** — depoimentos com rating e avatar
- **Faqs** — perguntas frequentes ordenáveis
- **Leads** — leads recebidos do formulário

Cache TTL de 30s in-memory com fallback silencioso.

### Webhook de Revalidação

`POST /api/revalidate` — recebe webhooks do CMS para invalidar o cache do Next.js:

- Assinatura HMAC-SHA256 via header `x-webhook-signature`
- Secreto configurado em `WEBHOOK_SECRET`
- Revalida a rota `/` via `revalidatePath`

### Analytics

| Provedor | Ativação | Eventos |
|---|---|---|
| **PostHog** | Sempre ativo (se chave configurada) | pageview, lead_created, service_interest, faq_toggled, section_view |
| **Umami** | Opcional (via `NEXT_PUBLIC_UMAMI_URL` + `NEXT_PUBLIC_UMAMI_ID`) | Pageviews |

### Performance

- **Dynamic imports** com `next/dynamic` para seções abaixo da dobra (pain-points, bio, posicionamento, services, results, faq)
- **Preload** de hero images (`fetchpriority="high"`, `<link rel="preload">`)
- **Font display swap** em todas as fontes do Google
- **Optimize package imports** para `lucide-react` e `framer-motion`
- **Image formats** AVIF + WebP com sizes otimizados
- **Standalone output** para deploy otimizado

### SEO

- Structured data JSON-LD (Person, WebSite, ProfessionalService, FAQPage)
- Open Graph / Twitter Cards com imagem 1920x1080
- Sitemap.xml dinâmico
- Meta tags completas (description, keywords, robots, google verification)
- Lang `pt-BR`

---

## Pré-requisitos

- **Bun** (recomendado) ou Node.js 18+
- Conta no [Supabase](https://supabase.com) com um projeto PostgreSQL criado
- Conta no [Vercel](https://vercel.com) para deploy

---

## Setup Local

```bash
# 1. Clone
git clone <repo-url>
cd gislaine

# 2. Instale dependências
bun install

# 3. Configure variáveis de ambiente
cp .env.example .env  # ou edite o .env existente

# 4. Inicialize o banco (Supabase/PostgreSQL)
bun run db:push       # sincroniza o schema Prisma com o banco

# 5. Desenvolvimento
bun run dev           # http://localhost:3000

# 6. Build de produção
bun run build
```

### Variáveis de Ambiente

| Variável | Obrigatória | Descrição |
|---|---|---|
| `DATABASE_URL` | Sim | URL do PostgreSQL via **pooler Supabase** (ex.: `postgresql://user:pass@host.pooler.supabase.com:6543/postgres?pgbouncer=true`) |
| `DIRECT_URL` | Sim | URL de conexão **direta** (porta 5432) — usada pelo Prisma nas migrations |
| `DATABASE_PROVIDER` | Não | Provider do Prisma (`postgresql`) |
| `ADMIN_USERNAME` | Sim | Usuário do painel administrativo (`/admin/login`) |
| `ADMIN_PASSWORD_HASH` | Sim | Hash SHA-256 da senha do admin (ver [Acesso Administrativo](#acesso-administrativo)) |
| `NEXTAUTH_SECRET` | Sim | Segredo de sessão do NextAuth |
| `NEXTAUTH_URL` | Sim | URL base da aplicação (ex.: `https://gislainelozano.com.br`) |
| `NEXT_PUBLIC_CMS_URL` | Não | URL do CMS magma-saas |
| `NEXT_PUBLIC_TENANT_SLUG` | Não | Slug do tenant no CMS (`gislaine`) |
| `WEBHOOK_SECRET` | Não | Segredo para assinatura de webhook (`/api/revalidate`) |
| `NEXT_PUBLIC_POSTHOG_KEY` | Não | Chave pública do PostHog |
| `NEXT_PUBLIC_POSTHOG_API_KEY` | Não | Chave da API do PostHog (server-side) |
| `NEXT_PUBLIC_POSTHOG_PROJECT_ID` | Não | ID do projeto no PostHog |
| `NEXT_PUBLIC_POSTHOG_HOST` | Não | Host do PostHog (`https://eu.posthog.com`) |
| `POSTHOG_API_KEY` | Não | Chave da API do PostHog (server-side) |
| `NEXT_PUBLIC_SITE_URL` | Não | URL canônica do site |
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | Não | Código de verificação Google |
| `NEXT_PUBLIC_SENTRY_DSN` / `SENTRY_DSN` | Não | DSN do Sentry (monitoramento de erros) |
| `RATE_LIMIT_CONTACT_MAX` | Não | Máximo de envios do formulário por janela |

### Acesso Administrativo

O painel administrativo fica em **`/admin`** (login em `/admin/login`).

> **Credenciais de acesso (produção):**
>
> | Campo | Valor |
> |---|---|
> | **Usuário** | `admin` |
> | **Senha (hash SHA-256)** | `ae06a2cd4b2865a4335e2adb844f7b439015dc7618abbae2220c919d21ccab5a` |

A senha é armazenada apenas como **hash SHA-256** em `ADMIN_PASSWORD_HASH` (nunca em texto puro). O hash acima é o valor usado em produção (`.env` / Vercel). Para gerar/alterar a senha, use:

```bash
echo -n "sua-nova-senha" | shasum -a 256   # macOS
# ou
echo -n "sua-nova-senha" | sha256sum       # Linux
```

> ⚠️ A senha em texto puro não pode ser recuperada do hash — apenas redefinida. Após trocar a senha, atualize `ADMIN_PASSWORD_HASH` no `.env` local **e** nas variáveis de ambiente da Vercel. Troque o hash acima se alterar a senha de produção.

---

## Scripts

| Comando | Descrição |
|---|---|
| `bun run dev` | Servidor de desenvolvimento (porta 3000) |
| `bun run build` | Build de produção + copia assets para standalone |
| `bun run start` | Inicia servidor standalone de produção |
| `bun run lint` | Verificação de lint (ESLint 9) |
| `bun test` | Testes unitários (Vitest) |
| `bun test:watch` | Testes unitários em watch mode |
| `bun test:coverage` | Testes unitários com cobertura |
| `bun test:e2e` | Build + testes E2E (Playwright) |
| `bun test:e2e:ui` | Build + testes E2E com UI interativa |
| `bun run db:push` | Sincronizar schema Prisma com o banco |
| `bun run db:generate` | Gerar Prisma Client |
| `bun run db:migrate` | Criar migration |
| `bun run db:seed` | Rodar seed (`prisma/seed.ts`) |

---

## API

### `POST /api/contact`

Persiste lead no PostgreSQL (Supabase) e envia para o CMS remoto.

**Body:**

```json
{
  "name": "string (obrigatório)",
  "email": "string (obrigatório, formato válido)",
  "phone": "string (obrigatório)",
  "message": "string (opcional)"
}
```

**Response 200:**

```json
{
  "success": true,
  "message": "Mensagem recebida com sucesso!",
  "syncedToCms": true
}
```

### `GET /api/admin/leads`

Lista leads com paginação, ordenação e estatísticas por fonte.

- `?page=1&limit=20` — paginação
- `?stats=true` — retorna apenas estatísticas agregadas (dashboard)
- `?search=...` — busca por nome/email/telefone

### `DELETE /api/admin/leads`

Remove leads (autenticado, rate-limited). Aceita `{ "ids": string[] }` no corpo ou `?id=<id>`.

### `POST /api/revalidate`

Webhook para revalidar cache do Next.js.

**Headers:** `x-webhook-signature: <hmac-sha256>`

**Body:**

```json
{
  "event": "content_updated",
  "tenant": "gislaine"
}
```

### `POST /api/generate-images`

Gera imagens via z-ai-web-dev-sdk (uso interno).

---

## Estrutura do Projeto

```
├── prisma/
│   └── schema.prisma              # Schema PostgreSQL (Contact, CmsState, CmsRevision...)
├── public/
│   └── images/gislaine/           # Imagens do site
│       ├── gislaine-new-hero.webp  # Hero desktop (1920x1080)
│       ├── mobile-hero.webp        # Hero mobile
│       ├── gislaine-portrait.png   # Retrato hero
│       ├── sobre-photo.jpg         # Foto da seção bio
│       ├── logo-icon-only.png      # Ícone do logo
│       ├── logo-and-text.png       # Logo completo
│       └── ...
├── src/
│   ├── app/
│   │   ├── layout.tsx             # Layout raiz (fontes, SEO, structured data, analytics)
│   │   ├── page.tsx               # Página principal (com dynamic imports)
│   │   ├── loading.tsx            # Loading state
│   │   ├── globals.css            # Estilos globais + animações customizadas
│   │   ├── sitemap.ts             # Sitemap dinâmico
│   │   ├── middleware.ts          # Proteção do namespace /admin
│   │   ├── admin/                 # Painel administrativo
│   │   │   ├── login/             # Tela de login
│   │   │   ├── dashboard/         # Dashboard (content, leads, settings)
│   │   │   └── preview/           # Preview do site com CMS
│   │   └── api/
│   │       ├── contact/route.ts   # POST — formulário de contato
│   │       ├── revalidate/route.ts# POST — webhook de revalidação
│   │       ├── admin/             # APIs do painel (leads, cms, settings, upload, analytics)
│   │       └── generate-images/route.ts # POST — geração de imagens IA
│   ├── components/
│   │   ├── gislaine/              # Componentes públicos do site
│   │   │   ├── constants.ts       # Cores, fontes, URLs, NAV_HEIGHT
│   │   │   ├── navbar.tsx         # Navbar fixa com scroll effect
│   │   │   ├── hero.tsx           # Hero 100vh com parallax + partículas
│   │   │   ├── particles.tsx      # Partículas animadas de fundo
│   │   │   ├── pain-points.tsx    # Seção "Para Quem É"
│   │   │   ├── bio.tsx            # Seção sobre com foto + métricas
│   │   │   ├── posicionamento.tsx # Diferenciais competitivos
│   │   │   ├── services.tsx       # Catálogo de 5 serviços
│   │   │   ├── results.tsx        # Resultados + depoimentos
│   │   │   ├── faq.tsx            # Acordeão de perguntas frequentes
│   │   │   ├── footer.tsx         # Rodapé com logo e links
│   │   │   ├── whatsapp-fab.tsx   # Botão flutuante WhatsApp
│   │   │   └── ...
│   │   ├── admin/                 # Componentes do painel (CMS editor, leads-table...)
│   │   ├── ui/                    # Componentes shadcn/ui
│   │   ├── posthog-provider.tsx   # Provider PostHog (client-side)
│   │   └── lgpd-banner.tsx        # Banner de consentimento LGPD
│   ├── hooks/                     # Hooks customizados
│   └── lib/
│       ├── db.ts                  # Singleton Prisma Client
│       ├── cms.ts                 # Cliente CMS (cache 30s, fallback)
│       ├── auth.ts                # Config NextAuth (credentials + hash SHA-256)
│       ├── analytics.ts           # Analytics client-side (PostHog)
│       ├── analytics-server.ts    # Analytics server-side
│       └── utils.ts               # Utilitários (cn)
├── .env                           # Variáveis de ambiente (não versionado)
├── next.config.ts                 # Config Next.js (standalone, images, i18n)
├── tailwind.config.ts             # Config Tailwind
├── tsconfig.json                  # Config TypeScript
└── components.json                # Config shadcn/ui
```

---

## Deploy na Vercel

### Opção A — GitHub (recomendado)

1. Faça push do código para o GitHub
2. Acesse [vercel.com/new](https://vercel.com/new)
3. Conecte o repositório
4. Configure as variáveis de ambiente no painel da Vercel
5. Clique em **Deploy**

### Opção B — CLI

```bash
npm i -g vercel
vercel login
vercel --prod
```

### Banco de Dados em Produção

O banco de produção é **Supabase (PostgreSQL)** — compatível com o ambiente serverless da Vercel. A configuração usa duas URLs do Prisma:

- `DATABASE_URL` → **pooler** do Supabase (porta 6543, com `pgbouncer=true`) — usada em runtime
- `DIRECT_URL` → conexão **direta** (porta 5432) — usada pelo Prisma nas migrations

Após mudanças no `prisma/schema.prisma`, aplique as migrations apontando para o banco de produção:

```bash
bunx prisma migrate deploy   # aplica migrations pendentes no banco
# ou, para sincronização rápida do schema (sem migrations versionadas):
bunx prisma db push
```

> ⚠️ Use `DIRECT_URL` para migrations: o pooler do Supabase não suporta transações/sessions de migration. Mantenha ambas as variáveis sincronizadas no painel da Vercel.

---

## Licença

Propriedade de **Gislaine Lozano**. Todos os direitos reservados.

---

Desenvolvido com [Next.js](https://nextjs.org), [Tailwind CSS](https://tailwindcss.com), [shadcn/ui](https://ui.shadcn.com) e [Prisma](https://prisma.io).
