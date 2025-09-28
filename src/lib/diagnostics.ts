import { withBasePath } from '@/lib/basePath';

export interface ConnectionCheck {
  id: string;
  label: string;
  status: 'ok' | 'warn' | 'error';
  latencyMs?: number;
  details?: string;
}

export interface DiagnosticsResult {
  timestamp: string;
  checks: ConnectionCheck[];
  summary: { ok: number; warn: number; error: number; total: number };
}

async function timeFetch(url: string, opts?: RequestInit) {
  const start = performance.now();
  try {
    const res = await fetch(url, opts);
    const latency = performance.now() - start;
    if (!res.ok) return { status: 'error' as const, latency, details: `HTTP ${res.status}` };
    return { status: 'ok' as const, latency };
  } catch (e: any) {
    return { status: 'error' as const, latency: performance.now() - start, details: e.message };
  }
}

export async function runDiagnostics(): Promise<DiagnosticsResult> {
  const endpoints: { id: string; label: string; path: string }[] = [
    { id: 'health-app', label: 'App Health', path: '/api/healthz' },
    { id: 'posts', label: 'Scheduled Posts API', path: '/api/scheduled-posts' },
    { id: 'metrics', label: 'Metrics Endpoint', path: '/api/metrics' },
    { id: 'version', label: 'Version', path: '/api/version' },
  ];

  const checks: ConnectionCheck[] = [];
  for (const ep of endpoints) {
    const r = await timeFetch(withBasePath(ep.path));
    checks.push({ id: ep.id, label: ep.label, status: r.status, latencyMs: Math.round(r.latency), details: r.details });
  }

  const summary = {
    ok: checks.filter(c => c.status === 'ok').length,
    warn: checks.filter(c => c.status === 'warn').length,
    error: checks.filter(c => c.status === 'error').length,
    total: checks.length,
  };

  return { timestamp: new Date().toISOString(), checks, summary };
}

export function formatErrorsOnly(result: DiagnosticsResult): string {
  const lines = result.checks.filter(c => c.status === 'error').map(c => `${c.label}: ${c.details || 'Error'}`);
  return lines.join('\n');
}
