/**
 * Invitations service
 *
 * Provides a small, documented API for managing user invitations backed by JSON storage.
 * This isolates persistence and business rules away from route handlers to improve testability
 * and maintainability. Designed with multi-tenancy and audit logging in mind.
 */

import crypto from 'crypto';
import { readJson, writeJson } from '@/lib/storage';

export type Role = 'admin' | 'manager' | 'client';

export interface InvitationData {
	email: string;
	role: Role;
	invitedBy: string; // email or user id
	companyName?: string;
	message?: string;
}

export interface Invitation extends InvitationData {
	id: string;
	status: 'pending' | 'accepted' | 'expired' | 'revoked';
	invitedAt: string; // ISO date
	expiresAt: string; // ISO date
	token: string; // single-use token
	tenantId: string; // multi-tenant partition key
	// Optional lifecycle metadata
	acceptedAt?: string;
	revokedAt?: string;
	revokedBy?: string;
	resendCount?: number;
}

const STORE_NAME = 'invitations';
const DEFAULT_INVITE_TTL_DAYS = Number.parseInt(process.env.INVITE_TTL_DAYS || '7', 10) || 7;

export type InvitationErrorCode =
	| 'VALIDATION'
	| 'CONFLICT'
	| 'NOT_FOUND'
	| 'FORBIDDEN';

export class InvitationError extends Error {
	readonly code: InvitationErrorCode;
	constructor(message: string, code: InvitationErrorCode) {
		super(message);
		this.name = 'InvitationError';
		this.code = code;
	}
}

