import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

export interface LocalMailboxInput {
  username: string; // local part before @
  domain: string;
  password: string;
  displayName?: string;
  aliases?: string[];
}

export interface LocalMailboxResult {
  created: boolean;
  message?: string;
}

function isEnabled() {
  return process.env.LOCAL_MAILBOX_ENABLED === 'true' && !!process.env.LOCAL_MAILBOX_SCRIPT;
}

export async function createLocalMailbox(input: LocalMailboxInput, correlationId: string): Promise<LocalMailboxResult> {
  if (!isEnabled()) {
    return { created: false, message: 'Local mailbox provisioning is not enabled' };
  }

  const script = process.env.LOCAL_MAILBOX_SCRIPT as string;

  // Basic input sanitation: allow alnum, dot, dash, underscore in username, and a conservative domain pattern
  const safeUser = input.username.replace(/[^a-zA-Z0-9._-]/g, '');
  const safeDomain = input.domain.replace(/[^a-zA-Z0-9.-]/g, '');

  if (!safeUser || !safeDomain) {
    return { created: false, message: 'Invalid username or domain' };
  }

  const args = [
    '--user', safeUser,
    '--domain', safeDomain,
    '--password', input.password,
  ];
  if (input.displayName) args.push('--display-name', input.displayName);
  if (input.aliases && input.aliases.length) args.push('--aliases', input.aliases.join(','));

  try {
    // eslint-disable-next-line no-console
    console.info(`[email-setup][local-mailbox][${correlationId}] exec`, { script, args: args.filter(a => a !== input.password) });
  const { stdout, stderr }: { stdout: string; stderr: string } = await execFileAsync(script, args, { timeout: 20_000 }) as unknown as { stdout: string; stderr: string };
    if (stderr && stderr.trim().length > 0) {
      // Some scripts log to stderr for warnings; do not treat as fatal automatically.
      // eslint-disable-next-line no-console
      console.warn(`[email-setup][local-mailbox][${correlationId}] stderr:`, stderr);
    }
    // eslint-disable-next-line no-console
    console.info(`[email-setup][local-mailbox][${correlationId}] stdout:`, stdout);
    return { created: true, message: stdout?.trim() || 'Mailbox created' };
  } catch (err: unknown) {
    const msg = typeof err === 'object' && err && 'message' in err && typeof (err as { message?: unknown }).message === 'string'
      ? (err as { message: string }).message
      : 'Failed to execute mailbox script';
    // eslint-disable-next-line no-console
    console.error(`[email-setup][local-mailbox][${correlationId}] error:`, msg);
    return { created: false, message: msg };
  }
}
