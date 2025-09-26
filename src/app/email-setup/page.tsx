'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { isEmailSetupEnabled } from '@/features/email_setup/feature';
import { ErrorBoundary } from 'react-error-boundary';

type StepKey = 'domain' | 'provider' | 'dns' | 'mailbox' | 'signature' | 'summary';

interface WizardState {
  domain?: string;
  provider?: 'google' | 'microsoft' | 'zoho' | 'local';
  dns?: { spf?: boolean; dkim?: boolean; dmarc?: boolean };
  mailbox?: { primaryEmail: string; displayName: string; aliases: string[] };
  signature?: { name: string; role: string; brandColor: string; logoUrl?: string; website?: string };
  correlationId?: string;
  deliverability?: {
    spf: { found: boolean; record?: string };
    dkim: { found: boolean; selectors?: string[] };
    dmarc: { found: boolean; policy?: string; record?: string };
    tls: { grade?: string; notes?: string };
  };
  localProvision?: { created: boolean; message?: string };
}

function StepHeader({ current, steps }: { current: StepKey; steps: StepKey[] }) {
  const idx = steps.indexOf(current);
  return (
    <nav aria-label="Progress" className="mb-6">
      <ol className="flex items-center gap-2">
        {steps.map((s, i) => (
          <li key={s} className={`px-3 py-1 rounded-full text-sm ${i <= idx ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}>{s}</li>
        ))}
      </ol>
    </nav>
  );
}

function DomainStep({ value, onNext }: { value?: string; onNext: (domain: string) => void }) {
  const [domain, setDomain] = useState(value ?? '');
  const [error, setError] = useState('');
  function validate(d: string) {
    return /^([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/.test(d);
  }
  return (
    <form
      aria-label="Domain selection"
      onSubmit={(e) => { e.preventDefault(); if (!validate(domain)) { setError('Enter a valid domain'); return; } onNext(domain); }}
      className="space-y-3"
    >
      <div>
        <label htmlFor="domain" className="block text-sm font-medium">Business Domain</label>
   <input id="domain" name="domain" value={domain} onChange={(e) => setDomain(e.target.value)}
     className="mt-1 w-full border rounded px-3 py-2" placeholder="example.com" required aria-invalid={error ? 'true' : undefined} aria-describedby={error ? 'domain-err' : undefined} />
        {error && <p id="domain-err" className="text-sm text-red-600 mt-1">{error}</p>}
      </div>
      <button className="bg-blue-600 text-white px-4 py-2 rounded">Next</button>
    </form>
  );
}

function ProviderStep({ value, onNext, allowLocal }: { value?: WizardState['provider']; onNext: (p: NonNullable<WizardState['provider']>) => void; allowLocal?: boolean }) {
  const [provider, setProvider] = useState<WizardState['provider']>(value ?? undefined);
  const [error, setError] = useState('');
  const options: NonNullable<WizardState['provider']>[] = allowLocal ? ['google', 'microsoft', 'zoho', 'local'] : ['google', 'microsoft', 'zoho'];
  return (
    <form onSubmit={(e) => { e.preventDefault(); if (!provider) { setError('Choose a provider'); return; } onNext(provider); }} className="space-y-3" aria-label="Provider selection">
      <fieldset>
        <legend className="block text-sm font-medium mb-2">Email Provider</legend>
        <div className="flex gap-4">
          {options.map((p) => (
            <label key={p} className={`cursor-pointer px-3 py-2 border rounded ${provider===p ? 'border-blue-600' : 'border-gray-300'}`}>
              <input type="radio" name="provider" value={p} className="sr-only" onChange={() => setProvider(p)} checked={provider===p} />
              <span className="capitalize">{p}</span>
            </label>
          ))}
        </div>
        {allowLocal === false && (
          <p className="mt-2 text-xs text-gray-500">Local provisioning is not available on this server. Ask an admin to enable LOCAL_MAILBOX_ENABLED and configure LOCAL_MAILBOX_SCRIPT.</p>
        )}
        {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
      </fieldset>
      <button className="bg-blue-600 text-white px-4 py-2 rounded">Next</button>
    </form>
  );
}

function DNSStep({ onNext }: { onNext: () => void }) {
  return (
    <form onSubmit={(e) => { e.preventDefault(); onNext(); }} className="space-y-3" aria-label="DNS verification">
      <p className="text-sm text-gray-700">We will check SPF, DKIM, and DMARC records and guide you to add any missing ones. This is currently a stub.
      </p>
      <button className="bg-blue-600 text-white px-4 py-2 rounded">Next</button>
    </form>
  );
}

function MailboxStep({ value, onNext, provider, localPassword, onLocalPasswordChange }: { value?: WizardState['mailbox']; onNext: (m: NonNullable<WizardState['mailbox']>) => void; provider?: WizardState['provider']; localPassword?: string; onLocalPasswordChange?: (p: string)=>void }) {
  const [primaryEmail, setPrimaryEmail] = useState(value?.primaryEmail ?? '');
  const [displayName, setDisplayName] = useState(value?.displayName ?? '');
  const [aliases, setAliases] = useState<string>(value?.aliases?.join(', ') ?? '');
  const [error, setError] = useState('');
  return (
    <form aria-label="Mailbox creation" onSubmit={(e)=>{
      e.preventDefault();
      if(!primaryEmail || !displayName){ setError('Email and display name required'); return; }
      if(provider === 'local'){
        const pwd = localPassword || '';
        if(pwd.length < 8){ setError('Password required for local mailbox (min 8 characters)'); return; }
      }
      onNext({ primaryEmail, displayName, aliases: aliases.split(',').map(a=>a.trim()).filter(Boolean) });
    }} className="space-y-3">
      <div>
        <label htmlFor="primaryEmail" className="block text-sm font-medium">Primary Email</label>
        <input id="primaryEmail" value={primaryEmail} onChange={(e)=>setPrimaryEmail(e.target.value)} className="mt-1 w-full border rounded px-3 py-2" placeholder="name@example.com" required />
      </div>
      <div>
        <label htmlFor="displayName" className="block text-sm font-medium">Display Name</label>
        <input id="displayName" value={displayName} onChange={(e)=>setDisplayName(e.target.value)} className="mt-1 w-full border rounded px-3 py-2" required />
      </div>
      <div>
        <label htmlFor="aliases" className="block text-sm font-medium">Aliases (comma separated)</label>
        <input id="aliases" value={aliases} onChange={(e)=>setAliases(e.target.value)} className="mt-1 w-full border rounded px-3 py-2" />
      </div>
      {provider === 'local' && (
        <div>
          <label htmlFor="localPassword" className="block text-sm font-medium">Mailbox Password (local)</label>
          <input id="localPassword" type="password" value={localPassword || ''} onChange={(e)=>onLocalPasswordChange?.(e.target.value)} className="mt-1 w-full border rounded px-3 py-2" placeholder="Set a strong password" />
          <p className="text-xs text-gray-600 mt-1">This password is only sent to the server to create the mailbox and is not saved in the browser.</p>
        </div>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button className="bg-blue-600 text-white px-4 py-2 rounded">Next</button>
    </form>
  );
}

function SignatureStep({ value, onNext }: { value?: WizardState['signature']; onNext: (s: NonNullable<WizardState['signature']>) => void }) {
  const [name, setName] = useState(value?.name ?? '');
  const [role, setRole] = useState(value?.role ?? '');
  const [brandColor, setBrandColor] = useState(value?.brandColor ?? '#0ea5e9');
  const [logoUrl, setLogoUrl] = useState(value?.logoUrl ?? '');
  const [website, setWebsite] = useState(value?.website ?? '');
  const [error, setError] = useState('');
  return (
    <form aria-label="Signature templates" onSubmit={(e)=>{ e.preventDefault(); if(!name || !role){ setError('Name and role required'); return; } onNext({ name, role, brandColor, logoUrl, website }); }} className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium" htmlFor="sig_name">Name</label>
          <input id="sig_name" value={name} onChange={(e)=>setName(e.target.value)} className="mt-1 w-full border rounded px-3 py-2" required />
        </div>
        <div>
          <label className="block text-sm font-medium" htmlFor="sig_role">Role</label>
          <input id="sig_role" value={role} onChange={(e)=>setRole(e.target.value)} className="mt-1 w-full border rounded px-3 py-2" required />
        </div>
        <div>
          <label className="block text-sm font-medium" htmlFor="sig_color">Brand Color</label>
          <input id="sig_color" type="color" value={brandColor} onChange={(e)=>setBrandColor(e.target.value)} className="mt-1 h-10 w-20 border rounded" />
        </div>
        <div>
          <label className="block text-sm font-medium" htmlFor="sig_logo">Logo URL</label>
          <input id="sig_logo" value={logoUrl} onChange={(e)=>setLogoUrl(e.target.value)} className="mt-1 w-full border rounded px-3 py-2" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium" htmlFor="sig_site">Website</label>
          <input id="sig_site" value={website} onChange={(e)=>setWebsite(e.target.value)} className="mt-1 w-full border rounded px-3 py-2" />
        </div>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button className="bg-blue-600 text-white px-4 py-2 rounded">Next</button>
    </form>
  );
}

function SummaryStep({ state, onApply, isSubmitting }: { state: WizardState; onApply: () => void; isSubmitting: boolean }) {
  return (
    <div aria-label="Summary and apply" className="space-y-4">
      <h3 className="font-semibold">Summary</h3>
      <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto" aria-live="polite">{JSON.stringify(state, null, 2)}</pre>
      {state.deliverability && (
        <div className="rounded border p-3">
          <h4 className="font-medium mb-2">Deliverability checks</h4>
          <ul className="space-y-1 text-sm">
            <li className="flex items-center gap-2">
              <span className={`inline-block h-2 w-2 rounded-full ${state.deliverability.spf.found ? 'bg-green-500' : 'bg-red-500'}`} />
              SPF {state.deliverability.spf.found ? 'found' : 'missing'}
            </li>
            <li className="flex items-center gap-2">
              <span className={`inline-block h-2 w-2 rounded-full ${state.deliverability.dkim.found ? 'bg-green-500' : 'bg-red-500'}`} />
              DKIM {state.deliverability.dkim.found ? 'found' : 'missing'}
            </li>
            <li className="flex items-center gap-2">
              <span className={`inline-block h-2 w-2 rounded-full ${state.deliverability.dmarc.found ? 'bg-green-500' : 'bg-red-500'}`} />
              DMARC {state.deliverability.dmarc.found ? 'found' : 'missing'}
            </li>
            <li className="flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full bg-gray-500" />
              TLS grade: {state.deliverability.tls.grade || 'unknown'}
            </li>
          </ul>
        </div>
      )}
      {state.localProvision && (
        <div className="rounded border p-3">
          <h4 className="font-medium mb-2">Local mailbox provisioning</h4>
          <p className="text-sm">
            {state.localProvision.created ? 'Mailbox created on server.' : 'Mailbox not created.'}
            {state.localProvision.message ? ` - ${state.localProvision.message}` : ''}
          </p>
        </div>
      )}
      <button className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-60" onClick={onApply} disabled={isSubmitting}>
        {isSubmitting ? 'Starting…' : 'Apply'}
      </button>
    </div>
  );
}

function FallbackError({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <div role="alert" className="p-4 rounded bg-red-50 text-red-700">
      <p className="font-semibold">Something went wrong</p>
      <pre className="text-xs overflow-auto">{error.message}</pre>
      <button className="mt-2 px-3 py-1 bg-red-600 text-white rounded" onClick={resetErrorBoundary}>Retry</button>
    </div>
  );
}

export default function EmailSetupPage() {
  const enabled = isEmailSetupEnabled();
  const steps: StepKey[] = ['domain','provider','dns','mailbox','signature','summary'];
  const [current, setCurrent] = useState<StepKey>('domain');
  const [state, setState] = useState<WizardState>({});
  const [submitting, setSubmitting] = useState(false);
  const [localPassword, setLocalPassword] = useState('');
  const [allowLocalProvider, setAllowLocalProvider] = useState<boolean | undefined>(undefined);

  // save-and-resume using localStorage for now (per-tenant would be better on server)
  useEffect(()=>{
    try{ const saved = localStorage.getItem('email-setup-state'); if(saved) setState(JSON.parse(saved)); }catch{ /* noop */ }
  },[]);
  useEffect(()=>{ try{ localStorage.setItem('email-setup-state', JSON.stringify(state)); }catch{/* noop */} },[state]);

  // Fetch server-side capabilities (whether local mailbox is enabled and script is present)
  useEffect(()=>{
    let cancelled = false;
    (async ()=>{
      try {
        const res = await fetch('/api/email-setup/capabilities', { method: 'GET' });
        const data = await res.json().catch(()=>({}));
        if(!cancelled){
          const allow = Boolean(data?.local?.enabled && data?.local?.scriptConfigured && data?.local?.scriptExists);
          setAllowLocalProvider(allow);
        }
      } catch {
        if(!cancelled){ setAllowLocalProvider(false); }
      }
    })();
    return ()=>{ cancelled = true; };
  },[]);

  const getCsrfFromCookie = () => {
    try {
      const m = document.cookie.match(/(?:^|; )csrf-token=([^;]+)/);
      return m ? decodeURIComponent(m[1]) : undefined;
    } catch { return undefined; }
  };

  const onApply = async () => {
    if (!state.domain || !state.provider) {
      alert('Please complete Domain and Provider steps.');
      return;
    }
    setSubmitting(true);
    try {
      const csrf = getCsrfFromCookie();
      const mailboxPayload = state.mailbox && state.provider === 'local'
        ? { ...state.mailbox, password: localPassword }
        : state.mailbox;
      const res = await fetch('/api/email-setup', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          ...(csrf ? { 'x-csrf-token': csrf } : {}),
        },
        body: JSON.stringify({
          domain: state.domain,
          provider: state.provider,
          mailbox: mailboxPayload,
          signature: state.signature,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = data?.error || `Request failed (${res.status})`;
        alert(`Failed to start email setup: ${msg}`);
        return;
      }
      setState((s) => ({
        ...s,
        correlationId: data.correlationId,
        deliverability: data.deliverability,
        localProvision: data.localProvision,
      }));
      alert(`Provisioning started. Correlation ID: ${data.correlationId ?? 'n/a'}`);
      // Clear transient password after successful submit
      setLocalPassword('');
    } catch (err) {
      alert(`Network error: ${(err as Error)?.message ?? String(err)}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (!enabled) {
    return (
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-2">Email Setup</h2>
        <p className="text-gray-700">This feature is disabled. Ask an administrator to enable FEATURE_EMAIL_SETUP.</p>
        <Link className="text-blue-600 underline" href="/">Go back</Link>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Business Email Setup</h2>
        <span className="text-sm text-gray-500">Save &amp; resume enabled</span>
      </div>
      <StepHeader current={current} steps={steps} />
      <ErrorBoundary FallbackComponent={FallbackError}>
        {current==='domain' && (
          <DomainStep value={state.domain} onNext={(domain)=>{ setState((s)=>({ ...s, domain })); setCurrent('provider'); }} />
        )}
        {current==='provider' && (
          <ProviderStep value={state.provider} allowLocal={allowLocalProvider} onNext={(provider)=>{ setState((s)=>({ ...s, provider })); setCurrent('dns'); }} />)
        }
        {current==='dns' && (<DNSStep onNext={()=> setCurrent('mailbox')} />)}
        {current==='mailbox' && (
          <MailboxStep
            value={state.mailbox}
            provider={state.provider}
            localPassword={localPassword}
            onLocalPasswordChange={setLocalPassword}
            onNext={(mailbox)=>{ setState((s)=>({ ...s, mailbox })); setCurrent('signature'); }}
          />
        )}
        {current==='signature' && (
          <SignatureStep value={state.signature} onNext={(signature)=>{ setState((s)=>({ ...s, signature })); setCurrent('summary'); }} />
        )}
        {current==='summary' && (<SummaryStep state={state} onApply={onApply} isSubmitting={submitting} />)}
      </ErrorBoundary>
    </div>
  );
}
