import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(request: Request) {
  try {
    const body = await request.text()
    const event = JSON.parse(body) as Stripe.Event

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session

      const userId = session.metadata?.userId
      const amount = parseFloat(session.metadata?.amount ?? '')

      if (!userId || isNaN(amount)) {
        console.error('[webhook] Missing or invalid metadata', session.metadata)
        return NextResponse.json({ error: 'Invalid metadata' }, { status: 400 })
      }

      await prisma.user.update({
        where: { id: userId },
        data: { balance: { increment: amount } },
      })

      console.log(`[webhook] Deposited $${amount} for user ${userId}`)
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error('[POST /api/payments/webhook]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
