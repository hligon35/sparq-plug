import { describe, it, expect } from 'vitest';
import { Logger } from '@/core/logger';

describe('Logger', () => {
  it('filters below level', () => {
    const logs: any[] = [];
    const orig = console.log;
    console.log = (msg: any) => { logs.push(JSON.parse(msg)); };
    const logger = new Logger({ level: 'info' });
    logger.debug('should_not');
    logger.info('should_yes');
    console.log = orig;
    expect(logs.some(l => l.message === 'should_not')).toBe(false);
    expect(logs.some(l => l.message === 'should_yes')).toBe(true);
  });

  it('inherits context in child', () => {
    const logs: any[] = [];
    const orig = console.log;
    console.log = (msg: any) => { logs.push(JSON.parse(msg)); };
    const logger = new Logger({ level: 'debug', defaultContext: { base: 'x' } });
    const child = logger.child({ traceId: 'abc123' });
    child.info('childLog');
    console.log = orig;
    const entry = logs.find(l => l.message === 'childLog');
    expect(entry.traceId).toBe('abc123');
    expect(entry.base).toBe('x');
  });
});
