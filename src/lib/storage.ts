import { mkdir, readFile, writeFile, rename } from 'fs/promises';
import path from 'path';

const dataRoot = path.resolve(process.env.DATA_DIR || path.join(process.cwd(), 'data'));

async function ensureDir() {
  await mkdir(dataRoot, { recursive: true });
}

async function filePath(name: string) {
  await ensureDir();
  return path.join(dataRoot, `${name}.json`);
}

export async function readJson<T>(name: string, fallback: T): Promise<T> {
  try {
    const fp = await filePath(name);
    const buf = await readFile(fp);
    return JSON.parse(buf.toString()) as T;
  } catch {
    return fallback;
  }
}

export async function writeJson<T>(name: string, data: T): Promise<void> {
  const fp = await filePath(name);
  const tmp = `${fp}.tmp`;
  await writeFile(tmp, JSON.stringify(data, null, 2), 'utf-8');
  await rename(tmp, fp);
}
