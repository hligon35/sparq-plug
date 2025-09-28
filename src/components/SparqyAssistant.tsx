"use client";
import { useState, useEffect, useRef } from 'react';
import Button from '@/components/ui/Button';

type Message = { role: 'user'|'assistant'; content: string; time: string };

export default function SparqyAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => { if (open) { fetch('/api/sparqy/history').then(r=>r.json()).then(d=> setMessages(d.messages||[])).catch(()=>{}); } }, [open]);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, open]);

  async function send() {
    if (!input.trim()) return; const msg = input.trim(); setInput(''); setLoading(true);
    setMessages(m => [...m, { role:'user', content: msg, time: new Date().toISOString() }]);
    try {
      const r = await fetch('/api/sparqy/chat', { method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({ message: msg }) });
      const data = await r.json();
      if (data.reply) setMessages(m => [...m, { role:'assistant', content: data.reply, time: new Date().toISOString() }]);
    } catch (e:any) {
      setMessages(m => [...m, { role:'assistant', content: 'Error contacting Sparqy: ' + (e.message||'Unknown'), time: new Date().toISOString() }]);
    } finally { setLoading(false); }
  }

  return (
  <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-16 z-[900] flex flex-col items-end space-y-2">
      {open && (
        <div className="w-[340px] sm:w-[380px] h-[480px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden animate-fade-in relative">
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <h3 className="text-sm font-semibold">Sparqy Assistant</h3>
            <div className="flex gap-2 items-center">
              <Button size="sm" variant="ghost" onClick={()=>setOpen(false)}>Close</Button>
            </div>
          </div>
          <div className="flex-1 overflow-auto p-3 space-y-3 text-sm bg-gray-50">
            {messages.length === 0 && <div className="text-xs text-gray-500">Ask me anything about using the platform.</div>}
            {messages.map((m,i)=>(
              <div key={i} className={"flex " + (m.role==='user' ? 'justify-end':'justify-start')}>
                <div className={"max-w-[80%] rounded-lg px-3 py-2 " + (m.role==='user' ? 'bg-blue-600 text-white':'bg-white border border-gray-200 text-gray-800')}>{m.content}</div>
              </div>
            ))}
            <div ref={endRef} />
          </div>
          <form onSubmit={e=>{ e.preventDefault(); send(); }} className="p-3 border-t border-gray-200 bg-white flex items-center gap-2">
            <input value={input} onChange={e=>setInput(e.target.value)} placeholder="Ask Sparqy..." className="flex-1 text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
            <Button size="sm" type="submit" disabled={loading}>{loading ? '...' : 'Send'}</Button>
          </form>
        </div>
      )}
      <button
        onClick={()=>setOpen(o=>!o)}
        data-width="block" /* exclude from global fit-content rule so w/h utilities enforce a true circle */
        className="rounded-full bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-xl w-14 h-14 flex items-center justify-center text-xl font-bold focus:outline-none focus:ring-4 focus:ring-blue-300"
        aria-label={open ? 'Close Sparqy assistant' : 'Open Sparqy assistant'}
        type="button"
      >
        {open ? '×' : '💬'}
      </button>
    </div>
  );
}
