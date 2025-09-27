import { AsyncLocalStorage } from 'async_hooks';
import { randomUUID } from 'crypto';

interface RequestContextValue {
  traceId: string;
  userId?: string;
  role?: string;
}

const storage = new AsyncLocalStorage<RequestContextValue>();

export function runWithContext<T>(fn: () => T, seed?: Partial<RequestContextValue>) {
  const value: RequestContextValue = { traceId: seed?.traceId || randomUUID(), userId: seed?.userId, role: seed?.role };
  return storage.run(value, fn);
}

export function getContext(): RequestContextValue | undefined {
  return storage.getStore();
}
