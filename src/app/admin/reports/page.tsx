'use client';

import { useState } from 'react';
import AdminTopNav from '@/components/AdminTopNav';
import AdminHeader from '@/components/AdminHeader';

interface ReportData {
  id: string;
  name: string;
  type: 'Analytics' | 'Client' | 'Revenue' | 'Performance';
  description: string;
  lastGenerated: string;
  size: string;
  format: 'PDF' | 'Excel' | 'CSV';
}

const mockReports: ReportData[] = [
  {
    id: '1',
    name: 'Monthly Analytics Report',
    type: 'Analytics',
    description: 'Complete analytics overview for all clients',
    lastGenerated: '2025-09-24',
    size: '2.4 MB',
    format: 'PDF'
  },
  {
    id: '1b',
    name: 'Social Channel Performance',
    type: 'Analytics',
    description: 'Engagement, reach, top posts across all connected social platforms',
    lastGenerated: '2025-09-24',
    size: '1.1 MB',
    format: 'PDF'
  },
  {
    id: '1c',
    name: 'Website Traffic & Conversions',
    type: 'Analytics',
    description: 'Aggregated website views, visitors, conversion rate & load performance',
    lastGenerated: '2025-09-24',
    size: '1.6 MB',
    format: 'Excel'
  },
  {
    id: '2',
    name: 'Client Performance Summary',
    type: 'Client',
    description: 'Performance metrics and engagement data per client',
    lastGenerated: '2025-09-23',
    size: '1.8 MB',
    format: 'Excel'
  },
  {
    id: '3',
    name: 'Revenue Report Q3 2025',
    type: 'Revenue',
    description: 'Quarterly revenue breakdown and projections',
    lastGenerated: '2025-09-22',
    size: '956 KB',
    format: 'PDF'
  },
  {
    id: '4',
    name: 'Social Media Performance',
    type: 'Performance',
    description: 'Cross-platform performance metrics and insights',
    lastGenerated: '2025-09-21',
    size: '3.1 MB',
    format: 'Excel'
  },
  {
    id: '5',
    name: 'Client Activity Export',
    type: 'Client',
    description: 'Detailed client activity and usage statistics',
    lastGenerated: '2025-09-20',
    size: '1.2 MB',
    format: 'CSV'
  }
];

export default function ReportsPage() {
  const [selectedType, setSelectedType] = useState<string>('All');
  const [dateRange, setDateRange] = useState('30d');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newReport, setNewReport] = useState({
    name: '',
    type: 'Analytics' as ReportData['type'],
    description: '',
    format: 'PDF' as ReportData['format']
  });

  const reportTypes = ['All', 'Analytics', 'Client', 'Revenue', 'Performance'];
  const dateRanges = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 90 days' },
    { value: '1y', label: 'Last year' }
  ];

  const filteredReports = mockReports.filter(report => 
    selectedType === 'All' || report.type === selectedType
  );

  const handleGenerateReport = () => {
    if (!newReport.name || !newReport.description) {
      alert('Please fill in all fields');
      return;
    }
    // TODO: Connect to real backend API
    alert('Report generation started! You will be notified when it\'s ready.');
    setNewReport({ name: '', type: 'Analytics', description: '', format: 'PDF' });
    setShowCreateModal(false);
  };

  const handleDownloadReport = (reportId: string) => {
    // TODO: Connect to real backend API
    alert(`Downloading report ${reportId}...`);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Analytics': return 'bg-blue-100 text-blue-700';
      case 'Client': return 'bg-green-100 text-green-700';
      case 'Revenue': return 'bg-purple-100 text-purple-700';
      case 'Performance': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'PDF': return '📄';
      case 'Excel': return '📊';
      case 'CSV': return '📋';
      default: return '📄';
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f7fb]">
      <AdminHeader title="Admin Reports" subtitle="Generate and manage business reports and analytics" />

      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          <AdminTopNav />

          {/* Page Header Actions */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V4a2 2 0 00-2-2H6zm1 2a1 1 0 000 2h6a1 1 0 100-2H7zm6 7a1 1 0 01-1 1H8a1 1 0 110-2h4a1 1 0 011 1zm-1 4a1 1 0 100-2H8a1 1 0 100 2h4z" clipRule="evenodd" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-gray-800">Reports & Analytics</h2>
            </div>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-medium transition-colors shadow-lg"
            >
              Generate Report
            </button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Total Reports</p>
                  <p className="text-2xl font-bold">{mockReports.length}</p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <span className="text-white text-xl">📊</span>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">This Month</p>
                  <p className="text-2xl font-bold">12</p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <span className="text-white text-xl">📈</span>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Automated</p>
                  <p className="text-2xl font-bold">8</p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <span className="text-white text-xl">⚡</span>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm">Downloads</p>
                  <p className="text-2xl font-bold">234</p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <span className="text-white text-xl">📥</span>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm mb-8">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="flex gap-2 overflow-x-auto">
                {reportTypes.map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                      selectedType === type
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-purple-100'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
              
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium text-gray-700">Date Range:</label>
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  title="Select date range"
                >
                  {dateRanges.map((range) => (
                    <option key={range.value} value={range.value}>
                      {range.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Reports List */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Available Reports</h3>
            </div>
            
            <div className="divide-y divide-gray-200">
              {filteredReports.map((report) => (
                <div key={report.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-2xl">
                        {getFormatIcon(report.format)}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="text-lg font-semibold text-gray-900">{report.name}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(report.type)}`}>
                            {report.type}
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm mb-2">{report.description}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>Generated {new Date(report.lastGenerated).toLocaleDateString()}</span>
                          <span>•</span>
                          <span>{report.size}</span>
                          <span>•</span>
                          <span>{report.format}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleDownloadReport(report.id)}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                      >
                        Download
                      </button>
                      <button className="border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                        Share
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {filteredReports.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No reports found</h3>
              <p className="text-gray-500">Try adjusting your filters or generate a new report.</p>
            </div>
          )}

          {/* Create Report Modal */}
          {showCreateModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-2xl p-8 max-w-md w-full">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Generate New Report</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Report Name</label>
                    <input
                      type="text"
                      value={newReport.name}
                      onChange={(e) => setNewReport({ ...newReport, name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Enter report name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
                    <select
                      value={newReport.type}
                      onChange={(e) => setNewReport({ ...newReport, type: e.target.value as ReportData['type'] })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      title="Select report type"
                    >
                      <option value="Analytics">Analytics</option>
                      <option value="Client">Client</option>
                      <option value="Revenue">Revenue</option>
                      <option value="Performance">Performance</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Format</label>
                    <select
                      value={newReport.format}
                      onChange={(e) => setNewReport({ ...newReport, format: e.target.value as ReportData['format'] })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      title="Select report format"
                    >
                      <option value="PDF">PDF</option>
                      <option value="Excel">Excel</option>
                      <option value="CSV">CSV</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      value={newReport.description}
                      onChange={(e) => setNewReport({ ...newReport, description: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      rows={3}
                      placeholder="Describe this report"
                    />
                  </div>
                </div>
                
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleGenerateReport}
                    className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Generate
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}