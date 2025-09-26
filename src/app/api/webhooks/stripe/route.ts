import { NextRequest, NextResponse } from 'next/server';
import { addPayment, PaymentRecord } from '@/lib/payments';

// Raw body is required to verify Stripe signatures. Next.js App Router uses web-standards Request.
export const config = {
  api: { bodyParser: false },
};

export async function POST(req: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 501 });
  }

  const buf = await req.arrayBuffer();
  const rawBody = Buffer.from(buf);
  const sig = req.headers.get('stripe-signature');

  try {
    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe(stripeKey);
    // @ts-ignore create typed event
    const event = stripe.webhooks.constructEvent(rawBody, sig as string, secret as string);

    // Handle events we care about for revenue tracking
    switch (event.type) {
      case 'payment_intent.succeeded':
      case 'charge.succeeded': {
        const charge: any = event.data.object;
        const amountCents = charge.amount_received ?? charge.amount ?? 0;
        const currency = charge.currency || 'usd';
        const invoiceId = charge.metadata?.invoiceId || charge.metadata?.invoice_id;
        const client = charge.metadata?.client;
        const record: PaymentRecord = {
          id: String(charge.id || charge.payment_intent || event.id),
          provider: 'stripe',
          method: (charge.payment_method_details?.type as any) || 'card',
          status: 'succeeded',
          amountCents: amountCents,
          currency,
          invoiceId,
          client,
          createdAt: new Date().toISOString(),
          raw: charge,
          metadata: charge.metadata || {},
        };
        await addPayment(record);
        break;
      }
      case 'payment_intent.payment_failed':
      case 'charge.failed': {
        const charge: any = event.data.object;
        const amountCents = charge.amount ?? 0;
        const currency = charge.currency || 'usd';
        const invoiceId = charge.metadata?.invoiceId || charge.metadata?.invoice_id;
        const client = charge.metadata?.client;
        const record: PaymentRecord = {
          id: String(charge.id || charge.payment_intent || event.id),
          provider: 'stripe',
          method: (charge.payment_method_details?.type as any) || 'card',
          status: 'failed',
          amountCents,
          currency,
          invoiceId,
          client,
          createdAt: new Date().toISOString(),
          raw: charge,
          metadata: charge.metadata || {},
        };
        await addPayment(record);
        break;
      }
      case 'charge.refunded':
      case 'charge.refund.updated':
      case 'refund.created': {
        const refund: any = event.data.object;
        const amountCents = -Math.abs(refund.amount || 0); // negative revenue
        const currency = refund.currency || 'usd';
        const record: PaymentRecord = {
          id: String(refund.id || event.id),
          provider: 'stripe',
          method: 'card',
          status: refund.amount === refund.balance_transaction ? 'refunded' : 'partially_refunded',
          amountCents,
          currency,
          invoiceId: refund.metadata?.invoiceId,
          client: refund.metadata?.client,
          createdAt: new Date().toISOString(),
          raw: refund,
          metadata: refund.metadata || {},
        };
        await addPayment(record);
        break;
      }
      default:
        // Ignore other events for now
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }
}
