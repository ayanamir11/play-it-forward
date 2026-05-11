import { NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function requireAdmin(
  request: Request,
): Promise<{ userId: string } | NextResponse> {
  const authHeader = request.headers.get('Authorization')
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null

  if (!token) {
    return NextResponse.json({ error: 'Missing authorization token' }, { status: 401 })
  }

  let userId: string
  try {
    const payload = await verifyToken(token)
    if (!payload.sub) {
      return NextResponse.json({ error: 'Invalid token payload' }, { status: 401 })
    }
    userId = payload.sub
  } catch {
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isAdmin: true },
  })

  if (!user || !user.isAdmin) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 })
  }

  return { userId }
}
