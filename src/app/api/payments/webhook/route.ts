import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export const config = { api: { bodyParser: false } }

export async function POST(request: Request) {
  const rawBody = await request.text()
  const signature = request.headers.get('stripe-signature')

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature ?? '',
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('[webhook] Signature verification failed', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
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
