import { NextRequest, NextResponse } from 'next/server';

// Mock business info data
const mockBusinessInfo = {
  '1': {
    address: '123 Tech Street\nSan Francisco, CA 94105\nUnited States',
    businessHours: 'Monday - Friday: 9:00 AM - 6:00 PM PST\nSaturday: 10:00 AM - 2:00 PM PST\nSunday: Closed',
    businessType: 'Software Development & Consulting',
    founded: '2018',
    employees: 75,
    revenue: '$5M - $10M annually',
    marketingGoals: [
      'Increase brand awareness by 40%',
      'Generate 500 qualified leads per quarter',
      'Establish thought leadership',
      'Expand into new markets'
    ],
    competitors: [
      'CompetitorA Inc',
      'TechRival Solutions',
      'InnovateNow Corp',
      'DigitalPro Services'
    ],
    brandVoice: 'Professional yet approachable, innovative, trustworthy, and solution-focused. We speak to technical audiences while remaining accessible to business decision makers.',
    keyMessages: [
      'Innovation drives success',
      'Your technology partner',
      'Scalable solutions for growth',
      'Expert-driven results',
      'Future-ready technology'
    ]
  }
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: clientId } = await params;
    
    // In a real app, you would fetch from database
    const businessInfo = mockBusinessInfo[clientId as keyof typeof mockBusinessInfo];
    
    if (businessInfo) {
      return NextResponse.json({ 
        success: true, 
        businessInfo 
      });
    }
    
    return NextResponse.json({ 
      success: true, 
      businessInfo: {} 
    });
  } catch (error) {
    console.error('Error fetching business info:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const clientId = params.id;
    const updates = await request.json();
    
    // In a real app, you would update the database
    // const updatedBusinessInfo = await db.businessInfo.upsert({
    //   where: { clientId },
    //   update: updates,
    //   create: { clientId, ...updates }
    // });
    
    const currentInfo = mockBusinessInfo[clientId as keyof typeof mockBusinessInfo] || {};
    const updatedInfo = { ...currentInfo, ...updates };
    
    return NextResponse.json({ 
      success: true, 
      businessInfo: updatedInfo 
    });
  } catch (error) {
    console.error('Error updating business info:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}