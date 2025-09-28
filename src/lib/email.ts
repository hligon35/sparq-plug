import nodemailer from 'nodemailer';
import { prisma } from '@/lib/prisma';

// Basic reusable email sender with logging into EmailLog table.
// Falls back to console logging in development if SMTP not configured.
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: false,
  auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
});

export async function sendEmail(opts: { to: string; subject: string; html: string; template: string }) {
  const { to, subject, html, template } = opts;
  try {
    if (!process.env.SMTP_HOST) {
      // eslint-disable-next-line no-console
      console.log('[email:debug:no-smtp]', { to, subject, template });
    } else if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.log('[email:dev]', { to, subject, template });
      await transporter.sendMail({ from: process.env.MAIL_FROM || 'no-reply@sparqplug', to, subject, html });
    } else {
      await transporter.sendMail({ from: process.env.MAIL_FROM || 'no-reply@sparqplug', to, subject, html });
    }
    await prisma.emailLog.create({ data: { to, template, status: 'sent' } });
  } catch (e: any) {
    await prisma.emailLog.create({ data: { to, template, status: 'failed', error: e?.message || 'unknown' } });
    throw e;
  }
}

export function passwordResetTemplate(link: string) {
  return `<!doctype html><html><body style="font-family:Arial,sans-serif;background:#f5f7fb;padding:24px;">\n  <table role="presentation" width="100%" style="max-width:640px;margin:auto;background:#ffffff;border-radius:12px;padding:32px;border:1px solid #e5e7eb;">\n    <tr><td>\n      <h2 style="color:#1d74d0;margin:0 0 16px;font-size:22px;">Password Reset</h2>\n      <p style="color:#374151;font-size:14px;line-height:20px;margin:0 0 16px;">Click the button below to reset your password. This link is valid for 30 minutes.</p>\n      <p style="margin:24px 0 8px;">\n        <a href="${link}" style="background:#1d74d0;color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:8px;font-size:14px;display:inline-block;">Reset Password</a>\n      </p>\n      <p style="color:#6b7280;font-size:12px;margin-top:32px;">If you did not request this, you can ignore this email.</p>\n    </td></tr>\n  </table>\n  <p style="text-align:center;color:#9ca3af;font-size:11px;margin-top:16px;">© ${new Date().getFullYear()} SparQ Plug</p>\n</body></html>`;
}

export function passwordResetSuccessTemplate() {
  return `<!doctype html><html><body style="font-family:Arial,sans-serif;background:#f5f7fb;padding:24px;">\n  <table role="presentation" width="100%" style="max-width:640px;margin:auto;background:#ffffff;border-radius:12px;padding:32px;border:1px solid #e5e7eb;">\n    <tr><td>\n      <h2 style="color:#1d74d0;margin:0 0 16px;font-size:22px;">Password Updated</h2>\n      <p style="color:#374151;font-size:14px;line-height:20px;margin:0 0 16px;">Your password has been changed successfully. If this wasn't you, contact support immediately.</p>\n    </td></tr>\n  </table>\n  <p style="text-align:center;color:#9ca3af;font-size:11px;margin-top:16px;">© ${new Date().getFullYear()} SparQ Plug</p>\n</body></html>`;
}
