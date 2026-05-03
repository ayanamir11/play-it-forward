import 'dotenv/config'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) })

const ROTATION_MONTH = 5
const ROTATION_YEAR = 2026

const charities = [
  {
    name: 'Pencils of Promise',
    causeCategory: 'EDUCATION' as const,
    description: 'Builds schools and increases access to quality education in developing countries.',
  },
  {
    name: "St. Jude Children's Research Hospital",
    causeCategory: 'HEALTH' as const,
    description: 'Leads research and treatment for childhood cancer and other life-threatening diseases.',
  },
  {
    name: 'The Nature Conservancy',
    causeCategory: 'ENVIRONMENT' as const,
    description: 'Protects the lands and waters on which all life depends.',
  },
  {
    name: 'ACLU Foundation',
    causeCategory: 'HUMAN_RIGHTS' as const,
    description: 'Defends and preserves the individual rights and liberties guaranteed by the Constitution.',
  },
  {
    name: 'Feeding America',
    causeCategory: 'POVERTY' as const,
    description: 'Leads the nation\'s largest domestic hunger-relief organization through a network of food banks.',
  },
]

async function main() {
  console.log('Seeding charities...')

  for (const charity of charities) {
    const record = await prisma.charity.upsert({
      where: {
        causeCategory_rotationMonth_rotationYear: {
          causeCategory: charity.causeCategory,
          rotationMonth: ROTATION_MONTH,
          rotationYear: ROTATION_YEAR,
        },
      },
      update: { name: charity.name, description: charity.description, isActive: true },
      create: {
        ...charity,
        rotationMonth: ROTATION_MONTH,
        rotationYear: ROTATION_YEAR,
        isActive: true,
      },
    })
    console.log(`  ✓ ${record.causeCategory}: ${record.name} (${record.id})`)
  }

  console.log('\nUpdating testuser selectedCause to HEALTH...')
  const user = await prisma.user.update({
    where: { username: 'testuser' },
    data: { selectedCause: 'HEALTH' },
    select: { id: true, username: true, selectedCause: true },
  })
  console.log(`  ✓ ${user.username} → selectedCause: ${user.selectedCause}`)

  console.log('\nDone.')
}

main()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
