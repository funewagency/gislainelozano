import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { globalConfigSchema } from '@/lib/cms-types';
import { DEFAULT_CMS_DATA, DEFAULT_THEME } from '@/lib/cms-defaults';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { unauthorized, serverError, badRequest, rateLimited } from '@/lib/api-utils';
import { mutationLimiter, shouldRateLimit } from '@/lib/rate-limit';

const TENANT = 'gislaine';

function migrateData(data: Record<string, unknown>): Record<string, unknown> {
  if (!data.theme) {
    data.theme = { ...DEFAULT_THEME };
  }

  const sectionsWithTitle = ['hero', 'bio', 'positioning', 'services', 'testimonials', 'faq', 'contact'] as const;
  for (const section of sectionsWithTitle) {
    const sec = data[section] as Record<string, unknown> | undefined;
    if (sec && sec.titleMarkdown && !sec.titleHtml) {
      sec.titleHtml = sec.titleMarkdown as string;
      delete sec.titleMarkdown;
    }
  }

  // Merge missing sections from defaults (handles schema additions like whatsappModal)
  const sectionKeys = new Set(Object.keys(DEFAULT_CMS_DATA));
  for (const key of sectionKeys) {
    if (key === 'meta' || key === 'theme') continue;
    if (!(key in data)) {
      data[key] = DEFAULT_CMS_DATA[key as keyof typeof DEFAULT_CMS_DATA];
    }
  }

  // Merge missing entries in sectionOrder
  if (Array.isArray(data.sectionOrder)) {
    const existingIds = new Set(data.sectionOrder.map((s: any) => s.id));
    for (const entry of DEFAULT_CMS_DATA.sectionOrder) {
      if (!existingIds.has(entry.id)) {
        (data.sectionOrder as any[]).push({ ...entry });
      }
    }
  }

  // Fill in empty fields from defaults (prevents blank titles after DB save with empty values)
  // Also catches Lexical editor's empty HTML: <p class="editor-paragraph"><br></p>
  const EMPTY_HTML_RE = /^<p[^>]*>\s*<br\s*\/?>\s*<\/p>$/i;
  for (const key of sectionKeys) {
    if (key === 'meta' || key === 'theme' || key === 'sectionOrder') continue;
    const dbSection = data[key] as Record<string, unknown> | undefined;
    const defaultSection = DEFAULT_CMS_DATA[key as keyof typeof DEFAULT_CMS_DATA] as Record<string, unknown> | undefined;
    if (!dbSection || !defaultSection) continue;
    for (const [field, defaultValue] of Object.entries(defaultSection)) {
      const val = dbSection[field];
      const isEmpty =
        val === undefined ||
        val === null ||
        val === '' ||
        (typeof val === 'string' && EMPTY_HTML_RE.test(val.trim()));
      if (isEmpty) {
        dbSection[field] = defaultValue;
      }
    }
  }

  // Ensure services/faq items have HTML versions of description/answer for Lexical editor
  function toHtml(text: string): string {
    if (!text) return '';
    // Already has HTML tags?
    if (/<[a-z][\s\S]*>/i.test(text)) return text;
    // Wrap plain text in paragraph tags, preserving line breaks
    return text.split('\n').map(t => t.trim() ? `<p>${t}</p>` : '').filter(Boolean).join('\n');
  }

  // Services: description → descriptionHtml
  const services = data.services as { items?: Array<Record<string, unknown>> } | undefined;
  if (services?.items && Array.isArray(services.items)) {
    for (const item of services.items) {
      const desc = item.description as string | undefined;
      if (desc && !item.descriptionHtml) {
        item.descriptionHtml = toHtml(desc);
      }
    }
  }

  // FAQ: answer → answerHtml
  const faq = data.faq as { items?: Array<Record<string, unknown>> } | undefined;
  if (faq?.items && Array.isArray(faq.items)) {
    for (const item of faq.items) {
      const answer = item.answer as string | undefined;
      if (answer && !item.answerHtml) {
        item.answerHtml = toHtml(answer);
      }
    }
  }

  return data;
}

export async function GET() {
  try {
    let state = await db.cmsState.findUnique({ where: { tenant: TENANT } });

    if (!state) {
      state = await db.cmsState.create({
        data: {
          tenant: TENANT,
          data: JSON.stringify(DEFAULT_CMS_DATA),
          version: 1,
        },
      });
    }

    const data = migrateData(JSON.parse(state.data));

    const revisions = await db.cmsRevision.findMany({
      where: { tenant: TENANT },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json(
      {
        data,
        meta: {
          version: state.version,
          updatedAt: state.updatedAt,
          updatedBy: state.updatedBy,
        },
        revisions: revisions.map((r) => ({
          version: r.version,
          summary: r.summary,
          timestamp: r.createdAt,
          createdBy: r.createdBy,
          data: migrateData(JSON.parse(r.data)),
        })),
      },
      // Never cache: the editor and e2e tests read this immediately after a
      // save and must always get fresh data (no heuristic browser caching).
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (error) {
    console.error('[CMS API] GET error:', error);
    return NextResponse.json(
      { error: 'Failed to load CMS data', data: DEFAULT_CMS_DATA },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return unauthorized();

    if (shouldRateLimit()) {
      const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
      const { allowed } = mutationLimiter.check(`cms:${ip}`);
      if (!allowed) return rateLimited(30);
    }

    const body = await request.json();

    const parsed = globalConfigSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'Dados inválidos',
          code: 'VALIDATION_ERROR',
          details: parsed.error.issues.map((i) => ({
            path: i.path.join('.'),
            message: i.message,
          })),
        },
        { status: 422 },
      );
    }

    const newVersion = parsed.data.meta.version;

    const state = await db.cmsState.upsert({
      where: { tenant: TENANT },
      update: {
        data: JSON.stringify(parsed.data),
        version: newVersion,
        updatedBy: session.user.name ?? session.user.email ?? 'Admin',
      },
      create: {
        tenant: TENANT,
        data: JSON.stringify(parsed.data),
        version: newVersion,
        updatedBy: session.user.name ?? session.user.email ?? 'Admin',
      },
    });

    const revision = await db.cmsRevision.create({
      data: {
        tenant: TENANT,
        version: newVersion,
        data: JSON.stringify(parsed.data),
        summary: `Atualização v${newVersion}`,
        createdBy: session.user.name ?? session.user.email ?? 'Admin',
      },
    });

    return NextResponse.json({
      success: true,
      version: state.version,
      revision: {
        version: revision.version,
        summary: revision.summary,
        timestamp: revision.createdAt,
        createdBy: revision.createdBy,
        data: parsed.data,
      },
    });
  } catch (error) {
    console.error('[CMS API] PUT error:', error);
    return serverError(error, 'Erro ao salvar dados do CMS');
  }
}
