# Feature Flags

| Flag | Purpose | Default |
|------|---------|---------|
| metrics | Enables /api/metrics endpoint & counters | off |
| audit_logging | Emits audit events for sensitive actions | off |
| advanced_validation | Enables stricter input validation for scheduling | off |
| email_setup | (Legacy) gating email onboarding flows | off |
| bot_factory | Placeholder for bot generation features | off |

## Usage

Flags live in `src/core/featureFlags.ts`. Each entry is `{ enabled: boolean, description?: string }`.

## Adding a Flag

1. Define in registry with description.
2. Gate code paths (`if (featureFlags.new_flag.enabled) { ... }`).
3. Consider diagnostics visibility & version endpoint exposure.

## Future

Externalize to persistent store + admin UI for runtime toggling.
