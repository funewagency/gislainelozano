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

    console.log('✅ Seed concluído')
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
