import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
import path from 'path';

const OUTPUT_DIR = './public/images/gislaine';

const images = [
  {
    prompt: 'Professional elegant woman in her 30s, Brazilian business mentor, confident pose looking at camera, wearing a sophisticated dark navy blazer with gold brooch, gold jewelry earrings and necklace, studio lighting with dark navy blue background, professional portrait photography, sharp focus, high-end fashion editorial style, luxury aesthetic, dramatic lighting with golden rim light, confident and powerful expression',
    output: 'gislaine-portrait.png',
    size: '768x1344' as const,
  },
  {
    prompt: 'Elegant woman business coach seated confidently in a modern luxury chair, dark navy outfit, gold accessories, Brazilian, professional photography, warm golden lighting from side, dark moody background, editorial portrait, shot from slightly below, powerful pose, mentor aesthetic, luxury brand feel',
    output: 'gislaine-bio.png',
    size: '768x1344' as const,
  },
  {
    prompt: '3D mockup of a luxury ebook digital guide, dark navy blue cover with gold foil decorative borders and ornamental design, lying on a dark marble surface with golden ambient light reflections, premium product photography, soft shadows, high-end marketing material, luxury brand aesthetic, professional lighting',
    output: 'ebook-3d.png',
    size: '1024x1024' as const,
  },
];

async function main() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const zai = await ZAI.create();

  for (const img of images) {
    const outputPath = path.join(OUTPUT_DIR, img.output);
    console.log(`\n🎨 Generating: ${img.output}`);

    try {
      const response = await zai.images.generations.create({
        prompt: img.prompt,
        size: img.size,
      });

      const imageBase64 = response.data[0].base64;
      const buffer = Buffer.from(imageBase64, 'base64');
      fs.writeFileSync(outputPath, buffer);
      console.log(`✅ Saved: ${outputPath} (${buffer.length} bytes)`);
    } catch (error: unknown) {
      console.error(`❌ Failed: ${img.output}`, (error as Error).message);
    }

    // Wait 3 seconds between requests to avoid rate limiting
    console.log('⏳ Waiting 3s...');
    await new Promise((r) => setTimeout(r, 3000));
  }

  console.log('\n✨ Done!');
}

main().catch(console.error);
