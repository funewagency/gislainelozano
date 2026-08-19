/**
 * One-off restore: reverts the Supabase CmsState to the original pre-test data.
 *
 * History source: prisma/db/custom.db (SQLite, v4) — the data that was migrated
 * to Postgres on 2026-07-14 — merged with DEFAULT_CMS_DATA using the exact same
 * deepMerge logic as scripts/merge-cms-defaults.ts.
 *
 * Usage:
 *   bun run scripts/restore-cms-state.ts          # dry run (validates only)
 *   APPLY=1 bun run scripts/restore-cms-state.ts  # writes to Postgres
 */
import { Database } from 'bun:sqlite'
import { PrismaClient } from '@prisma/client'
import { DEFAULT_CMS_DATA } from '../src/lib/cms-defaults'
import { globalConfigSchema } from '../src/lib/cms-types'

const SQLITE_PATH = 'prisma/db/custom.db'
const TENANT = process.env.NEXT_PUBLIC_TENANT_SLUG || 'gislaine'
const APPLY = process.env.APPLY === '1'

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
  const sqlite = new Database(SQLITE_PATH, { readonly: true })
  const prisma = new PrismaClient({ datasourceUrl: process.env.DIRECT_URL })

  try {
    const rows = sqlite.query('SELECT * FROM CmsState').all() as any[]
    const row = rows.find((r) => r.tenant === TENANT)
    if (!row) {
      throw new Error(`No CmsState for tenant "${TENANT}" in SQLite`)
    }

    const oldData = JSON.parse(row.data)
    const merged = deepMerge(oldData, DEFAULT_CMS_DATA)

    merged.meta = {
      ...(oldData.meta || {}),
      lastSaved: new Date().toISOString(),
      lastSavedBy: 'restore-script',
      version: oldData.meta?.version ?? row.version ?? 1,
    }

    const parsed = globalConfigSchema.safeParse(merged)
    if (!parsed.success) {
      console.error('SCHEMA VALIDATION FAILED:')
      console.error(JSON.stringify(parsed.error.flatten(), null, 2))
      process.exit(1)
    }

    const newVersion = merged.meta.version
    console.log('✅ Merged data validates against globalConfigSchema')
    console.log(`   version: ${newVersion}`)
    console.log(`   top-level keys: ${Object.keys(merged).join(', ')}`)
    console.log(`   whatsappModal: ${JSON.stringify(merged.whatsappModal)}`)
    console.log(`   contact.features: ${JSON.stringify(merged.contact.features)}`)
    console.log(`   contact.titleHtml: ${JSON.stringify(merged.contact.titleHtml)}`)

    if (!APPLY) {
      console.log('\n(dry run — set APPLY=1 to write to Postgres)')
      return
    }

    await prisma.$transaction(async (tx) => {
      await tx.cmsState.upsert({
        where: { tenant: TENANT },
        create: {
          tenant: TENANT,
          data: JSON.stringify(merged),
          version: newVersion,
          updatedBy: 'restore-script',
        },
        update: {
          data: JSON.stringify(merged),
          version: newVersion,
          updatedBy: 'restore-script',
        },
      })

      const deleted = await tx.cmsRevision.deleteMany({ where: { tenant: TENANT } })

      await tx.cmsRevision.create({
        data: {
          tenant: TENANT,
          version: newVersion,
          data: JSON.stringify(merged),
          summary: `Restauração dos dados originais (SQLite v${oldData.meta?.version}) — removidos dados de testes e2e`,
          createdBy: 'restore-script',
        },
      })

      console.log(`\n✅ CmsState restaurado (version=${newVersion})`)
      console.log(`   ${deleted.count} revisões de teste removidas, 1 revisão de restauração criada`)
    })
  } finally {
    sqlite.close()
    await prisma.$disconnect()
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
