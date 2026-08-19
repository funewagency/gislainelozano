import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
import path from 'path';
import { generateLimiter, shouldRateLimit } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  if (shouldRateLimit()) {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const { allowed } = generateLimiter.check(ip);
    if (!allowed) {
      return NextResponse.json({ error: 'Muitas requisições. Aguarde um momento.' }, { status: 429 });
    }
  }

  try {
    const outputDir = path.join(process.cwd(), 'public', 'images', 'gislaine');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const zai = await ZAI.create();

    const images = [
      {
        prompt: 'Professional elegant woman in her 30s, Brazilian business mentor, confident pose looking at camera, wearing a sophisticated dark navy blazer with gold brooch, gold jewelry, studio lighting with dark navy blue background, professional portrait photography, sharp focus, high-end fashion editorial style, luxury aesthetic, dramatic lighting with golden rim light',
        output: 'gislaine-portrait.png',
        size: '768x1344' as const,
      },
      {
        prompt: 'Elegant woman business coach seated confidently in a modern luxury chair, dark navy outfit, gold accessories, Brazilian, professional photography, warm golden lighting from side, dark moody background, editorial portrait, powerful pose, mentor aesthetic',
        output: 'gislaine-bio.png',
        size: '768x1344' as const,
      },
      {
        prompt: '3D mockup of a luxury ebook digital guide, dark navy blue cover with gold foil decorative borders and ornamental design, lying on dark marble surface with golden ambient light, premium product photography, soft shadows, high-end marketing material, luxury brand aesthetic',
        output: 'ebook-3d.png',
        size: '1024x1024' as const,
      },
    ];

    const results: Array<{ file: string; success: boolean; size?: number; error?: string }> = [];

    for (const img of images) {
      try {
        const outputPath = path.join(outputDir, img.output);
        const response = await zai.images.generations.create({
          prompt: img.prompt,
          size: img.size,
        });
        const imageBase64 = response.data[0].base64;
        const buffer = Buffer.from(imageBase64, 'base64');
        fs.writeFileSync(outputPath, buffer);
        results.push({ file: img.output, success: true, size: buffer.length });

        // Wait 3s between requests
        await new Promise((r) => setTimeout(r, 3000));
      } catch (err: unknown) {
        results.push({
          file: img.output,
          success: false,
          error: (err as Error).message,
        });
      }
    }

    return NextResponse.json({ results });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
