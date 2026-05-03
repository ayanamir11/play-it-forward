import { NextResponse } from 'next/server'
import { BetStatus, BetType } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/middleware'

const BET_TYPES = new Set<string>(Object.values(BetType))
const BET_STATUSES = new Set<string>(Object.values(BetStatus))

function calcPotentialPayout(wager: number, odds: number): number {
  const profit =
    odds > 0 ? wager * (odds / 100) : wager * (100 / Math.abs(odds))
  return Math.round((wager + profit) * 100) / 100
}

export async function POST(request: Request) {
  try {
    const auth = await requireAuth(request)
    if (auth instanceof NextResponse) return auth
    const { userId } = auth

    let body: Record<string, unknown>
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Request body must be valid JSON' }, { status: 400 })
    }

    const { sport, event, pick, betType, odds, wagerAmount } = body as {
      sport?: string
      event?: string
      pick?: string
      betType?: string
      odds?: number
      wagerAmount?: number
    }

    if (!sport || !event || !pick || !betType || odds === undefined || wagerAmount === undefined) {
      return NextResponse.json(
        { error: 'sport, event, pick, betType, odds, and wagerAmount are required' },
        { status: 400 }
      )
    }

    if (!BET_TYPES.has(betType)) {
      return NextResponse.json(
        { error: `betType must be one of: ${[...BET_TYPES].join(', ')}` },
        { status: 400 }
      )
    }

    if (!Number.isInteger(odds) || odds === 0) {
      return NextResponse.json({ error: 'odds must be a non-zero integer' }, { status: 400 })
    }

    if (typeof wagerAmount !== 'number' || wagerAmount <= 0) {
      return NextResponse.json({ error: 'wagerAmount must be a positive number' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { balance: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 })
    }

    if (user.balance.toNumber() < wagerAmount) {
      return NextResponse.json({ error: 'Insufficient balance' }, { status: 402 })
    }

    const potentialPayout = calcPotentialPayout(wagerAmount, odds)

    const [bet] = await prisma.$transaction([
      prisma.bet.create({
        data: {
          userId,
          sport,
          event,
          pick,
          betType: betType as BetType,
          odds,
          wagerAmount,
          potentialPayout,
          status: 'PENDING',
        },
      }),
      prisma.user.update({
        where: { id: userId },
        data: { balance: { decrement: wagerAmount } },
      }),
    ])

    return NextResponse.json({ bet }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/bets]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const auth = await requireAuth(request)
    if (auth instanceof NextResponse) return auth
    const { userId } = auth

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') ?? undefined

    if (status !== undefined && !BET_STATUSES.has(status)) {
      return NextResponse.json(
        { error: `status must be one of: ${[...BET_STATUSES].join(', ')}` },
        { status: 400 }
      )
    }

    const bets = await prisma.bet.findMany({
      where: { userId, ...(status ? { status: status as BetStatus } : {}) },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ bets })
  } catch (err) {
    console.error('[GET /api/bets]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
