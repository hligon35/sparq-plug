import { NextResponse } from 'next/server';
import { readdir, stat } from 'fs/promises';
import path from 'path';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const configured = process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads');
  const base = path.resolve(configured);
  try {
    const files = await readdir(base);
    const items = await Promise.all(files.map(async (file) => {
      const fp = path.join(base, file);
      const s = await stat(fp);
      if (!s.isFile()) return null;
      const ext = path.extname(file).toLowerCase();
      const type = ['.png','.jpg','.jpeg','.gif','.webp'].includes(ext) ? 'image'
        : ['.mp4','.mov','.webm'].includes(ext) ? 'video'
        : 'document';
      return {
        id: file,
        name: file.replace(/^\d+-/, ''),
        size: s.size,
        uploadedAt: s.birthtimeMs || s.ctimeMs || s.mtimeMs,
        type,
        url: `/api/uploaded?file=${encodeURIComponent(file)}`,
      };
    }));
    return NextResponse.json({ items: items.filter(Boolean) });
  } catch (e) {
    return NextResponse.json({ items: [] });
  }
}
