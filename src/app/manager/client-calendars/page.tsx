'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { withBasePath } from '@/lib/basePath';
import ManagerHeader from '@/components/ManagerHeader';
import ManagerTopNav from '@/components/ManagerTopNav';
import ManagerSectionBanner from '@/components/ManagerSectionBanner';
import { managerRouteMap } from '@/lib/managerNav';

type Client = {
  id: string;
  name: string;
  status: 'Active' | 'Inactive';
  socialPlatforms?: string[];
  assignedManager?: string;
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

function ManagerClientCalendarsPageInner() {
  const searchParams = useSearchParams();
  const selectedClientId = searchParams.get('client');
  
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [posts, setPosts] = useState<CalendarPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());

  // Load clients assigned to this manager
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const res = await fetch(withBasePath('/api/clients?managerId=current'));
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
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    for (let i = 0; i < 42; i++) {
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
      <ManagerHeader title="SparQ Plug" subtitle="Client Calendars" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <ManagerTopNav
          active={'clients'}
          onChange={(k) => {
            if (k === 'clients') return;
            window.location.href = managerRouteMap[k];
          }}
        />
        <div className="p-1">
          <ManagerSectionBanner
            icon="🗓️"
            variant="blue"
            title="Client Content Calendars"
            subtitle="Manage and review scheduled content across your assigned clients"
            actions={
              <Link
                href="/manager/unified-planner"
                className="bg-white/15 hover:bg-white/25 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Unified Planner →
              </Link>
            }
          />
          {/* Client Selection */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm mb-8 p-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">My Client Calendars</h2>
                  <p className="text-gray-600">Select a client to manage their content calendar</p>
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
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 min-w-[200px]"
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
                  <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
                    Schedule Post
                  </button>
                )}
              </div>
            </div>

            {selectedClient && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-semibold">
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
                      href={`/manager/clients/${selectedClient.id}`}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      View Profile →
                    </Link>
                    <div className="flex space-x-2">
                      <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
                        Analytics
                      </button>
                      <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
                        Content Library
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {!selectedClient ? (
            // No client selected - show client grid
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {clients.map(client => (
                  <div key={client.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-shadow">
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-semibold text-sm">
                              {client.name.substring(0, 2).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{client.name}</h3>
                            <p className="text-sm text-gray-600">{client.status}</p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3 mb-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                          </svg>
                          Calendar Management
                        </div>
                        <div className="flex space-x-2">
                          {client.socialPlatforms?.slice(0, 3).map((platform, index) => (
                            <span key={index} className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                              {platform}
                            </span>
                          ))}
                          {client.socialPlatforms && client.socialPlatforms.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                              +{client.socialPlatforms.length - 3}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                        <button
                          onClick={() => {
                            window.history.pushState({}, '', `?client=${client.id}`);
                            window.location.reload();
                          }}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                          View Calendar
                        </button>
                        <Link
                          href={`/manager/clients/${client.id}`}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                          Profile →
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {clients.length === 0 && (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Clients Assigned</h3>
                    <p className="text-gray-600">You haven't been assigned any clients yet. Contact your administrator to get started.</p>
                  </div>
                </div>
              )}
            </div>
          ) : loading ? (
            // Loading state
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading calendar...</p>
              </div>
            </div>
          ) : (
            // Calendar view (same as admin but with manager-specific styling)
            <div className="space-y-8">
              {/* Quick Actions Bar */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold mb-2">Content Management</h3>
                    <p className="text-blue-100">Manage {selectedClient.name}'s content calendar and scheduling</p>
                  </div>
                  <div className="flex space-x-3">
                    <button className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm font-medium backdrop-blur-sm">
                      Quick Post
                    </button>
                    <button className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm font-medium backdrop-blur-sm">
                      View Analytics
                    </button>
                  </div>
                </div>
              </div>

              {/* Calendar Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Scheduled</p>
                      <p className="text-2xl font-bold text-blue-600">{posts.filter(p => p.status === 'Scheduled').length}</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Published</p>
                      <p className="text-2xl font-bold text-green-600">{posts.filter(p => p.status === 'Published').length}</p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Drafts</p>
                      <p className="text-2xl font-bold text-yellow-600">{posts.filter(p => p.status === 'Draft').length}</p>
                    </div>
                    <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">This Week</p>
                      <p className="text-2xl font-bold text-purple-600">{posts.length}</p>
                    </div>
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                      </svg>
                    </div>
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
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
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
                          } ${isToday ? 'ring-2 ring-blue-500' : ''}`}
                        >
                          <div className={`text-sm font-medium mb-2 ${
                            isCurrentMonthDay ? 'text-gray-900' : 'text-gray-400'
                          } ${isToday ? 'text-blue-600' : ''}`}>
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ManagerClientCalendarsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f5f7fb] flex items-center justify-center p-8">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading client calendars...</p>
          </div>
        </div>
      }
    >
      <ManagerClientCalendarsPageInner />
    </Suspense>
  );
}