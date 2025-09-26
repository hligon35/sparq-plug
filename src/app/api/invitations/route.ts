import { NextRequest, NextResponse } from 'next/server';

interface InvitationData {
  email: string;
  role: 'admin' | 'manager' | 'client';
  invitedBy: string;
  companyName?: string;
  message?: string;
}

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

// Mock invitation storage (in production, use a database)
let invitations: Invitation[] = [
  {
    id: '1',
    email: 'newmanager@example.com',
    role: 'manager',
    status: 'pending',
    invitedBy: 'admin@sparqdigital.com',
    invitedAt: '2025-09-24T10:00:00Z',
    expiresAt: '2025-10-01T10:00:00Z',
    token: 'mgr_abc123def456',
    companyName: 'SparQ Digital',
    message: 'Welcome to our team!'
  },
  {
    id: '2',
    email: 'newclient@techcorp.com',
    role: 'client',
    status: 'pending',
    invitedBy: 'manager@sparqdigital.com',
    invitedAt: '2025-09-24T14:30:00Z',
    expiresAt: '2025-10-01T14:30:00Z',
    token: 'client_xyz789abc012',
    companyName: 'TechCorp Solutions'
  }
];

function generateInvitationToken(role: string): string {
  const prefix = role === 'admin' ? 'admin_' : role === 'manager' ? 'mgr_' : 'client_';
  const randomString = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  return prefix + randomString;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');
  const email = searchParams.get('email');
  
  if (token) {
    // Get invitation by token
    const invitation = invitations.find(inv => inv.token === token && inv.status === 'pending');
    if (!invitation) {
      return NextResponse.json({ error: 'Invalid or expired invitation' }, { status: 404 });
    }
    
    // Check if expired
    if (new Date() > new Date(invitation.expiresAt)) {
      invitation.status = 'expired';
      return NextResponse.json({ error: 'Invitation has expired' }, { status: 410 });
    }
    
    return NextResponse.json({ invitation });
  }
  
  if (email) {
    // Get invitations for specific email
    const userInvitations = invitations.filter(inv => inv.email === email);
    return NextResponse.json({ invitations: userInvitations });
  }
  
  // Get all invitations (admin/manager only)
  return NextResponse.json({ invitations });
}

export async function POST(request: NextRequest) {
  try {
    const data: InvitationData = await request.json();
    
    // Validate required fields
    if (!data.email || !data.role || !data.invitedBy) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Check if user already has a pending invitation
    const existingInvitation = invitations.find(
      inv => inv.email === data.email && inv.status === 'pending'
    );
    
    if (existingInvitation) {
      return NextResponse.json({ error: 'User already has a pending invitation' }, { status: 409 });
    }
    
    // Create new invitation
    const invitation: Invitation = {
      id: (invitations.length + 1).toString(),
      email: data.email,
      role: data.role,
      status: 'pending',
      invitedBy: data.invitedBy,
      invitedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
      token: generateInvitationToken(data.role),
      companyName: data.companyName,
      message: data.message
    };
    
    invitations.push(invitation);
    
    // In production, you would send an email here
    console.log(`Invitation sent to ${data.email} with token: ${invitation.token}`);
    
    return NextResponse.json({ 
      invitation,
      invitationLink: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/register?token=${invitation.token}`
    });
    
  } catch (error) {
    console.error('Error creating invitation:', error);
    return NextResponse.json({ error: 'Failed to create invitation' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { token, status } = await request.json();
    
    const invitation = invitations.find(inv => inv.token === token);
    if (!invitation) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
    }
    
    invitation.status = status;
    
    return NextResponse.json({ invitation });
    
  } catch (error) {
    console.error('Error updating invitation:', error);
    return NextResponse.json({ error: 'Failed to update invitation' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');
  
  if (!token) {
    return NextResponse.json({ error: 'Token required' }, { status: 400 });
  }
  
  const index = invitations.findIndex(inv => inv.token === token);
  if (index === -1) {
    return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
  }
  
  invitations.splice(index, 1);
  
  return NextResponse.json({ success: true });
}