import { describe, it, expect } from 'vitest';
import { ScheduledPostSchema, validate } from '@/core/validation';

describe('validation', () => {
  it('accepts valid scheduled post', () => {
    const input = { clientId: 'c1', platform: 'facebook', content: 'Hello', scheduledFor: new Date().toISOString(), status: 'scheduled' };
    const result = validate(ScheduledPostSchema, input);
    expect(result.ok).toBe(true);
  });

  it('rejects invalid scheduled post', () => {
    const input: any = { clientId: '', platform: '', content: '', scheduledFor: 'not-a-date' };
    const result = validate(ScheduledPostSchema, input);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues.length).toBeGreaterThan(0);
    }
  });
});
