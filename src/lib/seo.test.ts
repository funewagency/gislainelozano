import { describe, it, expect } from 'vitest';
import sitemap from '@/app/sitemap';
import robots from '@/app/robots';
import fs from 'fs';
import path from 'path';

describe('SEO & AI Discovery Infrastructure', () => {
  describe('Sitemap XML', () => {
    it('generates dynamic sitemap with primary and section entries', () => {
      const items = sitemap();
      expect(Array.isArray(items)).toBe(true);
      expect(items.length).toBeGreaterThanOrEqual(5);

      const urls = items.map((i) => i.url);
      expect(urls.some((u) => u.includes('gislainelozano.com.br'))).toBe(true);
      expect(urls.some((u) => u.includes('#servicos'))).toBe(true);
      expect(urls.some((u) => u.includes('#contato'))).toBe(true);

      const root = items.find((i) => !i.url.includes('#'));
      expect(root?.priority).toBe(1.0);
    });
  });

  describe('Robots.txt Configuration', () => {
    it('configures rules for search engines and AI agents', () => {
      const config = robots();
      expect(config.sitemap).toBeDefined();
      expect(config.host).toBeDefined();

      const rules = Array.isArray(config.rules) ? config.rules : [config.rules];
      expect(rules.length).toBeGreaterThanOrEqual(2);

      // Bloqueio de rotas administrativas
      const generalRule = rules.find((r) => r.userAgent === '*');
      expect(generalRule?.disallow).toContain('/admin/');
      expect(generalRule?.disallow).toContain('/api/admin/');
    });
  });

  describe('AI Discovery (LLMS.txt & WebMCP)', () => {
    it('provides public llms.txt and llms-full.txt', () => {
      const publicDir = path.join(process.cwd(), 'public');
      const llmsTxt = fs.readFileSync(path.join(publicDir, 'llms.txt'), 'utf-8');
      const llmsFullTxt = fs.readFileSync(path.join(publicDir, 'llms-full.txt'), 'utf-8');
      const mcpJson = fs.readFileSync(path.join(publicDir, '.well-known', 'mcp.json'), 'utf-8');

      expect(llmsTxt).toContain('Gislaine Lozano');
      expect(llmsTxt).toContain('Mentoria');
      expect(llmsFullTxt).toContain('Tudo comunica');
      expect(llmsFullTxt).toContain('Funew Agency');
      
      const parsedMcp = JSON.parse(mcpJson);
      expect(parsedMcp.name).toBe('Gislaine Lozano WebMCP');
      expect(Array.isArray(parsedMcp.tools)).toBe(true);
      expect(parsedMcp.tools.length).toBeGreaterThanOrEqual(3);
    });
  });
});
