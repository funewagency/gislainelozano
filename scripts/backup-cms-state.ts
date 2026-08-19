/**
 * Backup the current CMS data (CmsState + CmsRevision) for the tenant
 * to a JSON file under prisma/db/ (gitignored).
 *
 * Usage:
 *   bun run scripts/backup-cms-state.ts
 */
import { PrismaClient } from '@prisma/client'

const TENANT = process.env.NEXT_PUBLIC_TENANT_SLUG || 'gislaine'
const OUT_DIR = 'prisma/db'

async function main() {
  const prisma = new PrismaClient({ datasourceUrl: process.env.DIRECT_URL })

  try {
    const state = await prisma.cmsState.findUnique({ where: { tenant: TENANT } })
    if (!state) {
      throw new Error(`No CmsState for tenant "${TENANT}"`)
    }
    const revisions = await prisma.cmsRevision.findMany({
      where: { tenant: TENANT },
      orderBy: { version: 'asc' },
    })

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const outPath = `${OUT_DIR}/cms-backup.${timestamp}.json`
    const payload = {
      tenant: TENANT,
      backedUpAt: new Date().toISOString(),
      state: {
        id: state.id,
        version: state.version,
        updatedBy: state.updatedBy,
        updatedAt: state.updatedAt,
        data: JSON.parse(state.data),
      },
      revisions: revisions.map((r) => ({
        id: r.id,
        version: r.version,
        summary: r.summary,
        createdBy: r.createdBy,
        createdAt: r.createdAt,
        data: JSON.parse(r.data),
      })),
    }

    const fs = await import('node:fs')
    fs.writeFileSync(outPath, JSON.stringify(payload, null, 2), 'utf-8')

    console.log(`✅ Backup criado: ${outPath}`)
    console.log(`   tenant: ${TENANT}`)
    console.log(`   state version: ${state.version}`)
    console.log(`   revisions: ${revisions.length}`)
    console.log(`   whatsappModal.title: ${payload.state.data.whatsappModal?.title}`)
    console.log(`   hero.titleHtml: ${String(payload.state.data.hero?.titleHtml ?? '').slice(0, 60)}`)
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
