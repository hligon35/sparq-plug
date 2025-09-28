export const publicBasePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

export function withBasePath(path: string) {
  if (!path.startsWith('/')) path = '/' + path;
  return `${publicBasePath}${path}`;
}
