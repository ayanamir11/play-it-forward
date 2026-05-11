import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/middleware'
import { CauseCategory } from '@prisma/client'

const VALID_CAUSES = new Set(Object.values(CauseCategory))

export async function PATCH(request: Request) {
  try {
    const auth = await requireAuth(request)
    if (auth instanceof NextResponse) return auth
    const { userId } = auth

    const body = await request.json()
    const { selectedCause } = body

    if (!selectedCause || !VALID_CAUSES.has(selectedCause)) {
      return NextResponse.json({ error: 'Invalid cause category' }, { status: 400 })
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { selectedCause },
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

    return NextResponse.json({
      id: updated.id,
      username: updated.username,
      email: updated.email,
      firstName: updated.firstName,
      lastName: updated.lastName,
      dateOfBirth: updated.dateOfBirth,
      selectedCause: updated.selectedCause,
      balance: updated.balance.toString(),
      createdAt: updated.createdAt,
    })
  } catch (err) {
    console.error('[PATCH /api/account/cause]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
