import { NextRequest } from 'next/server';
import { apiGuard } from '@/lib/apiGuard';
import { ok } from '@/lib/apiResponse';

// Simple in-memory mock. Could later read per-tenant mailboxes from storage.
// We include a couple of threads to drive the UI placeholder.

export async function GET(request: NextRequest) {
  const g = apiGuard(request, { path: '/api/email/mailboxes:GET', capability: 'view_email', rate: { windowMs: 10_000, max: 40 }, csrf: false });
  if (g instanceof Response) return g;

  // Mock mailboxes (would be filtered by g.tenantId eventually)
  const mailboxes = [
    { id: 'mb_primary', address: `inbox@tenant.example`, label: 'Primary', unread: 2, provider: 'google' as const },
    { id: 'mb_support', address: `support@tenant.example`, label: 'Support', unread: 0, provider: 'local' as const },
  ];

  const now = Date.now();
  const threads = [
    {
      id: 'thr_1',
      mailboxId: 'mb_primary',
      subject: 'Welcome to SparQ Plug',
      from: 'support@sparq.local',
      snippet: 'Thanks for trying the unified inbox preview…',
      unread: true,
      updatedAt: new Date(now - 2 * 60 * 1000).toISOString(),
    },
    {
      id: 'thr_2',
      mailboxId: 'mb_primary',
      subject: 'Monthly Report Ready',
      from: 'reports@sparq.local',
      snippet: 'Your monthly social performance report is ready to view…',
      unread: true,
      updatedAt: new Date(now - 10 * 60 * 1000).toISOString(),
    },
    {
      id: 'thr_3',
      mailboxId: 'mb_support',
      subject: 'Re: Question about scheduling',
      from: 'client@example.com',
      snippet: 'Great, that answers my question. Appreciate the quick reply!',
      unread: false,
      updatedAt: new Date(now - 50 * 60 * 1000).toISOString(),
    },
  ];

  return ok({ mailboxes, threads });
}
