import { NextRequest, NextResponse } from 'next/server';
import { listPayments, summarizeRevenueByMonth, totalRevenue } from '@/lib/payments';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const summary = searchParams.get('summary');
  const currency = (searchParams.get('currency') || 'usd').toLowerCase();

  try {
    if (summary === 'monthly') {
      const buckets = await summarizeRevenueByMonth(currency);
      return NextResponse.json({ buckets });
    }
    if (summary === 'total') {
      const total = await totalRevenue(currency);
      return NextResponse.json({ total });
    }
    const payments = await listPayments();
    return NextResponse.json({ payments });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unknown error' }, { status: 500 });
  }
}
