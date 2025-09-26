'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import AdminTopNav from '@/components/AdminTopNav';
import AdminHeader from '@/components/AdminHeader';
import { withBasePath } from '@/lib/basePath';

type Client = {
  id: string;
  name: string;
  status: 'Active' | 'Inactive';
  socialPlatforms?: string[];
};

type CalendarPost = {
  id: string;
  content: string;
  platforms: string[];
  clientId: string;
  clientName: string;
  scheduledAt: string;
  status: 'Scheduled' | 'Draft' | 'Published' | 'Failed';
  mediaType?: 'image' | 'video' | 'carousel' | 'text';
  engagement?: {
    likes: number;
    comments: number;
    shares: number;
  };
};

export default function ClientCalendarsPage() {
  const searchParams = useSearchParams();
  const selectedClientId = searchParams.get('client');
  
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [posts, setPosts] = useState<CalendarPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');

  // Load clients
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const res = await fetch(withBasePath('/api/clients'));
        if (res.ok) {
          const data = await res.json();
          setClients(data.clients || []);
        }
      } catch (error) {
        console.error('Error fetching clients:', error);
      }
    };
    fetchClients();
  }, []);

  // Load posts for selected client
  useEffect(() => {
    const fetchPosts = async () => {
      if (!selectedClientId) {
        setPosts([]);
        setSelectedClient(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const client = clients.find(c => c.id === selectedClientId);
        setSelectedClient(client || null);

        const res = await fetch(withBasePath(`/api/scheduled-posts?clientId=${selectedClientId}`));
        if (res.ok) {
          const data = await res.json();
          setPosts(data.posts || []);
        }
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setLoading(false);
      }
    };

    if (clients.length > 0) {
      fetchPosts();
    }
  }, [selectedClientId, clients]);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay()); // Start from Sunday

    const days = [];
    for (let i = 0; i < 42; i++) { // 6 weeks
      const day = new Date(startDate);
      day.setDate(startDate.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const getPostsForDate = (date: Date) => {
    return posts.filter(post => {
      const postDate = new Date(post.scheduledAt);
      return postDate.toDateString() === date.toDateString();
    });
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + (direction === 'next' ? 1 : -1));
    setCurrentDate(newDate);
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const days = getDaysInMonth(currentDate);
  const isCurrentMonth = (date: Date) => date.getMonth() === currentDate.getMonth();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Published': return 'bg-green-100 text-green-800';
      case 'Scheduled': return 'bg-blue-100 text-blue-800';
      case 'Draft': return 'bg-yellow-100 text-yellow-800';
      case 'Failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'Facebook': return 'bg-blue-500';
      case 'Instagram': return 'bg-pink-500';
      case 'Twitter/X': return 'bg-gray-800';
      case 'LinkedIn': return 'bg-blue-600';
      case 'TikTok': return 'bg-black';
      default: return 'bg-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f7fb]">
      <AdminHeader title="Client Calendars" subtitle="View and manage content calendars for individual clients" />

      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          <AdminTopNav />

          {/* Client Selection Header */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm mb-8 p-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Content Calendars</h2>
                  <p className="text-gray-600">Select a client to view their content calendar</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <select
                  value={selectedClientId || ''}
                  onChange={(e) => {
                    const clientId = e.target.value;
                    if (clientId) {
                      window.history.pushState({}, '', `?client=${clientId}`);
                      window.location.reload();
                    } else {
                      window.history.pushState({}, '', window.location.pathname);
                      window.location.reload();
                    }
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 min-w-[200px]"
                  aria-label="Select client"
                >
                  <option value="">Select a client...</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>
                      {client.name} ({client.status})
                    </option>
                  ))}
                </select>

                {selectedClient && (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setViewMode('month')}
                      className={`px-3 py-2 rounded-lg text-sm font-medium ${
                        viewMode === 'month' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Month
                    </button>
                    <button
                      onClick={() => setViewMode('week')}
                      className={`px-3 py-2 rounded-lg text-sm font-medium ${
                        viewMode === 'week' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Week
                    </button>
                  </div>
                )}
              </div>
            </div>

            {selectedClient && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                        <span className="text-purple-600 font-semibold">
                          {selectedClient.name.substring(0, 2).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">{selectedClient.name}</h3>
                        <p className="text-sm text-gray-600">
                          {selectedClient.socialPlatforms?.join(', ') || 'No platforms configured'}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Link
                      href={`/admin/clients/${selectedClient.id}`}
                      className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                    >
                      View Profile →
                    </Link>
                    <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
                      Schedule Post
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {!selectedClient ? (
            // No client selected - show overview
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12">
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Select a Client</h3>
                <p className="text-gray-600 mb-6">Choose a client from the dropdown above to view their content calendar and scheduled posts.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                  {clients.slice(0, 3).map(client => (
                    <button
                      key={client.id}
                      onClick={() => {
                        window.history.pushState({}, '', `?client=${client.id}`);
                        window.location.reload();
                      }}
                      className="bg-gray-50 hover:bg-gray-100 rounded-xl p-6 text-left transition-colors"
                    >
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mb-3">
                        <span className="text-purple-600 font-semibold text-sm">
                          {client.name.substring(0, 2).toUpperCase()}
                        </span>
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-1">{client.name}</h4>
                      <p className="text-sm text-gray-600">{client.status}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : loading ? (
            // Loading state
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading calendar...</p>
              </div>
            </div>
          ) : (
            // Calendar view
            <div className="space-y-8">
              {/* Calendar Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-2">{posts.filter(p => p.status === 'Scheduled').length}</div>
                    <div className="text-white/90 text-sm font-medium">Scheduled</div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white">
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-2">{posts.filter(p => p.status === 'Published').length}</div>
                    <div className="text-white/90 text-sm font-medium">Published</div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl p-6 text-white">
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-2">{posts.filter(p => p.status === 'Draft').length}</div>
                    <div className="text-white/90 text-sm font-medium">Drafts</div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white">
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-2">{posts.length}</div>
                    <div className="text-white/90 text-sm font-medium">Total Posts</div>
                  </div>
                </div>
              </div>

              {/* Calendar */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
                {/* Calendar Header */}
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => navigateMonth('prev')}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                        aria-label="Previous month"
                        title="Previous month"
                      >
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      <h3 className="text-xl font-semibold text-gray-900">
                        {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                      </h3>
                      <button
                        onClick={() => navigateMonth('next')}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                        aria-label="Next month"
                        title="Next month"
                      >
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                    <button
                      onClick={() => setCurrentDate(new Date())}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                    >
                      Today
                    </button>
                  </div>
                </div>

                {/* Calendar Grid */}
                <div className="p-6">
                  {/* Day Headers */}
                  <div className="grid grid-cols-7 gap-1 mb-4">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                      <div key={day} className="p-3 text-center text-sm font-medium text-gray-500">
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Calendar Days */}
                  <div className="grid grid-cols-7 gap-1">
                    {days.map((day, index) => {
                      const dayPosts = getPostsForDate(day);
                      const isToday = day.toDateString() === new Date().toDateString();
                      const isCurrentMonthDay = isCurrentMonth(day);

                      return (
                        <div
                          key={index}
                          className={`min-h-[120px] p-2 border border-gray-200 rounded-lg ${
                            isCurrentMonthDay ? 'bg-white' : 'bg-gray-50'
                          } ${isToday ? 'ring-2 ring-purple-500' : ''}`}
                        >
                          <div className={`text-sm font-medium mb-2 ${
                            isCurrentMonthDay ? 'text-gray-900' : 'text-gray-400'
                          } ${isToday ? 'text-purple-600' : ''}`}>
                            {day.getDate()}
                          </div>
                          
                          <div className="space-y-1">
                            {dayPosts.slice(0, 3).map(post => (
                              <div
                                key={post.id}
                                className="group cursor-pointer"
                                title={post.content}
                              >
                                <div className="bg-gray-100 hover:bg-gray-200 rounded p-1 text-xs">
                                  <div className="flex items-center space-x-1 mb-1">
                                    {post.platforms.slice(0, 2).map(platform => (
                                      <div
                                        key={platform}
                                        className={`w-2 h-2 rounded-full ${getPlatformColor(platform)}`}
                                        title={platform}
                                      />
                                    ))}
                                    <span className={`px-1 py-0.5 rounded text-xs ${getStatusColor(post.status)}`}>
                                      {post.status.substring(0, 1)}
                                    </span>
                                  </div>
                                  <div className="text-gray-700 truncate">
                                    {post.content.substring(0, 20)}...
                                  </div>
                                </div>
                              </div>
                            ))}
                            {dayPosts.length > 3 && (
                              <div className="text-xs text-gray-500 text-center">
                                +{dayPosts.length - 3} more
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Upcoming Posts List */}
              {posts.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-xl font-semibold text-gray-900">Upcoming Posts</h3>
                  </div>
                  <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                    {posts
                      .filter(post => new Date(post.scheduledAt) >= new Date())
                      .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
                      .slice(0, 10)
                      .map(post => (
                        <div key={post.id} className="p-6 hover:bg-gray-50">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <div className="flex space-x-1">
                                  {post.platforms.map(platform => (
                                    <span
                                      key={platform}
                                      className={`inline-block w-3 h-3 rounded-full ${getPlatformColor(platform)}`}
                                      title={platform}
                                    />
                                  ))}
                                </div>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(post.status)}`}>
                                  {post.status}
                                </span>
                                {post.mediaType && (
                                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                    {post.mediaType}
                                  </span>
                                )}
                              </div>
                              <p className="text-gray-800 mb-2 line-clamp-2">{post.content}</p>
                              <p className="text-sm text-gray-500">
                                {new Date(post.scheduledAt).toLocaleString()}
                              </p>
                            </div>
                            <div className="ml-4 flex items-center space-x-2">
                              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                                Edit
                              </button>
                              <button className="text-red-600 hover:text-red-700 text-sm font-medium">
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}