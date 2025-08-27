import { NextRequest } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const file = searchParams.get('file');
  if (!file) {
    return new Response('Missing file', { status: 400 });
  }
  const configured = process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads');
  const base = path.resolve(configured);
  const safe = path.basename(file);
  const filePath = path.join(base, safe);
  try {
    const data = await readFile(filePath);
    // naive content type detection
    const ext = path.extname(safe).toLowerCase();
    const type = ext === '.png' ? 'image/png'
      : ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg'
      : ext === '.gif' ? 'image/gif'
      : ext === '.mp4' ? 'video/mp4'
      : 'application/octet-stream';
  const ab = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) as ArrayBuffer;
  return new Response(ab, { headers: { 'content-type': type } });
  } catch {
    return new Response('Not found', { status: 404 });
  }
}
