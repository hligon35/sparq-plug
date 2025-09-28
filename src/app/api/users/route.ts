import { NextRequest, NextResponse } from 'next/server';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  company?: string;
  jobTitle?: string;
  role: 'admin' | 'manager' | 'client';
  timezone: string;
  status: 'active' | 'inactive' | 'pending';
  createdAt: string;
  lastLogin?: string;
  invitedBy?: string;
}

interface CreateUserData {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  phone?: string;
  company?: string;
  jobTitle?: string;
  role: 'admin' | 'manager' | 'client';
  timezone: string;
  invitationToken?: string;
}

// Mock user storage (in production, use a database)
let users: User[] = [
  {
    id: '1',
    email: 'admin@sparqdigital.com',
    firstName: 'Admin',
    lastName: 'User',
    phone: '(555) 123-4567',
    company: 'SparQ Digital',
    jobTitle: 'System Administrator',
    role: 'admin',
    timezone: 'America/New_York',
    status: 'active',
    createdAt: '2025-01-01T00:00:00Z',
    lastLogin: '2025-09-24T08:00:00Z'
  },
  {
    id: '2',
    email: 'manager@sparqdigital.com',
    firstName: 'Manager',
    lastName: 'User',
    phone: '(555) 234-5678',
    company: 'SparQ Digital',
    jobTitle: 'Account Manager',
    role: 'manager',
    timezone: 'America/New_York',
    status: 'active',
    createdAt: '2025-01-15T00:00:00Z',
    lastLogin: '2025-09-24T09:30:00Z'
  }
];

function generateUserId(): string {
  return (users.length + 1).toString();
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');
  const role = searchParams.get('role');
  
  if (email) {
    const user = users.find(u => u.email === email);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    return NextResponse.json({ user });
  }
  
  let filteredUsers = users;
  if (role) {
    filteredUsers = users.filter(u => u.role === role);
  }
  
  // Remove sensitive information
  const publicUsers = filteredUsers.map(user => {
    const { ...publicUser } = user;
    return publicUser;
  });
  
  return NextResponse.json({ users: publicUsers });
}

export async function POST(request: NextRequest) {
  try {
    const data: CreateUserData = await request.json();
    
    // Validate required fields
    if (!data.email || !data.firstName || !data.lastName || !data.password || !data.role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Check if user already exists
    const existingUser = users.find(u => u.email === data.email);
    if (existingUser) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 409 });
    }
    
    // Validate password strength
    if (data.password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters long' }, { status: 400 });
    }
    
    // Create new user
    const newUser: User = {
      id: generateUserId(),
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      company: data.company,
      jobTitle: data.jobTitle,
      role: data.role,
      timezone: data.timezone || 'America/New_York',
      status: 'active',
      createdAt: new Date().toISOString()
    };
    
    // If created from invitation, mark as invited by the inviter
    if (data.invitationToken) {
      try {
        const invitationResponse = await fetch(`${request.nextUrl.origin}/api/invitations?token=${data.invitationToken}`);
        const invitationData = await invitationResponse.json();
        if (invitationData.invitation) {
          newUser.invitedBy = invitationData.invitation.invitedBy;
        }
      } catch (error) {
        console.error('Error fetching invitation data:', error);
      }
    }
    
    users.push(newUser);
    
    // In production, you would hash the password and store it securely
    console.log(`User created: ${data.email} with role: ${data.role}`);
    
    // Return user without sensitive data
    const { ...publicUser } = newUser;
    return NextResponse.json({ user: publicUser });
    
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { id, ...updateData } = await request.json();
    
    const userIndex = users.findIndex(u => u.id === id);
    if (userIndex === -1) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Update user
    users[userIndex] = { ...users[userIndex], ...updateData };
    
    const { ...publicUser } = users[userIndex];
    return NextResponse.json({ user: publicUser });
    
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  
  if (!id) {
    return NextResponse.json({ error: 'User ID required' }, { status: 400 });
  }
  
  const userIndex = users.findIndex(u => u.id === id);
  if (userIndex === -1) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }
  
  users.splice(userIndex, 1);
  
  return NextResponse.json({ success: true });
}