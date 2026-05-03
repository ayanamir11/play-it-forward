import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/middleware'

export async function POST(request: Request) {
  try {
    const auth = await requireAuth(request)
    if (auth instanceof NextResponse) return auth
    const { userId } = auth

    let body: { amount?: unknown }
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Request body must be valid JSON' }, { status: 400 })
    }

    const { amount } = body

    if (typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json({ error: 'amount must be a positive number' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { balance: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 })
    }

    if (user.balance.toNumber() < amount) {
      return NextResponse.json({ error: 'Insufficient balance' }, { status: 402 })
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { balance: { decrement: amount } },
      select: { id: true, username: true, balance: true },
    })

    return NextResponse.json({ balance: updated.balance })
  } catch (err) {
    console.error('[POST /api/payments/withdraw]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
