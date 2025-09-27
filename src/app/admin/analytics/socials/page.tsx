"use client";

import { useState } from 'react';
import AdminHeader from '@/components/AdminHeader';
import AdminTopNav from '@/components/AdminTopNav';
import AnalyticsSubNav from '@/components/AnalyticsSubNav';
import AudienceInsights from '@/components/AudienceInsights';
import CustomReports from '@/components/CustomReports';
import KpiCard from '@/components/KpiCard';

export default function SocialsAnalyticsPage() {
	const [timeframe, setTimeframe] = useState('7d');

	const analyticsData = {
		totalReach: '2.4M',
		engagement: '15.2%',
		newFollowers: '+8,245',
		clicks: '12.3K'
	};

	const topPosts = [
		{ id: 1, content: 'New product launch announcement!', platform: 'Instagram', engagement: '24.5%', reach: '45.2K' },
		{ id: 2, content: 'Behind the scenes content...', platform: 'Facebook', engagement: '18.7%', reach: '32.1K' },
		{ id: 3, content: 'Weekly promotion post', platform: 'Twitter/X', engagement: '12.3%', reach: '28.9K' }
	];

	return (
		<div className="min-h-screen bg-[#f5f7fb]">
			<AdminHeader title="Analytics & Reports" subtitle="Social channel performance" />
			<div className="px-4 sm:px-6 lg:px-8 py-8">
				<div className="max-w-7xl mx-auto">
					<AdminTopNav />
					<AnalyticsSubNav />
					<div>
						{/* Key Metrics */}
						<div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
							<KpiCard gradient="blue" label="Total Reach" value={analyticsData.totalReach} delta="+12.5%" />
							<KpiCard gradient="green" label="Avg Engagement" value={analyticsData.engagement} delta="+2.3%" />
							<KpiCard gradient="purple" label="New Followers" value={analyticsData.newFollowers} delta="+18.7%" />
							<KpiCard gradient="orange" label="Total Clicks" value={analyticsData.clicks} delta="+8.1%" />
						</div>

						{/* Charts Section */}
						<div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
							<PlaceholderChart color="blue" title="Engagement Trend" subtitle="Engagement over time" icon="bars" />
							<PlaceholderChart color="green" title="Platform Performance" subtitle="Performance by platform" icon="pie" />
						</div>

						{/* Top Posts */}
						<div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
							<div className="p-6 border-b border-gray-200 flex items-center gap-3">
								<div className="w-6 h-6 bg-purple-500 rounded-full" />
								<h3 className="text-2xl font-bold text-gray-800">Top Performing Posts</h3>
							</div>
							<div className="overflow-x-auto">
								<table className="w-full">
									<caption className="sr-only">Top performing social posts with engagement and reach metrics</caption>
									<thead className="bg-gray-50">
										<tr>
											<Th>Content</Th><Th>Platform</Th><Th>Engagement</Th><Th>Reach</Th><Th>Actions</Th>
										</tr>
									</thead>
									<tbody className="bg-white divide-y divide-gray-200">
										{topPosts.map(post => (
											<tr key={post.id} className="hover:bg-gray-50">
												<Td>{post.content}</Td>
												<Td>
													<span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
														post.platform === 'Facebook' ? 'bg-blue-100 text-blue-800' :
														post.platform === 'Instagram' ? 'bg-pink-100 text-pink-800' :
														post.platform === 'Twitter/X' ? 'bg-gray-100 text-gray-800' : 'bg-blue-100 text-blue-800'
													}`}>{post.platform}</span>
												</Td>
												<Td>{post.engagement}</Td>
												<Td>{post.reach}</Td>
												<Td><button aria-label={`View details for post ${post.id}`} className="text-blue-600 hover:text-blue-900">View Details</button></Td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						</div>

						{/* Insights and Reports widgets */}
						<div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
							<AudienceInsights />
							<CustomReports />
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

function MetricCard({ gradient, label, value, delta }: { gradient: string; label: string; value: string; delta: string; }) {
	return (
		<div className={`bg-gradient-to-br ${gradient} rounded-2xl p-6 text-white shadow-lg`}>
			<div className="text-center">
				<div className="text-4xl font-bold mb-2">{value}</div>
				<div className="text-white/90 text-sm font-medium">{label}</div>
				<div className="text-white/70 text-xs mt-1">{delta} vs last period</div>
			</div>
		</div>
	);
}

function PlaceholderChart({ color, title, subtitle, icon }: { color: string; title: string; subtitle: string; icon: 'bars' | 'pie'; }) {
	return (
		<div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
			<div className="flex items-center space-x-3 mb-6">
				<div className={`w-6 h-6 bg-${color}-500 rounded-full`} />
				<h3 className="text-xl font-bold text-gray-800">{title}</h3>
			</div>
			<div className="bg-gray-50 rounded-xl p-8 border-2 border-dashed border-gray-300 text-center text-gray-500">
				<div className="text-5xl mb-4" aria-hidden>{icon === 'bars' ? '📊' : '🥧'}</div>
				<p className="text-sm font-medium">{title}</p>
				<p className="text-xs">{subtitle}</p>
			</div>
		</div>
	);
}

function Th({ children }: { children: React.ReactNode }) { return <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{children}</th>; }
function Td({ children }: { children: React.ReactNode }) { return <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{children}</td>; }

