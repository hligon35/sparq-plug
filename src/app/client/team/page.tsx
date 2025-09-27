"use client";

import { useState } from 'react';
import ClientHeader from '@/components/ClientHeader';
import ClientTopNav from '@/components/ClientTopNav';
import TeamCollaboration from '@/components/TeamCollaboration';

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
    <div className="min-h-screen bg-[#f5f7fb]">
  <ClientHeader title="Team Management" subtitle="Manage your team members and permissions" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <ClientTopNav />
      </div>
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-gray-800">Team</h2>
          <button
            onClick={() => setShowInviteModal(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors font-medium"
          >
            Invite Member
          </button>
        </div>
        {/* Main Content */}
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
                          onClick={() => {
                            // TODO: Connect to real email invitation API
                            alert(`Invitation resent to ${invite.email}`);
                          }}
                          className="px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg text-sm"
                        >
                          Resend
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Are you sure you want to cancel the invitation for ${invite.email}?`)) {
                              // TODO: Connect to real API to cancel invitation
                              alert(`Invitation cancelled for ${invite.email}`);
                            }
                          }}
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
      </main>
      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[1000]">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md border border-gray-200 shadow-lg relative">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              onClick={() => setShowInviteModal(false)}
              aria-label="Close invite modal"
              title="Close"
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
                <select 
                  aria-label="Select role"
                  title="Role"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
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
              aria-label="Close edit member modal"
              title="Close"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Edit Team Member</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">Role</label>
                <select 
                  aria-label="Select role"
                  title="Role"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
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
      
      {/* Collaboration Widget */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <TeamCollaboration />
      </div>
    </div>
  );
}
