import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, createToken } from '@/lib/auth'
import { CauseCategory } from '@prisma/client'

export async function POST(request: Request) {
  try {
    let body: Record<string, string>
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Request body must be valid JSON' }, { status: 400 })
    }

    const { email, username, password, firstName, lastName, dateOfBirth, selectedCause } = body

    if (!email || !username || !password || !firstName || !lastName || !dateOfBirth) {
      return NextResponse.json(
        { error: 'email, username, password, firstName, lastName, and dateOfBirth are required' },
        { status: 400 }
      )
    }

    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
      select: { email: true, username: true },
    })

    if (existing) {
      const field = existing.email === email ? 'email' : 'username'
      return NextResponse.json({ error: `That ${field} is already taken` }, { status: 409 })
    }

    const passwordHash = await hashPassword(password)

    const user = await prisma.user.create({
      data: {
        email,
        username,
        passwordHash,
        firstName,
        lastName,
        dateOfBirth: new Date(dateOfBirth),
        ...(selectedCause ? { selectedCause: selectedCause as CauseCategory } : {}),
      },
      select: { id: true, email: true, username: true, firstName: true, lastName: true },
    })

    const token = await createToken(user.id)

    return NextResponse.json({ token, user }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/auth/register]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
