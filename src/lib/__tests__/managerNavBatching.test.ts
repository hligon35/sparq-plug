import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { navigateManager, addManagerNavListener, setManagerNavBatching, flushManagerNavEvents, removeAllManagerNavListeners } from '../managerNav';

// Lightweight shim if project uses a custom router mock elsewhere.
vi.mock('next/navigation', () => {
  const push = vi.fn();
  const replace = vi.fn();
  return {
    useRouter: () => ({ push, replace }),
  };
});

describe('managerNav batching', () => {
  beforeEach(() => {
    setManagerNavBatching(false);
    removeAllManagerNavListeners();
  });

  afterEach(() => {
    setManagerNavBatching(false);
    removeAllManagerNavListeners();
  });

  it('emits immediately when batching disabled (router path)', () => {
    const events: string[] = [];
    const router = { push: vi.fn(), replace: vi.fn() };
    addManagerNavListener(ev => events.push(ev.tab));
    navigateManager('clients', { router });
    expect(router.push).toHaveBeenCalled();
    expect(events).toContain('clients');
  });

  it('buffers events when batching enabled until flushed', () => {
    const events: string[] = [];
    const router = { push: vi.fn(), replace: vi.fn() };
    addManagerNavListener(ev => events.push(ev.tab));
    setManagerNavBatching(true);
    navigateManager('clients', { router });
    navigateManager('settings', { router });
    expect(events.length).toBe(0);
    flushManagerNavEvents();
    expect(events).toEqual(['clients', 'settings']);
  });

  it('clears buffer after flush', () => {
    const events: string[] = [];
    const router = { push: vi.fn(), replace: vi.fn() };
    addManagerNavListener(ev => events.push(ev.tab));
    setManagerNavBatching(true);
    navigateManager('clients', { router });
    flushManagerNavEvents();
    expect(events).toEqual(['clients']);
    navigateManager('settings', { router });
    expect(events).toEqual(['clients']);
    flushManagerNavEvents();
    expect(events).toEqual(['clients', 'settings']);
  });
});
