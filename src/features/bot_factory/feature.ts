// Bot Factory feature flag
// Use NEXT_PUBLIC_FEATURE_BOT_FACTORY (client) or FEATURE_BOT_FACTORY (server)
export function isBotFactoryEnabled(): boolean {
  return (process.env.NEXT_PUBLIC_FEATURE_BOT_FACTORY ?? process.env.FEATURE_BOT_FACTORY) === 'true';
}
