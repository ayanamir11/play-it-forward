import { NextResponse } from 'next/server'
import { cacheGet, cacheSet, cacheGetAllEvents } from '@/lib/oddsCache'

const API_BASE = 'https://api.the-odds-api.com/v4'

interface OddsEvent {
  id: string
  sport_key: string
  sport_title: string
  commence_time: string
  home_team: string
  away_team: string
  bookmakers: unknown[]
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const { eventId } = await params

    // Search all currently cached sport events first
    const allCached = cacheGetAllEvents<OddsEvent>()
    const found = allCached.find((e) => e.id === eventId)
    if (found) {
      return NextResponse.json({ event: found })
    }

    // Cache miss — if the caller knows the sport, fetch and cache that sport
    const { searchParams } = new URL(request.url)
    const sport = searchParams.get('sport')

    if (!sport) {
      return NextResponse.json(
        { error: 'Event not found in cache. Provide ?sport= to fetch live data.' },
        { status: 404 }
      )
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

    const events: OddsEvent[] = await res.json()
    cacheSet(`events:${sport}`, events)

    const event = events.find((e) => e.id === eventId)
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    return NextResponse.json({ event })
  } catch (err) {
    console.error('[GET /api/odds/events/[eventId]]', err)
    return NextResponse.json({ error: 'Failed to fetch event' }, { status: 502 })
  }
}
