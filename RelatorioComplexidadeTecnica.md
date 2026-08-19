# Relatório de Complexidade Técnica — Plataforma Gislaine Lozano

## 1. Resumo Executivo
O projeto Gislaine Lozano é uma aplicação híbrida composta por uma landing page de alta conversão voltada ao público e um portal administrativo completo e privado. Seu objetivo principal é converter tráfego de alta intenção em leads de vendas qualificados via WhatsApp, sustentado por um ciclo sofisticado de analytics e monitoramento comportamental.

## 2. Arquitetura & Fundamentação Técnica
O projeto utiliza o paradigma **App Router do Next.js 16**, escolhido pelo desempenho no servidor, otimização de SEO e controle fino sobre o fetching de dados.

- **Runtime:** Bun (gerenciamento de pacotes e execução de scripts de alta velocidade).
- **Linguagem:** TypeScript (modo estrito) em toda a base de código, garantindo segurança de tipos do schema do banco até os componentes de UI.
- **Estratégia de Deploy:** A aplicação é compilada em um **container Node.js standalone**. O processo de build no `package.json` é intencionalmente não padrão para garantir que todos os assets estáticos, páginas geradas e lógica server-side sejam empacotados em um único artefato portátil e pronto para produção.
- **Persistência de Dados:** Prisma ORM gerenciando um banco relacional de produção — **PostgreSQL hospedado no Supabase** — com conexão via pooler (runtime) e conexão direta (migrations), exigindo fluxos de migração de schema sofisticados (`db:push`, `db:migrate`, `migrate deploy`).

## 3. Implementação Frontend & Design System
A estética "Conversão Premium" não vem de templates prontos, mas de um design system proprietário e rigorosamente governado.

- **Estratégia de Componentes:** Construída sobre **Shadcn/UI**, que fornece a base de acessibilidade (Radix UI) permitindo sobrescritas de estilo em nível atômico.
- **Estilização Orientada a Tokens:** O design system impõe uma hierarquia de tokens estrita, sem margem para erro. Cores, escalas tipográficas e espaçamentos não são números mágicos — são derivados de uma configuração unificada, garantindo consistência de marca.
- **Engenharia de Movimento:** `framer-motion` é usado para implementar animações narrativas. Isso exige conhecimento especializado de padrões de observer acionados por scroll, sequenciamento de movimento e o requisito absoluto de fallbacks de `prefers-reduced-motion` para conformidade com WCAG.
- **Narrativa Responsiva:** O layout não é apenas responsivo — é adaptativo. Emprega funções CSS `clamp()` para tipografia e sistemas de grid sofisticados que mudam de estado conforme o viewport, não apenas ocultação baseada em breakpoints.

## 4. Sistema de Gerenciamento de Conteúdo (CMS) & Camada de Dados
A plataforma permite que a cliente gerencie conteúdo dinamicamente, sem intervenção de desenvolvedores.

- **Texto Rico Lexical:** Integração profunda com `@mdxeditor/editor` (e dependências `@lexical/*` declaradas) permitindo estrutura de conteúdo complexa — não apenas texto plano — mantendo o estilo visual do site em produção.
- **Revalidação Dinâmica:** O projeto implementa a Revalidação Sob Demanda do Next.js (`/api/revalidate`). Quando a cliente salva uma atualização no CMS, o servidor purga inteligentemente o cache de rotas específicas, garantindo atualizações instantâneas em produção sem necessidade de rebuild completo.
- **Formulário & Persistência:** Integração de `react-hook-form` com validação de schema `zod`, criando um contrato rígido entre o input do frontend, a validação da API backend e o armazenamento no banco.
- **Painel Administrativo:** Portal completo em `/admin` com editor de conteúdo (todas as seções), gerenciamento de leads (paginação, busca, exclusão em lote com rate-limit), configurações de analytics e preview ao vivo.

