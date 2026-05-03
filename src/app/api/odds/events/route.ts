import { NextResponse } from 'next/server'
import { cacheGet, cacheSet } from '@/lib/oddsCache'

const API_BASE = 'https://api.the-odds-api.com/v4'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const sport = searchParams.get('sport')

    if (!sport) {
      return NextResponse.json({ error: 'sport query parameter is required' }, { status: 400 })
    }

    const cacheKey = `events:${sport}`
    const cached = cacheGet<unknown[]>(cacheKey)
    if (cached) {
      return NextResponse.json({ events: cached, cached: true })
    }

    const apiKey = process.env.ODDS_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'Odds API key not configured' }, { status: 500 })
    }

    const url =
      `${API_BASE}/sports/${sport}/odds/` +
      `?apiKey=${apiKey}&regions=us&markets=h2h,spreads,totals&oddsFormat=american`

    const res = await fetch(url, { cache: 'no-store' })

    if (res.status === 401) {
      return NextResponse.json({ error: 'Invalid Odds API key' }, { status: 502 })
    }
    if (res.status === 422) {
      return NextResponse.json({ error: `Unknown sport: ${sport}` }, { status: 400 })
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

    const events = await res.json()
    cacheSet(cacheKey, events)

    return NextResponse.json({ events, cached: false })
  } catch (err) {
    console.error('[GET /api/odds/events]', err)
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 502 })
  }
}
