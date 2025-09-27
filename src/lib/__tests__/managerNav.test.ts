import { describe, it, expect, vi } from 'vitest';
import { managerRouteMap, navigateManager } from '../managerNav';

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

  it('sets window.location for non-internal tabs', () => {
    const restore = stubLocationHref();
    navigateManager('clients');
    expect(window.location.href).toBe(managerRouteMap.clients);
    restore();
  });
});
