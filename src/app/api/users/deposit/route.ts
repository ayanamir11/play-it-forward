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

    const user = await prisma.user.update({
      where: { id: userId },
      data: { balance: { increment: amount } },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        dateOfBirth: true,
        balance: true,
        selectedCause: true,
        isActive: true,
        createdAt: true,
      },
    })

    return NextResponse.json({ user })
  } catch (err) {
    console.error('[POST /api/users/deposit]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
