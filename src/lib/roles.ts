export const ROLE_CAPABILITIES: Record<string, string[]> = {
  admin: [
    'manage_clients',
    'view_analytics',
    'configure_integrations',
    'manage_team',
    'billing',
    // Access to business email setup wizard & related API
    'email_setup',
    // View inboxes / email module
    'view_email',
    'full_access',
    'bot_factory',
  ],
  manager: [
    'manage_clients',
    'view_analytics',
    'manage_team',
    'limited_billing',
    // Manager is also allowed to configure business email (no full_access needed)
    'email_setup',
    'view_email',
    'bot_factory',
  ],
  client: [
    'view_reports',
    'manage_content',
    'media_library_access',
    // Allow client to view their own inbox via email module (read-only)
    'view_email',
  ],
};

export function can(role: string | null | undefined, capability: string) {
  if (!role) return false;
  const caps = ROLE_CAPABILITIES[role];
  if (!caps) return false;
  return caps.includes(capability);
}
