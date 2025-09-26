"use client";
import { useEffect, useState } from 'react';
import AdminTopNav from '@/components/AdminTopNav';
import AdminHeader from '@/components/AdminHeader';

export default function RevenueAnalyticsPage() {
  const [buckets, setBuckets] = useState<{ period: string; grossCents: number; currency: string }[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    (async () => {
      try {
        const res1 = await fetch('/api/payments?summary=monthly&currency=usd');
        const data1 = await res1.json();
        if (!res1.ok) throw new Error(data1.error || 'Failed to load');
        setBuckets(data1.buckets || []);
        const res2 = await fetch('/api/payments?summary=total&currency=usd');
        const data2 = await res2.json();
        if (!res2.ok) throw new Error(data2.error || 'Failed to load');
        setTotal(data2.total || 0);
      } catch (e: any) {
        setError(e.message || 'Unknown error');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="min-h-screen bg-[#f5f7fb]">
      <AdminHeader title="Revenue Analytics" subtitle="Track revenue captured from Stripe and other providers" />
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          <AdminTopNav />

          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm mt-6">
            {loading ? (
              <div className="text-gray-600">Loading revenue...</div>
            ) : error ? (
              <div className="text-red-600">{error}</div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Summary</h2>
                  <div className="text-2xl font-bold text-gray-900">${(total / 100).toFixed(2)} USD</div>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">Monthly Gross</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {buckets.map(b => (
                      <div key={b.period} className="border border-gray-200 rounded-lg p-4">
                        <div className="text-sm text-gray-500">{b.period}</div>
                        <div className="text-lg font-semibold">${(b.grossCents / 100).toFixed(2)} {b.currency.toUpperCase()}</div>
                      </div>
                    ))}
                    {buckets.length === 0 && (
                      <div className="text-gray-600">No data yet.</div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
