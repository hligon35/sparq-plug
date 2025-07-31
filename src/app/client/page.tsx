import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { useState } from 'react';
import { getOptimalPostTime } from '@/features/scheduling';

// Placeholder: Replace with real-time analytics fetching logic
const mockAnalytics: { timestamp: Date; engagement: number; contentType: 'image' | 'video' | 'text' }[] = [
  { timestamp: new Date(Date.now() - 3600 * 1000 * 2), engagement: 50, contentType: 'image' },
  { timestamp: new Date(Date.now() - 3600 * 1000 * 5), engagement: 80, contentType: 'video' },
  { timestamp: new Date(Date.now() - 3600 * 1000 * 8), engagement: 30, contentType: 'text' },
  { timestamp: new Date(Date.now() - 3600 * 1000 * 24), engagement: 120, contentType: 'image' },
  // ...more data
];

export default function ClientDashboard() {
  const [contentType, setContentType] = useState<'image' | 'video' | 'text'>('image');
  const [recommended, setRecommended] = useState<Date | null>(null);

  function handleContentTypeChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const type = e.target.value as 'image' | 'video' | 'text';
    setContentType(type);
    setRecommended(getOptimalPostTime(mockAnalytics, type));
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header title="Client Dashboard" />
        <main className="flex-1 p-8 overflow-y-auto">
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-2">Connected Accounts</h2>
            {/* Social account connect UI goes here */}
          </section>
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-2">Schedule a Post</h2>
            <form className="bg-white rounded shadow p-6 max-w-xl">
              <label className="block mb-2 font-medium">Content Type</label>
              <select
                className="mb-4 p-2 border rounded w-full"
                value={contentType}
                onChange={handleContentTypeChange}
                aria-label="Select content type"
              >
                <option value="image">Image</option>
                <option value="video">Video</option>
                <option value="text">Text</option>
              </select>
              <label className="block mb-2 font-medium">Recommended Time</label>
              <input
                className="mb-4 p-2 border rounded w-full bg-gray-100"
                type="text"
                value={recommended ? recommended.toLocaleString() : 'Select content type'}
                readOnly
                aria-label="Recommended post time"
              />
              {/* Add post content and submit button here */}
            </form>
          </section>
          <section>
            <h2 className="text-2xl font-bold mb-2">Analytics</h2>
            {/* Analytics widgets go here */}
          </section>
        </main>
      </div>
    </div>
  );
}
