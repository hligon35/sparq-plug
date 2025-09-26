import { NextRequest, NextResponse } from 'next/server';
import { readJson, writeJson } from '@/lib/storage';

export type Client = {
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

const STORE_KEY = 'clients';

// Mock client data for development
const mockClients: Client[] = [
  {
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
    goals: 'Increase brand awareness, generate leads, and establish thought leadership in the tech industry.',
    currentFollowers: 12500,
    targetAudience: 'Tech professionals, startup founders, enterprise decision makers aged 25-55.',
    contentPreferences: ['Videos', 'Infographics', 'Blog Posts', 'Case Studies'],
    postingFrequency: '3-4 times per week',
    timezone: 'EST',
    billingAddress: '123 Tech Street\nSan Francisco, CA 94105\nUnited States',
    notes: 'Very responsive client. Prefers video content over static images.',
    status: 'Active',
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-03-01T14:30:00Z',
  },
  {
    id: 'fashion-forward-1',
    name: 'Fashion Forward Boutique',
    contactPerson: 'Sarah Johnson',
    email: 'sarah@fashionforward.com',
    phone: '+1 (555) 987-6543',
    website: 'https://fashionforward.com',
    industry: 'Fashion & Beauty',
    companySize: '11-50',
    services: ['Content Creation', 'Social Media Management', 'Influencer Marketing'],
    socialPlatforms: ['Instagram', 'TikTok', 'Pinterest', 'Facebook'],
    monthlyBudget: 3500,
    goals: 'Increase online sales, build brand community, and showcase seasonal collections.',
    currentFollowers: 8900,
    targetAudience: 'Fashion-conscious women aged 18-35, interested in trendy, affordable clothing.',
    contentPreferences: ['Photos', 'Videos', 'Stories', 'Reels'],
    postingFrequency: 'Daily',
    timezone: 'PST',
    billingAddress: '456 Fashion Ave\nLos Angeles, CA 90210\nUnited States',
    notes: 'Seasonal campaigns are very important. Peak seasons: Spring/Summer launch, Holiday shopping.',
    status: 'Active',
    createdAt: '2024-02-01T10:00:00Z',
    updatedAt: '2024-03-01T16:45:00Z',
  },
  {
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
    status: 'Active',
    createdAt: '2024-01-20T12:00:00Z',
    updatedAt: '2024-02-28T11:20:00Z',
  },
  {
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
    status: 'Active',
    createdAt: '2024-02-15T09:00:00Z',
    updatedAt: '2024-03-01T10:15:00Z',
  }
];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const managerId = searchParams.get('managerId');
  
  // Try to get clients from storage first
  const storedClients = await readJson<Client[]>(STORE_KEY, []);
  
  let clients = storedClients.length > 0 ? storedClients : mockClients;
  
  // If managerId is specified, filter by manager's assigned clients
  if (managerId === 'current') {
    // In a real app, you'd get the manager's assigned clients from the database
    // For now, we'll assume the current manager has access to specific clients
    const managerClientIds = ['tech-corp-1', 'restaurant-1', 'fitness-studio-1'];
    clients = clients.filter(client => managerClientIds.includes(client.id));
  }
  
  return NextResponse.json({ clients });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body || !body.name) {
    return NextResponse.json({ error: 'name is required' }, { status: 400 });
  }
  const now = new Date().toISOString();
  const clients = await readJson<Client[]>(STORE_KEY, []);
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const newClient: Client = {
    id,
    name: String(body.name),
    contactPerson: body.contactPerson ? String(body.contactPerson) : undefined,
    email: body.email ? String(body.email) : undefined,
    phone: body.phone ? String(body.phone) : undefined,
    website: body.website ? String(body.website) : undefined,
    industry: body.industry ? String(body.industry) : undefined,
    companySize: body.companySize ? String(body.companySize) : undefined,
    services: Array.isArray(body.services) ? body.services.map(String) : [],
    socialPlatforms: Array.isArray(body.socialPlatforms) ? body.socialPlatforms.map(String) : [],
    monthlyBudget: body.monthlyBudget !== undefined ? Number(body.monthlyBudget) : undefined,
    goals: body.goals ? String(body.goals) : undefined,
    currentFollowers: body.currentFollowers !== undefined ? Number(body.currentFollowers) : undefined,
    targetAudience: body.targetAudience ? String(body.targetAudience) : undefined,
    contentPreferences: Array.isArray(body.contentPreferences) ? body.contentPreferences.map(String) : [],
    postingFrequency: body.postingFrequency ? String(body.postingFrequency) : undefined,
    timezone: body.timezone ? String(body.timezone) : undefined,
    billingAddress: body.billingAddress ? String(body.billingAddress) : undefined,
    notes: body.notes ? String(body.notes) : undefined,
    status: 'Active',
    createdAt: now,
    updatedAt: now,
  };
  clients.push(newClient);
  await writeJson(STORE_KEY, clients);
  return NextResponse.json({ client: newClient }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const url = new URL(req.url);
  const id = url.searchParams.get('id');
  const body = await req.json().catch(() => ({}));
  const targetId = String(id || body?.id || '');
  if (!targetId) return NextResponse.json({ error: 'id is required' }, { status: 400 });
  const clients = await readJson<Client[]>(STORE_KEY, []);
  const idx = clients.findIndex(c => c.id === targetId);
  if (idx === -1) return NextResponse.json({ error: 'not found' }, { status: 404 });
  const cur = clients[idx];
  const now = new Date().toISOString();
  const updated: Client = {
    ...cur,
    name: body.name !== undefined ? String(body.name) : cur.name,
    contactPerson: body.contactPerson !== undefined ? String(body.contactPerson) : cur.contactPerson,
    email: body.email !== undefined ? String(body.email) : cur.email,
    phone: body.phone !== undefined ? String(body.phone) : cur.phone,
    website: body.website !== undefined ? String(body.website) : cur.website,
    industry: body.industry !== undefined ? String(body.industry) : cur.industry,
    companySize: body.companySize !== undefined ? String(body.companySize) : cur.companySize,
    services: Array.isArray(body.services) ? body.services.map(String) : cur.services,
    socialPlatforms: Array.isArray(body.socialPlatforms) ? body.socialPlatforms.map(String) : cur.socialPlatforms,
    monthlyBudget: body.monthlyBudget !== undefined ? Number(body.monthlyBudget) : cur.monthlyBudget,
    goals: body.goals !== undefined ? String(body.goals) : cur.goals,
    currentFollowers: body.currentFollowers !== undefined ? Number(body.currentFollowers) : cur.currentFollowers,
    targetAudience: body.targetAudience !== undefined ? String(body.targetAudience) : cur.targetAudience,
    contentPreferences: Array.isArray(body.contentPreferences) ? body.contentPreferences.map(String) : cur.contentPreferences,
    postingFrequency: body.postingFrequency !== undefined ? String(body.postingFrequency) : cur.postingFrequency,
    timezone: body.timezone !== undefined ? String(body.timezone) : cur.timezone,
    billingAddress: body.billingAddress !== undefined ? String(body.billingAddress) : cur.billingAddress,
    notes: body.notes !== undefined ? String(body.notes) : cur.notes,
    status: body.status === 'Inactive' ? 'Inactive' : body.status === 'Active' ? 'Active' : cur.status,
    updatedAt: now,
  };
  clients[idx] = updated;
  await writeJson(STORE_KEY, clients);
  return NextResponse.json({ client: updated });
}

export async function DELETE(req: NextRequest) {
  const url = new URL(req.url);
  const id = url.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });
  const clients = await readJson<Client[]>(STORE_KEY, []);
  const next = clients.filter(c => c.id !== id);
  const removed = next.length !== clients.length;
  if (removed) await writeJson(STORE_KEY, next);
  return NextResponse.json({ ok: removed });
}
