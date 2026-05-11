import * as dotenv from 'dotenv'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config({ path: resolve(__dirname, '../.env') })

import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

async function main() {
  const username = process.argv[2]
  if (!username) {
    console.error('Usage: npx ts-node scripts/make-admin.ts <username>')
    process.exit(1)
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL })
  const adapter = new PrismaPg(pool)
  const prisma = new PrismaClient({ adapter })

  try {
    const user = await prisma.user.update({
      where: { username },
      data: { isAdmin: true },
      select: { id: true, username: true },
    })
    console.log(`Done: ${user.username} is now an admin`)
  } catch (err) {
    if ((err as { code?: string }).code === 'P2025') {
      console.error(`User not found: ${username}`)
      process.exit(1)
    }
    throw err
  } finally {
    await prisma.$disconnect()
    await pool.end()
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
