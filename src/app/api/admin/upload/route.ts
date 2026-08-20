import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import sharp from 'sharp';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { unauthorized, serverError, badRequest, rateLimited } from '@/lib/api-utils';
import { mutationLimiter } from '@/lib/rate-limit';
import { validateImageMagicBytes, sanitizeSafeFilename } from '@/lib/file-security';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');
const MAX_SIZE = 10 * 1024 * 1024; // 10MB
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

    // Validação estrita de Magic Bytes (assinatura binária real do arquivo)
    if (!validateImageMagicBytes(buffer, file.type)) {
      return badRequest('O conteúdo do arquivo não corresponde a uma imagem válida ou segura.');
    }

    const safeBaseName = sanitizeSafeFilename(file.name).replace(/\.[^.]+$/, '');
    const timestamp = Date.now();
    const isGif = file.type === 'image/gif';
    const finalExt = isGif ? 'gif' : 'webp';
    const finalFilename = `${safeBaseName}-${timestamp}.${finalExt}`;
    const filepath = path.join(UPLOAD_DIR, finalFilename);

    await mkdir(UPLOAD_DIR, { recursive: true });

    if (isGif) {
      await writeFile(filepath, buffer);
    } else {
      // Re-encoda através do Sharp para neutralizar EXIF malicioso ou payloads embutidos
      await sharp(buffer)
        .resize(1920, 1080, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 85 })
        .toFile(filepath);
    }

    const url = `/uploads/${finalFilename}`;
    return NextResponse.json({ url, filename: finalFilename });
  } catch (error) {
    return serverError(error, 'Falha no processamento seguro do upload');
  }
}
