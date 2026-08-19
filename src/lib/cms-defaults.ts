import type { GlobalConfig } from './cms-types';

export const DEFAULT_THEME = {
  primaryColor: '#19396C',
  accentColor: '#DF823C',
  backgroundColor: '#FAF6EF',
  surfaceColor: '#FFFFFF',
  textColor: '#1A1C20',
  mutedColor: '#5A5E62',
  headingFont: 'Outfit, sans-serif',
  bodyFont: 'Plus Jakarta Sans, sans-serif',
  baseFontSize: 16,
  sectionPadding: 96,
  cardBorderRadius: 16,
  buttonBorderRadius: 0,
  headingLetterSpacing: -0.5,
  bodyLineHeight: 1.6,
};

export const DEFAULT_CMS_DATA: GlobalConfig = {
  meta: {
    lastSaved: null,
    lastSavedBy: null,
    version: 1,
  },

  sectionOrder: [
    { id: 'navbar', label: 'Navbar', enabled: true },
    { id: 'hero', label: 'Hero', enabled: true },
    { id: 'painPoints', label: 'Para Quem É', enabled: true },
    { id: 'bio', label: 'Sobre Mim', enabled: true },
    { id: 'positioning', label: 'Posicionamento', enabled: true },
    { id: 'services', label: 'Serviços', enabled: true },
    { id: 'testimonials', label: 'Feedbacks', enabled: true },
    { id: 'faq', label: 'FAQ', enabled: true },
    { id: 'contact', label: 'Contato', enabled: true },
    { id: 'whatsappModal', label: 'WhatsApp Modal', enabled: true },
    { id: 'footer', label: 'Footer', enabled: true },
  ],

  theme: { ...DEFAULT_THEME },

  navbar: {
    logoUrl: '/images/gislaine/logo-icon-only.webp',
    brandName: 'GISLAINE LOZANO',
    whatsappUrl: 'https://wa.me/5545988231902?text=Ol%C3%A1!%20Gostaria%20de%20saber%20mais%20sobre%20a%20mentoria.',
    links: [
      { id: 'nav-1', label: 'Sobre', sectionId: '#sobre' },
      { id: 'nav-2', label: 'Serviços', sectionId: '#servicos' },
      { id: 'nav-3', label: 'Feedbacks', sectionId: '#resultados' },
      { id: 'nav-4', label: 'FAQ', sectionId: '#faq' },
    ],
  },

  hero: {
    titleHtml:
      '<strong>Tudo Comunica:</strong> quando sua comunicação é estratégica, vender deixa de ser esforço e passa a ser consequência.',
    description:
      'Sou Gislaine Lozano, estrategista de comunicação e negócios, e ajudo empresas a organizarem sua comunicação, seu posicionamento e suas estratégias de venda.',
    ctaText: 'Quero falar no WhatsApp',
    scrollLabel: 'Scroll',
    mobileImageUrl: '/images/gislaine/mobile-hero.webp',
    desktopImageUrl: '/images/gislaine/gislaine-new-hero.webp',
  },

  painPoints: {
    eyebrow: 'Para Quem É',
    bullets: [
      'Para quem sente que o negócio tem potencial, mas a comunicação ainda não sustenta as vendas.',
      'Para quem atende clientes todos os dias, mas percebe que perde oportunidades por falhas no atendimento.',
      'Para quem quer estruturar marketing, posicionamento e vendas de forma mais profissional.',
      'Para quem deseja uma visão estratégica para crescer com mais consistência e intenção.',
    ],
    calloutText: 'Se você se identifica,',
    calloutEmphasis: 'é porque está na hora de mudar.',
  },

  bio: {
    eyebrow: 'Sobre',
    titleHtml: 'Quem é <strong>Gislaine Lozano?</strong>',
    paragraphs: [
      'Me chamo Gislaine Lozano. Atuo oficialmente no mercado desde 2019, ajudando empresas a organizarem sua comunicação, posicionamento e estratégias de venda.',
      'Sou estrategista de comunicação e negócios, e acredito que uma marca forte não é construída apenas com presença digital, mas com mensagem clara, atendimento bem estruturado e percepção de valor.',
    ],
    portraitImageUrl: '/images/gislaine/sobre-photo.webp',
    careerPath: [
      'CEO da Funew Agency',
      'Professora universitária no curso de Publicidade e Propaganda',
      'Mentora estratégica de negócios',
      'Coordenadora de Marketing do Titão Culinária Nordestina',
      'Estudiosa de neuromarketing, pessoas e comportamento do consumidor',
    ],
    overlayName: 'GISLAINE LOZANO',
    overlayRole: 'Estratégia & Conversão',
  },

  positioning: {
    eyebrow: 'Posicionamento',
    titleHtml:
      'Tudo Comunica. Esse é o meu posicionamento e também a base de tudo o que ensino e aplico.',
    paragraph1:
      'Tudo Comunica significa entender que cada ponto de contato com o cliente comunica algo: o seu perfil, a sua proposta, a sua forma de responder, o jeito como você conduz a conversa, a organização da sua marca e até a experiência que você entrega.',
    emphasisText:
      'não existe venda forte com comunicação confusa.',
    paragraph2:
      'Quando a comunicação é bem construída, o atendimento deixa de ser improviso, o posicionamento ganha força e a venda acontece com mais naturalidade.',
  },

  services: {
    eyebrow: 'Serviços',
    titleHtml: 'Serviços e soluções <strong>estratégicas</strong>',
    items: [
      {
        id: 'svc-1',
        number: '01',
        title: 'E-book — Conversas que viram clientes',
        subtitle: 'O básico do atendimento que realmente gera vendas',
        description:
          'Se você conversa todos os dias com clientes no WhatsApp, mas sente que poderia vender mais, este e-book é para você. Aqui você aprende, de forma prática e estratégica, como transformar atendimentos em oportunidades reais de venda, utilizando comunicação clara, condução de conversa e princípios de comportamento do consumidor. Ideal para empreendedores que querem parar de perder clientes por falhas simples no atendimento e começar a estruturar um processo que converte.',
        ctaText: 'Quero o e-book Conversas que viram clientes',
        includes: null,
      },
      {
        id: 'svc-2',
        number: '02',
        title: 'Aula Tudo Comunica',
        subtitle: 'Estratégia, posicionamento e conexão para vender mais',
        description:
          'Uma aula completa de 1h30 para você entender como posicionar sua marca no digital de forma estratégica e gerar conexão real com seu público. Você vai aprender os principais erros e acertos na comunicação de empresas, além de insights práticos sobre atendimento, posicionamento e construção de marca. Mais do que vender, você vai entender como criar uma marca que gera percepção de valor e constrói relacionamento.',
        ctaText: 'Quero acessar a Aula Tudo Comunica',
        includes: null,
      },
      {
        id: 'svc-3',
        number: '03',
        title: 'Comunidade Tudo Comunica',
        subtitle: 'Estruture sua comunicação, posicione sua marca e construa o seu crescimento',
        description:
          'O Tudo Comunica é um curso completo para empreendedoras que querem sair do improviso e estruturar o marketing, a comunicação e as vendas do seu negócio de forma estratégica. Aqui você aprende a organizar desde o básico, como seus canais digitais, até o avançado: posicionamento, planejamento de conteúdo, tráfego pago, estrutura comercial e experiência do cliente.',
        ctaText: 'Quero entrar na Comunidade Tudo Comunica',
        includes: [
          'Estrutura completa de posicionamento',
          'Planejamento de conteúdo e execução',
          'Fundamentos de tráfego pago',
          'Organização do funil e atendimento',
          'Aplicação de neuromarketing e experiência do cliente',
        ],
      },
      {
        id: 'svc-4',
        number: '04',
        title: 'Funew Agency',
        subtitle: 'Estruturamos o crescimento do seu negócio com estratégia, dados e tecnologia',
        description:
          'A Funew Agency é uma agência estratégica de marketing focada em estruturar operações de crescimento através da união entre posicionamento, comunicação, dados e tráfego pago. Mais do que executar ações, atuamos como parceiros do negócio, organizando toda a jornada do cliente, do primeiro contato até a conversão, com foco em previsibilidade e escala.',
        ctaText: 'Quero falar com a Funew Agency',
        includes: null,
      },
      {
        id: 'svc-5',
        number: '05',
        title: 'Consultorias & Mentorias Estratégicas',
        subtitle: 'Diagnóstico, direcionamento e estrutura para crescer com estratégia',
        description:
          'Cada negócio está em um momento diferente e, por isso, não existe uma solução única. Antes de qualquer entrega, realizamos uma análise estratégica da sua empresa para entender o cenário atual, identificar gargalos e mapear oportunidades de crescimento. A partir disso, direcionamos você para o formato mais adequado.',
        ctaText: 'Quero um diagnóstico estratégico',
        includes: null,
      },
    ],
  },

  testimonials: {
    eyebrow: 'Feedbacks',
    titleHtml: 'Prova <strong>social.</strong>',
    description:
      'Veja o que dizem quem já transformou sua comunicação e vendas com meu trabalho.',
    items: [
      {
        id: 'test-1',
        name: 'Davi Leonardo da Silva',
        role: 'Pedroso Tur',
        paragraphs: [
          {
            id: 'tp-1-1',
            text: 'Olha vem sendo de grande ajuda tudo oq vocês vem fazendo no insta e websites da empresa, tanto gerenciando quanto em consultoria, eu não tinha ideia que tem tanta coisa que eu não me atentava em ver, e todos meus clientes estão elogiando muito a nova cara da página que devo a vocês!',
          },
        ],
      },
      {
        id: 'test-2',
        name: 'Fabiana Zétola',
        role: 'Nadai Confort Hotel & Spa',
        paragraphs: [
          {
            id: 'tp-2-1',
            text: 'Trabalhar com a Gislaine — ou simplesmente Gi, para os mais próximos — foi uma grata surpresa. Já havia tido contato com ela anteriormente, mas nada tão profundo e profissional quanto essa experiência.',
          },
          {
            id: 'tp-2-2',
            text: 'Desde o início, demonstrou uma paciência genuína, conduzindo cada etapa com clareza e sensibilidade, sempre me orientando com estratégias assertivas e bem alinhadas ao momento.',
          },
          {
            id: 'tp-2-3',
            text: 'A Gi se destaca, sobretudo, pela sua resiliência — uma característica que se revela na sua capacidade de transitar com naturalidade pelas diferentes camadas e desafios da hotelaria.',
          },
          {
            id: 'tp-2-4',
            text: 'É, sem dúvida, uma profissional que agrega não apenas pela competência técnica, mas também pela forma como se envolve e acredita nos projetos que assume.',
          },
        ],
      },
      {
        id: 'test-3',
        name: 'William Macieski',
        role: 'Altaa Digital',
        paragraphs: [
          {
            id: 'tp-3-1',
            text: 'Tive o prazer de trabalhar com a Gislaine por cerca de um ano na área de atendimento publicitário, e posso dizer com tranquilidade que foi uma parceria muito alinhada, tanto no aspecto profissional quanto pessoal.',
          },
          {
            id: 'tp-3-2',
            text: 'Gislaine é uma profissional extremamente organizada, ágil e produtiva. Sempre esteve à frente das demandas com proatividade, clareza na comunicação e um olhar atento aos detalhes.',
          },
          {
            id: 'tp-3-3',
            text: 'Recomendo a Gislaine com total confiança e certeza de que ela será um grande reforço em qualquer equipe que venha a integrar.',
          },
        ],
      },
      {
        id: 'test-4',
        name: 'Lauane Reis',
        role: 'Make Up',
        paragraphs: [
          {
            id: 'tp-4-1',
            text: 'Passando pra agradecer a mentoria maravilhosa que você fez comigo, foi tudo tão claro, você sempre muito paciente para me explicar as coisas, foi um investimento, realmente investimento porque estou usando muito, inclusive muito do que você me ensinou até minhas clientes tem elogiado e percebido, com certeza vou levar tudo pra vida, sou uma nova profissional após a mentoria, valeu cada centavo.',
          },
        ],
      },
    ],
  },

  faq: {
    eyebrow: 'Dúvidas',
    titleHtml: 'Perguntas <strong>frequentes.</strong>',
    items: [
      {
        id: 'faq-1',
        question: 'Como funciona o atendimento?',
        answer:
          'O atendimento é totalmente personalizado. Após um diagnóstico inicial da sua marca e objetivos, construímos uma estratégia sob medida com acompanhamento contínuo. Tudo é feito de forma online, com reuniões periódicas e suporte via WhatsApp.',
      },
      {
        id: 'faq-2',
        question: 'Qual serviço é ideal para mim?',
        answer:
          'Depende do seu momento. Se você precisa estruturar sua comunicação do zero, a Consultoria Estratégica é o caminho. Se já tem uma base mas quer escalar vendas, a Mentoria Comercial é ideal. Na nossa primeira conversa, avaliamos juntos o melhor plano.',
      },
      {
        id: 'faq-3',
        question: 'Preciso ter experiência em marketing?',
        answer:
          'Não! Meu trabalho é justamente traduzir conceitos complexos de marketing e vendas em ações práticas e acessíveis. Você não precisa saber de termos técnicos: eu guio todo o processo.',
      },
      {
        id: 'faq-4',
        question: 'Quanto tempo leva para ver resultados?',
        answer:
          'Os primeiros resultados em comunicação e posicionamento costumam aparecer nas primeiras semanas. Resultados comerciais mais consistentes surgem entre 30 e 90 dias, dependendo do segmento e da aplicação das estratégias.',
      },
      {
        id: 'faq-5',
        question: 'Os serviços são online ou presenciais?',
        answer:
          'Todos os serviços são 100% online. Isso permite que eu atenda clientes de qualquer lugar do Brasil com a mesma qualidade e dedicação. As reuniões acontecem por videochamada e o acompanhamento é diário via WhatsApp.',
      },
      {
        id: 'faq-6',
        question: 'Como posso começar?',
        answer:
          'É simples! Clique no botão abaixo e fale comigo pelo WhatsApp. Vou entender seu cenário, tirar suas dúvidas e, se fizer sentido, agendamos nosso diagnóstico estratégico.',
      },
    ],
    footerCtaQuestion: 'Ainda tem dúvidas? Vamos conversar.',
    footerCtaButtonText: 'Falar com Gislaine no WhatsApp',
  },

  contact: {
    eyebrow: 'Fale Comigo',
    titleHtml: 'Seu tempo possui valor.<br/>Suas conversas também.',
    description:
      'Chega de falar sozinho(a). Venha aprender a vender seu valor e fechar mais negócios via WhatsApp.',
    features: [
      'Sessão individual personalizada',
      'Roteiro de vendas exclusivo',
      'Acompanhamento por 30 dias',
    ],
    guaranteeTitle: 'Garantia de resultado',
    guaranteeDescription: 'Ou seu investimento de volta',
    submitButtonText: 'Garantir Minha Vaga',
  },

  footer: {
    brandName: 'GISLAINE LOZANO',
    logoUrl: '/images/gislaine/logo-icon-only.webp',
    copyrightText: 'by magma',
    links: [
      { id: 'fl-1', label: 'Sobre', sectionId: '#sobre' },
      { id: 'fl-2', label: 'Serviços', sectionId: '#servicos' },
      { id: 'fl-3', label: 'Feedbacks', sectionId: '#resultados' },
      { id: 'fl-4', label: 'FAQ', sectionId: '#faq' },
    ],
  },
  whatsappModal: {
    title: 'Falar com Gislaine',
    message: 'Olá! Como posso te ajudar hoje?',
    buttonText: 'Enviar mensagem',
    phoneNumber: '5545988231902',
    triggerDelay: 0,
    showOnExitIntent: false,
  },
};
