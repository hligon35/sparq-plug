import { NextResponse } from 'next/server';

// Simple version endpoint (could later include git sha, build time, feature flags)
export async function GET() {
	return NextResponse.json({ version: '0.1.0', build: 'dev', timestamp: new Date().toISOString() });
}

