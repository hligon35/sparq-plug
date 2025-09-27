import { NextResponse } from 'next/server';
import { snapshot } from '@/core/metrics';
import { isFlagEnabled } from '@/core/featureFlags';
import { createApiHandler } from '@/core/apiHandler';

export const GET = createApiHandler(async () => {
  if (!isFlagEnabled('new_scheduler_metrics')) {
    return NextResponse.json({ error: 'Metrics disabled' }, { status: 404 });
  }
  return NextResponse.json({ metrics: snapshot() });
});