export type Provider = 'google' | 'microsoft' | 'zoho';

export interface DomainConfig {
  domain: string;
}

export interface MailboxConfig {
  primaryEmail: string;
  displayName: string;
  password?: string; // optional if provider enforces SSO or random gen
  aliases?: string[];
}

export interface ProvisionResult {
  mailboxId: string;
  primaryEmail: string;
}

export interface EmailService {
  ensureDomain(domain: string, correlationId: string): Promise<{ verified: boolean; notes?: string }>; // idempotent
  createMailbox(domain: string, mailbox: MailboxConfig, correlationId: string): Promise<ProvisionResult>;
  deleteMailbox(mailboxId: string, correlationId: string): Promise<void>; // for rollback
}

export interface Credentials {
  clientId?: string;
  clientSecret?: string;
  tenantId?: string;
  apiKey?: string;
}
