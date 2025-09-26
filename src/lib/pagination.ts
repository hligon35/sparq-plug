import { NextResponse } from 'next/server';

export function paginate<T>(items: T[], page: number, pageSize: number) {
  const total = items.length;
  const p = Math.max(1, page || 1);
  const ps = Math.max(1, Math.min(100, pageSize || 50));
  const start = (p - 1) * ps;
  const data = items.slice(start, start + ps);
  return { data, page: p, pageSize: ps, total };
}

export function withPaginationHeaders<T>(body: T, page: number, pageSize: number, total: number) {
  const res = NextResponse.json(body);
  res.headers.set('X-Total-Count', String(total));
  res.headers.set('X-Page', String(page));
  res.headers.set('X-Page-Size', String(pageSize));
  return res;
}
