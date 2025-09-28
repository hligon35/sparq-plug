'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { isEmailSetupEnabled } from '@/features/email_setup/feature';
import { ErrorBoundary } from 'react-error-boundary';
import { useRouter } from 'next/navigation';

type StepKey = 'domain' | 'provider' | 'dns' | 'mailbox' | 'signature' | 'summary';

interface WizardState {
  domain?: string;
  provider?: 'google' | 'microsoft' | 'zoho' | 'local';
  dns?: { spf?: boolean; dkim?: boolean; dmarc?: boolean };
  mailbox?: { primaryEmail: string; displayName: string; aliases: string[] };
  signature?: { name: string; role: string; brandColor: string; logoUrl?: string; website?: string };
  palette?: string[]; // extracted or imported colors (hex)
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
     className="mt-1 w-full border rounded px-3 py-2" placeholder="example.com" required aria-describedby={error ? 'domain-err' : undefined} />
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

// Palette & Logo import controls (lightweight inline component)
function PaletteAndBrandControls({ onLogo, onColor }: { onLogo: (url: string) => void; onColor: (color: string) => void }) {
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [color, setColor] = useState<string>('#1d74d0');
  const [palette, setPalette] = useState<string[]>([]);
  const [importError, setImportError] = useState<string>('');

  // Simple dominant color & palette extraction (frequency reduction & quantization-lite)
  function extractColors(image: HTMLImageElement) {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const max = 160; // scale for performance
      const scale = Math.min(max / image.width, max / image.height, 1);
      canvas.width = Math.floor(image.width * scale);
      canvas.height = Math.floor(image.height * scale);
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      const freq: Record<string, number> = {};
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i]; const g = data[i+1]; const b = data[i+2]; const a = data[i+3];
        if (a < 200) continue; // skip transparent
        // bucket
        const key = `${Math.round(r/16)*16},${Math.round(g/16)*16},${Math.round(b/16)*16}`;
        freq[key] = (freq[key] || 0) + 1;
      }
      const sorted = Object.entries(freq).sort((a,b)=> b[1]-a[1]).slice(0,8).map(([k])=>{
        const [r,g,b] = k.split(',').map(Number);
        const toHex = (v:number)=> v.toString(16).padStart(2,'0');
        return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
      });
      if (sorted.length) {
        setPalette(sorted);
        // pick the first vivid-ish (skip very light/very dark if possible)
        const pick = sorted.find(h=>{
          const rgb = h.match(/#(..)(..)(..)/); if(!rgb) return false;
          const r=parseInt(rgb[1],16), g=parseInt(rgb[2],16), b=parseInt(rgb[3],16);
          const l = 0.2126*r + 0.7152*g + 0.0722*b; // relative luminance scale 0-255
          return l > 60 && l < 210;
        }) || sorted[0];
        setColor(pick);
        onColor(pick);
      }
    } catch {/* ignore */}
  }

  const onLogoFile: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    setImportError('');
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        const url = typeof reader.result === 'string' ? reader.result : '';
        setLogoPreview(url);
        onLogo(url);
        const img = new Image();
        img.onload = () => extractColors(img);
        img.src = url;
      };
      reader.readAsDataURL(file);
      return;
    }
  };

  const onPaletteFile: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    setImportError('');
    const file = e.target.files?.[0];
    if(!file) return;
    // Palette file types only (logo handled separately)
    const name = file.name.toLowerCase();
    const ext = name.split('.').pop() || '';
    const supported = ['aco','ase','gpl','pal','cls','xml','riff','act'];
    if (!supported.includes(ext)) {
      setImportError('Unsupported file type.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const buf = reader.result;
        const colors = parsePalette(buf, ext);
        if (!colors.length) throw new Error('No colors found');
        setPalette(colors.slice(0,12));
        const primary = colors[0];
        setColor(primary);
        onColor(primary);
      } catch (err) {
        setImportError((err as Error).message || 'Failed to parse palette');
      }
    };
    if (ext === 'xml') reader.readAsText(file); else reader.readAsArrayBuffer(file);
  };

  function parsePalette(data: string | ArrayBuffer | null, ext: string): string[] {
    if (!data) return [];
    try {
      switch (ext) {
        case 'gpl': {
          const text = typeof data === 'string' ? data : new TextDecoder().decode(data as ArrayBuffer);
            return text.split('\n')
              .map(l=>l.trim())
              .filter(l=> l && !l.startsWith('#') && /\d+\s+\d+\s+\d+/.test(l))
              .map(l=>{
                const parts = l.split(/\s+/); const r=+parts[0], g=+parts[1], b=+parts[2];
                return rgbToHex(r,g,b);
              });
        }
        case 'pal': { // very loose: look for rgb triplets in text
          const text = typeof data === 'string' ? data : new TextDecoder().decode(data as ArrayBuffer);
          const matches = text.match(/(\d{1,3})\s+(\d{1,3})\s+(\d{1,3})/g) || [];
          return matches.map(m=>{
            const [r,g,b] = m.split(/\s+/).map(Number); return rgbToHex(r,g,b);
          });
        }
        case 'xml': {
          const text = typeof data === 'string' ? data : new TextDecoder().decode(data as ArrayBuffer);
          const hexes = Array.from(text.matchAll(/#[0-9a-fA-F]{6}/g)).map(m=>m[0].toLowerCase());
          return Array.from(new Set(hexes));
        }
        case 'ase': {
          // Minimal ASE parser: extract 6-hex patterns from binary decoded as Latin1
          const text = typeof data === 'string' ? data : new TextDecoder('latin1').decode(data as ArrayBuffer);
          const hexes = Array.from(text.matchAll(/([0-9A-Fa-f]{6})/g)).map(m=>`#${m[1]}`);
          return uniqueColors(hexes);
        }
        case 'aco': {
          // ACO v1 is big-endian 16bit RGB; we'll attempt coarse parse
          if (data instanceof ArrayBuffer) {
            const dv = new DataView(data);
            // first 2 bytes version, next 2 count
            if (dv.byteLength < 4) return [];
            const count = dv.getUint16(2, false);
            const colors: string[] = [];
            let offset = 4;
            for (let i=0;i<count && offset+10 <= dv.byteLength;i++) {
              const space = dv.getUint16(offset, false); // 0=RGB
              if (space !== 0) break;
              const r = dv.getUint16(offset+2,false) / 257;
              const g = dv.getUint16(offset+4,false) / 257;
              const b = dv.getUint16(offset+6,false) / 257;
              colors.push(rgbToHex(r,g,b));
              offset += 10; // skip to next
            }
            return colors;
          }
          return [];
        }
        case 'riff': {
          // naive: look for hex patterns after text decode
          const text = typeof data === 'string' ? data : new TextDecoder('latin1').decode(data as ArrayBuffer);
          const hexes = Array.from(text.matchAll(/#[0-9a-fA-F]{6}/g)).map(m=>m[0]);
          return uniqueColors(hexes);
        }
        case 'act': {
          if (data instanceof ArrayBuffer) {
            const bytes = new Uint8Array(data);
            const colors: string[] = [];
            for (let i=0; i+2 < bytes.length && colors.length < 256; i+=3) {
              const r = bytes[i]; const g = bytes[i+1]; const b = bytes[i+2];
              colors.push(rgbToHex(r,g,b));
            }
            return colors;
          }
          return [];
        }
        case 'cls': {
          const text = typeof data === 'string' ? data : new TextDecoder().decode(data as ArrayBuffer);
          const hexes = Array.from(text.matchAll(/#[0-9a-fA-F]{6}/g)).map(m=>m[0]);
          return uniqueColors(hexes);
        }
        default:
          return [];
      }
    } catch { return []; }
  }

  function rgbToHex(r:number,g:number,b:number){
    const toHex=(v:number)=> Math.max(0,Math.min(255,Math.round(v))).toString(16).padStart(2,'0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }
  function uniqueColors(list:string[]){
    const seen=new Set<string>(); const out:string[]=[]; for(const c of list){ const lc=c.toLowerCase(); if(!/^#[0-9a-f]{6}$/.test(lc)) continue; if(!seen.has(lc)){ seen.add(lc); out.push(lc);} } return out;
  }

  return (
    <div className="flex flex-col gap-2 min-w-[260px]">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center gap-3 flex-wrap">
          <label className="flex items-center gap-2 text-xs font-medium text-gray-600 cursor-pointer">
            <span className="inline-flex items-center gap-1 rounded bg-sky-600/10 text-sky-700 px-2 py-1 border border-sky-500/30">Logo</span>
            <input type="file" accept="image/*" className="hidden" onChange={onLogoFile} />
          </label>
          <label className="flex items-center gap-2 text-xs font-medium text-gray-600 cursor-pointer">
            <span className="inline-flex items-center gap-1 rounded bg-indigo-600/10 text-indigo-700 px-2 py-1 border border-indigo-500/30">Palette</span>
            <input type="file" accept=".aco,.ase,.gpl,.pal,.cls,.xml,.riff,.act" className="hidden" onChange={onPaletteFile} />
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={color}
              aria-label="Brand color"
              onChange={(e)=>{ setColor(e.target.value); onColor(e.target.value); }}
              className="h-8 w-10 cursor-pointer rounded border border-gray-300"
            />
            <span className="text-[10px] text-gray-500 font-mono">{color}</span>
          </div>
          {palette.length > 0 && (
            <div className="flex items-center gap-1 overflow-x-auto max-w-[200px] py-1">
              {palette.map(c => {
                const safe = /^#[0-9a-fA-F]{6}$/.test(c) ? c : '#000000';
                const cls = `h-5 w-5 rounded border border-gray-300 shadow bg-[${safe}]`;
                return (
                  <button
                    type="button"
                    key={c}
                    title={c}
                    aria-label={`Use color ${c}`}
                    onClick={()=>{ setColor(safe); onColor(safe); }}
                    className={cls}
                  />
                );
              })}
            </div>
          )}
        </div>
        {/* Thumbnail window */}
        <div className="relative w-40 h-28 border rounded-lg bg-white/40 flex items-center justify-center shadow-inner overflow-hidden">
          {logoPreview ? (
            <>
              <img
                src={logoPreview}
                alt="Uploaded logo thumbnail"
                className="max-w-full max-h-full object-contain"
                aria-label="Logo thumbnail"
              />
              <button
                type="button"
                aria-label="Remove logo"
                onClick={()=>{ setLogoPreview(''); onLogo(''); setPalette([]); }}
                className="absolute top-1 right-1 text-[10px] bg-white/80 hover:bg-white border border-gray-300 rounded px-1 leading-none"
              >×</button>
            </>
          ) : (
            <span className="text-[10px] text-gray-400 px-2 text-center select-none">No logo uploaded</span>
          )}
        </div>
      </div>
      {importError && <span className="text-[10px] text-red-600" role="alert">{importError}</span>}
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
  const router = useRouter();
  const steps: StepKey[] = ['domain','provider','dns','mailbox','signature','summary'];
  const [current, setCurrent] = useState<StepKey>('domain');
  const [state, setState] = useState<WizardState>({});
  const [submitting, setSubmitting] = useState(false);
  const [localPassword, setLocalPassword] = useState('');
  const [allowLocalProvider, setAllowLocalProvider] = useState<boolean | undefined>(undefined);
  const [roleAllowed, setRoleAllowed] = useState<boolean | undefined>(undefined);

  // Role gate (client-side) - server APIs already enforce capability
  useEffect(()=>{
    try {
      const cookieStr = document.cookie || '';
      const cookies: Record<string,string> = Object.fromEntries(cookieStr.split(';').map(c=>c.trim()).filter(Boolean).map(pair=>{ const i=pair.indexOf('='); const k=i===-1?pair:pair.slice(0,i); const v=i===-1?'':decodeURIComponent(pair.slice(i+1)); return [k,v]; }));
      const role = cookies['role'];
      const ok = role === 'admin' || role === 'manager';
      setRoleAllowed(ok);
      if(!ok){
        // Redirect to home/dashboard after a brief tick
        setTimeout(()=>{ router.push('/'); }, 1500);
      }
    } catch { setRoleAllowed(false); }
  },[router]);

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

  if (roleAllowed === false) {
    return (
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-2">Email Setup</h2>
        <p className="text-gray-700">You do not have permission to access this wizard. Redirecting…</p>
        <Link className="text-blue-600 underline" href="/">Return home</Link>
      </div>
    );
  }

  // Detect embedded usage (combined admin Emails module) to suppress full-screen gradient styling
  const embedded = typeof window !== 'undefined' && window.location.pathname.includes('/admin/emails');

  return (
    <div className={embedded ? 'w-full' : 'min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1d74d0] via-sky-600 to-indigo-700 p-4'}>
      <div className={embedded ? 'w-full bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6' : 'w-full max-w-3xl bg-white/95 backdrop-blur rounded-xl shadow-2xl border border-white/40 p-6 space-y-6'}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-sky-600 to-indigo-600 bg-clip-text text-transparent">Business Email Setup</h2>
            <p className="text-xs text-gray-500 mt-1">Save &amp; resume enabled</p>
          </div>
          <PaletteAndBrandControls
            onLogo={(u: string)=> setState(s=>({ ...s, signature: { name: s.signature?.name || '', role: s.signature?.role || '', brandColor: s.signature?.brandColor || '#0ea5e9', website: s.signature?.website, logoUrl: u } }))}
            onColor={(c: string)=> setState(s=>({ ...s, signature: { name: s.signature?.name || '', role: s.signature?.role || '', brandColor: c, website: s.signature?.website, logoUrl: s.signature?.logoUrl } }))}
          />
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
    </div>
  );
}
