import { NextRequest } from 'next/server';
import { apiGuard } from '@/lib/apiGuard';
import { ok, badRequest, serverError } from '@/lib/apiResponse';
import { newCorrelationId } from '@/features/email_setup/services/logging';
import { audit } from '@/lib/audit';
import { DNSVerificationService } from '@/features/email_setup/services/dnsVerification';
import { createLocalMailbox } from '@/features/email_setup/services/localMailbox';

export async function POST(request: NextRequest) {
  // Require the narrower 'email_setup' capability so both admin and manager roles can access
  const g = apiGuard(request, { path: '/api/email-setup:POST', capability: 'email_setup', rate: { windowMs: 60_000, max: 20 }, csrf: true });
  if (g instanceof Response) return g;

  const correlationId = newCorrelationId();
  try {
    const payload = await request.json();
    if (!payload?.domain || !payload?.provider) return badRequest('Missing domain or provider');

    // eslint-disable-next-line no-console
    console.info(`[email-setup][${correlationId}] received`, { actor: g.actor, tenantId: g.tenantId, provider: payload.provider, domain: payload.domain });
    await audit({ actor: g.actor, tenantId: g.tenantId, action: 'email-setup.start', target: `domain:${payload.domain}`, metadata: { provider: payload.provider, correlationId } });

    // Pre-flight DNS deliverability check (stub)
    const dns = new DNSVerificationService();
    const deliverability = await dns.check(payload.domain, correlationId);

    // Optional: local mailbox provisioning on the host, when requested
    let localProvision: { created: boolean; message?: string } | undefined;
    if (payload.provider === 'local' && payload.mailbox?.primaryEmail && payload.mailbox?.password) {
      const [user, domainPart] = String(payload.mailbox.primaryEmail).split('@');
      if (user && domainPart) {
        localProvision = await createLocalMailbox({
          username: user,
          domain: payload.domain,
          password: String(payload.mailbox.password),
          displayName: payload.mailbox.displayName,
          aliases: payload.mailbox.aliases,
        }, correlationId);
      }
    }

    return ok({ correlationId, accepted: true, deliverability, localProvision });
  } catch (e) {
    console.error(`[email-setup][${correlationId}] error`, e);
    return serverError('Failed to start email setup');
  }
}
