import { randomUUID } from 'crypto';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogContext {
  traceId?: string;
  userId?: string;
  role?: string;
  [key: string]: any;
}

interface LoggerOptions {
  level?: LogLevel;
  defaultContext?: LogContext;
}

const levelPriority: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

export class Logger {
  private level: LogLevel;
  private defaultContext: LogContext;

  constructor(opts: LoggerOptions = {}) {
    this.level = opts.level || (process.env.NODE_ENV === 'production' ? 'info' : 'debug');
    this.defaultContext = opts.defaultContext || {};
  }

  child(ctx: LogContext) {
    return new Logger({ level: this.level, defaultContext: { ...this.defaultContext, ...ctx } });
  }

  private shouldLog(level: LogLevel) {
    return levelPriority[level] >= levelPriority[this.level];
  }

  private format(level: LogLevel, message: string, context?: LogContext, meta?: any) {
    const time = new Date().toISOString();
    const ctx = { ...this.defaultContext, ...context };
    return { time, level, message, ...ctx, ...(meta ? { meta } : {}) };
  }

  private emit(obj: any) {
    // Basic emission; could be extended to send to external sink
    if (obj.level === 'error') {
      console.error(JSON.stringify(obj));
    } else if (obj.level === 'warn') {
      console.warn(JSON.stringify(obj));
    } else {
      console.log(JSON.stringify(obj));
    }
  }

  log(level: LogLevel, message: string, context?: LogContext, meta?: any) {
    if (!this.shouldLog(level)) return;
    this.emit(this.format(level, message, context, meta));
  }

  debug(msg: string, ctx?: LogContext, meta?: any) { this.log('debug', msg, ctx, meta); }
  info(msg: string, ctx?: LogContext, meta?: any) { this.log('info', msg, ctx, meta); }
  warn(msg: string, ctx?: LogContext, meta?: any) { this.log('warn', msg, ctx, meta); }
  error(msg: string, ctx?: LogContext, meta?: any) { this.log('error', msg, ctx, meta); }
}

export const rootLogger = new Logger();

export function withTrace<T>(fn: (logger: Logger, traceId: string) => Promise<T> | T, traceId?: string) {
  const id = traceId || randomUUID();
  const logger = rootLogger.child({ traceId: id });
  return fn(logger, id);
}
