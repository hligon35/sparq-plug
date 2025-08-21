export const ROLE_CAPABILITIES: Record<string, string[]> = {
  admin: [
    'manage_clients',
    'view_analytics',
    'configure_integrations',
    'manage_team',
    'billing',
    'full_access',
  ],
  manager: [
    'manage_clients',
    'view_analytics',
    'manage_team',
    'limited_billing',
  ],
  client: [
    'view_reports',
    'manage_content',
    'media_library_access',
  ],
};

export function can(role: string | null | undefined, capability: string) {
  if (!role) return false;
  const caps = ROLE_CAPABILITIES[role];
  if (!caps) return false;
  return caps.includes(capability);
}
