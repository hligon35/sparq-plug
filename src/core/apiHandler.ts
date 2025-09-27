import { NextRequest, NextResponse } from 'next/server';
import { rootLogger } from './logger';
import { toErrorResponse, AppError } from './errors';

export type HandlerFn = (req: NextRequest, ctx: { logger: any; start: number }) => Promise<NextResponse>;

export function createApiHandler(handler: HandlerFn) {
  return async function wrapped(req: NextRequest) {
    const start = Date.now();
    const traceId = req.headers.get('x-trace-id') || undefined;
    const logger = rootLogger.child({ traceId, path: req.nextUrl.pathname, method: req.method });
    try {
      const res = await handler(req, { logger, start });
      const dur = Date.now() - start;
      logger.info('request.completed', { durationMs: dur, status: res.status });
      return res;
    } catch (err) {
      const dur = Date.now() - start;
      logger.error('request.failed', { durationMs: dur, error: (err as any)?.message });
      const { status, body } = toErrorResponse(err);
      return NextResponse.json(body, { status });
    }
  };
}
