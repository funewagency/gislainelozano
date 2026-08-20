import type { Metadata } from "next";
import { Syne, Outfit, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { AnalyticsProviders } from "@/components/analytics-providers";
import { ImpeccableLiveScript } from "@/components/impeccable-live-script";

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
});

function getValidSiteUrl(): string {
  const envUrl = (process.env.NEXT_PUBLIC_SITE_URL || '').trim();
  if (!envUrl) return 'https://gislainelozano.com.br';
  try {
    return new URL(envUrl).origin;
  } catch {
    return 'https://gislainelozano.com.br';
  }
}

const SITE_URL = getValidSiteUrl();

export const metadata: Metadata = {
  title: "Gislaine Lozano | Mentoria Estratégica de Vendas & Posicionamento",
  description:
    "Transforme cada conversa no WhatsApp em venda. Método validado de vendas consultivas e posicionamento estratégico para empreendedores e prestadores de serviços.",
  keywords: [
    "mentoria vendas",
    "mentoria estratégica",
    "vendas WhatsApp",
    "estratégia comercial",
    "conversão de vendas",
    "Gislaine Lozano",
    "consultoria vendas",
    "posicionamento digital",
    "tudo comunica",
    "funew agency",
    "mentoria de negócios",
    "fechamento de vendas",
    "vendas online Brasil",
  ],
  authors: [{ name: "Gislaine Lozano", url: SITE_URL }],
  creator: "Gislaine Lozano",
  publisher: "Funew Agency",
  category: "Business & Career Consulting",
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/favicon.ico",
  },
  openGraph: {
    title: "Gislaine Lozano | Mentoria Estratégica de Vendas",
    description:
      "Transforme cada conversa em venda com o método validado de Gislaine Lozano. Estratégia, posicionamento e conversão de alta performance.",
    type: "website",
    locale: "pt_BR",
    url: SITE_URL,
    siteName: "Gislaine Lozano",
    images: [
      {
        url: "/images/gislaine/gislaine-new-hero.webp",
        width: 1920,
        height: 1080,
        type: "image/webp",
        alt: "Gislaine Lozano — Mentoria Estratégica de Vendas",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Gislaine Lozano | Mentoria Estratégica de Vendas",
    description:
      "Transforme conversas em vendas reais. Método validado de vendas para empreendedores.",
    images: ["/images/gislaine/gislaine-new-hero.webp"],
    creator: "@gislainelozano",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  other: {
    "geo.region": "BR-PR",
    "geo.placename": "Cascavel, Paraná, Brasil",
    "geo.position": "-24.9578;-53.4595",
    "ICBM": "-24.9578, -53.4595",
    "distribution": "global",
    "rating": "general",
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || '',
  },
};

function StructuredData() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": `${SITE_URL}/#person`,
        name: "Gislaine Lozano",
        jobTitle: "Mentora e Consultora Estratégica de Vendas",
        description: "Estrategista de vendas, mentora de negócios e CEO da Funew Agency.",
        url: SITE_URL,
        image: `${SITE_URL}/images/gislaine/gislaine-portrait.png`,
        worksFor: {
          "@type": "Organization",
          name: "Funew Agency",
          url: SITE_URL,
        },
        knowsAbout: [
          "Mentoria de Vendas",
          "Vendas Consultivas",
          "Vendas via WhatsApp",
          "Estratégia Comercial",
          "Posicionamento de Mercado",
          "Negociação e Fechamento",
        ],
        sameAs: [
          "https://instagram.com/gislainelozano",
          "https://gislainelozano.com.br",
        ],
      },
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: "Gislaine Lozano Mentoria & Funew Agency",
        url: SITE_URL,
        logo: `${SITE_URL}/images/gislaine/logo-icon-only.png`,
        contactPoint: {
          "@type": "ContactPoint",
          telephone: "+55-45-98823-1902",
          contactType: "sales",
          areaServed: "BR",
          availableLanguage: ["Portuguese"],
        },
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: "Gislaine Lozano — Mentoria Estratégica de Vendas",
        description: "Transforme cada conversa em venda com o método validado de Gislaine Lozano.",
        inLanguage: "pt-BR",
        publisher: { "@id": `${SITE_URL}/#person` },
      },
      {
        "@type": "ProfessionalService",
        "@id": `${SITE_URL}/#service`,
        name: "Mentoria Estratégica de Vendas — Gislaine Lozano",
        description: "Mentoria e consultoria de vendas, posicionamento comercial e conversão no WhatsApp.",
        provider: { "@id": `${SITE_URL}/#person` },
        areaServed: {
          "@type": "Country",
          name: "Brasil",
        },
        telephone: "+55-45-98823-1902",
        priceRange: "$$",
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: "Soluções de Vendas & Mentoria",
          itemListElement: [
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "Service",
                name: "E-book Estratégico de Vendas",
                description: "Scripts práticos e roteiros de fechamento rápido para WhatsApp.",
              },
            },
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "Service",
                name: "Aula Master de Vendas",
                description: "Treinamento em técnicas de persuasão ética e negociação.",
              },
            },
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "Service",
                name: "Comunidade Exclusiva",
                description: "Grupo VIP de networking e suporte contínuo em vendas.",
              },
            },
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "Service",
                name: "Mentoria Individual (1-on-1)",
                description: "Acompanhamento estratégico personalizado com diagnóstico 360º.",
              },
            },
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "Service",
                name: "Consultoria Corporativa (Funew Agency)",
                description: "Estruturação completa de equipes de vendas e processos comerciais.",
              },
            },
          ],
        },
      },
      {
        "@type": "FAQPage",
        "@id": `${SITE_URL}/#faq`,
        mainEntity: [
          {
            "@type": "Question",
            name: "Como funciona o atendimento?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "O atendimento é 100% online e personalizado. Analiso seu cenário atual e crio uma estratégia sob medida para seus objetivos.",
            },
          },
          {
            "@type": "Question",
            name: "Qual serviço é ideal para mim?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Depende do seu momento atual. Na mentoria, avalio seu negócio e indico o melhor caminho: pode ser desde um e-book até uma consultoria completa.",
            },
          },
          {
            "@type": "Question",
            name: "Preciso ter experiência com marketing?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Não! Te guio em cada etapa. O método é pensado para quem está começando ou quer profissionalizar o que já faz.",
            },
          },
          {
            "@type": "Question",
            name: "Em quanto tempo vejo resultados?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "As primeiras mudanças na comunicação surgem nas primeiras semanas. Resultados comerciais sólidos costumam aparecer entre 30 e 90 dias.",
            },
          },
          {
            "@type": "Question",
            name: "É online ou presencial?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "100% online. Você recebe todo o conteúdo e acompanhamento pelo WhatsApp e plataformas digitais.",
            },
          },
          {
            "@type": "Question",
            name: "Como começar?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "É simples! Clique no botão do WhatsApp e converse comigo. Vou entender seu momento e te mostrar a melhor solução.",
            },
          },
        ],
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

