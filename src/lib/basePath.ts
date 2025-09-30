// Centralized basePath helper. Adjust if you introduce a dynamic base path at build/runtime.
// In the gateway deployment, APP_BASE_PATH=/app. This helper keeps client code clean.
// NOTE: We intentionally fall back to '/app' because production gateway sets APP_BASE_PATH=/app.
// If a future deployment wants root mounting, export APP_BASE_PATH="" (empty) or NEXT_PUBLIC_BASE_PATH="".
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || process.env.APP_BASE_PATH || '/app';

// Ensure only one canonical helper: adds BASE_PATH if not already present.
export function withBasePath(path: string) {
  if (!path.startsWith('/')) path = '/' + path;
  if (BASE_PATH === '/') return path;
  return path.startsWith(BASE_PATH) ? path : `${BASE_PATH}${path}`;
}

export function getBasePath() { return BASE_PATH; }

// Backward compatibility alias (some files imported publicBasePath previously)
export const publicBasePath = BASE_PATH;
