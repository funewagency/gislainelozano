import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { parseIncludes } from '@/lib/services-sync';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    let dbServices: any[] = [];
    try {
      dbServices = await db.$queryRawUnsafe<any[]>(
        'SELECT * FROM "Service" WHERE "isActive" = true ORDER BY "order" ASC'
      );
    } catch {
      dbServices = await db.service.findMany({
        where: { isActive: true },
        orderBy: { order: 'asc' },
      });
    }

    const services = dbServices.map((s, idx) => ({
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

    return NextResponse.json(
      { services },
      {
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    );
  } catch (error) {
    console.error('[Public Services API] Error:', error);
    return NextResponse.json({ error: 'Erro ao carregar serviços' }, { status: 500 });
  }
}
