import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { requireAuth } from '@/lib/middleware'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

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

    if (typeof amount !== 'number' || amount < 10 || amount > 5000) {
      return NextResponse.json(
        { error: 'amount must be a number between 10 and 5000' },
        { status: 400 }
      )
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: Math.round(amount * 100),
            product_data: { name: 'Wallet Deposit' },
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId,
        amount: amount.toString(),
      },
      success_url: 'http://localhost:3001/wallet?deposit=success',
      cancel_url: 'http://localhost:3001/wallet?deposit=cancelled',
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('[POST /api/payments/deposit]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
