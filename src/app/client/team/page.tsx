'use client';

import { useState } from 'react';

export default function TeamPage() {
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<number | null>(null);

  const teamMembers = [
    { 
      id: 1, 
      name: 'Sarah Johnson', 
      email: 'sarah@company.com', 
      role: 'Content Manager', 
      status: 'active',
      avatar: 'SJ',
      lastActive: '2 minutes ago',
      permissions: ['create_posts', 'schedule_posts', 'view_analytics']
    },
    { 
      id: 2, 
      name: 'Mike Chen', 
      email: 'mike@company.com', 
      role: 'Social Media Specialist', 
      status: 'active',
      avatar: 'MC',
      lastActive: '1 hour ago',
      permissions: ['create_posts', 'schedule_posts']
    },
    { 
      id: 3, 
      name: 'Emily Davis', 
      email: 'emily@company.com', 
      role: 'Graphic Designer', 
      status: 'offline',
      avatar: 'ED',
      lastActive: '3 hours ago',
      permissions: ['media_upload', 'create_posts']
    },
    { 
      id: 4, 
      name: 'Alex Rodriguez', 
      email: 'alex@company.com', 
      role: 'Analytics Specialist', 
      status: 'active',
      avatar: 'AR',
      lastActive: '30 minutes ago',
      permissions: ['view_analytics', 'create_reports']
    }
  ];

  const pendingInvites = [
    { id: 1, email: 'john@company.com', role: 'Content Writer', sentDate: '2024-08-01' },
    { id: 2, email: 'lisa@company.com', role: 'Community Manager', sentDate: '2024-08-02' }
  ];

  const handleNavClick = (section: string) => {
    if (section === 'team') return;
    window.location.href = `/client/${section}`;
  };

  const handleInviteMember = () => {
    alert('Invite sent! In production, this would send an email invitation.');
    setShowInviteModal(false);
  };

  const handleRemoveMember = (memberId: number) => {
    if (confirm('Are you sure you want to remove this team member?')) {
      alert('Team member removed. In production, this would revoke access and update permissions.');
    }
  };

  const handleUpdateRole = (memberId: number, newRole: string) => {
    alert(`Role updated to ${newRole}. In production, this would update permissions and access levels.`);
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'active': return 'bg-green-500';
      case 'offline': return 'bg-gray-400';
      case 'away': return 'bg-yellow-500';
      default: return 'bg-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-purple-700 text-white p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
              <span className="text-white text-2xl">👥</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Team Management</h1>
              <p className="text-white/80 text-sm mt-1">Manage your team members and permissions</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowInviteModal(true)}
              className="bg-green-500/20 hover:bg-green-500/30 text-white px-4 py-2 rounded-lg transition-colors font-medium"
            >
              Invite Member
            </button>
            <button
              onClick={() => window.location.href = '/login'}
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-80 bg-gray-50 border-r border-gray-200 min-h-screen p-6">
          <nav className="space-y-3">
            <button 
              onClick={() => handleNavClick('')}
              className="w-full bg-white hover:bg-blue-50 rounded-xl p-4 text-gray-700 hover:text-blue-600 border border-gray-200 hover:border-blue-300 transition-all duration-200 shadow-sm hover:shadow"
            >
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-blue-400 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                  </svg>
                </div>
                <span className="font-medium">Dashboard</span>
              </div>
            </button>

            <div className="bg-purple-600 rounded-xl p-4 text-white shadow-lg">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm">👥</span>
                </div>
                <span className="font-medium">Team</span>
              </div>
            </div>

            <button 
              onClick={() => handleNavClick('content')}
              className="w-full bg-white hover:bg-blue-50 rounded-xl p-4 text-gray-700 hover:text-blue-600 border border-gray-200 hover:border-blue-300 transition-all duration-200 shadow-sm hover:shadow"
            >
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-green-400 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm">📝</span>
                </div>
                <span className="font-medium">Content & Posts</span>
              </div>
            </button>
          </nav>

          {/* Team Stats */}
          <div className="mt-8 bg-white rounded-xl p-4 border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-3">Team Overview</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Members</span>
                <span className="font-semibold text-green-600">{teamMembers.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Active Now</span>
                <span className="font-semibold text-blue-600">{teamMembers.filter(m => m.status === 'active').length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Pending Invites</span>
                <span className="font-semibold text-orange-600">{pendingInvites.length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          {/* Team Members */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Team Members</h2>
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              {teamMembers.map((member) => (
                <div key={member.id} className="border-b border-gray-100 last:border-b-0 p-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                          {member.avatar}
                        </div>
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${getStatusColor(member.status)} rounded-full border-2 border-white`}></div>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{member.name}</h3>
                        <p className="text-gray-600 text-sm">{member.email}</p>
                        <p className="text-gray-500 text-xs">Last active: {member.lastActive}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="font-medium text-gray-900">{member.role}</p>
                        <div className="flex space-x-1 mt-1">
                          {member.permissions.slice(0, 2).map((permission) => (
                            <span key={permission} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                              {permission.replace('_', ' ')}
                            </span>
                          ))}
                          {member.permissions.length > 2 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                              +{member.permissions.length - 2}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setSelectedMember(member.id)}
                          className="px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleRemoveMember(member.id)}
                          className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pending Invites */}
          {pendingInvites.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Pending Invites</h2>
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                {pendingInvites.map((invite) => (
                  <div key={invite.id} className="border-b border-gray-100 last:border-b-0 p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                          <span className="text-orange-600 text-xl">📧</span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{invite.email}</h3>
                          <p className="text-gray-600 text-sm">Invited as {invite.role}</p>
                          <p className="text-gray-500 text-xs">Sent: {invite.sentDate}</p>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={() => alert('Resending invite...')}
                          className="px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg text-sm"
                        >
                          Resend
                        </button>
                        <button
                          onClick={() => alert('Invite cancelled')}
                          className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[1000]">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md border border-gray-200 shadow-lg relative">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              onClick={() => setShowInviteModal(false)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Invite Team Member</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">Email Address</label>
                <input
                  type="email"
                  placeholder="Enter email address"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">Role</label>
                <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option>Content Manager</option>
                  <option>Social Media Specialist</option>
                  <option>Graphic Designer</option>
                  <option>Analytics Specialist</option>
                  <option>Community Manager</option>
                </select>
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleInviteMember}
                  className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
                >
                  Send Invite
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Member Edit Modal */}
      {selectedMember && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[1000]">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md border border-gray-200 shadow-lg relative">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              onClick={() => setSelectedMember(null)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Edit Team Member</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">Role</label>
                <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option>Content Manager</option>
                  <option>Social Media Specialist</option>
                  <option>Graphic Designer</option>
                  <option>Analytics Specialist</option>
                  <option>Community Manager</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">Permissions</label>
                <div className="space-y-2">
                  {['create_posts', 'schedule_posts', 'view_analytics', 'media_upload', 'create_reports'].map((permission) => (
                    <label key={permission} className="flex items-center">
                      <input type="checkbox" className="mr-2" defaultChecked={teamMembers.find(m => m.id === selectedMember)?.permissions.includes(permission)} />
                      <span className="text-sm text-gray-700">{permission.replace('_', ' ')}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setSelectedMember(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    alert('Member updated successfully!');
                    setSelectedMember(null);
                  }}
                  className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
