import { NextRequest } from 'next/server';
import { readJson } from '@/lib/storage';
import { apiGuard } from '@/lib/apiGuard';
import { withPaginationHeaders } from '@/lib/pagination';

export async function GET(req: NextRequest) {
  const g = apiGuard(req, { path: '/api/audit:GET', capability: 'full_access', rate: { windowMs: 10_000, max: 20 } });
  if (g instanceof Response) return g;

  const url = new URL(req.url);
  const page = Number(url.searchParams.get('page') || '1');
  const pageSize = Number(url.searchParams.get('pageSize') || '50');

  const all = await readJson<any[]>('audit-log', []);
  // Tenant scoping
  const list = all.filter((e) => e.tenantId === g.tenantId);
  const total = list.length;
  const start = (page - 1) * pageSize;
  const slice = list.slice(start, start + pageSize);
  return withPaginationHeaders({ events: slice, page, pageSize, total }, page, pageSize, total);
}
