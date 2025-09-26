import type { EmailService, MailboxConfig, ProvisionResult, Credentials } from './emailService';

function log(step: string, correlationId: string, data: Record<string, unknown> = {}) {
  // eslint-disable-next-line no-console
  console.info(`[email-setup][zoho][${correlationId}] ${step}`, data);
}

export class ZohoMailAdapter implements EmailService {
  constructor(private creds: Credentials) {}

  async ensureDomain(domain: string, correlationId: string): Promise<{ verified: boolean; notes?: string }> {
    log('ensureDomain:start', correlationId, { domain });
    // TODO: Implement domain verification via Zoho API
    log('ensureDomain:done', correlationId, { domain, verified: false });
    return { verified: false, notes: 'Domain verification pending (stub).' };
  }

  async createMailbox(domain: string, mailbox: MailboxConfig, correlationId: string): Promise<ProvisionResult> {
    log('createMailbox:start', correlationId, { domain, primaryEmail: mailbox.primaryEmail });
    // TODO: Implement user creation via Zoho Mail API
    const result: ProvisionResult = { mailboxId: `zoho_${Date.now()}`, primaryEmail: mailbox.primaryEmail };
    log('createMailbox:done', correlationId, { result });
    return result;
  }

  async deleteMailbox(mailboxId: string, correlationId: string): Promise<void> {
    log('deleteMailbox:start', correlationId, { mailboxId });
    // TODO: Implement user deletion via Zoho API
    log('deleteMailbox:done', correlationId, { mailboxId });
  }
}
