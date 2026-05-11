import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/adminAuth'

export async function GET(request: Request) {
  try {
    const auth = await requireAdmin(request)
    if (auth instanceof NextResponse) return auth

    const bets = await prisma.bet.findMany({
      where: { status: 'PENDING' },
      include: {
        user: { select: { username: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ bets })
  } catch (err) {
    console.error('[GET /api/admin/bets]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
