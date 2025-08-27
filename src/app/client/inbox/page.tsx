'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import ClientTopNav from '@/components/ClientTopNav';

export default function ClientInboxPage() {
  const [activeFilter, setActiveFilter] = useState('all');
  const [messages, setMessages] = useState([
    {
      id: 1,
      platform: 'Facebook',
      sender: 'Sarah Johnson',
      message: 'Love your latest product! When will it be available?',
      timestamp: '2 hours ago',
      status: 'unread',
      type: 'comment'
    },
    {
      id: 2,
      platform: 'Instagram',
      sender: 'mike_designs',
      message: 'Can you collaborate on a design project?',
      timestamp: '4 hours ago',
      status: 'read',
      type: 'direct_message'
    },
    {
      id: 3,
      platform: 'LinkedIn',
      sender: 'TechCorp Ltd',
      message: 'Interested in your services for our marketing campaign',
      timestamp: '1 day ago',
      status: 'replied',
      type: 'direct_message'
    },
    {
      id: 4,
      platform: 'Twitter/X',
      sender: 'startup_life',
      message: 'Great insights in your latest post!',
      timestamp: '2 days ago',
      status: 'read',
      type: 'mention'
    }
  ]);

  const handleReply = (messageId: number) => {
    alert(`Replying to message ${messageId}. In production, this would open a reply interface.`);
  };

  const handleMarkAsRead = (messageId: number) => {
    setMessages(messages.map(msg => 
      msg.id === messageId ? {...msg, status: 'read'} : msg
    ));
  };

  const filteredMessages = messages.filter(msg => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'unread') return msg.status === 'unread';
    if (activeFilter === 'mentions') return msg.type === 'mention';
    return msg.platform.toLowerCase() === activeFilter;
  });

  const getPlatformIcon = (platform: string) => {
    const icons: { [key: string]: string } = {
      'Facebook': '📘',
      'Instagram': '📷',
      'Twitter/X': '🐦',
      'LinkedIn': '💼'
    };
    return icons[platform] || '📱';
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'unread': return 'bg-red-100 text-red-800';
      case 'replied': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f7fb]">
      <Header title="Social Inbox" subtitle="Manage messages across all platforms" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ClientTopNav />
        <div className="pb-8">
          {/* Filter Tabs */}
          <div className="mb-6">
            <div className="flex space-x-2 bg-gray-100 p-1 rounded-lg">
              {['all', 'unread', 'facebook', 'instagram', 'linkedin', 'mentions'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeFilter === filter
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Messages List */}
          <div className="space-y-4">
            {filteredMessages.map((message) => (
              <div key={message.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                      <span className="text-lg">{getPlatformIcon(message.platform)}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-semibold text-gray-900">{message.sender}</h3>
                        <span className="text-sm text-gray-500">on {message.platform}</span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(message.status)}`}>
                          {message.status}
                        </span>
                      </div>
                      <p className="text-gray-700 mb-2">{message.message}</p>
                      <p className="text-sm text-gray-500">{message.timestamp}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    {message.status === 'unread' && (
                      <button
                        onClick={() => handleMarkAsRead(message.id)}
                        className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm"
                      >
                        Mark as Read
                      </button>
                    )}
                    <button
                      onClick={() => handleReply(message.id)}
                      className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm"
                    >
                      Reply
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredMessages.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-gray-400 text-2xl">💬</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No messages found</h3>
              <p className="text-gray-500">No messages match the current filter.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
