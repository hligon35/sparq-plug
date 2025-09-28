"use client";
import React, { useState } from 'react';
import { isBotFactoryEnabled } from '../feature';
import { BotChannel, BotIntent, BotReplyTemplate } from '../services/botTypes';

interface DraftBot {
  name: string;
  channels: BotChannel[];
  persona: string;
  guidelines: string;
  intents: BotIntent[];
  replies: BotReplyTemplate[];
  escalation: { negativeSentimentThreshold: number; maxUncertainBeforeHandoff: number };
  rate: { perMinute: number; perHour: number; perDay: number };
  sandbox: boolean;
}

const emptyDraft: DraftBot = {
  name: '',
  channels: [],
  persona: '',
  guidelines: '',
  intents: [],
  replies: [],
  escalation: { negativeSentimentThreshold: -0.4, maxUncertainBeforeHandoff: 2 },
  rate: { perMinute: 10, perHour: 200, perDay: 1000 },
  sandbox: true,
};

const steps = [
  'Channels',
  'Persona',
  'Intents & Replies',
  'Escalation',
  'Approve & Activate'
];

export default function BotWizard(){
  const enabled = isBotFactoryEnabled();
  const [draft, setDraft] = useState<DraftBot>(emptyDraft);
  const [step, setStep] = useState(0);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewMessages, setPreviewMessages] = useState<{role:'user'|'bot'; text:string}[]>([]);
  const [createdBotId, setCreatedBotId] = useState<string | null>(null);
  const [activating, setActivating] = useState(false);

  if(!enabled){
    return <div className="max-w-4xl mx-auto p-8"><p className="text-sm text-gray-500">Bot Factory is disabled (feature flag).</p></div>;
  }

  function toggleChannel(ch: BotChannel){
    setDraft(d=>({...d, channels: d.channels.includes(ch) ? d.channels.filter(c=>c!==ch) : [...d.channels, ch]}));
  }

  function addIntent(){
    const name = prompt('Intent name?');
    if(!name) return;
    setDraft(d=>({...d, intents:[...d.intents, { id: crypto.randomUUID(), name, keywords: [], replyTemplateIds: [] }]}));
  }

  function addReply(){
    const title = prompt('Reply title?');
    if(!title) return;
    setDraft(d=>({...d, replies:[...d.replies, { id: crypto.randomUUID(), title, body: 'Thank you!', channelOverrides: {} }]}));
  }

  function simulate(){
    const input = prompt('User says:');
    if(!input) return;
    setPreviewMessages(m=>[...m, { role:'user', text: input }]);
    // naive pick first reply if any
    const reply = draft.replies[0]?.body || '(no reply templates)';
    setTimeout(()=>{
      setPreviewMessages(m=>[...m, { role:'bot', text: reply }]);
    }, 300);
  }

  async function createBot(){
    setCreating(true); setError(null);
    try {
      const body = {
        name: draft.name,
        channels: draft.channels,
        persona: draft.persona,
        guidelines: draft.guidelines,
        intents: draft.intents,
        replies: draft.replies,
        escalationRules: { negativeSentimentThreshold: draft.escalation.negativeSentimentThreshold, maxUncertainBeforeHandoff: draft.escalation.maxUncertainBeforeHandoff },
        rateLimits: { perMinute: draft.rate.perMinute, perHour: draft.rate.perHour, perDay: draft.rate.perDay },
        sandbox: draft.sandbox,
      };
      const res = await fetch('/api/bots',{ method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body)});
      const data = await res.json();
      if(!res.ok) throw new Error(data.error || 'Failed to create');
      setStep(steps.length-1);
      setCreatedBotId(data.bot.id);
    } catch(e:any){ setError(e.message); }
    finally { setCreating(false); }
  }

  async function activateNow(){
    if(!createdBotId) return;
    setActivating(true); setError(null);
    try {
      const res = await fetch(`/api/bots/${createdBotId}`, { method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ active:true })});
      const data = await res.json(); if(!res.ok) throw new Error(data.error || 'activation failed');
      alert('Bot activated.');
    } catch(e:any){ setError(e.message); }
    finally { setActivating(false); }
  }

  function next(){ if(step < steps.length-1) setStep(s=>s+1); }
  function prev(){ if(step>0) setStep(s=>s-1); }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Produce Bot</h1>
          <p className="text-sm text-gray-600">Wizard to configure brand-aligned automated responder.</p>
        </div>
        <ol className="flex flex-wrap gap-2 text-xs">
          {steps.map((label,i)=> (
            <li key={label} className={`px-2.5 py-1 rounded-full border ${i===step? 'bg-blue-600 text-white border-blue-600':'bg-white text-gray-600 border-gray-300'}`}>{i+1}. {label}</li>
          ))}
        </ol>
      </header>

      {error && <div className="p-3 rounded bg-red-50 border border-red-200 text-sm text-red-700">{error}</div>}

      <div className="grid lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 space-y-6">
          {step===0 && (
            <section className="bg-white rounded-lg border p-5 shadow-sm space-y-4">
              <h2 className="font-semibold text-sm tracking-wide">Channels</h2>
              <div className="flex flex-wrap gap-2">
                {(['facebook','instagram','linkedin','x','email'] as BotChannel[]).map(ch => (
                  <button key={ch} type="button" onClick={()=>toggleChannel(ch)} className={`px-3 py-1.5 rounded border text-xs font-medium ${draft.channels.includes(ch) ? 'bg-blue-600 text-white border-blue-600':'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}>{ch}</button>
                ))}
              </div>
              <label className="block text-xs font-medium text-gray-600 space-y-1">
                <span>Name</span>
                <input value={draft.name} onChange={e=>setDraft(d=>({...d, name:e.target.value}))} className="border rounded px-2 py-1.5 text-sm w-full" placeholder="Campaign Bot" />
              </label>
            </section>
          )}
          {step===1 && (
            <section className="bg-white rounded-lg border p-5 shadow-sm space-y-4">
              <h2 className="font-semibold text-sm tracking-wide">Persona & Brand Voice</h2>
              <label className="block text-xs font-medium text-gray-600 space-y-1">
                <span>Persona Description</span>
                <textarea value={draft.persona} onChange={e=>setDraft(d=>({...d, persona:e.target.value}))} className="border rounded px-2 py-1.5 text-sm w-full h-28" placeholder="Friendly, concise, upbeat brand advocate." />
              </label>
              <label className="block text-xs font-medium text-gray-600 space-y-1">
                <span>Guidelines</span>
                <textarea value={draft.guidelines} onChange={e=>setDraft(d=>({...d, guidelines:e.target.value}))} className="border rounded px-2 py-1.5 text-sm w-full h-40" placeholder="Do: be helpful... Do not: promise refunds..." />
              </label>
            </section>
          )}
          {step===2 && (
            <section className="bg-white rounded-lg border p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-sm tracking-wide">Intents & Replies</h2>
                <div className="flex gap-2">
                  <button onClick={addIntent} className="text-xs px-2 py-1 rounded bg-blue-600 text-white">Add Intent</button>
                  <button onClick={addReply} className="text-xs px-2 py-1 rounded bg-emerald-600 text-white">Add Reply</button>
                </div>
              </div>
              <div className="space-y-3">
                {draft.intents.map(inIntent => (
                  <div key={inIntent.id} className="border rounded p-3 text-xs space-y-2">
                    <div className="font-semibold">{inIntent.name}</div>
                    <label className="block space-y-1">
                      <span className="text-[11px] text-gray-600">Keywords (comma separated)</span>
                      <input value={inIntent.keywords.join(', ')} onChange={e=>{
                        const kws = e.target.value.split(',').map(s=>s.trim()).filter(Boolean);
                        setDraft(d=>({...d, intents: d.intents.map(it=> it.id===inIntent.id ? {...it, keywords: kws }: it)}));
                      }} className="border rounded px-2 py-1.5 text-[11px] w-full" />
                    </label>
                  </div>
                ))}
                {draft.replies.length>0 && (
                  <div className="space-y-2">
                    <h3 className="text-xs font-semibold text-gray-700">Reply Templates</h3>
                    {draft.replies.map(r => (
                      <div key={r.id} className="border rounded p-3 text-xs space-y-2">
                        <div className="font-semibold">{r.title}</div>
                        <label className="block space-y-1">
                          <span className="text-[11px] text-gray-600">Body</span>
                          <textarea value={r.body} onChange={e=>{
                            const body = e.target.value; setDraft(d=>({...d, replies: d.replies.map(rr=> rr.id===r.id ? {...rr, body}: rr)}));
                          }} className="border rounded px-2 py-1.5 text-[11px] w-full h-20" />
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          )}
          {step===3 && (
            <section className="bg-white rounded-lg border p-5 shadow-sm space-y-4">
              <h2 className="font-semibold text-sm tracking-wide">Escalation Rules</h2>
              <div className="grid sm:grid-cols-2 gap-4 text-xs">
                <label className="space-y-1 font-medium text-gray-600">
                  <span>Negative Sentiment Threshold</span>
                  <input type="number" step="0.1" min={-1} max={0} value={draft.escalation.negativeSentimentThreshold} onChange={e=>setDraft(d=>({...d, escalation:{...d.escalation, negativeSentimentThreshold: parseFloat(e.target.value)}}))} className="border rounded px-2 py-1.5 text-sm" />
                </label>
                <label className="space-y-1 font-medium text-gray-600">
                  <span>Max Uncertain Before Handoff</span>
                  <input type="number" min={1} value={draft.escalation.maxUncertainBeforeHandoff} onChange={e=>setDraft(d=>({...d, escalation:{...d.escalation, maxUncertainBeforeHandoff: parseInt(e.target.value)}}))} className="border rounded px-2 py-1.5 text-sm" />
                </label>
              </div>
              <div className="text-[11px] text-gray-500">Human escalation triggers when low confidence repeats or sentiment &lt;= threshold.</div>
            </section>
          )}
          {step===4 && (
            <section className="bg-white rounded-lg border p-5 shadow-sm space-y-4">
              <h2 className="font-semibold text-sm tracking-wide">Approval</h2>
              <ul className="text-xs list-disc pl-5 space-y-1 text-gray-600">
                <li>{draft.channels.length} channels selected</li>
                <li>{draft.intents.length} intents configured</li>
                <li>{draft.replies.length} reply templates</li>
                <li>Sandbox: {draft.sandbox ? 'Enabled' : 'Disabled'}</li>
              </ul>
              <div className="flex items-center gap-2 text-xs">
                <label className="inline-flex items-center gap-1">
                  <input type="checkbox" checked={draft.sandbox} onChange={e=>setDraft(d=>({...d, sandbox:e.target.checked}))} />
                  <span>Sandbox Mode</span>
                </label>
              </div>
              {!createdBotId && (
                <button disabled={creating || !draft.name || draft.channels.length===0} onClick={createBot} className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm disabled:opacity-50 hover:bg-blue-700">
                  {creating ? 'Creating…' : 'Create Bot'}
                </button>
              )}
              {createdBotId && (
                <div className="flex flex-col gap-3">
                  <div className="text-xs text-green-700 font-medium">Bot created (ID: {createdBotId})</div>
                  <div className="flex gap-2">
                    <button disabled={activating} onClick={activateNow} className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm disabled:opacity-50 hover:bg-emerald-700">
                      {activating ? 'Activating…' : 'Activate Now'}
                    </button>
                    <a href="/admin/bots" className="inline-flex items-center gap-2 rounded-md bg-gray-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-700">Manage Bots</a>
                  </div>
                </div>
              )}
            </section>
          )}
          <div className="flex justify-between pt-2">
            <button disabled={step===0} onClick={prev} className="text-xs px-3 py-1.5 rounded border bg-white hover:bg-gray-50 disabled:opacity-40">Back</button>
            <button disabled={step===steps.length-1} onClick={next} className="text-xs px-3 py-1.5 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40">Next</button>
          </div>
        </div>
        <aside className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-lg border p-4 shadow-sm h-full flex flex-col">
            <h3 className="text-sm font-semibold mb-2">Preview Simulation</h3>
            <div className="flex-1 overflow-y-auto border rounded p-2 space-y-2 text-[11px] bg-gray-50">
              {previewMessages.map((m,i)=>(
                <div key={i} className={`px-2 py-1 rounded max-w-[85%] ${m.role==='user'?'bg-white self-start border':'bg-blue-600 text-white self-end ml-auto'}`}>{m.text}</div>
              ))}
              {previewMessages.length===0 && <div className="text-gray-400 text-[10px]">No simulation messages yet.</div>}
            </div>
            <button onClick={simulate} className="mt-3 text-xs px-2 py-1.5 rounded bg-indigo-600 text-white hover:bg-indigo-700">Simulate</button>
          </div>
        </aside>
      </div>
    </div>
  );
}
