import { NextRequest, NextResponse } from 'next/server';

// Mock data - in a real app, this would come from a database
const mockClients: Record<string, any> = {
  'tech-corp-1': {
    id: 'tech-corp-1',
    name: 'TechCorp Solutions',
    contactPerson: 'John Smith',
    email: 'john.smith@techcorp.com',
    phone: '+1 (555) 123-4567',
    website: 'https://techcorp.com',
    industry: 'Technology',
    companySize: '51-200',
    services: ['Content Creation', 'Social Media Management', 'Paid Advertising', 'Analytics & Reporting'],
    socialPlatforms: ['Facebook', 'Instagram', 'Twitter/X', 'LinkedIn'],
    monthlyBudget: 5000,
    goals: 'Increase brand awareness, generate leads, and establish thought leadership in the tech industry. Focus on B2B audience and showcase our innovative solutions.',
    currentFollowers: 12500,
    targetAudience: 'Tech professionals, startup founders, enterprise decision makers aged 25-55. Primarily focused on software development, cloud computing, and digital transformation.',
    contentPreferences: ['Videos', 'Infographics', 'Blog Posts', 'Case Studies'],
    postingFrequency: '3-4 times per week',
    timezone: 'EST',
    billingAddress: '123 Tech Street\nSan Francisco, CA 94105\nUnited States',
    notes: 'Very responsive client. Prefers video content over static images. Has strong opinions about brand voice - professional but approachable. Competitor analysis shows they need more thought leadership content.',
    status: 'Active' as const,
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-03-01T14:30:00Z',
    assignedManager: 'manager-1'
  },
  'restaurant-1': {
    id: 'restaurant-1',
    name: 'Bella Vista Restaurant',
    contactPerson: 'Mike Rodriguez',
    email: 'mike@bellavista.com',
    phone: '+1 (555) 456-7890',
    website: 'https://bellavista.com',
    industry: 'Food & Beverage',
    companySize: '1-10',
    services: ['Content Creation', 'Social Media Management', 'Community Management'],
    socialPlatforms: ['Instagram', 'Facebook', 'TikTok'],
    monthlyBudget: 2000,
    goals: 'Increase foot traffic, promote authentic Italian cuisine, and build local community engagement.',
    currentFollowers: 3200,
    targetAudience: 'Food lovers aged 25-55, families, date night couples, Italian cuisine enthusiasts.',
    contentPreferences: ['Photos', 'Videos', 'Stories', 'Live Streams'],
    postingFrequency: '2-3 times per week',
    timezone: 'CST',
    billingAddress: '789 Italian Street\nAustin, TX 78701\nUnited States',
    notes: 'Focus on authentic Italian recipes and fresh ingredients. Very active in local community events.',
    status: 'Active' as const,
    createdAt: '2024-01-20T12:00:00Z',
    updatedAt: '2024-02-28T11:20:00Z',
    assignedManager: 'manager-1'
  },
  'fitness-studio-1': {
    id: 'fitness-studio-1',
    name: 'Peak Performance Fitness',
    contactPerson: 'Amanda Chen',
    email: 'amanda@peakperformance.com',
    phone: '+1 (555) 321-9876',
    website: 'https://peakperformance.com',
    industry: 'Health & Fitness',
    companySize: '11-50',
    services: ['Content Creation', 'Social Media Management', 'Community Management'],
    socialPlatforms: ['Instagram', 'TikTok', 'Facebook', 'YouTube'],
    monthlyBudget: 3000,
    goals: 'Build fitness community, promote healthy lifestyle, increase membership sign-ups.',
    currentFollowers: 5800,
    targetAudience: 'Fitness enthusiasts aged 20-45, health-conscious individuals, local community members.',
    contentPreferences: ['Workout Videos', 'Transformation Stories', 'Tips & Advice', 'Live Workouts'],
    postingFrequency: 'Daily',
    timezone: 'PST',
    billingAddress: '321 Fitness Blvd\nSeattle, WA 98101\nUnited States',
    notes: 'High engagement audience. Loves before/after transformation content and workout challenges.',
    status: 'Active' as const,
    createdAt: '2024-02-15T09:00:00Z',
    updatedAt: '2024-03-01T10:15:00Z',
    assignedManager: 'manager-1'
  }
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: clientId } = await params;
    
    // In a real app, you would fetch from database
    // const client = await db.client.findUnique({ where: { id: clientId } });
    
    const client = mockClients[clientId];
    if (client) {
      return NextResponse.json({ 
        success: true, 
        client 
      });
    }
    
    return NextResponse.json(
      { success: false, error: 'Client not found' },
      { status: 404 }
    );
  } catch (error) {
    console.error('Error fetching client:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: clientId } = await params;
    const updates = await request.json();
    
    // In a real app, you would update the database
    // const updatedClient = await db.client.update({
    //   where: { id: clientId },
    //   data: updates
    // });
    
    const client = mockClients[clientId];
    if (client) {
      const updatedClient = { ...client, ...updates, updatedAt: new Date().toISOString() };
      return NextResponse.json({ 
        success: true, 
        client: updatedClient 
      });
    }
    
    return NextResponse.json(
      { success: false, error: 'Client not found' },
      { status: 404 }
    );
  } catch (error) {
    console.error('Error updating client:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}