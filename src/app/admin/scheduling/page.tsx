'use client';

import { useEffect, useMemo, useState } from 'react';
import { hasBotFactoryAccessClient } from '@/features/bot_factory/access';
import AdminTopNav from '@/components/AdminTopNav';
import AdminHeader from '@/components/AdminHeader';
import CalendarGrid, { type CalendarEvent } from '@/components/CalendarGrid';
import { withBasePath } from '@/lib/basePath';

export default function PostScheduling() {
  type Post = { id: string; content: string; platforms: string[]; clientId?: string; clientName?: string; client?: string; scheduledAt: string; status: 'Scheduled' | 'Draft' | 'Published' | 'Failed' };
  const [scheduledPosts, setScheduledPosts] = useState<Post[]>([]);

  const refresh = async () => {
    try {
      const res = await fetch(withBasePath('/api/scheduled-posts'));
      if (!res.ok) return;
      const data = await res.json();
      setScheduledPosts(data.posts || data.items || []);
    } catch {}
  };

  useEffect(() => { refresh(); }, []);

  const calendarEvents: CalendarEvent[] = useMemo(() => (
    scheduledPosts.map((p) => ({
      id: p.id,
      title: p.content,
      content: p.content,
      platforms: p.platforms,
      date: new Date(p.scheduledAt),
      status: p.status,
      type: 'article'
    }))
  ), [scheduledPosts]);

  const handleCreatePost = async () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 30);
    const payload = {
      content: 'Sample scheduled post',
      platforms: ['Facebook', 'Instagram'],
      clientId: 'tech-corp-1',
      clientName: 'TechCorp Solutions',
      scheduledAt: now.toISOString(),
      status: 'Scheduled',
    };
    await fetch(withBasePath('/api/scheduled-posts'), { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) });
    await refresh();
  };

  const handleEditPost = (postId: number) => {
    alert(`Edit post ${postId} would open here`);
  };

  // Bot Factory button gating (duplicate logic with ContentCalendar for now; refactor later)
  const [allowProduceBot, setAllowProduceBot] = useState(false);
  useEffect(()=>{ setAllowProduceBot(hasBotFactoryAccessClient()); },[]);

  // Top nav handles routing; sidebar removed

  return (
    <div className="min-h-screen bg-[#f5f7fb]">
      <AdminHeader title="Post Scheduling" subtitle="Schedule and manage social posts across platforms" />

      {/* Centered content with top nav pills */}
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          <AdminTopNav />
          {/* Main Content */}
          <div className="">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg">
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">{scheduledPosts.filter(p => p.status === 'Scheduled').length}</div>
                <div className="text-white/90 text-sm font-medium">Scheduled Posts</div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg">
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">{scheduledPosts.filter(p => p.status === 'Draft').length}</div>
                <div className="text-white/90 text-sm font-medium">Draft Posts</div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">47</div>
                <div className="text-white/90 text-sm font-medium">Published Today</div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">156</div>
                <div className="text-white/90 text-sm font-medium">This Week</div>
              </div>
            </div>
          </div>

          {/* Content Calendar */}
          <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-purple-500 rounded-full"></div>
                <h3 className="text-2xl font-bold text-gray-800">Content Calendar</h3>
              </div>
              <div className="flex items-center space-x-3">
                {allowProduceBot && (
                  <a
                    id="btn-produce-bot"
                    href="/bots/new"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                  >
                    Produce Bot
                  </a>
                )}
                <a
                  href="/admin/client-calendars"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                >
                  Client Calendars
                </a>
                <button onClick={handleCreatePost} className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium">Quick Create</button>
              </div>
            </div>
            <CalendarGrid events={calendarEvents} />
          </div>

          {/* Platform Distribution Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-6 h-6 bg-blue-500 rounded-full"></div>
                <h3 className="text-xl font-bold text-gray-800">Platform Distribution</h3>
              </div>
              <div className="bg-gray-50 rounded-xl p-8 border-2 border-dashed border-gray-300">
                <div className="text-center text-gray-500">
                  <svg className="w-12 h-12 mx-auto mb-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm font-medium">Pie Chart</p>
                  <p className="text-xs">Posts by platform</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-6 h-6 bg-green-500 rounded-full"></div>
                <h3 className="text-xl font-bold text-gray-800">Weekly Schedule</h3>
              </div>
              <div className="bg-gray-50 rounded-xl p-8 border-2 border-dashed border-gray-300">
                <div className="text-center text-gray-500">
                  <svg className="w-12 h-12 mx-auto mb-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                  </svg>
                  <p className="text-sm font-medium">Bar Chart</p>
                  <p className="text-xs">Posts per day this week</p>
                </div>
              </div>
            </div>
          </div>

          {/* Scheduled Posts List */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-orange-500 rounded-full"></div>
                <h3 className="text-2xl font-bold text-gray-800">Upcoming Posts</h3>
              </div>
            </div>
            
            <div className="divide-y divide-gray-200">
              {scheduledPosts.map((post) => (
                <div key={post.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-2">
                        {post.platforms.map((pf) => (
                          <span key={pf} className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${pf === 'Facebook' ? 'bg-blue-100 text-blue-800' : pf === 'Instagram' ? 'bg-pink-100 text-pink-800' : pf === 'Twitter/X' ? 'bg-gray-100 text-gray-800' : 'bg-blue-100 text-blue-800'}`}>
                            {pf}
                          </span>
                        ))}
                        <span className="text-sm text-gray-500">{post.clientName || post.client}</span>
                        <span className={`inline-flex px-2 py-1 rounded text-xs font-medium ${
                          post.status === 'Scheduled' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {post.status}
                        </span>
                      </div>
                      <p className="text-gray-800 mb-2">{post.content}</p>
                      <p className="text-sm text-gray-500">Scheduled for: {new Date(post.scheduledAt).toLocaleString()}</p>
                    </div>
                    <div className="ml-4">
                      <button 
                        onClick={() => handleEditPost(Number(post.id))}
                        className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}
