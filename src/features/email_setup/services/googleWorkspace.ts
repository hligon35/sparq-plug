import type { EmailService, MailboxConfig, ProvisionResult, Credentials } from './emailService';

function log(step: string, correlationId: string, data: Record<string, unknown> = {}) {
  // Never log secrets
  // eslint-disable-next-line no-console
  console.info(`[email-setup][google][${correlationId}] ${step}`, data);
}

export class GoogleWorkspaceAdapter implements EmailService {
  constructor(private creds: Credentials) {}

  async ensureDomain(domain: string, correlationId: string): Promise<{ verified: boolean; notes?: string }> {
    log('ensureDomain:start', correlationId, { domain });
    // TODO: Implement Admin SDK domain insertion or verification check
    log('ensureDomain:done', correlationId, { domain, verified: false });
    return { verified: false, notes: 'Domain verification pending (stub).' };
  }

  async createMailbox(domain: string, mailbox: MailboxConfig, correlationId: string): Promise<ProvisionResult> {
    log('createMailbox:start', correlationId, { domain, primaryEmail: mailbox.primaryEmail });
    // TODO: Implement user creation via Admin SDK Directory API
    const result: ProvisionResult = {
      mailboxId: `gw_${Date.now()}`,
      primaryEmail: mailbox.primaryEmail,
    };
  log('createMailbox:done', correlationId, { result });
    return result;
  }

  async deleteMailbox(mailboxId: string, correlationId: string): Promise<void> {
    log('deleteMailbox:start', correlationId, { mailboxId });
    // TODO: Implement user deletion via Admin SDK
    log('deleteMailbox:done', correlationId, { mailboxId });
  }
}
