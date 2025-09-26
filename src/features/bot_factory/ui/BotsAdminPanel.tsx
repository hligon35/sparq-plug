"use client";
import React, { useEffect, useState } from 'react';
import { isBotFactoryEnabled } from '../feature';

interface BotRow { id:string; name:string; active:boolean; channels:string[]; sandbox:boolean; updatedAt:string; intents:number; replies:number; }
interface Trace { at:string; channel:string; input:string; action:string; detectedIntentId?:string; reason?:string; }

export default function BotsAdminPanel(){
  const enabled = isBotFactoryEnabled();
  const [bots, setBots] = useState<BotRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string|null>(null);
  const [tracesFor, setTracesFor] = useState<string|null>(null);
  const [traces, setTraces] = useState<Trace[]>([]);
  const [processing, setProcessing] = useState<string|null>(null);

  async function load(){
    if(!enabled) return;
    setLoading(true); setError(null);
    try {
      const res = await fetch('/api/bots');
      const data = await res.json();
      if(!res.ok) throw new Error(data.error || 'failed');
      setBots(data.bots.map((b:any)=>({ id:b.id, name:b.name, active:b.active, channels:b.channels, sandbox:b.sandbox, updatedAt:b.updatedAt, intents:b.intents?.length||0, replies:b.replies?.length||0 })));
    } catch(e:any){ setError(e.message); }
    finally { setLoading(false); }
  }
  useEffect(()=>{ load(); },[enabled]);

  async function toggleActive(id:string, next:boolean){
    setProcessing(id); setError(null);
    try {
      const res = await fetch(`/api/bots/${id}`, { method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ active: next }) });
      const data = await res.json(); if(!res.ok) throw new Error(data.error || 'update failed');
      setBots(bs=>bs.map(b=>b.id===id? { ...b, active: data.bot.active, name:data.bot.name, updatedAt:data.bot.updatedAt }: b));
    } catch(e:any){ setError(e.message); }
    finally { setProcessing(null); }
  }

  async function deleteBot(id:string){
    if(!confirm('Soft delete this bot?')) return;
    setProcessing(id);
    try {
      const res = await fetch(`/api/bots/${id}`, { method:'DELETE' });
      const data = await res.json(); if(!res.ok) throw new Error(data.error || 'delete failed');
      setBots(bs=>bs.map(b=>b.id===id? { ...b, active:false, name:data.bot.name }: b));
    } catch(e:any){ setError(e.message); }
    finally { setProcessing(null); }
  }

  async function viewTraces(id:string){
    setTracesFor(id); setTraces([]); setError(null);
    try {
      const res = await fetch(`/api/bots/${id}?action=traces`);
      const data = await res.json(); if(!res.ok) throw new Error(data.error || 'traces failed');
      setTraces(data.traces || []);
    } catch(e:any){ setError(e.message); }
  }

  if(!enabled) return <div className="max-w-5xl mx-auto p-8"><p className="text-sm text-gray-500">Bot Factory disabled.</p></div>;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Bots</h1>
  <a href="/bots/new" target="_blank" rel="noopener noreferrer" className="text-xs inline-flex items-center gap-1 rounded bg-blue-600 text-white px-3 py-1.5 hover:bg-blue-700">Produce Bot</a>
      </div>
      {error && <div className="p-3 rounded bg-red-50 border border-red-200 text-sm text-red-700">{error}</div>}
      <div className="overflow-x-auto border rounded bg-white">
        <table className="min-w-full text-xs">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="text-left px-3 py-2 font-medium">Name</th>
              <th className="text-left px-3 py-2 font-medium">Channels</th>
              <th className="text-left px-3 py-2 font-medium">Intents</th>
              <th className="text-left px-3 py-2 font-medium">Replies</th>
              <th className="text-left px-3 py-2 font-medium">Sandbox</th>
              <th className="text-left px-3 py-2 font-medium">Active</th>
              <th className="text-left px-3 py-2 font-medium">Updated</th>
              <th className="text-right px-3 py-2 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {bots.map(b=> (
              <tr key={b.id} className="border-t last:border-b">
                <td className="px-3 py-1.5 font-medium"><a href={`/admin/bots/${b.id}`} className="text-indigo-600 hover:underline">{b.name}</a></td>
                <td className="px-3 py-1.5">{b.channels.join(', ')}</td>
                <td className="px-3 py-1.5">{b.intents}</td>
                <td className="px-3 py-1.5">{b.replies}</td>
                <td className="px-3 py-1.5">{b.sandbox? 'Yes':'No'}</td>
                <td className="px-3 py-1.5">{b.active? <span className="text-green-600 font-semibold">Yes</span>: 'No'}</td>
                <td className="px-3 py-1.5" title={b.updatedAt}>{new Date(b.updatedAt).toLocaleString()}</td>
                <td className="px-3 py-1.5 text-right">
                  <div className="flex justify-end gap-2">
                    <button disabled={processing===b.id} onClick={()=>toggleActive(b.id, !b.active)} className="px-2 py-0.5 rounded bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-40">{b.active? 'Deactivate':'Activate'}</button>
                    <button onClick={()=>viewTraces(b.id)} className="px-2 py-0.5 rounded bg-indigo-600 text-white hover:bg-indigo-700">Traces</button>
                    <button disabled={processing===b.id} onClick={()=>deleteBot(b.id)} className="px-2 py-0.5 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-40">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
            {bots.length===0 && !loading && (
              <tr><td colSpan={8} className="px-3 py-6 text-center text-gray-500">No bots created yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      {tracesFor && (
        <div className="border rounded bg-white p-4 shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-sm font-semibold">Decision Traces</h2>
            <button onClick={()=>{setTracesFor(null); setTraces([]);}} className="text-xs px-2 py-1 rounded border hover:bg-gray-50">Close</button>
          </div>
          <div className="max-h-64 overflow-y-auto text-[11px] space-y-1">
            {traces.map((t,i)=> (
              <div key={i} className="border rounded px-2 py-1 flex flex-wrap gap-2">
                <span className="font-mono text-[10px] text-gray-500">{new Date(t.at).toLocaleTimeString()}</span>
                <span className="font-semibold">{t.channel}</span>
                <span className="truncate max-w-[160px]" title={t.input}>“{t.input}”</span>
                <span className="text-blue-600">{t.action}</span>
                {t.reason && <span className="text-gray-500">({t.reason})</span>}
              </div>
            ))}
            {traces.length===0 && <div className="text-gray-400">No traces.</div>}
          </div>
        </div>
      )}
    </div>
  );
}
