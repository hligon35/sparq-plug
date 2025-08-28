import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  let pkg: any = { name: 'sparq-plug', version: '0.0.0' };
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    pkg = require('../../../../package.json');
  } catch (_) {}
  return NextResponse.json({
    name: pkg.name,
    version: pkg.version,
    build: {
      commit: process.env.NEXT_PUBLIC_BUILD_COMMIT || process.env.BUILD_COMMIT || null,
      time: process.env.NEXT_PUBLIC_BUILD_TIME || process.env.BUILD_TIME || null,
    },
    env: {
      nodeEnv: process.env.NODE_ENV || null,
      appBasePath: process.env.APP_BASE_PATH || process.env.NEXT_PUBLIC_BASE_PATH || '',
    },
    uptimeSec: Math.round(process.uptime()),
  });
}
