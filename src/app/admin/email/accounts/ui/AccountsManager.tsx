"use client";

import React, { useEffect, useState } from 'react';

interface EmailAccount {
  id: string;
  address: string;
  displayName: string;
  username: string;
  provider: 'local' | 'google' | 'microsoft';
  forwarding: string[];
  signature: string;
  active: boolean;
  notes?: string;
  lastUpdated: string;
}

interface CreateDraft {
  address: string;
  displayName: string;
  username: string;
  provider: 'local' | 'google' | 'microsoft';
  forwarding: string;
  signature: string;
  notes: string;
}

const emptyDraft: CreateDraft = {
  address: '',
  displayName: '',
  username: '',
  provider: 'local',
  forwarding: '',
  signature: '',
  notes: ''
};

export default function AccountsManager(){
  const [accounts, setAccounts] = useState<EmailAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState<CreateDraft>(emptyDraft);
  const [editing, setEditing] = useState<EmailAccount | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [resetToken, setResetToken] = useState<string | null>(null);

  async function load(){
    setLoading(true); setError(null);
    try {
      const res = await fetch('/api/email/accounts');
      if(!res.ok) throw new Error('Failed to load accounts');
      const data = await res.json();
      setAccounts(data.accounts || []);
    } catch(e:any){ setError(e.message); }
    finally { setLoading(false); }
  }

  useEffect(()=>{ load(); },[]);

  function updateDraft<K extends keyof CreateDraft>(k: K, v: CreateDraft[K]){ setDraft(d=>({...d, [k]: v})); }

  async function create(){
    setCreating(true); setError(null);
    try {
      const body = {
        address: draft.address.trim(),
        displayName: draft.displayName.trim() || undefined,
        username: draft.username.trim() || undefined,
        provider: draft.provider,
        forwarding: draft.forwarding.split(/[,\n]/).map(s=>s.trim()).filter(Boolean),
        signature: draft.signature,
        notes: draft.notes.trim() || undefined,
      };
      const res = await fetch('/api/email/accounts',{ method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body)});
      const data = await res.json();
      if(!res.ok) throw new Error(data.error || 'Create failed');
      setAccounts(a=>[data.account, ...a]);
      setDraft(emptyDraft);
    } catch(e:any){ setError(e.message); }
    finally { setCreating(false); }
  }

  async function saveEdit(){
    if(!editing) return;
    setSavingEdit(true); setError(null);
    try {
      const body = {
        displayName: editing.displayName,
        username: editing.username,
        forwarding: editing.forwarding,
        signature: editing.signature,
        active: editing.active,
        notes: editing.notes,
        provider: editing.provider
      };
      const res = await fetch(`/api/email/accounts/${editing.id}`, { method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body)});
      const data = await res.json();
      if(!res.ok) throw new Error(data.error || 'Update failed');
      setAccounts(a=>a.map(acc=>acc.id===editing.id? data.account : acc));
      setEditing(null);
    } catch(e:any){ setError(e.message); }
    finally { setSavingEdit(false); }
  }

  async function resetPassword(id: string){
    setError(null); setResetToken(null);
    try {
      const res = await fetch(`/api/email/accounts/${id}/reset-password`, { method:'POST' });
      const data = await res.json();
      if(!res.ok) throw new Error(data.error || 'Reset failed');
      setResetToken(data.resetToken);
    } catch(e:any){ setError(e.message); }
  }

  return (
    <div className="space-y-10">
      <section>
        <h2 className="text-lg font-semibold mb-3">Create Account</h2>
        <div className="grid sm:grid-cols-2 gap-4 bg-white rounded-lg border p-4 shadow-sm">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">Address</label>
            <input value={draft.address} onChange={e=>updateDraft('address', e.target.value)} placeholder="user@example.com" className="border rounded px-2 py-1.5 text-sm" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">Display Name</label>
            <input value={draft.displayName} onChange={e=>updateDraft('displayName', e.target.value)} className="border rounded px-2 py-1.5 text-sm" aria-label="Display Name" placeholder="Display name" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">Username</label>
            <input value={draft.username} onChange={e=>updateDraft('username', e.target.value)} placeholder="(optional override)" className="border rounded px-2 py-1.5 text-sm" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">Provider</label>
            <select value={draft.provider} onChange={e=>updateDraft('provider', e.target.value as any)} className="border rounded px-2 py-1.5 text-sm" aria-label="Provider">
              <option value="local">Local</option>
              <option value="google">Google</option>
              <option value="microsoft">Microsoft</option>
            </select>
          </div>
          <div className="flex flex-col gap-1 sm:col-span-2">
            <label className="text-xs font-medium text-gray-600">Forwarding (comma or newline separated)</label>
            <textarea value={draft.forwarding} onChange={e=>updateDraft('forwarding', e.target.value)} className="border rounded px-2 py-1.5 text-sm h-16" aria-label="Forwarding addresses" placeholder="forward1@example.com, forward2@example.com" />
          </div>
          <div className="flex flex-col gap-1 sm:col-span-2">
            <label className="text-xs font-medium text-gray-600">Signature</label>
            <textarea value={draft.signature} onChange={e=>updateDraft('signature', e.target.value)} className="border rounded px-2 py-1.5 text-sm h-20" aria-label="Signature" placeholder="Signature" />
          </div>
          <div className="flex flex-col gap-1 sm:col-span-2">
            <label className="text-xs font-medium text-gray-600">Notes</label>
            <textarea value={draft.notes} onChange={e=>updateDraft('notes', e.target.value)} className="border rounded px-2 py-1.5 text-sm h-16" aria-label="Notes" placeholder="Notes" />
          </div>
          <div className="sm:col-span-2 flex justify-end">
            <button disabled={creating || !draft.address} onClick={create} className="inline-flex items-center gap-2 rounded-md bg-blue-600 disabled:opacity-50 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none">
              {creating ? 'Creating…' : 'Create Account'}
            </button>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-3">Accounts <span className="text-xs rounded-full bg-gray-200 px-2 py-0.5">{accounts.length}</span></h2>
        {loading && <p className="text-sm text-gray-500">Loading…</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="overflow-x-auto border rounded-lg bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left px-3 py-2 font-medium">Address</th>
                <th className="text-left px-3 py-2 font-medium">Display</th>
                <th className="text-left px-3 py-2 font-medium">Provider</th>
                <th className="text-left px-3 py-2 font-medium">Active</th>
                <th className="text-left px-3 py-2 font-medium">Forwarding</th>
                <th className="text-left px-3 py-2 font-medium">Updated</th>
                <th className="text-right px-3 py-2 font-medium" aria-label="Actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map(acc => (
                <tr key={acc.id} className="border-t last:border-b">
                  <td className="px-3 py-2 font-mono text-xs">{acc.address}</td>
                  <td className="px-3 py-2">{acc.displayName}</td>
                  <td className="px-3 py-2 capitalize">{acc.provider}</td>
                  <td className="px-3 py-2">{acc.active ? <span className="text-green-600 font-medium">Yes</span> : <span className="text-gray-400">No</span>}</td>
                  <td className="px-3 py-2 text-xs max-w-[200px] truncate" title={acc.forwarding.join(', ')}>{acc.forwarding.join(', ') || '—'}</td>
                  <td className="px-3 py-2 text-xs" title={acc.lastUpdated}>{new Date(acc.lastUpdated).toLocaleString()}</td>
                  <td className="px-3 py-2 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={()=>setEditing(acc)} className="text-xs px-2 py-1 rounded bg-amber-500 text-white hover:bg-amber-600">Edit</button>
                      <button onClick={()=>resetPassword(acc.id)} className="text-xs px-2 py-1 rounded bg-purple-600 text-white hover:bg-purple-700">Reset PW</button>
                    </div>
                  </td>
                </tr>
              ))}
              {accounts.length === 0 && !loading && (
                <tr>
                  <td colSpan={7} className="px-3 py-6 text-center text-gray-500 text-sm">No accounts yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {resetToken && (
          <div className="mt-3 p-3 border rounded bg-purple-50 text-purple-700 text-xs flex items-center justify-between">
            <span>Password reset token (stub): {resetToken}</span>
            <button onClick={()=>setResetToken(null)} className="text-purple-600 hover:underline ml-4">Dismiss</button>
          </div>
        )}
      </section>

      {editing && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 relative">
            <h3 className="text-lg font-semibold mb-4">Edit Account</h3>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
              <Field label="Display Name">
                <input value={editing.displayName} onChange={e=>setEditing({...editing, displayName:e.target.value})} className="border rounded px-2 py-1.5 text-sm w-full" aria-label="Edit display name" placeholder="Display name" />
              </Field>
              <Field label="Username">
                <input value={editing.username} onChange={e=>setEditing({...editing, username:e.target.value})} className="border rounded px-2 py-1.5 text-sm w-full" aria-label="Edit username" placeholder="Username" />
              </Field>
              <Field label="Provider">
                <select value={editing.provider} onChange={e=>setEditing({...editing, provider:e.target.value as any})} className="border rounded px-2 py-1.5 text-sm w-full" aria-label="Edit provider">
                  <option value="local">Local</option>
                  <option value="google">Google</option>
                  <option value="microsoft">Microsoft</option>
                </select>
              </Field>
              <Field label="Forwarding">
                <textarea value={editing.forwarding.join('\n')} onChange={e=>setEditing({...editing, forwarding:e.target.value.split(/\n/).map(s=>s.trim()).filter(Boolean)})} className="border rounded px-2 py-1.5 text-sm w-full h-20" aria-label="Edit forwarding addresses" placeholder="one@domain.com" />
              </Field>
              <Field label="Signature">
                <textarea value={editing.signature} onChange={e=>setEditing({...editing, signature:e.target.value})} className="border rounded px-2 py-1.5 text-sm w-full h-24" aria-label="Edit signature" placeholder="Signature" />
              </Field>
              <Field label="Notes">
                <textarea value={editing.notes || ''} onChange={e=>setEditing({...editing, notes:e.target.value})} className="border rounded px-2 py-1.5 text-sm w-full h-16" aria-label="Edit notes" placeholder="Notes" />
              </Field>
              <Field label="Active">
                <input type="checkbox" checked={editing.active} onChange={e=>setEditing({...editing, active:e.target.checked})} aria-label="Active account" />
              </Field>
              <p className="text-[11px] text-gray-500">Changes are saved locally in JSON until real provider provisioning is wired.</p>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={()=>setEditing(null)} className="px-3 py-1.5 text-sm rounded border bg-white hover:bg-gray-50">Cancel</button>
              <button disabled={savingEdit} onClick={saveEdit} className="px-4 py-1.5 text-sm rounded bg-blue-600 text-white font-semibold shadow disabled:opacity-50 hover:bg-blue-700">
                {savingEdit ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({label, children}:{label:string; children: React.ReactNode}){
  return (
    <label className="block text-xs font-medium text-gray-600 space-y-1">
      <span className="block">{label}</span>
      {children}
    </label>
  );
}
