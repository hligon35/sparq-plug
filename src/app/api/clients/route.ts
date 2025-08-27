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

export async function GET(req: NextRequest) {
  const clients = await readJson<Client[]>(STORE_KEY, []);
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
