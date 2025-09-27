'use client';

import { useEffect, useState } from 'react';
import { hasBotFactoryAccessClient } from '@/features/bot_factory/access';
import AdminTopNav from '@/components/AdminTopNav';
import AdminHeader from '@/components/AdminHeader';
// Legacy single calendar removed per redesign (Unified only)
import dynamic from 'next/dynamic';
import Tabs from '@/components/ui/Tabs';
import Button from '@/components/ui/Button';
import { ToastContainer, useToasts } from '@/components/ui/Toast';

// Lazy load unified planner only when needed
const MultiClientPlanner = dynamic(() => import('@/components/MultiClientPlanner'), { ssr: false });
import { withBasePath } from '@/lib/basePath';

export default function CircuitPlanner() {
  const [activeTab, setActiveTab] = useState<'unified' | 'create' | 'bot'>('unified');
  const [creating, setCreating] = useState(false);
  const { messages, push, remove } = useToasts();
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
  // Clear inline states
    // Build ISO from date & time
  if (!form.content.trim()) { push({ type:'error', text:'Content is required' }); return; }
  if (!form.date || !form.time) { push({ type:'error', text:'Date & Time required' }); return; }
  if (form.platforms.length === 0) { push({ type:'error', text:'Select at least one platform' }); return; }
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
      push({ type:'success', text:'Post scheduled' });
      setForm({ content: '', date: '', time: '', platforms: [], clientId: '' });
  setActiveTab('unified');
    } catch (e:any) {
      push({ type:'error', text: e.message || 'Error creating post' });
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

  const tabs = [
    { key: 'unified', label: 'Post Planner' },
    { key: 'create', label: 'Create' },
    { key: 'bot', label: 'Produce Bot', hidden: !allowProduceBot }
  ];

  return (
    <div className="min-h-screen bg-[#f5f7fb]">
  <AdminHeader title="Circuit" subtitle="Plan and manage social posts across platforms" />

      {/* Centered content with top nav pills */}
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          <AdminTopNav />
          <Tabs items={tabs} active={activeTab} onChange={(k)=>setActiveTab(k as typeof activeTab)} aria-label="Circuit tabs" className="justify-center mb-8" />

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
                {/* Toasts now handle feedback; keeping space for future inline validation */}
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
                  <Button onClick={handleCreatePost} loading={creating} variant="primary">Schedule Post</Button>
                  <Button type="button" variant="ghost" onClick={()=>{ setForm({ content:'', date:'', time:'', platforms:[], clientId:''}); }}>Reset</Button>
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
    <ToastContainer messages={messages} onRemove={remove} />
    </div>
  );
}
