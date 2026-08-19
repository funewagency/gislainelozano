import { PrismaClient } from '@prisma/client'
import { DEFAULT_CMS_DATA } from '../src/lib/cms-defaults'

const TENANT = process.env.NEXT_PUBLIC_TENANT_SLUG || 'gislaine'

function deepMerge(target: any, source: any): any {
  if (Array.isArray(source)) {
    return source
  }
  if (source && typeof source === 'object') {
    const result = { ...(target && typeof target === 'object' ? target : {}) }
    for (const key of Object.keys(source)) {
      result[key] = deepMerge(result[key], source[key])
    }
    return result
  }
  return target !== undefined ? target : source
}

async function main() {
  const prisma = new PrismaClient({ datasourceUrl: process.env.DIRECT_URL })

  try {
    const state = await prisma.cmsState.findUnique({ where: { tenant: TENANT } })

    const currentData = state ? JSON.parse(state.data) : {}
    const mergedData = deepMerge(currentData, DEFAULT_CMS_DATA)

    // Preserve meta from current data if it exists, otherwise create new
    mergedData.meta = {
      ...(currentData.meta || {}),
      lastSaved: new Date().toISOString(),
      lastSavedBy: 'migration-script',
      version: (currentData.meta?.version || 0) + 1,
    }

    const newVersion = mergedData.meta.version

    const updated = await prisma.cmsState.upsert({
      where: { tenant: TENANT },
      create: {
        tenant: TENANT,
        data: JSON.stringify(mergedData),
        version: newVersion,
        updatedBy: 'migration-script',
      },
      update: {
        data: JSON.stringify(mergedData),
        version: newVersion,
        updatedBy: 'migration-script',
      },
    })

    await prisma.cmsRevision.create({
      data: {
        tenant: TENANT,
        version: newVersion,
        data: JSON.stringify(mergedData),
        summary: `Centralização completa do CMS no Supabase (v${newVersion})`,
        createdBy: 'migration-script',
      },
    })

    console.log('✅ CmsState atualizado com dados completos:')
    console.log(`   tenant: ${updated.tenant}`)
    console.log(`   version: ${updated.version}`)
    console.log(`   data length: ${updated.data.length} chars`)
    console.log(`   top-level keys: ${Object.keys(mergedData).join(', ')}`)
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
