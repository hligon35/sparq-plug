import { NextRequest, NextResponse } from 'next/server';
import { rootLogger } from './logger';
import { toErrorResponse, AppError } from './errors';
import { runWithContext } from './requestContext';
import { randomUUID } from 'crypto';

export type HandlerFn = (req: NextRequest, ctx: { logger: any; start: number }) => Promise<NextResponse>;

export function createApiHandler(handler: HandlerFn) {
  return async function wrapped(req: NextRequest) {
    const start = Date.now();
    const incomingTrace = req.headers.get('x-trace-id') || undefined;
    const traceId = incomingTrace || randomUUID();
    return runWithContext(async () => {
      const logger = rootLogger.child({ traceId, path: req.nextUrl.pathname, method: req.method });
      try {
        const res = await handler(req, { logger, start });
        const dur = Date.now() - start;
        logger.info('request.completed', { durationMs: dur, status: res.status });
        // Attach trace id to response headers for propagation
        const headers = new Headers(res.headers);
        headers.set('x-trace-id', traceId);
        return new NextResponse(res.body, { status: res.status, headers });
      } catch (err) {
        const dur = Date.now() - start;
        logger.error('request.failed', { durationMs: dur, error: (err as any)?.message });
        const { status, body } = toErrorResponse(err);
        return NextResponse.json(body, { status, headers: { 'x-trace-id': traceId } });
      }
    }, { traceId });
  };
}
