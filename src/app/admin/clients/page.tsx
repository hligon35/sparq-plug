'use client';

import { useEffect, useState } from 'react';
import AdminTopNav from '@/components/AdminTopNav';
import AdminHeader from '@/components/AdminHeader';
import { withBasePath } from '@/lib/basePath';

export default function ClientsPage() {
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
  };

  type SocialAccount = {
    id: string;
    platform: string;
    accountName: string;
    handle: string;
    status: 'connected' | 'disconnected' | 'syncing';
    clientId?: string;
  };

  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  const [showClientDetails, setShowClientDetails] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedClientAccounts, setSelectedClientAccounts] = useState<SocialAccount[]>([]);

  const [showNewClientForm, setShowNewClientForm] = useState(false);
  const [formData, setFormData] = useState<{
    companyName: string;
    contactPerson: string;
    email: string;
    phone: string;
    website: string;
    industry: string;
    companySize: string;
    services: string[];
    socialPlatforms: string[];
    monthlyBudget: string;
    goals: string;
    currentFollowers: string;
    targetAudience: string;
    contentPreferences: string[];
    postingFrequency: string;
    timezone: string;
    billingAddress: string;
    notes: string;
  }>({
    companyName: '',
    contactPerson: '',
    email: '',
    phone: '',
    website: '',
    industry: '',
    companySize: '',
    services: [],
    socialPlatforms: [],
    monthlyBudget: '',
    goals: '',
    currentFollowers: '',
    targetAudience: '',
    contentPreferences: [],
    postingFrequency: '',
    timezone: '',
    billingAddress: '',
    notes: ''
  });

  const industries = [
    'Technology', 'Healthcare', 'Finance', 'E-commerce', 'Education', 'Food & Beverage',
    'Fashion & Beauty', 'Real Estate', 'Entertainment', 'Non-profit', 'Automotive', 'Other'
  ];

  const companySizes = ['1-10', '11-50', '51-200', '201-1000', '1000+'];

  const serviceOptions = [
    'Content Creation', 'Social Media Management', 'Paid Advertising', 'Analytics & Reporting',
    'Influencer Marketing', 'Community Management', 'Strategy Consulting', 'Brand Development'
  ];

  const platformOptions = [
    'Facebook', 'Instagram', 'Twitter/X', 'LinkedIn', 'TikTok', 'YouTube', 'Pinterest', 'Snapchat'
  ];

  const contentTypes = [
    'Photos', 'Videos', 'Stories', 'Reels', 'Live Streams', 'Blog Posts', 'Infographics', 'User-Generated Content'
  ];

  const postingFrequencies = [
    'Daily', '3-4 times per week', '2-3 times per week', 'Weekly', 'Bi-weekly', 'Monthly'
  ];

  const timezones = [
    'EST', 'CST', 'MST', 'PST', 'GMT', 'CET', 'JST', 'AEST'
  ];

  const handleAddClient = () => {
    setShowNewClientForm(true);
  };

  const handleCloseForm = () => {
    setShowNewClientForm(false);
    setFormData({
      companyName: '',
      contactPerson: '',
      email: '',
      phone: '',
      website: '',
      industry: '',
      companySize: '',
      services: [],
      socialPlatforms: [],
      monthlyBudget: '',
      goals: '',
      currentFollowers: '',
      targetAudience: '',
      contentPreferences: [],
      postingFrequency: '',
      timezone: '',
      billingAddress: '',
      notes: ''
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckboxChange = (field: string, value: string) => {
    setFormData(prev => {
      const currentArray = prev[field as keyof typeof prev] as string[];
      return {
        ...prev,
        [field]: currentArray.includes(value)
          ? currentArray.filter(item => item !== value)
          : [...currentArray, value]
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: formData.companyName,
      contactPerson: formData.contactPerson,
      email: formData.email,
      phone: formData.phone,
      website: formData.website,
      industry: formData.industry,
      companySize: formData.companySize,
      services: formData.services,
      socialPlatforms: formData.socialPlatforms,
      monthlyBudget: Number(formData.monthlyBudget || 0),
      goals: formData.goals,
      currentFollowers: Number(formData.currentFollowers || 0),
      targetAudience: formData.targetAudience,
      contentPreferences: formData.contentPreferences,
      postingFrequency: formData.postingFrequency,
      timezone: formData.timezone,
      billingAddress: formData.billingAddress,
      notes: formData.notes,
    };
    const res = await fetch(withBasePath('/api/clients'), { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) });
    if (!res.ok) { alert('Failed to add client'); return; }
    const { client } = await res.json();
    setClients(prev => [...prev, client]);
    handleCloseForm();
  };

  const handleViewClient = async (client: Client) => {
    setSelectedClient(client);
    try {
      const res = await fetch(withBasePath(`/api/social-accounts?clientId=${encodeURIComponent(client.id)}`));
      if (res.ok) {
        const data = await res.json();
        setSelectedClientAccounts(data.accounts || []);
      } else {
        setSelectedClientAccounts([]);
      }
    } catch {
      setSelectedClientAccounts([]);
    }
    setShowClientDetails(true);
  };

  const handleCloseClientDetails = () => {
    setShowClientDetails(false);
    setSelectedClient(null);
  };

  // Allow closing the details modal with Escape key
  useEffect(() => {
    if (!showClientDetails) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleCloseClientDetails();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [showClientDetails]);

  // initial load
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(withBasePath('/api/clients'));
        if (res.ok) {
          const data = await res.json();
          setClients(data.clients || []);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Top nav handles routing via links; removed sidebar

  return (
    <div className="min-h-screen bg-[#f5f7fb]">
      <AdminHeader title="Client Management" subtitle="Manage your social media clients" />

      {/* Centered content with top nav pills */}
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          <AdminTopNav />
          {/* Main Content */}
          <div className="">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-cyan-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-gray-800">Client Management</h2>
            </div>
            <button 
              onClick={handleAddClient}
              className="bg-blue-600 hover:bg-blue-700 rounded-xl px-6 py-3 text-white font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Add New Client
            </button>
          </div>

          {/* Client Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
              <h3 className="text-lg font-medium text-white/90">Total Clients</h3>
              <p className="text-3xl font-bold mt-2">24</p>
              <p className="text-blue-100 text-sm mt-1">+3 this month</p>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white">
              <h3 className="text-lg font-medium text-white/90">Active Clients</h3>
              <p className="text-3xl font-bold mt-2">21</p>
              <p className="text-green-100 text-sm mt-1">87.5% active rate</p>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white">
              <h3 className="text-lg font-medium text-white/90">Total Revenue</h3>
              <p className="text-3xl font-bold mt-2">$48.2K</p>
              <p className="text-purple-100 text-sm mt-1">+12% from last month</p>
            </div>
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white">
              <h3 className="text-lg font-medium text-white/90">Avg. Accounts</h3>
              <p className="text-3xl font-bold mt-2">8.4</p>
              <p className="text-orange-100 text-sm mt-1">Per client</p>
            </div>
          </div>

          {/* Performance Overview Chart Placeholder */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm mb-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Client Performance Overview</h3>
            <div className="h-64 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                  </svg>
                </div>
                <p className="text-gray-500 text-lg">Client Performance Chart</p>
                <p className="text-gray-400 text-sm">Revenue, engagement, and growth metrics will be displayed here</p>
              </div>
            </div>
          </div>

          {/* Client List */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-800">Client List</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
          {(!loading ? clients : []).map((client) => (
                    <tr key={client.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-semibold text-sm">
                              {client.name.substring(0, 2).toUpperCase()}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{client.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          client.status === 'Active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {client.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button 
                          onClick={() => handleViewClient(client)}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
        {loading && <div className="p-6 text-gray-500">Loading...</div>}
              {!loading && clients.length === 0 && <div className="p-6 text-gray-500">No clients yet. Click Add New Client to get started.</div>}
            </div>
          </div>
        </div>
      </div>
      </div>

      {/* New Client Form Modal */}
      {showNewClientForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">Add New Client</h2>
                <button
                  onClick={handleCloseForm}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Close add client form"
                  title="Close"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Company Information */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Company Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Company Name *</label>
                    <input
                      type="text"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter company name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Contact Person *</label>
                    <input
                      type="text"
                      name="contactPerson"
                      value={formData.contactPerson}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter contact person name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter email address"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter phone number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                    <input
                      type="url"
                      name="website"
                      value={formData.website}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://example.com"
                    />
                  </div>
                  <div>
                    <label htmlFor="industry" className="block text-sm font-medium text-gray-700 mb-2">Industry *</label>
                    <select
                      id="industry"
                      name="industry"
                      value={formData.industry}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select industry</option>
                      {industries.map(industry => (
                        <option key={industry} value={industry}>{industry}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="companySize" className="block text-sm font-medium text-gray-700 mb-2">Company Size</label>
                    <select
                      id="companySize"
                      name="companySize"
                      value={formData.companySize}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select company size</option>
                      {companySizes.map(size => (
                        <option key={size} value={size}>{size} employees</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Budget *</label>
                    <input
                      type="number"
                      name="monthlyBudget"
                      value={formData.monthlyBudget}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter monthly budget"
                    />
                  </div>
                </div>
              </div>

              {/* Services */}
              <div className="bg-blue-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Services Required</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {serviceOptions.map(service => (
                    <label key={service} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.services.includes(service)}
                        onChange={() => handleCheckboxChange('services', service)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{service}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Social Platforms */}
              <div className="bg-purple-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Social Media Platforms</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {platformOptions.map(platform => (
                    <label key={platform} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.socialPlatforms.includes(platform)}
                        onChange={() => handleCheckboxChange('socialPlatforms', platform)}
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <span className="text-sm text-gray-700">{platform}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Content Strategy */}
              <div className="bg-green-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Content Strategy</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Current Followers</label>
                    <input
                      type="number"
                      name="currentFollowers"
                      value={formData.currentFollowers}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Total current followers across all platforms"
                    />
                  </div>
                  <div>
                    <label htmlFor="postingFrequency" className="block text-sm font-medium text-gray-700 mb-2">Posting Frequency</label>
                    <select
                      id="postingFrequency"
                      name="postingFrequency"
                      value={formData.postingFrequency}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="">Select posting frequency</option>
                      {postingFrequencies.map(freq => (
                        <option key={freq} value={freq}>{freq}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="timezone" className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                    <select
                      id="timezone"
                      name="timezone"
                      value={formData.timezone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="">Select timezone</option>
                      {timezones.map(tz => (
                        <option key={tz} value={tz}>{tz}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Content Preferences</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {contentTypes.map(content => (
                      <label key={content} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.contentPreferences.includes(content)}
                          onChange={() => handleCheckboxChange('contentPreferences', content)}
                          className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                        />
                        <span className="text-sm text-gray-700">{content}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Goals and Target Audience */}
              <div className="bg-orange-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Goals & Target Audience</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Marketing Goals</label>
                    <textarea
                      name="goals"
                      value={formData.goals}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="Describe primary marketing goals and objectives..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Target Audience</label>
                    <textarea
                      name="targetAudience"
                      value={formData.targetAudience}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="Describe target audience demographics, interests, etc..."
                    />
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Additional Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Billing Address</label>
                    <textarea
                      name="billingAddress"
                      value={formData.billingAddress}
                      onChange={handleInputChange}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                      placeholder="Enter complete billing address..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes</label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                      placeholder="Any additional notes, special requirements, or important information..."
                    />
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCloseForm}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors"
                >
                  Add Client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Client Details Modal */}
      {showClientDetails && selectedClient && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          role="dialog"
          aria-modal="true"
          onClick={handleCloseClientDetails}
        >
          <div className="bg-white rounded-2xl w-full max-w-3xl shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold text-sm">
                    {selectedClient.name.substring(0, 2).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{selectedClient.name}</h2>
                  <p className="text-sm text-gray-500">Client Details</p>
                </div>
              </div>
              <button
                onClick={handleCloseClientDetails}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Close client details"
                title="Close"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500">Status</p>
                  <p>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      selectedClient.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {selectedClient.status}
                    </span>
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500">Industry</p>
                  <p className="text-lg font-semibold text-gray-900">{selectedClient.industry || '—'}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500">Budget</p>
                  <p className="text-lg font-semibold text-gray-900">{selectedClient.monthlyBudget ? `$${selectedClient.monthlyBudget}` : '—'}</p>
                </div>
              </div>

              <div className="mt-2">
                <h3 className="text-sm font-semibold text-gray-800 mb-2">Social Accounts</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedClientAccounts.length === 0 && (
                    <div className="text-sm text-gray-500">No connected accounts for this client.</div>
                  )}
                  {selectedClientAccounts.map((a) => (
                    <div key={a.id} className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg p-3">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{a.accountName}</div>
                        <div className="text-xs text-gray-500">{a.platform} — @{a.handle}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs ${a.status === 'connected' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{a.status}</span>
                        {a.status === 'disconnected' ? (
                          <button
                            onClick={async () => {
                              await fetch(withBasePath(`/api/social-accounts?id=${encodeURIComponent(a.id)}`), { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ status: 'connected', lastSync: 'just now' }) });
                              const res = await fetch(withBasePath(`/api/social-accounts?clientId=${encodeURIComponent(selectedClient!.id)}`));
                              const data = await res.json();
                              setSelectedClientAccounts(data.accounts || []);
                            }}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >Reconnect</button>
                        ) : (
                          <button
                            onClick={async () => {
                              await fetch(withBasePath(`/api/social-accounts?id=${encodeURIComponent(a.id)}`), { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ status: 'disconnected', lastSync: new Date().toISOString() }) });
                              const res = await fetch(withBasePath(`/api/social-accounts?clientId=${encodeURIComponent(selectedClient!.id)}`));
                              const data = await res.json();
                              setSelectedClientAccounts(data.accounts || []);
                            }}
                            className="text-gray-600 hover:text-gray-800 text-sm"
                          >Disconnect</button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4">
                <h3 className="text-sm font-semibold text-gray-800 mb-2">Quick Add Account</h3>
                <QuickAddAccount clientId={selectedClient.id} onAdded={async () => {
                  const res = await fetch(withBasePath(`/api/social-accounts?clientId=${encodeURIComponent(selectedClient!.id)}`));
                  const data = await res.json();
                  setSelectedClientAccounts(data.accounts || []);
                }} />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 rounded-b-2xl">
              <button
                onClick={handleCloseClientDetails}
                className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function QuickAddAccount({ clientId, onAdded }: { clientId: string; onAdded: () => void }) {
  const [platform, setPlatform] = useState('Facebook');
  const [accountName, setAccountName] = useState('');
  const [handle, setHandle] = useState('');
  const [busy, setBusy] = useState(false);
  return (
    <div className="bg-gray-50 rounded-xl p-4 flex flex-col md:flex-row gap-3 items-end">
      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
  <select aria-label="Platform" value={platform} onChange={(e) => setPlatform(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg">
          {['Facebook','Instagram','Twitter/X','LinkedIn','TikTok'].map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <input value={accountName} onChange={(e) => setAccountName(e.target.value)} placeholder="Account name" className="px-3 py-2 border border-gray-300 rounded-lg" />
        <input value={handle} onChange={(e) => setHandle(e.target.value)} placeholder="Handle" className="px-3 py-2 border border-gray-300 rounded-lg" />
      </div>
      <button
        disabled={busy || !accountName || !handle}
        onClick={async () => {
          setBusy(true);
          try {
            const res = await fetch(withBasePath('/api/social-accounts'), { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ platform, accountName, handle, clientId }) });
            if (res.ok) {
              setAccountName('');
              setHandle('');
              onAdded();
            } else {
              alert('Failed to add account');
            }
          } finally {
            setBusy(false);
          }
        }}
        className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-4 py-2 rounded-lg"
      >
        {busy ? 'Adding...' : 'Add'}
      </button>
    </div>
  );
}