let cachedAnalyticsConfig: { ga4Id: string | null; fbPixelId: string | null; gAdsId: string | null; gAdsLabel: string | null } | null = null;
let lastAnalyticsFetchTime = 0;

function AnalyticsConfigScript() {
  const config = {
    ga4Id: process.env.NEXT_PUBLIC_GA4_ID || null,
    fbPixelId: process.env.NEXT_PUBLIC_FB_PIXEL_ID || null,
    gAdsId: process.env.NEXT_PUBLIC_GADS_ID || null,
    gAdsLabel: process.env.NEXT_PUBLIC_GADS_LABEL || null,
  };

  // Only inject the script tag if at least one ID is configured
  const hasAny = Object.values(config).some(Boolean);
  if (!hasAny) return null;

  return (
    <script
      id="analytics-config"
      type="application/json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(config) }}
    />
  );
}

function AnalyticsScript() {
  const umamiUrl = process.env.NEXT_PUBLIC_UMAMI_URL;
  const umamiId = process.env.NEXT_PUBLIC_UMAMI_ID;

  if (!umamiUrl || !umamiId) return null;

  return (
    <>
      <script async src={`${umamiUrl}/script.js`} data-website-id={umamiId} defer />
    </>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <link rel="preload" href="/images/gislaine/gislaine-new-hero.webp" as="image" fetchPriority="high" />
        <link rel="preload" href="/images/gislaine/mobile-hero.webp" as="image" fetchPriority="high" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="theme-color" content="#19396C" />
        <StructuredData />
        <AnalyticsConfigScript />
        <AnalyticsScript />
      </head>
      <body
        className={`${syne.variable} ${outfit.variable} ${jakarta.variable} antialiased bg-background text-foreground`}
        suppressHydrationWarning
      >
        <AnalyticsProviders>
          {children}
        </AnalyticsProviders>
        <Toaster />
        <ImpeccableLiveScript />
      </body>
    </html>
  );
}