import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const VALID_RESULTS = new Set(['WON', 'LOST', 'VOID'])

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    let body: { result?: string }
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Request body must be valid JSON' }, { status: 400 })
    }

    const { result } = body

    if (!result || !VALID_RESULTS.has(result)) {
      return NextResponse.json({ error: 'result must be WON, LOST, or VOID' }, { status: 400 })
    }

    const bet = await prisma.bet.findUnique({
      where: { id },
      include: { user: { select: { selectedCause: true } } },
    })

    if (!bet) {
      return NextResponse.json({ error: 'Bet not found' }, { status: 404 })
    }

    if (bet.status !== 'PENDING') {
      return NextResponse.json({ error: 'Bet has already been settled' }, { status: 400 })
    }

    const now = new Date()

    let updatedBet

    if (result === 'WON') {
      ;[, updatedBet] = await prisma.$transaction([
        prisma.user.update({
          where: { id: bet.userId },
          data: { balance: { increment: bet.potentialPayout } },
        }),
        prisma.bet.update({
          where: { id },
          data: { status: 'WON', settledAt: now },
        }),
      ])
    } else if (result === 'VOID') {
      ;[, updatedBet] = await prisma.$transaction([
        prisma.user.update({
          where: { id: bet.userId },
          data: { balance: { increment: bet.wagerAmount } },
        }),
        prisma.bet.update({
          where: { id },
          data: { status: 'VOID', settledAt: now },
        }),
      ])
    } else {
      // LOST — calculate charity contribution and update CharityPot
      const charityContribution =
        Math.round(bet.wagerAmount.toNumber() * 0.02 * 100) / 100

      const currentMonth = now.getMonth() + 1
      const currentYear = now.getFullYear()
      const startOfMonth = new Date(currentYear, now.getMonth(), 1)

      updatedBet = await prisma.$transaction(async (tx) => {
        let charityId: string | undefined

        if (bet.user.selectedCause) {
          const charity = await tx.charity.findFirst({
            where: {
              causeCategory: bet.user.selectedCause,
              rotationMonth: currentMonth,
              rotationYear: currentYear,
              isActive: true,
            },
          })

          if (charity) {
            charityId = charity.id
            await tx.charityPot.upsert({
              where: {
                userId_charityId_month: {
                  userId: bet.userId,
                  charityId: charity.id,
                  month: startOfMonth,
                },
              },
              update: { totalContributed: { increment: charityContribution } },
              create: {
                userId: bet.userId,
                charityId: charity.id,
                month: startOfMonth,
                totalContributed: charityContribution,
              },
            })
          }
        }

        return tx.bet.update({
          where: { id },
          data: {
            status: 'LOST',
            settledAt: now,
            charityContribution,
            ...(charityId ? { charityId } : {}),
          },
        })
      })
    }

    return NextResponse.json({ bet: updatedBet })
  } catch (err) {
    console.error('[POST /api/bets/[id]/resolve]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