## 5. Segurança & Autenticação
- **NextAuth.js:** Implementação de autenticação por sessão robusta (strategy JWT).
- **Proteção do Admin:** O namespace `/admin` é protegido por middleware que impõe controle de acesso.
- **Credenciais:** Usuário e senha definidos via variáveis de ambiente (`ADMIN_USERNAME`, `ADMIN_PASSWORD_HASH`). A senha é armazenada apenas como **hash SHA-256** com comparação em tempo constante (`timingSafeEqual`) — nunca em texto puro.
- **Segurança de API:** Toda rota backend em `/api/admin` exige acesso autenticado e privilegiado, protegendo a integridade das tabelas de leads e do conteúdo do site.

## 6. Observabilidade, Analytics & Performance
Uma aplicação de nível de produção deve ser monitorada tão de perto quanto uma loja física.

- **Analytics Híbrido:** O projeto utiliza **PostHog** tanto no cliente (para mapas de calor comportamentais e rastreamento de funil) quanto no servidor (para atribuição segura e filtrada por bots). Isso permite entender não apenas *que* alguém converteu, mas *como* chegou.
- **Integração Sentry:** Rastreamento abrangente de erros. O Sentry monitora crashes client-side, erros 500 server-side e timeouts de API, alertando a equipe de engenharia antes que a cliente perceba degradação de desempenho.
- **Orçamento de Performance:** Com múltiplas famílias de fontes, bibliotecas de movimento e assets complexos do CMS, o projeto mantém performance via gestão estrita de dependências e táticas de code-splitting inerentes ao build do Next.js.

## 7. CI/CD & Pipeline de Produção
O rótulo "Nível de Produção" é conquistado pela robustez do pipeline de CI/CD, não apenas pelo código.

1. **Validação de Código (`lint`, type-check):** Qualquer PR deve passar pelo linter e pelo compilador TypeScript.
2. **Suíte de Testes (`vitest`, `playwright`):**
   - *Testes Unitários (`vitest`):* Validam a lógica complexa do CMS, handlers de rotas de API e utilitários de banco (587 testes).
   - *Testes E2E (`playwright`):* Simulam caminhos reais de usuário (ex.: "Visitante vê serviços, clica no CTA do WhatsApp, lead é registrado"), garantindo que o caminho de negócio mais crítico *não pode* quebrar.
3. **Artefato de Deploy:** O script de build customizado cria um diretório isolado `.next/standalone`, único artefato enviado ao ambiente de produção.
4. **Sincronização de Banco:** Deploys de produção acionam migrations do Prisma, exigindo operações atômicas para garantir zero perda de dados durante a transição.
5. **Paridade de Ambientes:** O projeto utiliza um sistema rigoroso de `env.ts` para garantir que ambientes de produção, staging e desenvolvimento nunca configurem mal segredos críticos ou endpoints de API.

## 8. Fluxos Operacionais & Manutenção
Este sistema exige cuidado contínuo para permanecer "premium".

- **Ciclo de Vida do Lead:** Gerenciamento do fluxo de dados de leads, garantindo conformidade com LGPD no armazenamento e fornecendo à cliente um dashboard acessível para gerenciar esses dados.
- **Governança de Conteúdo:** O CMS é a superfície principal da cliente. Qualquer alteração feita no painel propaga-se pelo ORM, pela API de revalidação e, finalmente, para o navegador do usuário.
- **Ciclo de Vida de Assets:** O uso de `sharp` para otimização de imagens on-the-fly garante que fotografias de alta qualidade não comprometam a velocidade de carregamento mobile.

## 9. Resumo do Índice de Complexidade
Este projeto gerencia a interseção de vários domínios de alta complexidade:
1. **UX/Design:** Estética de marca de alta precisão, com muito movimento.
2. **Infraestrutura:** Deploy de servidor standalone + gerenciamento de migrations de banco (PostgreSQL/Supabase).
3. **Integridade de Dados:** CMS headless acoplado a validação estrita de Zod/Prisma.
4. **Observabilidade:** Analytics integrado em múltiplas camadas e rastreamento de erros.

*Este projeto foi construído para escala, performance e autonomia da cliente.* Qualquer modificação ou expansão arrisca essas integrações frágeis; deve ser tratado com o nível de consciência arquitetural detalhado acima.
