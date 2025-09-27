import { describe, it, expect, beforeAll } from 'vitest';
import { prisma } from '@/lib/prisma';
import { audit, fetchAudit } from '@/lib/audit';

// Simple integration-ish test hitting the real SQLite dev DB file.
// Assumes test isolation not required yet; cleans only inserted records via unique action prefix.

const PREFIX = `test.audit.${Date.now()}`;

beforeAll(async () => {
  // sanity ensure prisma works
  await prisma.$queryRaw`SELECT 1`;
});

describe('audit logging', () => {
  it('persists and fetches events with metadata', async () => {
    await audit({ actor: 'tester', tenantId: 'system', action: `${PREFIX}.one`, target: 'unit', metadata: { foo: 'bar', n: 1 } });
    await audit({ actor: 'tester', tenantId: 'system', action: `${PREFIX}.two`, target: 'unit', metadata: { foo: 'baz', n: 2 } });

    const rows = await fetchAudit({ limit: 10, action: undefined, actor: 'tester' });
    const filtered = rows.filter(r => r.action.startsWith(PREFIX));
    expect(filtered.length).toBeGreaterThanOrEqual(2);
    const meta = filtered.find(r => r.action.endsWith('.one'))?.metadata as any;
    expect(meta?.foo).toBe('bar');
  });

  it('supports cursor pagination ordering by at desc', async () => {
    await audit({ actor: 'tester', tenantId: 'system', action: `${PREFIX}.pageA`, target: 'unit' });
    await audit({ actor: 'tester', tenantId: 'system', action: `${PREFIX}.pageB`, target: 'unit' });

    const firstBatch = await fetchAudit({ limit: 1, actor: 'tester' });
    expect(firstBatch.length).toBe(1);
    const cursor = firstBatch[0].id; // newest
    const secondBatch = await fetchAudit({ limit: 50, actor: 'tester', cursor });
    // ensure we did not get the same id back
    expect(secondBatch.find(r => r.id === cursor)).toBeFalsy();
  });
});
