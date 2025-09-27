"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { withBasePath } from '@/lib/basePath';
import ManagerHeader from '@/components/ManagerHeader';
import ManagerTopNav from '@/components/ManagerTopNav';
import ManagerSectionBanner from '@/components/ManagerSectionBanner';
import { managerRouteMap } from '@/lib/managerNav';

export default function ManagerClientsPage() {
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

  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const fetchClients = async () => {
      try {
        // In a real app, this would filter by manager
        const res = await fetch(withBasePath('/api/clients?managerId=current'));
        if (res.ok) {
          const data = await res.json();
          setClients(data.clients || []);
        }
      } catch (error) {
        console.error('Error fetching clients:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, []);

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.contactPerson?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.industry?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || client.status.toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const activeClients = clients.filter(c => c.status === 'Active').length;
  const totalRevenue = clients.reduce((sum, c) => sum + (c.monthlyBudget || 0), 0);

  return (
    <div className="min-h-screen bg-[#f5f7fb]">
      <ManagerHeader title="SparQ Plug" subtitle="Client Portfolio Management" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
  <ManagerTopNav active={'clients'} onChange={(k)=>{ if (k==='clients') return; window.location.href = managerRouteMap[k as keyof typeof managerRouteMap]; }} />
        <div className="p-1">
          <ManagerSectionBanner
            icon="👥"
            title="My Clients"
            subtitle="Manage and monitor your assigned client portfolio"
            variant="purple"
          />
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
              <h3 className="text-lg font-medium text-white/90">Total Clients</h3>
              <p className="text-3xl font-bold mt-2">{clients.length}</p>
              <p className="text-blue-100 text-sm mt-1">Under your management</p>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white">
              <h3 className="text-lg font-medium text-white/90">Active Clients</h3>
              <p className="text-3xl font-bold mt-2">{activeClients}</p>
              <p className="text-green-100 text-sm mt-1">{clients.length > 0 ? ((activeClients / clients.length) * 100).toFixed(1) : 0}% active rate</p>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white">
              <h3 className="text-lg font-medium text-white/90">Monthly Revenue</h3>
              <p className="text-3xl font-bold mt-2">${totalRevenue.toLocaleString()}</p>
              <p className="text-purple-100 text-sm mt-1">From your clients</p>
            </div>
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white">
              <h3 className="text-lg font-medium text-white/90">Avg. Budget</h3>
              <p className="text-3xl font-bold mt-2">
                ${clients.length > 0 ? Math.round(totalRevenue / clients.length).toLocaleString() : 0}
              </p>
              <p className="text-orange-100 text-sm mt-1">Per client</p>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm mb-8 p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search clients by name, contact person, or industry..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  aria-label="Filter by status"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          {/* Client Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 animate-pulse">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-24"></div>
                      <div className="h-3 bg-gray-200 rounded w-16"></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
              ))
            ) : filteredClients.length > 0 ? (
              filteredClients.map((client) => (
                <div key={client.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-shadow duration-200">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-semibold text-sm">
                            {client.name.substring(0, 2).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{client.name}</h3>
                          <p className="text-sm text-gray-600">{client.industry}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        client.status === 'Active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {client.status}
                      </span>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                          <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                        </svg>
                        {client.email || 'No email'}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                        </svg>
                        {client.phone || 'No phone'}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" />
                        </svg>
                        ${client.monthlyBudget?.toLocaleString() || '0'}/month
                      </div>
                    </div>

                    <div className="flex space-x-2 mb-4">
                      {client.socialPlatforms?.slice(0, 3).map((platform, index) => (
                        <span key={index} className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                          {platform}
                        </span>
                      ))}
                      {client.socialPlatforms && client.socialPlatforms.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                          +{client.socialPlatforms.length - 3}
                        </span>
                      )}
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                      <Link 
                        href={`/manager/clients/${client.id}`}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                      >
                        View Profile
                      </Link>
                      <div className="text-xs text-gray-500">
                        Client since {new Date(client.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Clients Found</h3>
                <p className="text-gray-600">
                  {searchTerm || statusFilter !== 'all' 
                    ? 'Try adjusting your search or filter criteria.' 
                    : 'You haven\'t been assigned any clients yet.'
                  }
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}