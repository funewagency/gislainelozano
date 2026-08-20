# Gislaine Lozano — Landing Page

> Landing page profissional de alta conversão para Mentoria Estratégica de Vendas. Design premium, animações fluidas, formulário de contato integrado e painel administrativo.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38bdf8?logo=tailwindcss)](https://tailwindcss.com)
[![Prisma](https://img.shields.io/badge/Prisma-PostgreSQL-2d3748?logo=prisma)](https://prisma.io)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase)](https://supabase.com)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-12-ff0088?logo=framer)](https://framer.com/motion)

---

## ✨ Funcionalidades

- **Design & Experiência Premium:** Interface moderna com animações fluidas via Framer Motion e micro-interações.
- **Captação de Leads:** Formulário com validação completa e persistência no banco PostgreSQL (Supabase) via Prisma.
- **Painel Administrativo:** Gestão de leads, conteúdo dinâmico e configurações.
- **Analytics & Rastreamento:** Suporte integrado a PostHog, Meta Pixel e Google Analytics.
- **Performance & SEO:** Otimizado com Next.js App Router (standalone), imagens responsivas em formato WebP/AVIF e dados estruturados (JSON-LD).

---

## 🛠️ Tech Stack

- **Framework:** Next.js 16 (React 19, App Router)
- **Linguagem:** TypeScript
- **Estilização:** Tailwind CSS 4 & shadcn/ui
- **Animações:** Framer Motion 12
- **Banco de Dados & ORM:** PostgreSQL (Supabase) com Prisma ORM 6
- **Autenticação:** NextAuth.js
- **Runtime / Package Manager:** Bun

---

## 🚀 Como Executar o Projeto

### Pré-requisitos

- [Bun](https://bun.sh) (recomendado) ou Node.js 18+
- Banco de dados PostgreSQL configurado (ex.: Supabase)

### 1. Clonar e Instalar

```bash
git clone https://github.com/funewagency/gislainelozano.git
cd gislainelozano
bun install
```

### 2. Configurar Variáveis de Ambiente

Crie o arquivo `.env` na raiz do projeto com base nas seguintes variáveis:

```env
# Banco de Dados
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
DATABASE_PROVIDER="postgresql"

# Autenticação & Admin
ADMIN_USERNAME="seu_usuario"
ADMIN_PASSWORD_HASH="hash_sha256_da_sua_senha"
NEXTAUTH_SECRET="seu_secret_aleatorio"
NEXTAUTH_URL="http://localhost:3000"

# Analytics (Opcional)
NEXT_PUBLIC_POSTHOG_KEY=""
NEXT_PUBLIC_POSTHOG_HOST="https://us.i.posthog.com"
```

### 3. Sincronizar o Banco e Iniciar

```bash
# Sincronizar o schema Prisma com o banco de dados
bun run db:push

# Iniciar em modo de desenvolvimento
bun run dev
```

Abra [http://localhost:3000](http://localhost:3000) no seu navegador para ver o resultado.

---

## 📦 Scripts Disponíveis

| Comando | Descrição |
|---|---|
| `bun run dev` | Inicia o servidor de desenvolvimento |
| `bun run build` | Compila o projeto para produção |
| `bun run start` | Executa o servidor standalone de produção |
| `bun run lint` | Executa o linter de código |
| `bun run db:push` | Aplica o schema do Prisma ao banco de dados |
| `bun run db:generate` | Gera o cliente tipado do Prisma |

---

## 🔒 Licença

Propriedade de **Gislaine Lozano**. Todos os direitos reservados.
