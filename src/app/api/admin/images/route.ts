import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { readdir, stat } from 'fs/promises';
import path from 'path';
import { unauthorized, serverError, rateLimited } from '@/lib/api-utils';
import { readLimiter, shouldRateLimit } from '@/lib/rate-limit';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return unauthorized();

    if (shouldRateLimit()) {
      const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
      const { allowed } = readLimiter.check(`images:${ip}`);
      if (!allowed) return rateLimited(30);
    }

    let files: { url: string; name: string; size: number; date: string }[] = [];

    try {
      const entries = await readdir(UPLOAD_DIR);
      const imageExtensions = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif', '.gif', '.svg']);

      for (const entry of entries) {
        const ext = path.extname(entry).toLowerCase();
        if (!imageExtensions.has(ext)) continue;

        const filepath = path.join(UPLOAD_DIR, entry);
        const stats = await stat(filepath);

        files.push({
          url: `/uploads/${entry}`,
          name: entry,
          size: stats.size,
          date: stats.mtime.toISOString(),
        });
      }
    } catch {
      // Directory doesn't exist yet
    }

    files.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return NextResponse.json({ images: files });
  } catch (error) {
    return serverError(error, 'Falha ao listar imagens');
  }
}
