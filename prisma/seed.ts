import { PrismaClient } from '@prisma/client'
import { DEFAULT_CMS_DATA } from '../src/lib/cms-defaults'

const TENANT = process.env.NEXT_PUBLIC_TENANT_SLUG || 'gislaine'

async function main() {
  const prisma = new PrismaClient({ datasourceUrl: process.env.DIRECT_URL })

  try {
    await prisma.analyticsSetting.upsert({
      where: { id: 'default' },
      create: {
        id: 'default',
        ga4Id: null,
        fbPixelId: null,
        gAdsId: null,
        gAdsLabel: null,
      },
      update: {},
    })

    const existingState = await prisma.cmsState.findUnique({
      where: { tenant: TENANT },
    })

    if (!existingState) {
      await prisma.cmsState.create({
        data: {
          tenant: TENANT,
          data: JSON.stringify(DEFAULT_CMS_DATA),
          version: 1,
          updatedBy: 'seed',
        },
      })
      console.log(`✅ Seeded CmsState for tenant "${TENANT}"`)
    } else {
      console.log(`ℹ️  CmsState for tenant "${TENANT}" already exists (version ${existingState.version}), skipping seed`)
    }

    const existingServices = await (prisma as any).service.count();
    if (existingServices === 0 && DEFAULT_CMS_DATA.services?.items) {
      console.log('🌱 Seeding services from default CMS data...');
      for (let i = 0; i < DEFAULT_CMS_DATA.services.items.length; i++) {
        const item = DEFAULT_CMS_DATA.services.items[i];
        await (prisma as any).service.create({
          data: {
            order: i,
            title: item.title,
            subtitle: item.subtitle || null,
            description: item.description,
            ctaText: item.ctaText,
            ctaLink: (item as any).ctaLink || null,
            includes: item.includes ? JSON.stringify(item.includes) : null,
            isActive: true,
          },
        });
      }
      console.log(`✅ Seeded ${DEFAULT_CMS_DATA.services.items.length} default services.`);
    }

    console.log('✅ Seed concluído')
  } finally {
    await prisma.$disconnect()
  }
}


main().catch((e) => {
  console.error(e)
  process.exit(1)
})
