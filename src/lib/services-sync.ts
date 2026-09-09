import { db } from './db';

const TENANT = process.env.NEXT_PUBLIC_TENANT_SLUG || 'gislaine';

export function parseIncludes(includes: string | null | undefined): string[] | null {
  if (!includes) return null;
  const trimmed = includes.trim();
  if (!trimmed) return null;

  try {
    const parsed = JSON.parse(trimmed);
    if (Array.isArray(parsed)) {
      return parsed.map((item) => String(item).trim()).filter(Boolean);
    }
  } catch {
    // Plain text with line breaks
  }

  const lines = trimmed
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  return lines.length > 0 ? lines : null;
}

export function formatIncludes(items: string[] | string | null | undefined): string | null {
  if (!items) return null;
  if (Array.isArray(items)) {
    const cleaned = items.map((i) => i.trim()).filter(Boolean);
    return cleaned.length > 0 ? JSON.stringify(cleaned) : null;
  }
  if (typeof items === 'string') {
    const parsed = parseIncludes(items);
    return parsed && parsed.length > 0 ? JSON.stringify(parsed) : null;
  }
  return null;
}

/**
 * Synchronizes services from the database table `Service` into the `CmsState` JSON,
 * so that all components and preview editors reading from `CmsState` stay 100% in sync.
 */
export async function syncServicesToCmsState() {
  try {
    const services = await db.service.findMany({
      orderBy: { order: 'asc' },
    });

    const cmsState = await db.cmsState.findUnique({
      where: { tenant: TENANT },
    });

    if (!cmsState) return;

    const data = JSON.parse(cmsState.data);
    if (!data.services) {
      data.services = {};
    }

    data.services.items = services.map((s, idx) => ({
      id: s.id,
      number: String(idx + 1).padStart(2, '0'),
      title: s.title,
      subtitle: s.subtitle || null,
      description: s.description,
      ctaText: s.ctaText,
      ctaLink: s.ctaLink || null,
      includes: parseIncludes(s.includes),
      isActive: s.isActive,
    }));

    await db.cmsState.update({
      where: { tenant: TENANT },
      data: {
        data: JSON.stringify(data),
      },
    });
  } catch (error) {
    console.error('[ServicesSync] Error syncing services to CmsState:', error);
  }
}
