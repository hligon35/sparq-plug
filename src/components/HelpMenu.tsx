"use client";
import { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import dynamic from 'next/dynamic';

const TourWizard = dynamic(() => import('./TourWizard'), { ssr: false });

const LOCAL_KEY = 'sparq_has_seen_tour_v1';

export default function HelpMenu() {
  const [open, setOpen] = useState(false);
  const [showTour, setShowTour] = useState(false);
  const [manual, setManual] = useState<string | null>(null);

  useEffect(() => {
    if (open && manual == null) {
      fetch('/manual/sparq-user-manual.md').then(r => r.text()).then(setManual).catch(()=>setManual('# Manual\nFailed to load manual.'));
    }
  }, [open, manual]);

  useEffect(() => {
    const seen = typeof window !== 'undefined' && localStorage.getItem(LOCAL_KEY);
    if (!seen) {
      setShowTour(true);
      localStorage.setItem(LOCAL_KEY, '1');
    }
  }, []);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o=>!o)}
        type="button"
        aria-haspopup="true"
        aria-expanded={open || undefined}
        className="inline-flex items-center gap-2 bg-white text-[#1d74d0] hover:bg-blue-50 px-3 py-2 rounded-full text-sm font-semibold shadow"
        title="Help & Resources"
      >
        <span aria-hidden>❓</span>
        <span className="hidden sm:inline">Help</span>
        <span className="sm:hidden">Help</span>
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-[420px] max-w-[85vw] z-50">
          <div className="bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden animate-fade-in">
            <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between bg-gray-50">
              <h3 className="text-sm font-semibold text-gray-800">Help Center</h3>
              <Button size="sm" variant="ghost" onClick={()=>setOpen(false)}>Close</Button>
            </div>
            <div className="p-4 space-y-4 max-h-[60vh] overflow-auto text-sm">
              <div className="space-y-2">
                <p className="text-gray-600">New here? Start with the interactive tour or explore the manual for detailed guidance.</p>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" onClick={()=>{ setShowTour(true); setOpen(false); }}>Run Tour</Button>
                  <Button size="sm" variant="secondary" onClick={()=>{ setManual(m=>m||'# Loading...'); }}>Load Manual</Button>
                </div>
              </div>
              {manual && (
                <div className="prose prose-sm max-w-none">
                  <pre className="whitespace-pre-wrap text-xs leading-relaxed font-mono bg-gray-50 p-3 rounded border border-gray-200">{manual}</pre>
                </div>
              )}
              <div className="pt-2 border-t border-gray-100 text-[11px] text-gray-500">Need more? Ask <strong>Sparqy</strong> in the bottom-right corner.</div>
            </div>
          </div>
        </div>
      )}
      <TourWizard open={showTour} onClose={()=>setShowTour(false)} />
    </div>
  );
}
