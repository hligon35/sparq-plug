'use client';

import { useState } from 'react';
import ClientHeader from '@/components/ClientHeader';
import ClientTopNav from '@/components/ClientTopNav';

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Mock scheduled posts data
  const scheduledPosts = [
    {
      id: 1,
      title: 'Weekly motivation Monday',
      content: 'Start your week with positive energy! 💪',
      platforms: ['Instagram', 'Facebook'],
      date: new Date(2025, 7, 6, 9, 0), // Aug 6, 2025, 9:00 AM
      status: 'scheduled',
      type: 'image'
    },
    {
      id: 2,
      title: 'Product feature highlight',
      content: 'Discover our amazing new features that will boost your productivity',
      platforms: ['LinkedIn', 'Twitter/X'],
      date: new Date(2025, 7, 6, 14, 0), // Aug 6, 2025, 2:00 PM
      status: 'scheduled',
      type: 'video'
    },
    {
      id: 3,
      title: 'Customer success story',
      content: 'How TechCorp increased their ROI by 150% using our platform',
      platforms: ['LinkedIn'],
      date: new Date(2025, 7, 7, 10, 30), // Aug 7, 2025, 10:30 AM
      status: 'scheduled',
      type: 'article'
    },
    {
      id: 4,
      title: 'Behind the scenes',
      content: 'Take a look at our team working on exciting new projects',
      platforms: ['Instagram', 'Facebook'],
      date: new Date(2025, 7, 8, 15, 0), // Aug 8, 2025, 3:00 PM
      status: 'scheduled',
      type: 'image'
    },
    {
      id: 5,
      title: 'Industry insights',
      content: 'Latest trends in social media marketing for 2025',
      platforms: ['Twitter/X', 'LinkedIn'],
      date: new Date(2025, 7, 9, 11, 0), // Aug 9, 2025, 11:00 AM
      status: 'scheduled',
      type: 'article'
    }
  ];

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getPostsForDate = (date: Date) => {
    return scheduledPosts.filter(post => {
      const postDate = new Date(post.date);
      return postDate.getDate() === date.getDate() &&
             postDate.getMonth() === date.getMonth() &&
             postDate.getFullYear() === date.getFullYear();
    });
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(currentDate.getMonth() - 1);
    } else {
      newDate.setMonth(currentDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-32"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const posts = getPostsForDate(date);
      const isToday = new Date().toDateString() === date.toDateString();

      days.push(
        <div
          key={day}
          className={`h-32 border border-gray-200 p-2 cursor-pointer hover:bg-gray-50 ${
            isToday ? 'bg-blue-50 border-blue-300' : ''
          }`}
          onClick={() => setSelectedDate(date)}
        >
          <div className={`text-sm font-medium mb-1 ${
            isToday ? 'text-blue-600' : 'text-gray-900'
          }`}>
            {day}
          </div>
          <div className="space-y-1">
            {posts.slice(0, 2).map((post) => (
              <div
                key={post.id}
                className="text-xs p-1 rounded bg-purple-100 text-purple-800 truncate"
              >
                {post.title}
              </div>
            ))}
            {posts.length > 2 && (
              <div className="text-xs text-gray-500">
                +{posts.length - 2} more
              </div>
            )}
          </div>
        </div>
      );
    }

    return days;
  };

  const getPlatformIcon = (platform: string) => {
    const icons: { [key: string]: string } = {
      'Facebook': '📘',
      'Instagram': '📷',
      'Twitter/X': '🐦',
      'LinkedIn': '💼'
    };
    return icons[platform] || '📱';
  };

  const getTypeIcon = (type: string) => {
    const icons: { [key: string]: string } = {
      'image': '🖼️',
      'video': '🎥',
      'article': '📝'
    };
    return icons[type] || '📄';
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="min-h-screen bg-[#f5f7fb]">
  <ClientHeader title="SparQ Content Calendar" subtitle="Plan & Schedule Your Social Media Content" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ClientTopNav />
        <div className="pb-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-gray-800">Content Calendar</h2>
            </div>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-medium transition-colors shadow-lg"
            >
              Schedule Post
            </button>
          </div>

          {/* Calendar Stats - Horizontal */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <h3 className="text-sm font-medium text-gray-700 mb-2">This Month</h3>
              <p className="text-2xl font-bold text-gray-900">24</p>
              <p className="text-sm text-gray-600">Scheduled posts</p>
            </div>
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Next 7 Days</h3>
              <p className="text-2xl font-bold text-green-600">8</p>
              <p className="text-sm text-gray-600">Upcoming posts</p>
            </div>
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Best Time</h3>
              <p className="text-lg font-bold text-purple-600">2:00 PM</p>
              <p className="text-sm text-gray-600">Peak engagement</p>
            </div>
          </div>

          {/* Calendar Header */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm mb-6">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <button
                onClick={() => navigateMonth('prev')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Previous month"
                title="Previous month"
              >
                <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </button>
              
              <h3 className="text-xl font-semibold text-gray-900">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h3>
              
              <button
                onClick={() => navigateMonth('next')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Next month"
                title="Next month"
              >
                <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>
            </div>

            {/* Calendar Grid */}
            <div className="p-6">
              {/* Day headers */}
              <div className="grid grid-cols-7 gap-px mb-2">
                {dayNames.map((day) => (
                  <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                    {day}
                  </div>
                ))}
              </div>
              
              {/* Calendar days */}
              <div className="grid grid-cols-7 gap-px bg-gray-200">
                {renderCalendarDays()}
              </div>
            </div>
          </div>

          {/* Upcoming Posts List */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">Upcoming Posts</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {scheduledPosts.slice(0, 5).map((post) => (
                  <div key={post.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <span className="text-green-600 text-lg">{getTypeIcon(post.type)}</span>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{post.title}</h4>
                        <p className="text-sm text-gray-600 mb-1">{post.content}</p>
                        <div className="flex items-center space-x-2">
                          {post.platforms.map((platform) => (
                            <span key={platform} className="text-xs">
                              {getPlatformIcon(platform)}
                            </span>
                          ))}
                          <span className="text-xs text-gray-500">
                            {post.date.toLocaleDateString()} at {post.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                        Edit
                      </button>
                      <button className="text-red-600 hover:text-red-800 text-sm font-medium">
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Schedule Post Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">Schedule New Post</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Close"
                  title="Close"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Post Title</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter post title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                <textarea
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="What's your message?"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    aria-label="Post date"
                    title="Post date"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                  <input
                    type="time"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    aria-label="Post time"
                    title="Post time"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Platforms</label>
                <div className="grid grid-cols-2 gap-3">
                  {['Facebook', 'Instagram', 'Twitter/X', 'LinkedIn'].map((platform) => (
                    <label key={platform} className="flex items-center space-x-2 cursor-pointer">
                      <input type="checkbox" className="rounded border-gray-300 text-green-600 focus:ring-green-500" />
                      <span className="text-sm text-gray-700">{getPlatformIcon(platform)} {platform}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                  Schedule Post
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
