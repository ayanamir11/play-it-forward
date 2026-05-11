import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/middleware'

export async function GET(request: Request) {
  try {
    const auth = await requireAuth(request)
    if (auth instanceof NextResponse) return auth
    const { userId } = auth

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
        dateOfBirth: true,
        selectedCause: true,
        balance: true,
        createdAt: true,
      },
    })

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    return NextResponse.json({
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      dateOfBirth: user.dateOfBirth,
      selectedCause: user.selectedCause,
      balance: user.balance.toString(),
      createdAt: user.createdAt,
    })
  } catch (err) {
    console.error('[GET /api/account]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
