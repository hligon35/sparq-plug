import { NextResponse } from 'next/server';

export type ApiErrorDetails = Record<string, unknown> | undefined;

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data, { status: 200, ...init });
}

export function badRequest(message: string, details?: ApiErrorDetails) {
  return NextResponse.json({ error: message, details }, { status: 400 });
}

export function unauthorized(message = 'Unauthorized') {
  return NextResponse.json({ error: message }, { status: 401 });
}

export function forbidden(message = 'Forbidden') {
  return NextResponse.json({ error: message }, { status: 403 });
}

export function notFound(message = 'Not Found') {
  return NextResponse.json({ error: message }, { status: 404 });
}

export function conflict(message = 'Conflict') {
  return NextResponse.json({ error: message }, { status: 409 });
}

export function serverError(message = 'Internal Server Error') {
  return NextResponse.json({ error: message }, { status: 500 });
}
