import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/middleware'

export async function GET(request: Request) {
  try {
    const auth = await requireAuth(request)
    if (auth instanceof NextResponse) return auth
    const { userId } = auth

    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1)

    const [user, pots, betsWithCharity] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { selectedCause: true },
      }),
      prisma.charityPot.findMany({
        where: { userId },
        include: {
          charity: {
            select: { name: true, causeCategory: true, description: true },
          },
        },
        orderBy: { month: 'desc' },
      }),
      prisma.bet.count({
        where: { userId, charityId: { not: null } },
      }),
    ])

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 })
    }

    const totalDonated = Math.round(
      pots.reduce((sum, p) => sum + p.totalContributed.toNumber(), 0) * 100
    ) / 100

    const thisMonth = Math.round(
      pots
        .filter((p) => p.month >= monthStart && p.month < nextMonthStart)
        .reduce((sum, p) => sum + p.totalContributed.toNumber(), 0) * 100
    ) / 100

    const breakdownMap: Record<string, number> = {}
    for (const pot of pots) {
      const cat = pot.charity.causeCategory
      breakdownMap[cat] = Math.round(
        ((breakdownMap[cat] ?? 0) + pot.totalContributed.toNumber()) * 100
      ) / 100
    }
    const breakdown = Object.entries(breakdownMap).map(([category, total]) => ({
      category,
      total,
    }))

    const charitiesSupported = new Set(pots.map((p) => p.charityId)).size

    // Find the active charity for the user's selected cause this month
    let activeCharity = null
    if (user.selectedCause) {
      activeCharity = await prisma.charity.findFirst({
        where: {
          causeCategory: user.selectedCause,
          rotationMonth: now.getMonth() + 1,
          rotationYear: now.getFullYear(),
          isActive: true,
        },
        select: { name: true, description: true, causeCategory: true },
      })
      if (!activeCharity) {
        activeCharity = await prisma.charity.findFirst({
          where: { causeCategory: user.selectedCause, isActive: true },
          select: { name: true, description: true, causeCategory: true },
        })
      }
    }

    const history = pots.slice(0, 12).map((p) => ({
      month: p.month,
      charityName: p.charity.name,
      charityCategory: p.charity.causeCategory,
      amount: p.totalContributed.toNumber(),
      isDisbursed: p.isDisbursed,
    }))

    return NextResponse.json({
      totalDonated,
      thisMonth,
      betsWithCharity,
      charitiesSupported,
      selectedCause: user.selectedCause,
      activeCharity,
      breakdown,
      history,
    })
  } catch (err) {
    console.error('[GET /api/donations/summary]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
