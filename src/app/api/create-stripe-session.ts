import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripeSecret = process.env.STRIPE_SECRET_KEY as string; // must be provided in environment
const stripe = new Stripe(stripeSecret, {});

export async function POST(req: NextRequest) {
  const { amount, invoiceId } = await req.json();
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Invoice #${invoiceId}`,
            },
            unit_amount: Math.round(Number(amount) * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.nextUrl.origin}/manager?success=1`,
      cancel_url: `${req.nextUrl.origin}/manager?canceled=1`,
    });
    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
