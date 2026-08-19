/**
 * Restore the CMS data from a backup file created by scripts/backup-cms-state.ts.
 *
 * Usage:
 *   bun run scripts/restore-cms-from-backup.ts <path-to-backup.json>
 *
 * Restores CmsState and replaces the CmsRevision history with the backup's.
 */
import { readFileSync } from 'node:fs'
import { PrismaClient } from '@prisma/client'

const BACKUP_PATH = process.argv[2]
if (!BACKUP_PATH) {
  console.error('Usage: bun run scripts/restore-cms-from-backup.ts <backup.json>')
  process.exit(1)
}

async function main() {
  const backup = JSON.parse(readFileSync(BACKUP_PATH, 'utf-8'))
  const prisma = new PrismaClient({ datasourceUrl: process.env.DIRECT_URL })

  try {
    const { tenant, state, revisions } = backup

    await prisma.cmsState.upsert({
      where: { tenant },
      create: {
        tenant,
        id: state.id,
        data: JSON.stringify(state.data),
        version: state.version,
        updatedAt: new Date(state.updatedAt),
        updatedBy: state.updatedBy,
      },
      update: {
        data: JSON.stringify(state.data),
        version: state.version,
        updatedBy: state.updatedBy,
      },
    })

    const deleted = await prisma.cmsRevision.deleteMany({ where: { tenant } })

    for (const r of revisions) {
      await prisma.cmsRevision.create({
        data: {
          tenant,
          version: r.version,
          data: JSON.stringify(r.data),
          summary: r.summary,
          createdBy: r.createdBy,
          createdAt: new Date(r.createdAt),
        },
      })
    }

    {
      console.log(`✅ Restaurado de ${BACKUP_PATH}`)
      console.log(`   tenant: ${tenant}`)
      console.log(`   state version: ${state.version}`)
      console.log(`   revisions: ${revisions.length} (${deleted.count} antigas removidas)`)
      console.log(`   whatsappModal.title: ${state.data.whatsappModal?.title}`)
    }
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
