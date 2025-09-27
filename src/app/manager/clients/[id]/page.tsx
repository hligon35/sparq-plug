'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { withBasePath } from '@/lib/basePath';
import ManagerHeader from '@/components/ManagerHeader';
import ManagerTopNav from '@/components/ManagerTopNav';

type Client = {
  id: string;
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  website?: string;
  industry?: string;
  companySize?: string;
  services?: string[];
  socialPlatforms?: string[];
  monthlyBudget?: number;
  goals?: string;
  currentFollowers?: number;
  targetAudience?: string;
  contentPreferences?: string[];
  postingFrequency?: string;
  timezone?: string;
  billingAddress?: string;
  notes?: string;
  status: 'Active' | 'Inactive';
  createdAt: string;
  updatedAt: string;
  assignedManager?: string;
};

type SocialAccount = {
  id: string;
  platform: string;
  accountName: string;
  handle: string;
  status: 'connected' | 'disconnected' | 'syncing';
  followers?: number;
  following?: number;
  posts?: number;
  engagement?: number;
  lastSync?: string;
  clientId?: string;
};

type BusinessInfo = {
  address?: string;
  businessHours?: string;
  businessType?: string;
  founded?: string;
  employees?: number;
  revenue?: string;
  marketingGoals?: string[];
  competitors?: string[];
  brandVoice?: string;
  keyMessages?: string[];
};

