"use client";
import { useState } from 'react';
import { runDiagnostics, DiagnosticsResult, formatErrorsOnly } from '@/lib/diagnostics';
import Button from '@/components/ui/Button';
import clsx from 'clsx';

export default function DebugPanel() {
  const [open, setOpen] = useState(false);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<DiagnosticsResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleRun() {
    setRunning(true); setError(null);
    try {
      const r = await runDiagnostics();
      setResult(r);
    } catch (e:any) {
      setError(e.message || 'Failed to run diagnostics');
    } finally {
      setRunning(false);
    }
  }

  function statusColor(status: string) {
    if (status === 'ok') return 'text-green-600 border-green-200 bg-green-50';
    if (status === 'warn') return 'text-amber-600 border-amber-200 bg-amber-50';
    return 'text-red-600 border-red-200 bg-red-50';
  }

  const hasErrors = result?.summary.error;

  return (
    <div className="relative">
      {/* Toggle button */}
      <button
        onClick={() => setOpen(o => !o)}
        className="inline-flex items-center gap-2 bg-white text-[#1d74d0] hover:bg-blue-50 px-3 py-2 rounded-full text-sm font-semibold shadow"
        aria-label={`Debug panel ${open ? 'open' : 'closed'} - toggle`}
        title="Toggle debug panel"
        type="button"
      >
        <span aria-hidden>🛠️</span>
        <span className="hidden sm:inline">Debug</span>
        <span className="sm:hidden">Dbg</span>
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-[480px] max-w-[90vw] z-50">
          <div className="bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden animate-fade-in">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
              <h3 className="text-sm font-semibold text-gray-800">System Diagnostics</h3>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>Close</Button>
              </div>
            </div>
            <div className="p-4 space-y-4 max-h-[70vh] overflow-auto">
              <div className="flex items-center gap-3 flex-wrap">
                <Button size="sm" onClick={handleRun} loading={running} disabled={running}>Run Comprehensive Test</Button>
                {result && <span className="text-xs text-gray-500">Last run: {new Date(result.timestamp).toLocaleTimeString()}</span>}
                {result && (
                  <span className={clsx('text-xs font-medium px-2.5 py-1 rounded-full border',
                    hasErrors ? 'bg-red-50 text-red-700 border-red-200' : 'bg-green-50 text-green-700 border-green-200')}>{hasErrors ? 'Errors Detected' : 'All Systems Operational'}</span>
                )}
              </div>
              {error && <div className="p-3 rounded-lg text-sm bg-red-50 text-red-700 border border-red-200">{error}</div>}
              {result && (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 gap-3">
                    {result.checks.map(c => (
                      <div key={c.id} className={clsx('rounded-lg border p-3 flex items-start gap-3', statusColor(c.status))}>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold uppercase tracking-wide">{c.label}</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/60 text-gray-700 border border-white/80">{c.status.toUpperCase()}</span>
                          </div>
                          <div className="mt-1 text-xs text-gray-700 truncate">Latency: {c.latencyMs ?? '—'} ms</div>
                          {c.details && <div className="mt-1 text-[11px] text-gray-600 break-all">{c.details}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-gray-600 mb-2">Summary</h4>
                    <div className="grid grid-cols-4 text-center text-[11px] border rounded-lg overflow-hidden">
                      <div className="p-2 bg-green-50">OK<br/><span className="font-semibold">{result.summary.ok}</span></div>
                      <div className="p-2 bg-amber-50">WARN<br/><span className="font-semibold">{result.summary.warn}</span></div>
                      <div className="p-2 bg-red-50">ERR<br/><span className="font-semibold">{result.summary.error}</span></div>
                      <div className="p-2 bg-gray-50">TOTAL<br/><span className="font-semibold">{result.summary.total}</span></div>
                    </div>
                  </div>
                  {hasErrors ? (
                    <div className="space-y-2">
                      <h4 className="text-xs font-semibold text-gray-600">Suggested Fixes</h4>
                      <ul className="list-disc pl-5 marker:text-gray-400 text-[11px] space-y-1 text-gray-700">
                        <li>Verify environment variables for backend services are set.</li>
                        <li>Check network connectivity / CORS issues in browser console.</li>
                        <li>Inspect server logs for stack traces matching failing endpoint.</li>
                        <li>Ensure feature flags (metrics) are enabled if required.</li>
                      </ul>
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost" onClick={() => {
                          const only = formatErrorsOnly(result);
                          navigator.clipboard.writeText(only || '');
                        }}>Copy Errors</Button>
                        <Button size="sm" variant="ghost" onClick={() => {
                          navigator.clipboard.writeText(JSON.stringify(result, null, 2));
                        }}>Copy Full JSON</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-gray-500 italic">No issues detected.</div>
                  )}
                </div>
              )}
              {!result && !error && (
                <div className="text-xs text-gray-500">Run the comprehensive test to gather system status.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
