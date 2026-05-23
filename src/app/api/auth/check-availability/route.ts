import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { apiLimiter, checkRateLimit } from '@/lib/ratelimit'

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for') ?? 'anonymous'
    const { success } = await checkRateLimit(apiLimiter, ip)
    if (!success) {
      return NextResponse.json(
        { error: 'Too many requests, please try again later' },
        { status: 429 },
      )
    }

    let body: { email?: string; username?: string }
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Request body must be valid JSON' }, { status: 400 })
    }

    const { email, username } = body

    if (!email && !username) {
      return NextResponse.json({ error: 'email or username is required' }, { status: 400 })
    }

    const [emailMatch, usernameMatch] = await Promise.all([
      email
        ? prisma.user.findUnique({ where: { email }, select: { id: true } })
        : Promise.resolve(null),
      username
        ? prisma.user.findUnique({ where: { username }, select: { id: true } })
        : Promise.resolve(null),
    ])

    return NextResponse.json({
      emailTaken: !!emailMatch,
      usernameTaken: !!usernameMatch,
    })
  } catch (err) {
    console.error('[POST /api/auth/check-availability]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
