"use client";

import { useState, useMemo } from 'react';
import KpiCard from '@/components/KpiCard';
import AdminHeader from '@/components/AdminHeader';
import AdminTopNav from '@/components/AdminTopNav';
import AnalyticsSubNav from '@/components/AnalyticsSubNav';

interface SiteMetric { id: string; site: string; client: string; views: number; visitors: number; convRate: number; loadTime: number; }

const mockSiteMetrics: SiteMetric[] = [
	{ id: '1', site: 'acme.com', client: 'Acme Corp', views: 182340, visitors: 75432, convRate: 2.45, loadTime: 1.8 },
	{ id: '2', site: 'acme-store.com', client: 'Acme Corp', views: 93450, visitors: 40211, convRate: 3.10, loadTime: 2.1 },
	{ id: '3', site: 'globex.io', client: 'Globex', views: 254300, visitors: 112034, convRate: 1.95, loadTime: 2.4 },
	{ id: '4', site: 'initech.app', client: 'Initech', views: 78342, visitors: 45001, convRate: 4.25, loadTime: 1.6 },
	{ id: '5', site: 'prestige.worldwide', client: 'Prestige', views: 50990, visitors: 22010, convRate: 2.75, loadTime: 2.9 },
];

export default function SitesAnalyticsPage() {
	const [clientFilter, setClientFilter] = useState<string>('All');
	const [sortKey, setSortKey] = useState<keyof SiteMetric>('views');
	const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

	const clients = ['All', ...Array.from(new Set(mockSiteMetrics.map(m => m.client)))];

	const filtered = useMemo(() => mockSiteMetrics.filter(m => clientFilter === 'All' || m.client === clientFilter), [clientFilter]);

	const sorted = useMemo(() => [...filtered].sort((a,b) => {
		const va = a[sortKey]; const vb = b[sortKey];
		if (va === vb) return 0;
		const res = va < vb ? -1 : 1;
		return sortDir === 'asc' ? res : -res;
	}), [filtered, sortKey, sortDir]);

	const aggregate = useMemo(() => {
		const base = { views: 0, visitors: 0, convNumerator: 0, convDenominator: 0, loadTimeTotal: 0 };
		const acc = filtered.reduce((acc, m) => {
			acc.views += m.views; acc.visitors += m.visitors; acc.convNumerator += m.convRate * m.visitors; acc.convDenominator += m.visitors; acc.loadTimeTotal += m.loadTime; return acc;
		}, base);
		const avgConv = acc.convDenominator ? acc.convNumerator / acc.convDenominator : 0;
		const avgLoad = filtered.length ? acc.loadTimeTotal / filtered.length : 0;
		return { totalViews: acc.views, totalVisitors: acc.visitors, avgConv, avgLoad };
	}, [filtered]);

	function toggleSort(k: keyof SiteMetric) {
		if (sortKey === k) setSortDir(d => d === 'asc' ? 'desc' : 'asc'); else { setSortKey(k); setSortDir('desc'); }
	}

	return (
		<div className="min-h-screen bg-[#f5f7fb]">
			<AdminHeader title="Analytics & Reports" subtitle="Website performance & conversions" />
			<div className="px-4 sm:px-6 lg:px-8 py-8">
				<div className="max-w-7xl mx-auto">
					<AdminTopNav />
					<AnalyticsSubNav />
					{/* Aggregate Metrics */}
					<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
						<KpiCard gradient="blue" label="Total Page Views" value={aggregate.totalViews.toLocaleString()} size="sm" />
						<KpiCard gradient="green" label="Unique Visitors" value={aggregate.totalVisitors.toLocaleString()} size="sm" />
						<KpiCard gradient="purple" label="Avg Conversion Rate" value={aggregate.avgConv.toFixed(2) + '%'} size="sm" />
						<KpiCard gradient="orange" label="Avg Load Time" value={aggregate.avgLoad.toFixed(2) + 's'} size="sm" />
					</div>

					{/* Controls */}
						<div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm mb-6 flex flex-col md:flex-row gap-4 md:items-center justify-between">
							<div className="flex items-center gap-3">
								<label className="text-sm font-medium text-gray-700">Client:</label>
								<select value={clientFilter} onChange={e => setClientFilter(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" aria-label="Filter by client">
									{clients.map(c => <option key={c}>{c}</option>)}
								</select>
							</div>
							<div className="text-xs text-gray-500">Mock data shown • Real integration pending</div>
						</div>

					{/* Table */}
					<div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
						<div className="p-6 border-b border-gray-200 flex items-center gap-3">
							<div className="w-6 h-6 bg-blue-500 rounded-full" />
							<h3 className="text-2xl font-bold text-gray-800">Site Performance</h3>
						</div>
						<div className="overflow-x-auto">
							<table className="w-full text-sm" aria-describedby="site-performance-caption">
							<caption id="site-performance-caption" className="sr-only">Sortable table of website performance metrics including views, visitors, conversion rate and load time.</caption>
								<thead className="bg-gray-50">
									<tr>
										<SortableTh onClick={() => toggleSort('site')} active={sortKey==='site'} dir={sortDir}>Site</SortableTh>
										<SortableTh onClick={() => toggleSort('client')} active={sortKey==='client'} dir={sortDir}>Client</SortableTh>
										<SortableTh onClick={() => toggleSort('views')} active={sortKey==='views'} dir={sortDir}>Views</SortableTh>
										<SortableTh onClick={() => toggleSort('visitors')} active={sortKey==='visitors'} dir={sortDir}>Visitors</SortableTh>
										<SortableTh onClick={() => toggleSort('convRate')} active={sortKey==='convRate'} dir={sortDir}>Conv Rate</SortableTh>
										<SortableTh onClick={() => toggleSort('loadTime')} active={sortKey==='loadTime'} dir={sortDir}>Load (s)</SortableTh>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-gray-100">
									{sorted.map(m => (
										<tr key={m.id} className="hover:bg-gray-50">
											<Td>{m.site}</Td>
											<Td>{m.client}</Td>
											<Td>{m.views.toLocaleString()}</Td>
											<Td>{m.visitors.toLocaleString()}</Td>
											<Td>{m.convRate.toFixed(2)}%</Td>
											<Td>{m.loadTime.toFixed(2)}</Td>
											<Td><button className="text-blue-600 hover:text-blue-800">Details</button></Td>
										</tr>
									))}
									{sorted.length === 0 && <tr><Td colSpan={7}>No data</Td></tr>}
								</tbody>
							</table>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

function SiteMetricCard({ label, value, color }: { label: string; value: string; color: string; }) {
	const gradientMap: Record<string,string> = {
		blue: 'from-blue-500 to-blue-600',
		green: 'from-green-500 to-green-600',
		purple: 'from-purple-500 to-purple-600',
		orange: 'from-orange-500 to-orange-600'
	};
	return (
		<div className={`bg-gradient-to-br ${gradientMap[color]} rounded-2xl p-6 text-white shadow-lg`}>
			<div className="text-center">
				<div className="text-3xl font-bold mb-1">{value}</div>
				<div className="text-white/90 text-xs font-medium">{label}</div>
			</div>
		</div>
	);
}

function SortableTh({ children, onClick, active, dir }: { children: React.ReactNode; onClick: () => void; active: boolean; dir: 'asc' | 'desc'; }) {
	return (
		<th>
			<button onClick={onClick} className={`px-6 py-3 flex items-center gap-1 text-left text-xs font-medium uppercase tracking-wider ${active ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>{children}{active && <span>{dir==='asc' ? '▲' : '▼'}</span>}</button>
		</th>
	);
}

function Td({ children, colSpan }: { children: React.ReactNode; colSpan?: number; }) { return <td colSpan={colSpan} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{children}</td>; }

