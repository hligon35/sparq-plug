"use client";
import { useState, useEffect, useCallback } from 'react';
import Button from '@/components/ui/Button';

export type TourStep = {
  id: string;
  title: string;
  body: string;
  selector?: string; // optional CSS selector to highlight
  placement?: 'top'|'bottom'|'left'|'right'|'center';
};

const DEFAULT_STEPS: TourStep[] = [
  { id: 'welcome', title: 'Welcome to SparQ Plug', body: 'This short tour will help you schedule posts, view analytics, and leverage Sparqy the AI assistant.' , placement: 'center'},
  { id: 'planner', title: 'Circuit Planner', body: 'Plan and manage posts across all connected client platforms here.', selector: 'h3:contains("Circuit: Post Planner")', placement: 'bottom'},
  { id: 'create', title: 'Quick Create', body: 'Use the Create tab to rapidly draft and schedule multi-platform posts.', placement: 'top'},
  { id: 'analytics', title: 'Analytics Hub', body: 'Navigate to Analytics to review performance KPIs, social metrics, and site traffic.', placement: 'top'},
  { id: 'sparqy', title: 'Meet Sparqy', body: 'Sparqy lives bottom-right. Ask questions, get guidance, and accelerate workflows.', placement: 'left'},
  { id: 'finish', title: 'You are ready!', body: 'That concludes the intro. You can re-run this tour anytime from the Help menu.', placement: 'center'},
];

type Props = {
  open: boolean;
  onClose: () => void;
  steps?: TourStep[];
};

// Very lightweight highlighting: attempt to find the first matching element by selector and outline it.
function highlightElement(selector?: string) {
  document.querySelectorAll('.__tour-highlight').forEach(el => el.classList.remove('__tour-highlight'));
  if (!selector) return null;
  // Basic :contains polyfill attempt for our simple usage
  let target: Element | null = null;
  if (selector.includes(':contains')) {
    const match = /([^:]+):contains\("(.+?)"\)/.exec(selector);
    if (match) {
      const base = match[1].trim();
      const text = match[2];
      const candidates = Array.from(document.querySelectorAll(base));
      target = candidates.find(c => c.textContent?.includes(text)) || null;
    }
  } else {
    target = document.querySelector(selector);
  }
  if (target) {
    target.classList.add('__tour-highlight');
  }
  return target;
}

export default function TourWizard({ open, onClose, steps = DEFAULT_STEPS }: Props) {
  const [index, setIndex] = useState(0);
  const step = steps[index];

  useEffect(() => {
    if (open) {
      setIndex(0);
      highlightElement(steps[0]?.selector);
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
      document.querySelectorAll('.__tour-highlight').forEach(el => el.classList.remove('__tour-highlight'));
    }
  }, [open, steps]);

  useEffect(() => {
    if (!open) return; highlightElement(step?.selector);
  }, [index, open, step]);

  const next = useCallback(() => {
    if (index < steps.length - 1) setIndex(i => i + 1); else finish();
  }, [index, steps.length]);
  const prev = () => setIndex(i => Math.max(0, i - 1));
  const finish = () => { onClose(); };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[1000] pointer-events-none">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm pointer-events-auto" aria-hidden onClick={finish} />
      <div className="absolute inset-0 flex items-center justify-center p-4 pointer-events-none">
        <div role="dialog" aria-modal="true" aria-labelledby="tour-step-title" className="pointer-events-auto w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-gray-200 p-6 relative animate-fade-in">
          <div className="absolute -top-4 -right-4 bg-gradient-to-br from-blue-500 to-purple-600 text-white px-4 py-1 rounded-full text-xs font-semibold shadow">Step {index + 1} / {steps.length}</div>
          <h2 id="tour-step-title" className="text-xl font-bold text-gray-800 mb-2">{step.title}</h2>
          <p className="text-sm text-gray-600 whitespace-pre-line mb-6">{step.body}</p>
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Button size="sm" variant="ghost" onClick={finish}>Exit</Button>
            </div>
            <div className="flex gap-2">
              {index > 0 && <Button size="sm" variant="secondary" onClick={prev}>Back</Button>}
              {index < steps.length - 1 && <Button size="sm" onClick={next}>Next</Button>}
              {index === steps.length - 1 && <Button size="sm" onClick={finish}>Finish</Button>}
            </div>
          </div>
        </div>
      </div>
      {/* Basic CSS for highlight */}
      <style jsx global>{`
        .__tour-highlight { outline: 3px solid #6366f1; outline-offset: 4px; border-radius: 6px; position: relative; }
        .__tour-highlight:after { content: ' '; position: absolute; inset: 0; box-shadow: 0 0 0 4px rgba(99,102,241,0.35); border-radius: inherit; pointer-events:none; }
      `}</style>
    </div>
  );
}
