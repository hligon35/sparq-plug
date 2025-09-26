import { NextRequest } from 'next/server';
import { audit } from '@/lib/audit';
import { ok, badRequest, notFound, conflict, serverError, forbidden } from '@/lib/apiResponse';
import { apiGuard } from '@/lib/apiGuard';
import { withPaginationHeaders } from '@/lib/pagination';
import {
  createInvitation,
  getByToken,
  listInvitations,
  listInvitationsPaged,
  updateInvitationStatus,
  removeInvitation,
  validateInvitationData,
  InvitationError,
  resendInvitation,
} from '@/lib/api/invitations';
import type { Invitation, Role } from '@/lib/api/invitations';

export async function GET(request: NextRequest) {
  const g = apiGuard(request, { path: '/api/invitations:GET', rate: { windowMs: 10_000, max: 20 } });
  if (g instanceof Response) return g;

  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');
  const tenantId = g.tenantId;
  const page = Number(searchParams.get('page') || '1');
  const pageSize = Math.min(100, Number(searchParams.get('pageSize') || '50'));
  const status = (searchParams.get('status') || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean) as Invitation['status'][];
  const role = (searchParams.get('role') || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean) as Role[];
  const q = searchParams.get('q') || searchParams.get('email') || undefined;

  if (token) {
    const inv = await getByToken(tenantId, token);
    if (!inv) return notFound('Invalid or expired invitation');
    if (inv.status === 'expired') return badRequest('Invitation has expired');
    return ok({ invitation: inv });
  }

  // Use paged listing with filters
  const result = await listInvitationsPaged(
    tenantId,
    {
      status: status && status.length ? status : undefined,
      role: role && role.length ? role : undefined,
      q,
    },
    page,
    pageSize,
  );
  return withPaginationHeaders({ invitations: result.items, page: result.page, pageSize: result.pageSize, total: result.total }, result.page, result.pageSize, result.total);
}

export async function POST(request: NextRequest) {
  try {
    const g = apiGuard(request, { path: '/api/invitations:POST', capability: 'manage_team', rate: { windowMs: 60_000, max: 10 }, csrf: true });
    if (g instanceof Response) return g;

    const body = await request.json();
    validateInvitationData(body);
    const tenantId = g.tenantId;
    const actor = g.actor;

  const inv = await createInvitation(tenantId, body);

    await audit({
      actor,
      tenantId,
      action: 'invitation.create',
      target: `invitation:${inv.id}`,
      metadata: { email: inv.email, role: inv.role },
    });

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `${request.nextUrl.origin}`;
    const invitationLink = `${baseUrl}/register?token=${encodeURIComponent(inv.token)}`;

    // TODO: send email via provider (Mailgun/SES/etc.)
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.log(`Invitation link for ${inv.email}: ${invitationLink}`);
    }

    return ok({ invitation: inv, invitationLink });
  } catch (error: unknown) {
    // eslint-disable-next-line no-console
    console.error('Error creating invitation:', error);
    if (error instanceof InvitationError) {
      switch (error.code) {
        case 'CONFLICT':
          return conflict(error.message);
        case 'FORBIDDEN':
          return forbidden(error.message);
        case 'NOT_FOUND':
          return notFound(error.message);
        default:
          return badRequest(error.message);
      }
    }
    return serverError('Failed to create invitation');
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const g = apiGuard(request, { path: '/api/invitations:PATCH', capability: 'manage_team', rate: { windowMs: 60_000, max: 20 }, csrf: true });
    if (g instanceof Response) return g;

    const { token, status, action, email, roleHint } = await request.json();
    const tenantId = g.tenantId;
    const actor = g.actor;

    if (action === 'resend') {
      // Allow resend by email or by token
      let targetEmail = email as string | undefined;
      if (!targetEmail && token) {
        const list = await listInvitations(tenantId);
        const found = list.find((i) => i.token === token);
        if (!found) return notFound('Invitation not found');
        targetEmail = found.email;
      }
      if (!targetEmail) return badRequest('Email or token required for resend');
      const resent = await resendInvitation(tenantId, targetEmail, roleHint);
      await audit({ actor, tenantId, action: 'invitation.resend', target: `invitation:${resent.id}`, metadata: { email: resent.email, role: resent.role } });
      return ok({ invitation: resent });
    }

    const updated = await updateInvitationStatus(tenantId, token, status);
    if (!updated) return notFound('Invitation not found');

    await audit({
      actor,
      tenantId,
      action: 'invitation.update',
      target: `invitation:${updated.id}`,
      metadata: { status },
    });

    return ok({ invitation: updated });
  } catch (error) {
    console.error('Error updating invitation:', error);
    if (error instanceof InvitationError) {
      switch (error.code) {
        case 'FORBIDDEN':
          return forbidden(error.message);
        case 'NOT_FOUND':
          return notFound(error.message);
        case 'CONFLICT':
          return conflict(error.message);
        default:
          return badRequest(error.message);
      }
    }
    return serverError('Failed to update invitation');
  }
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');
  if (!token) return badRequest('Token required');

  const g = apiGuard(request, { path: '/api/invitations:DELETE', capability: 'manage_team', rate: { windowMs: 60_000, max: 20 }, csrf: true });
  if (g instanceof Response) return g;

  const tenantId = g.tenantId;
  const actor = g.actor;
  const removed = await removeInvitation(tenantId, token);
  if (!removed) return notFound('Invitation not found');

  await audit({ actor, tenantId, action: 'invitation.delete', target: `token:${token}` });
  return ok({ success: true });
}