/** Email sanity check (not exhaustive) */
function isEmail(value: string): boolean {
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

/** Validate incoming invitation payload */
export function validateInvitationData(data: Partial<InvitationData>): asserts data is InvitationData {
	if (!data.email || !isEmail(data.email)) throw new Error('Invalid email');
	if (!data.role || !['admin', 'manager', 'client'].includes(data.role)) throw new Error('Invalid role');
	if (!data.invitedBy) throw new Error('Missing invitedBy');
}

function prefixedToken(role: Role): string {
	const prefix = role === 'admin' ? 'admin_' : role === 'manager' ? 'mgr_' : 'client_';
	// Use crypto for better entropy and URL-safe token
	const rand = crypto.randomBytes(24).toString('base64url');
	return `${prefix}${rand}`;
}

async function loadAll(): Promise<Invitation[]> {
	return readJson<Invitation[]>(STORE_NAME, []);
}

async function saveAll(items: Invitation[]): Promise<void> {
	await writeJson(STORE_NAME, items);
}

function normalizeEmail(email: string): string {
	return email.trim().toLowerCase();
}

function now(): Date {
	return new Date();
}

function addDays(base: Date, days: number): Date {
	return new Date(base.getTime() + days * 24 * 60 * 60 * 1000);
}

/** List invitations for a tenant; optional email filter */
export async function listInvitations(tenantId: string, email?: string): Promise<Invitation[]> {
	const all = await loadAll();
	// Refresh expired pending invitations on read to keep status consistent
	let mutated = false;
	const tsNow = Date.now();
	for (let i = 0; i < all.length; i++) {
		const inv = all[i];
		if (inv.tenantId !== tenantId) continue;
		if (inv.status === 'pending' && new Date(inv.expiresAt).getTime() < tsNow) {
			all[i] = { ...inv, status: 'expired' as const };
			mutated = true;
		}
	}
	if (mutated) await saveAll(all);
	const normalized = email ? normalizeEmail(email) : undefined;
	return all.filter((i) => i.tenantId === tenantId && (!normalized || i.email === normalized));
}

export interface ListFilters {
	status?: Invitation['status'][];
	role?: Role[];
	q?: string; // search in email or companyName
}

export interface PagedResult<T> {
	items: T[];
	total: number;
	page: number;
	pageSize: number;
	totalPages: number;
}

/**
 * List invitations with filtering and pagination. Does not throw.
 */
export async function listInvitationsPaged(
	tenantId: string,
	filters: ListFilters = {},
	page = 1,
	pageSize = 20,
): Promise<PagedResult<Invitation>> {
	const all = await listInvitations(tenantId);
	let items = all;
	if (filters.status && filters.status.length) {
		const set = new Set(filters.status);
		items = items.filter((i) => set.has(i.status));
	}
	if (filters.role && filters.role.length) {
		const set = new Set(filters.role);
		items = items.filter((i) => set.has(i.role));
	}
	if (filters.q && filters.q.trim()) {
		const q = filters.q.trim().toLowerCase();
		items = items.filter((i) => i.email.includes(q) || (i.companyName ? i.companyName.toLowerCase().includes(q) : false));
	}
	// Sort by invitedAt desc by default
	items.sort((a, b) => (a.invitedAt < b.invitedAt ? 1 : a.invitedAt > b.invitedAt ? -1 : 0));
	const total = items.length;
	const start = Math.max((page - 1) * pageSize, 0);
	const end = Math.min(start + pageSize, total);
	return {
		items: items.slice(start, end),
		total,
		page,
		pageSize,
		totalPages: Math.max(Math.ceil(total / pageSize), 1),
	};
}

/** Get a pending invitation by token within tenant */
export async function getByToken(tenantId: string, token: string): Promise<Invitation | null> {
	const all = await loadAll();
	const idx = all.findIndex((i) => i.tenantId === tenantId && i.token === token);
	if (idx === -1) return null;
	const inv = all[idx];
	if (inv.status !== 'pending') return null;
	if (new Date(inv.expiresAt).getTime() < Date.now()) {
		const expired: Invitation = { ...inv, status: 'expired' };
		all[idx] = expired;
		await saveAll(all);
		return expired;
	}
	return inv;
}

/** Create a new invitation; prevents multiple pending invites for the same email in a tenant */
export async function createInvitation(tenantId: string, data: InvitationData): Promise<Invitation> {
	validateInvitationData(data);
	const all = await loadAll();
	const normalizedEmail = normalizeEmail(data.email);
	const existing = all.find((i) => i.tenantId === tenantId && i.email === normalizedEmail && i.status === 'pending');
	if (existing) throw new InvitationError('User already has a pending invitation', 'CONFLICT');

	const nowDate = now();
	const inv: Invitation = {
		id: crypto.randomUUID(),
		email: normalizedEmail,
		role: data.role,
		status: 'pending',
		invitedBy: data.invitedBy,
		invitedAt: nowDate.toISOString(),
		expiresAt: addDays(nowDate, DEFAULT_INVITE_TTL_DAYS).toISOString(),
		token: prefixedToken(data.role),
		companyName: data.companyName,
		message: data.message,
		tenantId,
	};
	await saveAll([...all, inv]);
	return inv;
}

/** Update invitation status */
export async function updateInvitationStatus(
	tenantId: string,
	token: string,
	status: Invitation['status']
): Promise<Invitation | null> {
	const all = await loadAll();
	const idx = all.findIndex((i) => i.tenantId === tenantId && i.token === token);
	if (idx === -1) return null;
	const current = all[idx];
	if (current.status === status) return current;
	// Enforce safe transitions
	if (current.status === 'accepted' || current.status === 'revoked') {
		throw new InvitationError('Cannot change status after acceptance or revocation', 'FORBIDDEN');
	}
	if (current.status === 'expired' && status !== 'pending') {
		throw new InvitationError('Expired invitations can only be resent (set back to pending) using resendInvitation', 'FORBIDDEN');
	}
	let updated: Invitation = { ...current, status };
	if (status === 'accepted') {
		updated = { ...updated, acceptedAt: now().toISOString() };
	}
	if (status === 'revoked') {
		updated = { ...updated, revokedAt: now().toISOString() };
	}
	all[idx] = updated;
	await saveAll(all);
	return updated;
}

/** Delete an invitation by token */
export async function removeInvitation(tenantId: string, token: string): Promise<boolean> {
	const all = await loadAll();
	const remaining = all.filter((i) => !(i.tenantId === tenantId && i.token === token));
	if (remaining.length === all.length) return false;
	await saveAll(remaining);
	return true;
}

/**
 * Resend an invitation. Generates a new token, resets status to pending, bumps expiry and invitedAt.
 * Allowed when current status is pending or expired. Throws if accepted or revoked.
 */
export async function resendInvitation(
	tenantId: string,
	email: string,
	roleHint?: Role,
): Promise<Invitation> {
	const all = await loadAll();
	const normalizedEmail = normalizeEmail(email);
	const idx = all.findIndex((i) => i.tenantId === tenantId && i.email === normalizedEmail);
	if (idx === -1) throw new InvitationError('Invitation not found', 'NOT_FOUND');
	const current = all[idx];
	if (current.status === 'accepted' || current.status === 'revoked') {
		throw new InvitationError('Cannot resend an invitation that is already accepted or revoked', 'FORBIDDEN');
	}
	const nowDate = now();
	const next: Invitation = {
		...current,
		status: 'pending',
		invitedAt: nowDate.toISOString(),
		expiresAt: addDays(nowDate, DEFAULT_INVITE_TTL_DAYS).toISOString(),
		token: prefixedToken(roleHint || current.role),
		resendCount: (current.resendCount || 0) + 1,
	};
	all[idx] = next;
	await saveAll(all);
	return next;
}

/** Remove invitations older than retentionDays that are not pending. Returns number removed. */
export async function pruneInvitations(tenantId: string, retentionDays = 90): Promise<number> {
	const all = await loadAll();
	const cutoff = addDays(now(), -Math.abs(retentionDays)).toISOString();
	const keep: Invitation[] = [];
	let removed = 0;
	for (const inv of all) {
		if (inv.tenantId !== tenantId) {
			keep.push(inv);
			continue;
		}
		if (inv.status === 'pending') {
			keep.push(inv);
			continue;
		}
		if (inv.invitedAt < cutoff) {
			removed++;
			continue;
		}
		keep.push(inv);
	}
	if (removed > 0) await saveAll(keep);
	return removed;
}

