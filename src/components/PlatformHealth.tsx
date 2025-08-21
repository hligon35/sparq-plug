import { useEffect, useState } from 'react';

const platforms = [
  { name: 'Facebook', url: 'https://graph.facebook.com' },
  { name: 'Twitter(X)', url: 'https://api.twitter.com' },
  { name: 'Instagram', url: 'https://graph.instagram.com' },
  { name: 'TikTok', url: 'https://open-api.tiktok.com' },
  { name: 'LinkedIn', url: 'https://api.linkedin.com' },
];

function getStatusColor(status: string) {
  if (status === 'Online') return 'text-green-600';
  if (status === 'Degraded') return 'text-yellow-600';
  return 'text-red-600';
}

export default function PlatformHealth() {
  const [status, setStatus] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  async function checkStatus() {
    setLoading(true);
    const results: { [key: string]: string } = {};
    await Promise.all(
      platforms.map(async (platform) => {
        try {
          const res = await fetch(platform.url, { method: 'HEAD' });
          results[platform.name] = res.ok ? 'Online' : 'Degraded';
        } catch {
          results[platform.name] = 'Offline';
        }
      })
    );
    setStatus(results);
    setLastChecked(new Date());
    setLoading(false);
  }

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 5 * 60 * 1000); // auto-refresh every 5 min
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white rounded shadow p-4 mb-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold">Platform Health Status</h3>
        <button
          onClick={checkStatus}
          disabled={loading}
          className="ml-4 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50"
          aria-label="Refresh platform status"
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>
      <ul>
        {platforms.map((platform) => (
          <li key={platform.name} className="flex items-center mb-1">
            <span className="w-32 font-medium">{platform.name}</span>
            <span
              className={`ml-2 font-semibold ${getStatusColor(
                status[platform.name] || 'Checking...'
              )}`}
              aria-live="polite"
            >
              {status[platform.name] || 'Checking...'}
            </span>
          </li>
        ))}
      </ul>
      <div className="text-xs text-gray-500 mt-2">
        Last checked:{' '}
        {lastChecked ? lastChecked.toLocaleTimeString() : 'Never'} (auto-refreshes
        every 5 min)
      </div>
    </div>
  );
}
