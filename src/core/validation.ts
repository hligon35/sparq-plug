import { z, ZodIssue } from 'zod';

export const ScheduledPostSchema = z.object({
  clientId: z.string().min(1),
  platform: z.string().min(2),
  content: z.string().min(1).max(10000),
  scheduledFor: z.string().datetime().or(z.date().transform((d: Date) => d.toISOString())),
  status: z.enum(['draft', 'scheduled']).default('scheduled'),
});

export type ScheduledPostInput = z.infer<typeof ScheduledPostSchema>;

export function validate<T>(schema: z.ZodType<T>, data: unknown) {
  const parsed = schema.safeParse(data);
  if (!parsed.success) {
  const issues = parsed.error.issues.map((i: ZodIssue) => ({ path: i.path.join('.'), message: i.message }));
    return { ok: false as const, issues };
  }
  return { ok: true as const, data: parsed.data };
}
