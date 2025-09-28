"use client";

import { useEffect, useState } from 'react';
import { withBasePath } from '@/lib/basePath';
import ClientHeader from '@/components/ClientHeader';
import ClientTopNav from '@/components/ClientTopNav';
import type { SocialAccount } from '@/app/api/social-accounts/route';

export default function SocialAccountsPage() {
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editing, setEditing] = useState<SocialAccount | null>(null);
  const [form, setForm] = useState({ accountName: '', handle: '' });

  const [connectedAccounts, setConnectedAccounts] = useState<SocialAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDisconnected, setShowDisconnected] = useState(false);

  async function loadAccounts() {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(withBasePath('/api/social-accounts'), { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to load accounts');
      const data = await res.json();
      setConnectedAccounts(Array.isArray(data.accounts) ? data.accounts : []);
    } catch (e: any) {
      setError(e.message || 'Failed to load accounts');
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { loadAccounts(); }, []);

  const availablePlatforms = [
    {
      platform: 'YouTube',
      description: 'Connect your YouTube channel to share video content',
      icon: '🎥',
      color: 'bg-red-500',
      status: 'available'
    },
    {
      platform: 'TikTok',
      description: 'Reach younger audiences with short-form video content',
      icon: '🎵',
      color: 'bg-black',
      status: 'available'
    },
    {
      platform: 'Pinterest',
      description: 'Share visual content and drive traffic to your website',
      icon: '📌',
      color: 'bg-red-600',
      status: 'available'
    },
    {
      platform: 'Snapchat',
      description: 'Engage with younger demographics through Stories',
      icon: '👻',
      color: 'bg-yellow-400',
      status: 'available'
    }
  ];

  const getPlatformIcon = (platform: string) => {
    const icons: { [key: string]: string } = {
      'Facebook': '📘',
      'Instagram': '📷',
      'Twitter/X': '🐦',
      'LinkedIn': '💼',
      'YouTube': '🎥',
      'TikTok': '🎵',
      'Pinterest': '📌',
      'Snapchat': '👻'
    };
    return icons[platform] || '📱';
  };

  const getPlatformColor = (platform: string) => {
    const colors: { [key: string]: string } = {
      'Facebook': 'bg-blue-500',
      'Instagram': 'bg-pink-500',
      'Twitter/X': 'bg-sky-400',
      'LinkedIn': 'bg-blue-700',
      'YouTube': 'bg-red-500',
      'TikTok': 'bg-black',
      'Pinterest': 'bg-red-600',
      'Snapchat': 'bg-yellow-400'
    };
    return colors[platform] || 'bg-gray-500';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'bg-green-100 text-green-800';
      case 'disconnected':
        return 'bg-red-100 text-red-800';
      case 'syncing':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleConnectPlatform = (platform: string) => {
    setSelectedPlatform(platform);
  setForm({ accountName: `${platform} Account`, handle: '@myhandle' });
    setShowConnectModal(true);
  };

  const handleDisconnect = async (accountId: string) => {
    if (!confirm('Disconnect this account?')) return;
    const res = await fetch(withBasePath(`/api/social-accounts?id=${encodeURIComponent(accountId)}`), { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ status: 'disconnected', lastSync: 'now' }) });
    if (res.ok) {
      await loadAccounts();
    } else {
      alert('Failed to disconnect');
    }
  };

  const handleDelete = async (accountId: string) => {
    if (!confirm('Permanently delete this account?')) return;
    const res = await fetch(withBasePath(`/api/social-accounts?id=${encodeURIComponent(accountId)}`), { method: 'DELETE' });
    if (res.ok) await loadAccounts();
    else alert('Failed to delete');
  };

  const openEdit = (account: SocialAccount) => {
    setEditing(account);
    setForm({ accountName: account.accountName, handle: account.handle });
    setShowEditModal(true);
  };

  const saveEdit = async () => {
    if (!editing) return;
    const res = await fetch(withBasePath(`/api/social-accounts?id=${encodeURIComponent(editing.id)}`), {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ accountName: form.accountName, handle: form.handle }),
    });
    if (res.ok) {
      setShowEditModal(false);
      setEditing(null);
      await loadAccounts();
    } else {
      alert('Failed to save');
    }
  };

  const handleReconnect = async (accountId: string) => {
    const res = await fetch(withBasePath(`/api/social-accounts?id=${encodeURIComponent(accountId)}`), {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ status: 'connected', lastSync: 'just now' }),
    });
    if (res.ok) await loadAccounts();
    else alert('Failed to reconnect');
  };

  return (
    <div className="min-h-screen bg-[#f5f7fb]">
  <ClientHeader title="SparQ Social Accounts" subtitle="Manage Your Connected Social Media Platforms" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <ClientTopNav />
      </div>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-gray-800">Social Accounts</h2>
            </div>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" className="rounded" checked={showDisconnected} onChange={e => setShowDisconnected(e.target.checked)} aria-label="Toggle show disconnected accounts" />
                Show disconnected
              </label>
              <button 
                onClick={() => setShowConnectModal(true)}
                className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-xl font-medium transition-colors shadow-lg"
              >
                Connect New Platform
              </button>
            </div>
          </div>
        {/* Connected Accounts */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm mb-8">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">Connected Accounts</h3>
            </div>
            <div className="p-6">
              {loading && <div className="text-gray-600">Loading accounts…</div>}
              {error && <div className="text-red-600">{error}</div>}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {connectedAccounts.filter(a => a.status === 'connected').map((account) => (
                  <div key={account.id} className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 ${getPlatformColor(account.platform)} rounded-xl flex items-center justify-center`}>
                          <span className="text-white text-2xl">{getPlatformIcon(account.platform)}</span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{account.accountName}</h4>
                          <p className="text-sm text-gray-600">{account.handle}</p>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(account.status)}`}>
                            {account.status}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => openEdit(account)}
                          className="text-gray-400 hover:text-blue-600 transition-colors"
                          aria-label={`Edit ${account.accountName}`}
                          title="Edit account"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M17.414 2.586a2 2 0 010 2.828l-9.9 9.9a1 1 0 01-.39.242l-3.5 1.167a1 1 0 01-1.267-1.267l1.167-3.5a1 1 0 01.242-.39l9.9-9.9a2 2 0 012.828 0zM5.121 12.121l2.758 2.758" />
                          </svg>
                        </button>
                        <button 
                          onClick={() => handleDisconnect(account.id)}
                          className="text-gray-400 hover:text-yellow-600 transition-colors"
                          aria-label={`Disconnect ${account.accountName}`}
                          title="Disconnect account"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                          </svg>
                        </button>
                        <button 
                          onClick={() => handleDelete(account.id)}
                          className="text-gray-400 hover:text-red-600 transition-colors"
                          aria-label={`Delete ${account.accountName}`}
                          title="Delete account"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M6 8a1 1 0 011-1h6a1 1 0 011 1v8a2 2 0 01-2 2H8a2 2 0 01-2-2V8zm3-3a1 1 0 011-1h0a1 1 0 011 1v1H9V5z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="text-center">
                        <p className="text-lg font-bold text-gray-900">{account.followers?.toLocaleString?.() || account.followers}</p>
                        <p className="text-xs text-gray-600">Followers</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-gray-900">{account.posts}</p>
                        <p className="text-xs text-gray-600">Posts</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-gray-900">{account.engagement}%</p>
                        <p className="text-xs text-gray-600">Engagement</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Last sync: {account.lastSync}</span>
                      <button className="text-teal-600 hover:text-teal-800 font-medium">
                        Sync Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        {showDisconnected && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm mb-8">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">Disconnected Accounts</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {connectedAccounts.filter(a => a.status === 'disconnected').map((account) => (
                  <div key={account.id} className="bg-gray-50 rounded-xl p-6 border border-gray-200 opacity-80">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 ${getPlatformColor(account.platform)} rounded-xl flex items-center justify-center`}>
                          <span className="text-white text-2xl">{getPlatformIcon(account.platform)}</span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{account.accountName}</h4>
                          <p className="text-sm text-gray-600">{account.handle}</p>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(account.status)}`}>
                            {account.status}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleReconnect(account.id)}
                          className="text-gray-400 hover:text-green-600 transition-colors"
                          aria-label={`Reconnect ${account.accountName}`}
                          title="Reconnect account"
                        >
                          <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M4 4v4h4M16 16v-4h-4"/>
                            <path d="M5 11a6 6 0 019.9-2.6" stroke="currentColor" strokeWidth="2" fill="none"/>
                            <path d="M15 9a6 6 0 01-9.9 2.6" stroke="currentColor" strokeWidth="2" fill="none"/>
                          </svg>
                        </button>
                        <button 
                          onClick={() => handleDelete(account.id)}
                          className="text-gray-400 hover:text-red-600 transition-colors"
                          aria-label={`Delete ${account.accountName}`}
                          title="Delete account"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M6 8a1 1 0 011-1h6a1 1 0 011 1v8a2 2 0 01-2 2H8a2 2 0 01-2-2V8zm3-3a1 1 0 011-1h0a1 1 0 011 1v1H9V5z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="text-center">
                        <p className="text-lg font-bold text-gray-900">{account.followers?.toLocaleString?.() || account.followers}</p>
                        <p className="text-xs text-gray-600">Followers</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-gray-900">{account.posts}</p>
                        <p className="text-xs text-gray-600">Posts</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-gray-900">{account.engagement}%</p>
                        <p className="text-xs text-gray-600">Engagement</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Last sync: {account.lastSync}</span>
                      <button className="text-teal-600 hover:text-teal-800 font-medium" onClick={() => handleReconnect(account.id)}>
                        Reconnect
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Available Platforms */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">Available Platforms</h3>
              <p className="text-gray-600 mt-1">Connect additional social media platforms to expand your reach</p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {availablePlatforms.map((platform) => (
                  <div key={platform.platform} className="border border-gray-200 rounded-xl p-6 hover:border-teal-300 transition-colors">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className={`w-12 h-12 ${platform.color} rounded-xl flex items-center justify-center`}>
                        <span className="text-white text-2xl">{platform.icon}</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{platform.platform}</h4>
                        <p className="text-sm text-gray-600">{platform.description}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleConnectPlatform(platform.platform)}
                      className="w-full bg-teal-600 hover:bg-teal-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                    >
                      Connect {platform.platform}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
      </main>

      {/* Connect Platform Modal */}
      {showConnectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-800">
                  Connect {selectedPlatform || 'New Platform'}
                </h2>
                <button
                  onClick={() => setShowConnectModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Close connect platform modal"
                  title="Close"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6">
              {selectedPlatform ? (
                <div className="text-center">
                  <div className={`w-16 h-16 ${getPlatformColor(selectedPlatform)} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                    <span className="text-white text-3xl">{getPlatformIcon(selectedPlatform)}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Connect your {selectedPlatform} account</h3>
                  <p className="text-gray-600 mb-6">
                    You'll be redirected to {selectedPlatform} to authorize SparQ to manage your account.
                  </p>
                  <div className="space-y-4 text-left">
                    <div>
                      <label htmlFor="accName" className="block text-sm font-medium text-gray-700 mb-1">Account Name</label>
                      <input id="accName" className="w-full border border-gray-300 rounded-lg px-3 py-2" value={form.accountName} onChange={e => setForm(f => ({ ...f, accountName: e.target.value }))} />
                    </div>
                    <div>
                      <label htmlFor="accHandle" className="block text-sm font-medium text-gray-700 mb-1">Handle</label>
                      <input id="accHandle" className="w-full border border-gray-300 rounded-lg px-3 py-2" value={form.handle} onChange={e => setForm(f => ({ ...f, handle: e.target.value }))} />
                    </div>
                    <button 
                      onClick={async () => {
                        if (!selectedPlatform) return;
                        // For demo: create a placeholder connected account
                        const payload = {
                          platform: selectedPlatform,
                          accountName: form.accountName || `${selectedPlatform} Account`,
                          handle: form.handle || '@myhandle',
                        };
                        const res = await fetch(withBasePath('/api/social-accounts'), {
                          method: 'POST',
                          headers: { 'content-type': 'application/json' },
                          body: JSON.stringify(payload),
                        });
                        if (res.ok) {
                          await loadAccounts();
                          setShowConnectModal(false);
                          setSelectedPlatform('');
                          setForm({ accountName: '', handle: '' });
                        } else {
                          alert('Failed to connect');
                        }
                      }}
                      className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
                    >
                      Continue to {selectedPlatform}
                    </button>
                    <button
                      onClick={() => setShowConnectModal(false)}
                      className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Select a platform to connect</h3>
                  <div className="space-y-3">
                    {availablePlatforms.map((platform) => (
                      <button
                        key={platform.platform}
                        onClick={() => setSelectedPlatform(platform.platform)}
                        className="w-full flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:border-teal-300 transition-colors"
                      >
                        <div className={`w-8 h-8 ${platform.color} rounded-lg flex items-center justify-center`}>
                          <span className="text-white text-lg">{platform.icon}</span>
                        </div>
                        <span className="font-medium text-gray-900">{platform.platform}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800">Edit Account</h2>
              <button onClick={() => setShowEditModal(false)} aria-label="Close edit" title="Close" className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label htmlFor="editName" className="block text-sm font-medium text-gray-700 mb-1">Account Name</label>
                <input id="editName" className="w-full border border-gray-300 rounded-lg px-3 py-2" value={form.accountName} onChange={e => setForm(f => ({ ...f, accountName: e.target.value }))} />
              </div>
              <div>
                <label htmlFor="editHandle" className="block text-sm font-medium text-gray-700 mb-1">Handle</label>
                <input id="editHandle" className="w-full border border-gray-300 rounded-lg px-3 py-2" value={form.handle} onChange={e => setForm(f => ({ ...f, handle: e.target.value }))} />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={saveEdit} className="flex-1 bg-teal-600 hover:bg-teal-700 text-white py-2 rounded-lg font-medium">Save</button>
                <button onClick={() => setShowEditModal(false)} className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-50">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
