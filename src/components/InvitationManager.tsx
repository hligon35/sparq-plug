'use client';

import { useState, useEffect } from 'react';

interface Invitation {
  id: string;
  email: string;
  role: 'admin' | 'manager' | 'client';
  status: 'pending' | 'accepted' | 'expired';
  invitedBy: string;
  invitedAt: string;
  expiresAt: string;
  token: string;
  companyName?: string;
  message?: string;
}

interface InviteFormData {
  email: string;
  role: 'admin' | 'manager' | 'client';
  companyName: string;
  message: string;
}

interface InvitationManagerProps {
  currentUserEmail: string;
  currentUserRole: 'admin' | 'manager';
}

export default function InvitationManager({ currentUserEmail, currentUserRole }: InvitationManagerProps) {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState<InviteFormData>({
    email: '',
    role: 'client',
    companyName: '',
    message: ''
  });

  useEffect(() => {
    fetchInvitations();
  }, []);

  const fetchInvitations = async () => {
    try {
      const response = await fetch('/api/invitations');
      const data = await response.json();
      if (response.ok) {
        setInvitations(data.invitations);
      } else {
        setError('Failed to fetch invitations');
      }
    } catch (err) {
      setError('Failed to fetch invitations');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.email || !formData.role) {
      setError('Email and role are required');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    // Role restrictions for managers
    if (currentUserRole === 'manager' && formData.role !== 'client') {
      setError('Managers can only invite clients');
      return;
    }

    try {
      const response = await fetch('/api/invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          invitedBy: currentUserEmail
        })
      });

      const result = await response.json();

      if (response.ok) {
        setSuccess(`Invitation sent to ${formData.email}`);
        setFormData({
          email: '',
          role: 'client',
          companyName: '',
          message: ''
        });
        setShowInviteForm(false);
        fetchInvitations(); // Refresh the list
      } else {
        setError(result.error || 'Failed to send invitation');
      }
    } catch (err) {
      setError('Failed to send invitation');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const resendInvitation = async (invitation: Invitation) => {
    try {
      // Delete old invitation
      await fetch(`/api/invitations?token=${invitation.token}`, {
        method: 'DELETE'
      });

      // Create new invitation
      const response = await fetch('/api/invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: invitation.email,
          role: invitation.role,
          companyName: invitation.companyName,
          message: invitation.message,
          invitedBy: currentUserEmail
        })
      });

      if (response.ok) {
        setSuccess(`Invitation resent to ${invitation.email}`);
        fetchInvitations();
      } else {
        setError('Failed to resend invitation');
      }
    } catch (err) {
      setError('Failed to resend invitation');
    }
  };

  const cancelInvitation = async (token: string) => {
    try {
      const response = await fetch(`/api/invitations?token=${token}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setSuccess('Invitation cancelled');
        fetchInvitations();
      } else {
        setError('Failed to cancel invitation');
      }
    } catch (err) {
      setError('Failed to cancel invitation');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'expired': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">User Invitations</h2>
          <p className="text-gray-600">
            {currentUserRole === 'admin' 
              ? 'Invite and manage admins, managers, and clients' 
              : 'Invite and manage clients'
            }
          </p>
        </div>
        <button
          onClick={() => setShowInviteForm(!showInviteForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          {showInviteForm ? 'Cancel' : 'Send Invitation'}
        </button>
      </div>

      {(error || success) && (
        <div className={`p-4 rounded-md ${error ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
          {error || success}
        </div>
      )}

      {showInviteForm && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Send Invitation</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="user@example.com"
                />
              </div>

              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                  Role *
                </label>
                <select
                  id="role"
                  name="role"
                  required
                  value={formData.role}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {currentUserRole === 'admin' && (
                    <>
                      <option value="admin">Admin</option>
                      <option value="manager">Manager</option>
                    </>
                  )}
                  <option value="client">Client</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-1">
                Company Name
              </label>
              <input
                type="text"
                id="companyName"
                name="companyName"
                value={formData.companyName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Company or organization name"
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                Personal Message
              </label>
              <textarea
                id="message"
                name="message"
                rows={3}
                value={formData.message}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Optional welcome message..."
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowInviteForm(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Send Invitation
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Invitations</h3>
        </div>

        {invitations.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No invitations sent yet. Send your first invitation to get started.
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {invitations.map(invitation => (
              <div key={invitation.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h4 className="text-lg font-medium text-gray-900">{invitation.email}</h4>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(invitation.status)}`}>
                        {invitation.status}
                      </span>
                      <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                        {invitation.role}
                      </span>
                    </div>
                    
                    <div className="mt-2 text-sm text-gray-600 space-y-1">
                      <p>Invited by: {invitation.invitedBy}</p>
                      <p>Sent: {formatDate(invitation.invitedAt)}</p>
                      <p>Expires: {formatDate(invitation.expiresAt)}</p>
                      {invitation.companyName && <p>Company: {invitation.companyName}</p>}
                    </div>

                    {invitation.message && (
                      <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                        <p className="text-sm text-blue-800">{invitation.message}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col space-y-2">
                    {invitation.status === 'pending' && (
                      <div className="flex items-center justify-center gap-2.75">
                        <button
                          onClick={() => resendInvitation(invitation)}
                          className="w-1/4 px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                        >
                          Resend
                        </button>
                        <button
                          onClick={() => cancelInvitation(invitation.token)}
                          className="w-1/4 px-3 py-1 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                    
                    {invitation.status === 'pending' && (
                      <div className="text-xs text-gray-500 mt-4">
                        Invitation Link:
                        <br />
                        <code className="text-xs bg-gray-100 p-1 rounded break-all">
                          {`${window.location.origin}/register?token=${invitation.token}`}
                        </code>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}