export default function ManagerClientProfilePage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params.id as string;

  const [client, setClient] = useState<Client | null>(null);
  const [socialAccounts, setSocialAccounts] = useState<SocialAccount[]>([]);
  const [businessInfo, setBusinessInfo] = useState<BusinessInfo>({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!clientId) return;
    
    const fetchClientData = async () => {
      try {
        setLoading(true);
        
        // Fetch client details
        const clientRes = await fetch(withBasePath(`/api/clients/${clientId}`));
        if (clientRes.ok) {
          const clientData = await clientRes.json();
          setClient(clientData.client);
        }

        // Fetch social accounts
        const accountsRes = await fetch(withBasePath(`/api/social-accounts?clientId=${clientId}`));
        if (accountsRes.ok) {
          const accountsData = await accountsRes.json();
          setSocialAccounts(accountsData.accounts || []);
        }

        // Fetch business info
        const businessRes = await fetch(withBasePath(`/api/clients/${clientId}/business-info`));
        if (businessRes.ok) {
          const businessData = await businessRes.json();
          setBusinessInfo(businessData.businessInfo || {});
        }

      } catch (error) {
        console.error('Error fetching client data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchClientData();
  }, [clientId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f7fb] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading client profile...</p>
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="min-h-screen bg-[#f5f7fb] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Client Not Found</h1>
          <p className="text-gray-600 mb-4">The requested client profile could not be found.</p>
          <Link href="/manager/clients" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
            Back to Clients
          </Link>
        </div>
      </div>
    );
  }

  const totalFollowers = socialAccounts.reduce((sum, account) => sum + (account.followers || 0), 0);
  const connectedAccounts = socialAccounts.filter(account => account.status === 'connected').length;
  const avgEngagement = socialAccounts.length > 0 
    ? (socialAccounts.reduce((sum, account) => sum + (account.engagement || 0), 0) / socialAccounts.length).toFixed(1)
    : '0';

  return (
    <div className="min-h-screen bg-[#f5f7fb]">
      <ManagerHeader title="SparQ Plug" subtitle="Client Profile" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <ManagerTopNav active={'clients'} onChange={(k)=>{ if (k==='clients') return; const map: Record<string,string> = { dashboard:'/manager', invoices:'/manager?tab=invoices', clients:'/manager/clients', analytics:'/manager/analytics', settings:'/manager/settings', tasks:'/manager/tasks' }; window.location.href = map[k]; }} />
        <div className="p-1">
          {/* Client Header Card */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm mb-8 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <span className="text-white font-bold text-2xl">
                      {client.name.substring(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <div className="text-white">
                    <h1 className="text-3xl font-bold mb-2">{client.name}</h1>
                    <div className="flex items-center space-x-4 text-white/90">
                      <span>{client.industry}</span>
                      <span>•</span>
                      <span>{client.companySize} employees</span>
                      <span>•</span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        client.status === 'Active' 
                          ? 'bg-green-500/20 text-green-100' 
                          : 'bg-red-500/20 text-red-100'
                      }`}>
                        {client.status}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right text-white/90">
                  <p className="text-sm">Your client since</p>
                  <p className="text-lg font-semibold">
                    {new Date(client.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-8 bg-gray-50">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-1">{connectedAccounts}</div>
                <div className="text-gray-600 text-sm">Social Accounts</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-1">{totalFollowers.toLocaleString()}</div>
                <div className="text-gray-600 text-sm">Total Followers</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-1">{avgEngagement}%</div>
                <div className="text-gray-600 text-sm">Avg Engagement</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600 mb-1">
                  ${client.monthlyBudget?.toLocaleString() || 0}
                </div>
                <div className="text-gray-600 text-sm">Monthly Budget</div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm mb-8">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-8">
                {[
                  { id: 'overview', label: 'Overview', icon: '📊' },
                  { id: 'social', label: 'Social Accounts', icon: '📱' },
                  { id: 'content', label: 'Content Strategy', icon: '📝' },
                  { id: 'contact', label: 'Contact Info', icon: '📞' },
                  { id: 'performance', label: 'Performance', icon: '📈' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <span className="mr-2">{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-8">
              {activeTab === 'overview' && (
                <div className="space-y-8">
                  {/* Client Goals */}
                  <div className="bg-blue-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">📋 Marketing Goals & Objectives</h3>
                    <p className="text-gray-700 mb-4">{client.goals || 'No goals specified'}</p>
                    
                    {businessInfo.marketingGoals && businessInfo.marketingGoals.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-600 mb-2">Key Goals:</h4>
                        <div className="flex flex-wrap gap-2">
                          {businessInfo.marketingGoals.map((goal, index) => (
                            <span key={index} className="px-3 py-1 bg-blue-200 text-blue-800 rounded-full text-sm">
                              {goal}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Target Audience */}
                  <div className="bg-green-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">🎯 Target Audience</h3>
                    <p className="text-gray-700">{client.targetAudience || 'No target audience specified'}</p>
                  </div>

                  {/* Brand Voice & Messaging */}
                  <div className="bg-purple-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">🎨 Brand Voice & Key Messages</h3>
                    {businessInfo.brandVoice && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-600 mb-2">Brand Voice:</h4>
                        <p className="text-gray-700">{businessInfo.brandVoice}</p>
                      </div>
                    )}
                    
                    {businessInfo.keyMessages && businessInfo.keyMessages.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-600 mb-2">Key Messages:</h4>
                        <div className="flex flex-wrap gap-2">
                          {businessInfo.keyMessages.map((message, index) => (
                            <span key={index} className="px-3 py-1 bg-purple-200 text-purple-800 rounded-full text-sm">
                              {message}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Competitors */}
                  {businessInfo.competitors && businessInfo.competitors.length > 0 && (
                    <div className="bg-red-50 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">🏆 Main Competitors</h3>
                      <div className="flex flex-wrap gap-2">
                        {businessInfo.competitors.map((competitor, index) => (
                          <span key={index} className="px-3 py-1 bg-red-200 text-red-800 rounded-full text-sm">
                            {competitor}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'social' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-semibold text-gray-800">Social Media Accounts</h3>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm">
                      Connect Account
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {socialAccounts.map((account) => (
                      <div key={account.id} className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-blue-600 font-semibold text-sm">
                                {account.platform.substring(0, 2).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900">{account.accountName}</h4>
                              <p className="text-sm text-gray-600">@{account.handle}</p>
                            </div>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            account.status === 'connected' 
                              ? 'bg-green-100 text-green-800'
                              : account.status === 'syncing'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {account.status}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4 text-center mb-4">
                          <div>
                            <p className="text-lg font-bold text-gray-900">{account.followers?.toLocaleString() || '0'}</p>
                            <p className="text-xs text-gray-600">Followers</p>
                          </div>
                          <div>
                            <p className="text-lg font-bold text-gray-900">{account.following?.toLocaleString() || '0'}</p>
                            <p className="text-xs text-gray-600">Following</p>
                          </div>
                          <div>
                            <p className="text-lg font-bold text-gray-900">{account.posts?.toLocaleString() || '0'}</p>
                            <p className="text-xs text-gray-600">Posts</p>
                          </div>
                        </div>

                        <div className="flex justify-between items-center">
                          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                            View Analytics
                          </button>
                          <button className="text-green-600 hover:text-green-700 text-sm font-medium">
                            Schedule Post
                          </button>
                        </div>

                        {account.lastSync && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <p className="text-xs text-gray-500">
                              Last synced: {new Date(account.lastSync).toLocaleString()}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {socialAccounts.length === 0 && (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Social Accounts</h3>
                      <p className="text-gray-600 mb-4">This client hasn't connected any social media accounts yet.</p>
                      <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
                        Connect First Account
                      </button>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'content' && (
                <div className="space-y-8">
                  {/* Content Preferences */}
                  <div className="bg-purple-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">📝 Content Preferences</h3>
                    <div className="flex flex-wrap gap-2">
                      {client.contentPreferences?.map((pref, index) => (
                        <span key={index} className="px-3 py-1 bg-purple-200 text-purple-800 rounded-full text-sm">
                          {pref}
                        </span>
                      )) || <span className="text-gray-500">No preferences specified</span>}
                    </div>
                  </div>

                  {/* Posting Schedule */}
                  <div className="bg-orange-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">📅 Posting Schedule</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <span className="text-sm text-gray-600">Frequency:</span>
                        <p className="font-medium text-lg">{client.postingFrequency || 'Not specified'}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Timezone:</span>
                        <p className="font-medium text-lg">{client.timezone || 'Not specified'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Content Calendar Preview */}
                  <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">📅 Upcoming Content</h3>
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <p className="text-gray-500 text-lg">Content Calendar</p>
                      <p className="text-gray-400 text-sm mb-4">Scheduled posts and content planning will appear here</p>
                      <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg">
                        Schedule New Post
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'contact' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Primary Contact</label>
                      <p className="text-lg font-semibold text-gray-900">{client.contactPerson || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Email Address</label>
                      <p className="text-lg font-semibold text-gray-900">
                        {client.email ? (
                          <a href={`mailto:${client.email}`} className="text-blue-600 hover:text-blue-700">
                            {client.email}
                          </a>
                        ) : 'Not specified'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Phone Number</label>
                      <p className="text-lg font-semibold text-gray-900">
                        {client.phone ? (
                          <a href={`tel:${client.phone}`} className="text-blue-600 hover:text-blue-700">
                            {client.phone}
                          </a>
                        ) : 'Not specified'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Website</label>
                      <p className="text-lg font-semibold text-gray-900">
                        {client.website ? (
                          <a href={client.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700">
                            {client.website}
                          </a>
                        ) : 'Not specified'}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Business Address</label>
                      <p className="text-lg text-gray-900">{businessInfo.address || client.billingAddress || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Business Hours</label>
                      <p className="text-lg text-gray-900">{businessInfo.businessHours || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Company Size</label>
                      <p className="text-lg text-gray-900">{client.companySize || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Founded</label>
                      <p className="text-lg text-gray-900">{businessInfo.founded || 'Not specified'}</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'performance' && (
                <div className="space-y-8">
                  {/* Performance Overview */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-green-50 rounded-xl p-6 text-center">
                      <div className="text-3xl font-bold text-green-600 mb-2">{totalFollowers.toLocaleString()}</div>
                      <div className="text-gray-600">Total Followers</div>
                      <div className="text-sm text-green-600 mt-1">+12% this month</div>
                    </div>
                    <div className="bg-blue-50 rounded-xl p-6 text-center">
                      <div className="text-3xl font-bold text-blue-600 mb-2">{avgEngagement}%</div>
                      <div className="text-gray-600">Avg Engagement</div>
                      <div className="text-sm text-blue-600 mt-1">+2.3% this month</div>
                    </div>
                    <div className="bg-purple-50 rounded-xl p-6 text-center">
                      <div className="text-3xl font-bold text-purple-600 mb-2">47</div>
                      <div className="text-gray-600">Posts This Month</div>
                      <div className="text-sm text-purple-600 mt-1">On schedule</div>
                    </div>
                  </div>

                  {/* Performance Chart Placeholder */}
                  <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">📈 Performance Trends</h3>
                    <div className="h-64 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                          <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                          </svg>
                        </div>
                        <p className="text-gray-500 text-lg">Performance Analytics</p>
                        <p className="text-gray-400 text-sm">Engagement, reach, and growth metrics will be displayed here</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex justify-between items-center bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <Link 
              href="/manager/clients" 
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium transition-colors"
            >
              ← Back to Clients
            </Link>
            <div className="flex space-x-4">
              <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                Schedule Content
              </button>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                Generate Report
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}