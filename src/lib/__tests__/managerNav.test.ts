import { describe, it, expect, vi } from 'vitest';
import { managerRouteMap, navigateManager, addManagerNavListener } from '../managerNav';

// Helper to stub location href without triggering jsdom navigation
function stubLocationHref() {
  const original = window.location;
  // @ts-expect-error redefine for test
  delete window.location;
  let hrefValue = 'http://localhost:3000/';
  window.location = {
    ...original,
    get href() { return hrefValue; },
    set href(v: string) { hrefValue = v; }
  } as any;
  return () => {
    (window as any).location = original;
  };
}

describe('managerNav', () => {
  it('contains expected tab keys', () => {
    const expected = ['dashboard','invoices','clients','analytics','settings','tasks'];
    expect(Object.keys(managerRouteMap).sort()).toEqual(expected.sort());
  });

  it('paths start with /manager', () => {
    Object.values(managerRouteMap).forEach(p => {
      expect(p.startsWith('/manager')).toBe(true);
    });
  });

  it('invoices route includes query parameter', () => {
    expect(managerRouteMap.invoices).toContain('?tab=invoices');
  });

  it('dashboard and invoices can invoke internal handler instead of navigation', () => {
    const handler = vi.fn();
    const restore = stubLocationHref();
    const original = window.location.href;
    navigateManager('dashboard', { internalHandler: handler });
    navigateManager('invoices', { internalHandler: handler });
    expect(handler).toHaveBeenCalledTimes(2);
    expect(window.location.href).toBe(original);
    restore();
  });

  it('sets window.location for non-internal tabs without router', () => {
    const restore = stubLocationHref();
    navigateManager('clients');
    expect(window.location.href).toBe(managerRouteMap.clients);
    restore();
  });

  it('uses router push when provided', () => {
    const restore = stubLocationHref();
    const push = vi.fn();
    navigateManager('clients', { router: { push } });
    expect(push).toHaveBeenCalledWith(managerRouteMap.clients);
    restore();
  });

  it('uses internal handler for dashboard/invoices even if router passed', () => {
    const restore = stubLocationHref();
    const handler = vi.fn();
    const push = vi.fn();
    navigateManager('dashboard', { internalHandler: handler, router: { push } });
    expect(handler).toHaveBeenCalledTimes(1);
    expect(push).not.toHaveBeenCalled();
    restore();
  });

  it('emits events for each navigation path', () => {
    const restore = stubLocationHref();
    const events: any[] = [];
    const off = addManagerNavListener(e => events.push(e));
    const handler = vi.fn();
    navigateManager('dashboard', { internalHandler: handler }); // internal
    navigateManager('clients'); // hard (no router)
    const push = vi.fn();
    navigateManager('analytics', { router: { push } }); // router
    off();
    expect(events.length).toBe(3);
    const methods = events.map(e => e.method).sort();
    expect(methods).toEqual(['hard','internal','router'].sort());
    restore();
  });
});
