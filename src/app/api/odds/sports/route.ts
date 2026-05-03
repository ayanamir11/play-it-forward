import { NextResponse } from 'next/server'
import { cacheGet, cacheSet } from '@/lib/oddsCache'

const API_BASE = 'https://api.the-odds-api.com/v4'

export async function GET() {
  try {
    const cached = cacheGet<unknown[]>('sports')
    if (cached) {
      return NextResponse.json({ sports: cached })
    }

    const apiKey = process.env.ODDS_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'Odds API key not configured' }, { status: 500 })
    }

    const res = await fetch(`${API_BASE}/sports/?apiKey=${apiKey}`, {
      cache: 'no-store',
    })

    if (res.status === 401) {
      return NextResponse.json({ error: 'Invalid Odds API key' }, { status: 502 })
    }
    if (res.status === 429) {
      return NextResponse.json({ error: 'Odds API rate limit exceeded' }, { status: 429 })
    }
    if (!res.ok) {
      return NextResponse.json(
        { error: `Odds API error: ${res.status}` },
        { status: 502 }
      )
    }

    const sports = await res.json()
    cacheSet('sports', sports)

    return NextResponse.json({ sports })
  } catch (err) {
    console.error('[GET /api/odds/sports]', err)
    return NextResponse.json({ error: 'Failed to fetch sports' }, { status: 502 })
  }
}
