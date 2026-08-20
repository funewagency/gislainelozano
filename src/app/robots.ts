import type { MetadataRoute } from 'next';

const rawSiteUrl = (process.env.NEXT_PUBLIC_SITE_URL || '').trim();
const SITE_URL = rawSiteUrl.length > 0 ? rawSiteUrl : 'https://gislainelozano.com.br';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/admin/', '/api/auth/', '/api/generate-images/'],
      },
      {
        userAgent: [
          'Googlebot',
          'Bingbot',
          'YandexBot',
          'DuckDuckBot',
          'Baiduspider',
          'Applebot',
          'facebookexternalhit',
          'Twitterbot',
          'LinkedInBot',
          'WhatsApp',
        ],
        allow: '/',
        disallow: ['/admin/', '/api/admin/', '/api/auth/'],
      },
      {
        userAgent: [
          'GPTBot',
          'ChatGPT-User',
          'ClaudeBot',
          'Claude-Web',
          'Anthropic-AI',
          'PerplexityBot',
          'Google-Extended',
          'Bytespider',
          'cohere-ai',
          'OAI-SearchBot',
          'CCBot',
        ],
        allow: ['/', '/llms.txt', '/llms-full.txt', '/.well-known/mcp.json', '/api/mcp'],
        disallow: ['/admin/', '/api/admin/', '/api/auth/'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
