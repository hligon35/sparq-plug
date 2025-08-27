import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Simple local upload handler: saves files to .next/tmp-uploads (ephemeral)
export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';
    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json({ error: 'Invalid content type' }, { status: 400 });
    }

    const form = await req.formData();
    const files = form.getAll('files');
    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

  const configured = process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads');
  const uploadDir = path.resolve(configured);
    await mkdir(uploadDir, { recursive: true });

  const results: Array<{ name: string; size: number; type: string; url: string } > = [];

    for (const f of files) {
      if (typeof f === 'string') continue;
      // File from formData in App Router runtime
      const file = f as unknown as File;
      // Basic size guard: 50MB max
      if (file.size && file.size > 50 * 1024 * 1024) {
        return NextResponse.json({ error: `${file.name} exceeds 50MB limit` }, { status: 413 });
      }
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const filePath = path.join(uploadDir, `${Date.now()}-${safeName}`);
      await writeFile(filePath, buffer);
      // Expose via a simple proxy endpoint
      const fileUrl = `/api/uploaded?file=${encodeURIComponent(path.basename(filePath))}`;
      results.push({ name: file.name, size: buffer.length, type: file.type || 'application/octet-stream', url: fileUrl });
    }

    return NextResponse.json({ uploaded: results });
  } catch (err: unknown) {
    console.error('Upload error', err);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
