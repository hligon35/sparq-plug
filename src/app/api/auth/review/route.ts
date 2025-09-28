import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifySession } from '@/lib/auth';
import { sendEmail } from '@/lib/email';
import { audit } from '@/lib/audit';
import { rateLimitCheck, rateLimitKeyFromRequest, rateLimitHeaders } from '@/lib/rateLimit';

interface DecisionBody { id: string; approve: boolean; reason?: string }

export async function POST(req: NextRequest) {
  try {
  const limiterOpts = { windowMs: 10 * 60_000, max: 100 }; // admin decision ops
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const limit = rateLimitCheck(rateLimitKeyFromRequest({ ip, path: '/auth/review' }), limiterOpts);
    const baseHeaders = rateLimitHeaders(limit.remaining, limiterOpts);
  if (!limit.allowed) return new NextResponse(JSON.stringify({ error: 'Too Many Requests' }), { status: 429, headers: baseHeaders });
    const session = await verifySession(req.cookies.get('session')?.value);
    if (!session || session.role !== 'admin') return new NextResponse(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: baseHeaders });
    const body: DecisionBody = await req.json();
    if (!body || !body.id || typeof body.approve !== 'boolean') {
      return new NextResponse(JSON.stringify({ error: 'Invalid payload' }), { status: 400, headers: baseHeaders });
    }
    const registration = await prisma.registrationRequest.findUnique({ where: { id: body.id } });
    if (!registration) return new NextResponse(JSON.stringify({ error: 'Not found' }), { status: 404, headers: baseHeaders });
    if (registration.status !== 'pending') return new NextResponse(JSON.stringify({ error: 'Already decided' }), { status: 409, headers: baseHeaders });

    if (body.approve) {
      await prisma.$transaction([
        prisma.user.create({ data: { email: registration.email, name: registration.name, company: registration.company, role: registration.roleRequested, passwordHash: registration.passwordHash } }),
        prisma.registrationRequest.update({ where: { id: registration.id }, data: { status: 'approved', decidedAt: new Date() } })
      ]);
      await audit({ actor: session.sub, tenantId: 'system', action: 'auth.registration.approve', target: `registration:${registration.id}`, metadata: { email: registration.email, role: registration.roleRequested } });
    } else {
      await prisma.registrationRequest.update({ where: { id: registration.id }, data: { status: 'denied', decisionReason: body.reason || 'No reason provided', decidedAt: new Date() } });
      await audit({ actor: session.sub, tenantId: 'system', action: 'auth.registration.deny', target: `registration:${registration.id}`, metadata: { email: registration.email, reason: body.reason } });
    }

    const subject = body.approve ? 'Your SparQ Plug account has been approved' : 'Your SparQ Plug registration status';
    const html = body.approve
      ? approvedTemplate(registration.name || '', registration.roleRequested)
      : deniedTemplate(registration.name || '', body.reason || registration.decisionReason || 'No reason provided');

    try {
      await sendEmail({ to: registration.email, subject, html, template: body.approve ? 'registration-approved' : 'registration-denied' });
    } catch (e) {
      // email failure should not block decision; surface warning
      return new NextResponse(JSON.stringify({ ok: true, warning: 'Decision saved but email failed' }), { headers: baseHeaders });
    }
    return new NextResponse(JSON.stringify({ ok: true }), { headers: baseHeaders });
  } catch (e: any) {
    return new NextResponse(JSON.stringify({ error: 'Server error' }), { status: 500 });
  }
}

function approvedTemplate(name: string, role: string) {
  return `<!doctype html><html><body style="font-family:Arial,sans-serif;background:#f5f7fb;padding:24px;">
  <table role="presentation" width="100%" style="max-width:640px;margin:auto;background:#ffffff;border-radius:12px;padding:32px;border:1px solid #e5e7eb;">
    <tr><td>
      <h2 style="color:#1d74d0;margin:0 0 16px;font-size:22px;">Welcome to SparQ Plug${name ? ', ' + name : ''}!</h2>
      <p style="color:#374151;font-size:14px;line-height:20px;margin:0 0 16px;">Your account request has been approved. Your assigned role: <strong>${role}</strong>.</p>
      <p style="color:#374151;font-size:14px;line-height:20px;margin:0 0 16px;">You can now sign in and begin managing your social media workflows.</p>
      <p style="margin:24px 0 8px;">
        <a href="${process.env.PUBLIC_URL || ''}/login" style="background:#1d74d0;color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:8px;font-size:14px;display:inline-block;">Sign In</a>
      </p>
      <p style="color:#6b7280;font-size:12px;margin-top:32px;">If you did not request this, please ignore this email.</p>
    </td></tr>
  </table>
  <p style="text-align:center;color:#9ca3af;font-size:11px;margin-top:16px;">© ${new Date().getFullYear()} SparQ Plug</p>
</body></html>`;
}

function deniedTemplate(name: string, reason: string) {
  return `<!doctype html><html><body style="font-family:Arial,sans-serif;background:#f5f7fb;padding:24px;">
  <table role="presentation" width="100%" style="max-width:640px;margin:auto;background:#ffffff;border-radius:12px;padding:32px;border:1px solid #e5e7eb;">
    <tr><td>
      <h2 style="color:#1d74d0;margin:0 0 16px;font-size:22px;">Registration Update${name ? ', ' + name : ''}</h2>
      <p style="color:#374151;font-size:14px;line-height:20px;margin:0 0 16px;">We regret to inform you that your registration request was not approved at this time.</p>
      <p style="color:#374151;font-size:14px;line-height:20px;margin:0 0 16px;">Reason provided: <em>${reason}</em></p>
      <p style="color:#374151;font-size:14px;line-height:20px;margin:0 0 16px;">You may reply to this email for clarification or re-apply later.</p>
      <p style="color:#6b7280;font-size:12px;margin-top:32px;">Thank you for your interest in SparQ Plug.</p>
    </td></tr>
  </table>
  <p style="text-align:center;color:#9ca3af;font-size:11px;margin-top:16px;">© ${new Date().getFullYear()} SparQ Plug</p>
</body></html>`;
}
