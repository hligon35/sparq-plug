/**
 * Tenant utilities
 *
 * In production, you might derive tenant from subdomain, JWT claims, or SSO context.
 * Here we provide a basic extractor that reads from headers or environment fallbacks.
 */

import type { NextRequest } from 'next/server';

const DEFAULT_TENANT = process.env.DEFAULT_TENANT_ID || 'sparq';

export function getTenantId(req?: NextRequest): string {
  if (!req) return DEFAULT_TENANT;
  const fromHeader = req.headers.get('x-tenant-id');
  if (fromHeader) return fromHeader;
  // Optionally parse subdomain in the future
  return DEFAULT_TENANT;
}

export function getActor(req?: NextRequest): string {
  // Prefer a user email/id header set by auth gateway; fallback to role cookie if needed
  const email = req?.headers.get('x-user-email');
  if (email) return email;
  return 'system';
}
