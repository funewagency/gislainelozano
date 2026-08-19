import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import sharp from 'sharp';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { unauthorized, serverError, badRequest, rateLimited } from '@/lib/api-utils';
import { mutationLimiter } from '@/lib/rate-limit';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');
const MAX_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif'];

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return unauthorized();

    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const { allowed } = mutationLimiter.check(`upload:${ip}`);
    if (!allowed) return rateLimited(30);

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return badRequest('Nenhum arquivo enviado');
    }

    if (file.size === 0) {
      return badRequest('Arquivo vazio');
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return badRequest(`Tipo de arquivo inválido. Permitidos: ${ALLOWED_TYPES.join(', ')}`);
    }

    if (file.size > MAX_SIZE) {
      return badRequest('Arquivo muito grande. Máximo 10MB');
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const sanitizedName = file.name
      .replace(/[^a-zA-Z0-9._-]/g, '_')
      .replace(/\.[^.]+$/, '')
      .slice(0, 60);

    const timestamp = Date.now();
    const ext = file.type === 'image/jpeg'
      ? 'jpg'
      : file.type === 'image/png'
        ? 'png'
        : file.type === 'image/gif'
          ? 'gif'
          : 'webp';
    const filename = `${sanitizedName}-${timestamp}.${ext}`;
    const filepath = path.join(UPLOAD_DIR, filename);

    await mkdir(UPLOAD_DIR, { recursive: true });

    if (file.type === 'image/gif') {
      await writeFile(filepath, buffer);
    } else {
      await sharp(buffer)
        .resize(1920, 1080, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 85 })
        .toFile(filepath.replace(/\.(jpg|png)$/, '.webp'));
    }

    const finalFilename = file.type === 'image/gif' ? filename : filename.replace(/\.(jpg|png)$/, '.webp');
    const url = `/uploads/${finalFilename}`;

    return NextResponse.json({ url, filename: finalFilename });
  } catch (error) {
    return serverError(error, 'Falha no upload');
  }
}
