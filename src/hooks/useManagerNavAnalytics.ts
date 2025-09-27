import { useEffect, useRef, useState } from 'react';
import { addManagerNavListener, ManagerNavEvent } from '@/lib/managerNav';

/**
 * Collects manager navigation events for lightweight in-app analytics or debugging.
 * Options:
 *  - max: cap stored events (FIFO) to avoid unbounded memory (default 100)
 *  - onEvent: side-effect callback for streaming processing (e.g., send to analytics)
 */
export function useManagerNavAnalytics(opts?: { max?: number; onEvent?: (e: ManagerNavEvent) => void }) {
  const max = opts?.max ?? 100;
  const [events, setEvents] = useState<ManagerNavEvent[]>([]);
  const onEventRef = useRef(opts?.onEvent);
  onEventRef.current = opts?.onEvent;

  useEffect(() => {
    return addManagerNavListener((e) => {
      setEvents(prev => {
        const next = [...prev, e];
        if (next.length > max) next.splice(0, next.length - max);
        return next;
      });
      try {
        onEventRef.current?.(e);
      } catch {
        // swallow side-effect errors
      }
    });
  }, [max]);

  return events;
}

export default useManagerNavAnalytics;
