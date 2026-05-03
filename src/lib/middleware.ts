import { NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'

export async function requireAuth(
  request: Request
): Promise<{ userId: string } | NextResponse> {
  const authHeader = request.headers.get('Authorization')
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null

  if (!token) {
    return NextResponse.json({ error: 'Missing authorization token' }, { status: 401 })
  }

  try {
    const payload = await verifyToken(token)
    const userId = payload.sub
    if (!userId) {
      return NextResponse.json({ error: 'Invalid token payload' }, { status: 401 })
    }
    return { userId }
  } catch {
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 })
  }
}
