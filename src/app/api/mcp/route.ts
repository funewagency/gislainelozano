import { NextRequest, NextResponse } from 'next/server';
import { sanitizeInput, sanitizeEmail, sanitizePhone } from '@/lib/sanitize';
import { db } from '@/lib/db';
import { isValidPhone } from '@brazilian-utils/brazilian-utils';
import { readLimiter, mutationLimiter, shouldRateLimit } from '@/lib/rate-limit';

const MENTOR_DATA = {
  name: 'Gislaine Lozano',
  title: 'Consultora & Mentora Estratégica de Vendas',
  organization: 'Funew Agency',
  methodology: 'Método Tudo Comunica (Engenharia de Conversação, Posicionamento e Fechamento no WhatsApp)',
  location: 'Brasil (Atendimento Online Nacional e Internacional)',
  contact: {
    website: 'https://gislainelozano.com.br',
    whatsapp: '+55 (45) 98823-1902',
    schedulingUrl: 'https://gislainelozano.com.br/#contato',
  },
  services: [
    {
      id: 'ebook',
      title: 'E-book Estratégico de Vendas',
      description: 'Guia prático com roteiros prontos e técnicas de fechamento rápido para WhatsApp.',
      format: 'Digital / Download Imediato',
    },
    {
      id: 'aula',
      title: 'Aula Master de Vendas',
      description: 'Treinamento completo em negociação persuasiva e condução de reuniões de alta conversão.',
      format: 'Vídeo / Acesso Imediato',
    },
    {
      id: 'comunidade',
      title: 'Comunidade Exclusiva de Negócios',
      description: 'Grupo VIP para troca de experiências, networking e suporte contínuo.',
      format: 'Assinatura / Acesso Recorrente',
    },
    {
      id: 'mentoria',
      title: 'Mentoria Individual de Vendas (1-on-1)',
      description: 'Acompanhamento estratégico individualizado com diagnóstico 360º e plano de ação personalizado.',
      format: 'Sessões Individuais Online + Suporte Direto',
    },
    {
      id: 'agencia',
      title: 'Consultoria Corporativa (Funew Agency)',
      description: 'Estruturação da máquina de vendas e posicionamento digital para empresas.',
      format: 'Consultoria Empresarial',
    },
  ],
  faq: [
    {
      question: 'Como funciona o atendimento?',
      answer: 'O atendimento é 100% online e personalizado. Analisamos o momento da sua empresa para traçar uma rota direta de vendas.',
    },
    {
      question: 'Qual serviço é ideal para o meu momento?',
      answer: 'Depende do seu estágio atual. Na avaliação inicial, identificamos a melhor opção entre materiais de entrada e a mentoria individual.',
    },
    {
      question: 'Em quanto tempo vejo resultados?',
      answer: 'Mudanças na postura e clareza de mensagens geram retorno imediato nas primeiras semanas, consolidando resultados sólidos em 30 a 90 dias.',
    },
    {
      question: 'Como agendar uma mentoria?',
      answer: 'Basta enviar seus dados no formulário do site ou pelo WhatsApp oficial para iniciar o atendimento.',
    },
  ],
};

export async function GET(request: NextRequest) {
  if (shouldRateLimit()) {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const { allowed } = readLimiter.check(`mcp-get:${ip}`);
    if (!allowed) {
      return NextResponse.json({ error: 'Muitas requisições' }, { status: 429 });
    }
  }

  return NextResponse.json({
    protocol: 'model-context-protocol',
    version: '1.0.0',
    mentor: MENTOR_DATA.name,
    description: MENTOR_DATA.title,
    endpoints: {
      info: 'https://gislainelozano.com.br/api/mcp',
      manifest: 'https://gislainelozano.com.br/.well-known/mcp.json',
      llmsTxt: 'https://gislainelozano.com.br/llms.txt',
      llmsFullTxt: 'https://gislainelozano.com.br/llms-full.txt',
    },
    data: MENTOR_DATA,
  });
}

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    if (shouldRateLimit()) {
      const { allowed } = mutationLimiter.check(`mcp-post:${ip}`);
      if (!allowed) {
        return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
      }
    }

    const body = await request.json();
    const { action, tool, params = {} } = body;
    const requestedTool = tool || action;

    switch (requestedTool) {
      case 'get_mentor_info':
        return NextResponse.json({
          status: 'success',
          result: {
            name: MENTOR_DATA.name,
            title: MENTOR_DATA.title,
            organization: MENTOR_DATA.organization,
            methodology: MENTOR_DATA.methodology,
            location: MENTOR_DATA.location,
            contact: MENTOR_DATA.contact,
          },
        });

      case 'list_services': {
        const category = params.category ? String(params.category).toLowerCase() : null;
        const filtered = category
          ? MENTOR_DATA.services.filter((s) => s.id.includes(category) || s.title.toLowerCase().includes(category))
          : MENTOR_DATA.services;

        return NextResponse.json({
          status: 'success',
          result: filtered,
        });
      }

      case 'get_faq': {
        const query = params.query ? String(params.query).toLowerCase() : null;
        const filtered = query
          ? MENTOR_DATA.faq.filter(
              (f) => f.question.toLowerCase().includes(query) || f.answer.toLowerCase().includes(query),
            )
          : MENTOR_DATA.faq;

        return NextResponse.json({
          status: 'success',
          result: filtered,
        });
      }

      case 'submit_lead_inquiry': {
        const rawName = sanitizeInput(params.name, 100);
        const rawEmail = sanitizeEmail(params.email);
        const rawPhone = sanitizePhone(params.phone);
        const message = params.message ? sanitizeInput(params.message, 1000) : null;

        if (!rawName || !rawEmail || !rawPhone) {
          return NextResponse.json(
            { status: 'error', error: 'Nome, e-mail e telefone são obrigatórios.' },
            { status: 400 },
          );
        }

        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(rawEmail)) {
          return NextResponse.json(
            { status: 'error', error: 'E-mail em formato inválido.' },
            { status: 400 },
          );
        }

        if (!isValidPhone(rawPhone)) {
          return NextResponse.json(
            { status: 'error', error: 'Telefone inválido (necessário DDD brasileiro).' },
            { status: 400 },
          );
        }

        const lead = await db.contact.create({
          data: {
            name: rawName,
            email: rawEmail,
            phone: rawPhone,
            message: message ? `[Origem: WebMCP/IA] ${message}` : '[Origem: WebMCP/IA Agente]',
            source: 'webmcp-ai-agent',
          },
        });

        return NextResponse.json({
          status: 'success',
          message: 'Solicitação registrada com sucesso! A equipe de Gislaine Lozano entrará em contato.',
          leadId: lead.id,
        });
      }

      default:
        return NextResponse.json(
          {
            status: 'error',
            error: `Ferramenta '${requestedTool}' não reconhecida. Ferramentas disponíveis: get_mentor_info, list_services, get_faq, submit_lead_inquiry.`,
          },
          { status: 400 },
        );
    }
  } catch (error) {
    return NextResponse.json(
      { status: 'error', error: (error as Error).message },
      { status: 500 },
    );
  }
}
