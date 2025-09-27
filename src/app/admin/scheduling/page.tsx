'use client';

import { useEffect, useState } from 'react';
import { hasBotFactoryAccessClient } from '@/features/bot_factory/access';
import AdminTopNav from '@/components/AdminTopNav';
import AdminHeader from '@/components/AdminHeader';
// Legacy single calendar removed per redesign (Unified only)
import dynamic from 'next/dynamic';

// Lazy load unified planner only when needed
const MultiClientPlanner = dynamic(() => import('@/components/MultiClientPlanner'), { ssr: false });
import { withBasePath } from '@/lib/basePath';

export default function CircuitPlanner() {
  const [activeTab, setActiveTab] = useState<'unified' | 'create' | 'bot'>('unified');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState<string | null>(null);
  const [clients, setClients] = useState<{id:string; name:string}[]>([]);
  const [form, setForm] = useState({
    content: '',
    date: '',
    time: '',
    platforms: [] as string[],
    clientId: '',
  });

  // Unified planner handles its own data fetching; local fetch removed

  // Load clients for quick create
  useEffect(() => {
    const loadClients = async () => {
      try { const r = await fetch(withBasePath('/api/clients')); if (r.ok){ const d = await r.json(); setClients(d.clients || []);} } catch {}
    };
    loadClients();
  }, []);

  // Single calendar event mapping removed

  const handleCreatePost = async () => {
    setCreateError(null); setCreateSuccess(null);
    // Build ISO from date & time
    if (!form.content.trim()) { setCreateError('Content is required'); return; }
    if (!form.date || !form.time) { setCreateError('Date & Time required'); return; }
    if (form.platforms.length === 0) { setCreateError('Select at least one platform'); return; }
    const client = clients.find(c => c.id === form.clientId) || { id: 'default', name: 'Default Client' };
    const iso = new Date(`${form.date}T${form.time}:00`).toISOString();
    setCreating(true);
    try {
      const payload = {
        content: form.content,
        platforms: form.platforms,
        clientId: client.id,
        clientName: client.name,
        scheduledAt: iso,
        status: 'Scheduled'
      };
      const res = await fetch(withBasePath('/api/scheduled-posts'), { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error('Failed to create post');
      setCreateSuccess('Post scheduled');
      setForm({ content: '', date: '', time: '', platforms: [], clientId: '' });
  setActiveTab('unified');
    } catch (e:any) {
      setCreateError(e.message || 'Error creating post');
    } finally {
      setCreating(false);
    }
  };

  const handleEditPost = (postId: number) => {
    alert(`Edit post ${postId} would open here`);
  };

  // Bot Factory button gating

  const [allowProduceBot, setAllowProduceBot] = useState(false);
  useEffect(()=>{ setAllowProduceBot(hasBotFactoryAccessClient()); },[]);

  // Top nav handles routing; sidebar removed

  const tabs: { key: typeof activeTab; label: string; hidden?: boolean }[] = [
    { key: 'unified', label: 'Post Planner' },
    { key: 'create', label: 'Create' },
    { key: 'bot', label: 'Produce Bot', hidden: !allowProduceBot }
  ].filter(t => !t.hidden) as any;

  return (
    <div className="min-h-screen bg-[#f5f7fb]">
  <AdminHeader title="Circuit" subtitle="Plan and manage social posts across platforms" />

      {/* Centered content with top nav pills */}
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          <AdminTopNav />
          {/* Tabs Navigation */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {tabs.map(t => {
              const active = activeTab === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => setActiveTab(t.key)}
                  className={`inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold transition-all border shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/40 ${active ? 'bg-white text-blue-700 border-blue-200 shadow-md ring-1 ring-blue-200' : 'bg-white text-gray-700 border-gray-200 hover:shadow-md hover:-translate-y-[1px]'} `}
                  aria-current={active ? 'page' : undefined}
                >
                  <span className={`w-2 h-2 rounded-full ${active ? 'bg-blue-600' : 'bg-gray-300'}`}></span>
                  {t.label}
                </button>
              );
            })}
          </div>

          <div className="">
          {activeTab === 'unified' && (
            <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm mb-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-6 h-6 bg-blue-500 rounded-full"></div>
                <h3 className="text-2xl font-bold text-gray-800">Circuit: Post Planner</h3>
              </div>
              <MultiClientPlanner />
            </div>
          )}

          {activeTab === 'create' && (
            <div className="mb-8 flex justify-center">
              <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm w-full max-w-2xl">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">Create Post</h3>
              <div className="space-y-6">
                {createError && <div className="p-3 rounded bg-red-50 text-red-700 text-sm">{createError}</div>}
                {createSuccess && <div className="p-3 rounded bg-green-50 text-green-700 text-sm">{createSuccess}</div>}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                  <textarea
                    rows={4}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    value={form.content}
                    onChange={(e)=>setForm(f=>({...f, content: e.target.value}))}
                    placeholder="Write post copy..."
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                    <input type="date" title="Select date" aria-label="Select date" value={form.date} onChange={(e)=>setForm(f=>({...f,date:e.target.value}))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                    <input type="time" title="Select time" aria-label="Select time" value={form.time} onChange={(e)=>setForm(f=>({...f,time:e.target.value}))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Platforms</label>
                  <div className="flex flex-wrap gap-3">
                    {['Facebook','Instagram','Twitter/X','LinkedIn','TikTok'].map(pf => {
                      const checked = form.platforms.includes(pf);
                      return (
                        <label key={pf} className={`flex items-center space-x-2 px-3 py-2 rounded-lg border text-sm cursor-pointer select-none ${checked ? 'bg-purple-600 text-white border-purple-600' : 'bg-gray-50 border-gray-300 hover:bg-gray-100'}`}> 
                          <input
                            type="checkbox"
                            className="hidden"
                            checked={checked}
                            onChange={() => setForm(f=>({...f, platforms: checked ? f.platforms.filter(p=>p!==pf) : [...f.platforms, pf]}))}
                          />
                          <span>{pf}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
                  <select title="Select client" aria-label="Select client" value={form.clientId} onChange={(e)=>setForm(f=>({...f, clientId:e.target.value}))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                    <option value="">Select client...</option>
                    {clients.map(c=> <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="flex items-center gap-3 justify-center">
                  <button onClick={handleCreatePost} disabled={creating} className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
                    {creating && <span className="w-3 h-3 rounded-full border-2 border-white border-t-transparent animate-spin"></span>}
                    Schedule Post
                  </button>
                  <button onClick={()=>{ setForm({ content:'', date:'', time:'', platforms:[], clientId:''}); setCreateError(null); setCreateSuccess(null); }} className="text-sm text-gray-600 hover:text-gray-800">Reset</button>
                </div>
              </div>
              </div>
            </div>
          )}

          {activeTab === 'bot' && allowProduceBot && (
            <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm mb-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Produce Bot</h3>
              <p className="text-sm text-gray-600 mb-4">The bot factory wizard is embedded below for convenience. Finish configuration and production inside this pane.</p>
              <div className="border rounded-xl overflow-hidden h-[900px] bg-gray-50">
                <iframe src="/bots/new" className="w-full h-full" title="Bot Factory" />
              </div>
            </div>
          )}
          </div>
        </div>
      </div>
    </div>
  );
}
