"use client";
import React, { useEffect, useState } from 'react';
import { isBotFactoryEnabled } from '@/features/bot_factory/feature';

interface Bot { id:string; name:string; channels:string[]; active:boolean; intents:any[]; replies:any[]; sandbox:boolean; }
interface SimResult { action:string; intent?: {id:string; name:string}|null; confidence:number; sentiment:number; escalation?:string|null; reply?:{id:string; body:string}|null; reason?:string; uncertainCount?:number; }
interface Trace { at:string; channel:string; input:string; action:string; detectedIntentId?:string; reason?:string; }

export default function BotDetailPage({ params }: { params: { id: string } }) {
  const enabled = isBotFactoryEnabled();
  const { id } = params;
  const [bot,setBot] = useState<Bot|null>(null);
  const [loading,setLoading] = useState(false);
  const [error,setError] = useState<string|null>(null);
  const [input,setInput] = useState('Hello I need pricing info');
  const [channel,setChannel] = useState<string>('facebook');
  const [result,setResult] = useState<SimResult|null>(null);
  const [traces,setTraces] = useState<Trace[]>([]);
  const [refreshKey,setRefreshKey] = useState(0);

  useEffect(()=>{
    if(!enabled) return;
    (async()=>{
      setLoading(true); setError(null);
      try {
        const res = await fetch(`/api/bots/${id}`);
        const data = await res.json(); if(!res.ok) throw new Error(data.error || 'failed');
        setBot(data.bot); if(data.bot?.channels?.length) setChannel(data.bot.channels[0]);
      } catch(e:any){ setError(e.message);} finally { setLoading(false); }
    })();
  },[id, enabled]);

  useEffect(()=>{
    if(!bot) return;
    (async()=>{
      const res = await fetch(`/api/bots/${id}?action=traces`);
      const data = await res.json(); if(res.ok) setTraces(data.traces || []);
    })();
  },[bot, refreshKey, id]);

  async function simulate(){
    if(!input.trim()) return;
    setError(null);
    try {
      const res = await fetch(`/api/bots/${id}/simulate`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ channel, input }) });
      const data = await res.json(); if(!res.ok) throw new Error(data.error || 'simulate failed');
      setResult(data);
      setRefreshKey(k=>k+1);
    } catch(e:any){ setError(e.message); }
  }

  if(!enabled) return <div className="p-8 text-sm text-gray-500">Bot Factory disabled.</div>;
  if(loading) return <div className="p-8 text-sm text-gray-500">Loading...</div>;
  if(error) return <div className="p-8 text-sm text-red-600">Error: {error}</div>;
  if(!bot) return <div className="p-8 text-sm text-gray-500">Bot not found.</div>;

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Bot: {bot.name}</h1>
        <a href="/admin/bots" className="text-xs px-3 py-1.5 rounded border hover:bg-gray-50">Back</a>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
            <div className="border rounded p-4 bg-white shadow-sm">
              <h2 className="text-sm font-semibold mb-3">Simulator</h2>
              <div className="mb-2">
                <label className="text-[11px] font-medium text-gray-600">Channel</label>
                <select value={channel} onChange={e=>setChannel(e.target.value)} className="mt-1 w-full border rounded px-2 py-1 text-xs" aria-label="Channel" title="Channel">
                  {bot.channels.map(c=> <option key={c} value={c}>{c}</option> )}
                </select>
              </div>
              <div className="mb-3">
                <label className="text-[11px] font-medium text-gray-600">Input Message</label>
                <textarea value={input} onChange={e=>setInput(e.target.value)} rows={4} className="mt-1 w-full border rounded px-2 py-1 text-xs" aria-label="Input Message" title="Input Message" />
              </div>
              <button onClick={simulate} className="text-xs px-3 py-1.5 rounded bg-indigo-600 text-white hover:bg-indigo-700">Run Simulation</button>
              {result && (
                <div className="mt-4 text-[11px] border rounded p-3 bg-gray-50 space-y-1">
                  <div><span className="font-semibold">Action:</span> {result.action}</div>
                  {result.intent && <div><span className="font-semibold">Intent:</span> {result.intent.name} ({result.confidence.toFixed(2)})</div>}
                  <div><span className="font-semibold">Sentiment:</span> {result.sentiment.toFixed(2)}</div>
                  {result.escalation && <div><span className="font-semibold">Escalation:</span> {result.escalation}</div>}
                  {result.reply && <div><span className="font-semibold">Reply:</span> {result.reply.body}</div>}
                  {result.uncertainCount !== undefined && <div><span className="font-semibold">Uncertain Count:</span> {result.uncertainCount}</div>}
                </div>
              )}
            </div>
            <div className="border rounded p-4 bg-white shadow-sm text-[11px]">
              <h2 className="text-sm font-semibold mb-3">Bot Meta</h2>
              <div className="grid grid-cols-2 gap-y-1">
                <span className="text-gray-500">Active</span><span>{bot.active? 'Yes':'No'}</span>
                <span className="text-gray-500">Sandbox</span><span>{bot.sandbox? 'Yes':'No'}</span>
                <span className="text-gray-500">Channels</span><span>{bot.channels.join(', ')}</span>
                <span className="text-gray-500">Intents</span><span>{bot.intents.length}</span>
                <span className="text-gray-500">Replies</span><span>{bot.replies.length}</span>
              </div>
            </div>
        </div>
        <div className="border rounded p-4 bg-white shadow-sm max-h-[620px] flex flex-col">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-sm font-semibold">Recent Traces</h2>
            <button onClick={()=>setRefreshKey(k=>k+1)} className="text-xs px-2 py-1 rounded border hover:bg-gray-50">Refresh</button>
          </div>
          <div className="overflow-y-auto text-[11px] space-y-1">
            {traces.slice().reverse().slice(0,120).map((t,i)=> (
              <div key={i} className="border rounded px-2 py-1 flex flex-wrap gap-2">
                <span className="font-mono text-[10px] text-gray-500">{new Date(t.at).toLocaleTimeString()}</span>
                <span className="font-semibold">{t.channel}</span>
                <span className="truncate max-w-[150px]" title={t.input}>“{t.input}”</span>
                <span className="text-blue-600">{t.action}</span>
                {t.reason && <span className="text-gray-500">({t.reason})</span>}
              </div>
            ))}
            {traces.length===0 && <div className="text-gray-400">No traces yet.</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
