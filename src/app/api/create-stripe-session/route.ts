import { NextResponse } from 'next/server';

// Minimal mocked Stripe session creator.
// In production, set STRIPE_SECRET_KEY and call Stripe API.
export async function POST(req: Request) {
	try {
		const body = (await req.json().catch(() => ({}))) as { amount?: string | number; invoiceId?: string };
		const amount = Number(String(body.amount || '0').replace(/[^\d.]/g, '')) || 0;
		const invoiceId = String(body.invoiceId || 'unknown');

		// If a real Stripe key exists, we would create a Checkout Session here.
		if (process.env.STRIPE_SECRET_KEY) {
			// Lazy import to avoid bundling Stripe in edge runtimes unintentionally
			const Stripe = (await import('stripe')).default;
			const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
			const session = await stripe.checkout.sessions.create({
				mode: 'payment',
				success_url: `${process.env.PUBLIC_URL || ''}${process.env.APP_BASE_PATH || ''}/client/billing?status=success&invoiceId=${encodeURIComponent(invoiceId)}`,
				cancel_url: `${process.env.PUBLIC_URL || ''}${process.env.APP_BASE_PATH || ''}/client/billing?status=cancelled&invoiceId=${encodeURIComponent(invoiceId)}`,
				line_items: [
					{
						price_data: {
							currency: 'usd',
							product_data: { name: `Invoice ${invoiceId}` },
							unit_amount: Math.round(amount * 100),
						},
						quantity: 1,
					},
				],
			});
			return NextResponse.json({ url: session.url }, { status: 200 });
		}

		// Mocked URL for local testing without Stripe
		const url = `${process.env.APP_BASE_PATH || ''}/client/billing?status=success&invoiceId=${encodeURIComponent(invoiceId)}`;
		return NextResponse.json({ url, mocked: true }, { status: 200 });
	} catch (err: unknown) {
		const message = err instanceof Error ? err.message : 'Unknown error';
		return NextResponse.json({ error: message }, { status: 500 });
	}
}
