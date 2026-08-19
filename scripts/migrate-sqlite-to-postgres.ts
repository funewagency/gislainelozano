import { Database } from 'bun:sqlite'
import { PrismaClient } from '@prisma/client'

const SQLITE_PATH = 'prisma/db/custom.db'

function parseDate(value: unknown): Date | undefined {
  if (!value) return undefined
  const d = new Date(value as string)
  return isNaN(d.getTime()) ? undefined : d
}

async function main() {
  const sqlite = new Database(SQLITE_PATH, { readonly: true })
  const prisma = new PrismaClient({
    datasourceUrl: process.env.DIRECT_URL,
  })

  try {
    const contacts = sqlite.query('SELECT * FROM Contact').all() as any[]
    const cmsSettings = sqlite.query('SELECT * FROM CmsSetting').all() as any[]
    const cmsStates = sqlite.query('SELECT * FROM CmsState').all() as any[]
    const analyticsSettings = sqlite.query('SELECT * FROM AnalyticsSetting').all() as any[]
    const cmsRevisions = sqlite.query('SELECT * FROM CmsRevision').all() as any[]

    await prisma.$transaction(async (tx) => {
      for (const row of contacts) {
        await tx.contact.create({
          data: {
            id: row.id,
            name: row.name,
            email: row.email,
            phone: row.phone,
            message: row.message,
            source: row.source,
            medium: row.medium,
            campaign: row.campaign,
            createdAt: parseDate(row.createdAt) ?? new Date(),
            updatedAt: parseDate(row.updatedAt) ?? new Date(),
          },
        })
      }

      for (const row of cmsSettings) {
        await tx.cmsSetting.upsert({
          where: { key: row.key },
          create: {
            id: row.id,
            key: row.key,
            value: row.value,
            updatedAt: parseDate(row.updatedAt) ?? new Date(),
          },
          update: {
            value: row.value,
            updatedAt: parseDate(row.updatedAt) ?? new Date(),
          },
        })
      }

      for (const row of cmsStates) {
        await tx.cmsState.upsert({
          where: { tenant: row.tenant },
          create: {
            id: row.id,
            tenant: row.tenant,
            data: row.data,
            version: row.version ?? 1,
            updatedAt: parseDate(row.updatedAt) ?? new Date(),
            updatedBy: row.updatedBy,
          },
          update: {
            data: row.data,
            version: row.version ?? 1,
            updatedAt: parseDate(row.updatedAt) ?? new Date(),
            updatedBy: row.updatedBy,
          },
        })
      }

      for (const row of analyticsSettings) {
        await tx.analyticsSetting.upsert({
          where: { id: row.id ?? 'default' },
          create: {
            id: row.id ?? 'default',
            ga4Id: row.ga4Id,
            fbPixelId: row.fbPixelId,
            gAdsId: row.gAdsId,
            gAdsLabel: row.gAdsLabel,
            updatedAt: parseDate(row.updatedAt) ?? new Date(),
          },
          update: {
            ga4Id: row.ga4Id,
            fbPixelId: row.fbPixelId,
            gAdsId: row.gAdsId,
            gAdsLabel: row.gAdsLabel,
            updatedAt: parseDate(row.updatedAt) ?? new Date(),
          },
        })
      }

      for (const row of cmsRevisions) {
        await tx.cmsRevision.create({
          data: {
            id: row.id,
            tenant: row.tenant,
            version: row.version,
            data: row.data,
            summary: row.summary,
            createdBy: row.createdBy,
            createdAt: parseDate(row.createdAt) ?? new Date(),
          },
        })
      }
    })

    console.log('✅ Migração SQLite → Postgres concluída:')
    console.log(`  - ${contacts.length} contacts`)
    console.log(`  - ${cmsSettings.length} cmsSettings`)
    console.log(`  - ${cmsStates.length} cmsStates`)
    console.log(`  - ${analyticsSettings.length} analyticsSettings`)
    console.log(`  - ${cmsRevisions.length} cmsRevisions`)
  } finally {
    sqlite.close()
    await prisma.$disconnect()
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
