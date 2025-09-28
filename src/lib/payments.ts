import { readJson, writeJson } from './storage';

export type PaymentStatus = 'succeeded' | 'pending' | 'failed' | 'refunded' | 'partially_refunded';
export type PaymentMethod = 'card' | 'bank_transfer' | 'paypal' | 'unknown';
export type PaymentProvider = 'stripe' | 'paypal' | 'manual' | 'unknown';

export interface PaymentRecord {
  id: string; // provider payment id or generated id
  provider: PaymentProvider;
  method: PaymentMethod;
  status: PaymentStatus;
  invoiceId?: string;
  client?: string;
  amountCents: number; // store in cents for accuracy (can be negative for refunds)
  currency: string; // e.g., 'usd'
  createdAt: string; // ISO timestamp
  raw?: any; // provider payload for audit/debug
  metadata?: Record<string, any>;
}

const STORE_KEY = 'payments';

export async function listPayments(): Promise<PaymentRecord[]> {
  return readJson<PaymentRecord[]>(STORE_KEY, []);
}

export async function addPayment(payment: PaymentRecord): Promise<void> {
  const payments = await listPayments();
  // Prevent duplicates by id + status combo
  if (!payments.find(p => p.id === payment.id && p.status === payment.status)) {
    payments.push(payment);
    await writeJson(STORE_KEY, payments);
  }
}

export interface RevenueBucket {
  period: string; // e.g., '2025-09' for monthly
  grossCents: number; // includes positive and negative flows
  currency: string;
}

export async function summarizeRevenueByMonth(currency: string = 'usd'): Promise<RevenueBucket[]> {
  const payments = await listPayments();
  const buckets: Record<string, number> = {};
  for (const p of payments) {
    if ((p.currency || '').toLowerCase() !== currency.toLowerCase()) continue;
    // Use month key
    const d = new Date(p.createdAt || Date.now());
    const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
    buckets[key] = (buckets[key] || 0) + (p.amountCents || 0);
  }
  return Object.entries(buckets)
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([period, grossCents]) => ({ period, grossCents, currency }));
}

export async function totalRevenue(currency: string = 'usd'): Promise<number> {
  const payments = await listPayments();
  return payments
    .filter(p => (p.currency || '').toLowerCase() === currency.toLowerCase())
    .reduce((sum, p) => sum + (p.amountCents || 0), 0);
}
