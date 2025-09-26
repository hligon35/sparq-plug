#!/usr/bin/env bash
set -euo pipefail

# Simple demo provisioning script. Replace with real mailbox creation logic (e.g. dovecot/postfix integration).
# Expected arguments:
#   --user <username>
#   --domain <domain>
#   --password <password>
# Optional:
#   --display-name <name>
#   --aliases a,b,c

USER=""
DOMAIN=""
PASSWORD=""
DISPLAY_NAME=""
ALIASES=""

while [[ "$#" -gt 0 ]]; do
  case "$1" in
    --user) USER="$2"; shift 2 ;;
    --domain) DOMAIN="$2"; shift 2 ;;
    --password) PASSWORD="$2"; shift 2 ;;
    --display-name) DISPLAY_NAME="$2"; shift 2 ;;
    --aliases) ALIASES="$2"; shift 2 ;;
    *) echo "Unknown arg: $1" >&2; exit 2 ;;
  esac
done

if [[ -z "$USER" || -z "$DOMAIN" || -z "$PASSWORD" ]]; then
  echo "Missing required args" >&2
  exit 2
fi

EMAIL="${USER}@${DOMAIN}"

# Demo: Just print a success message. Replace with real provisioning actions.
# Example real actions could be:
# - Create a system user/maildir
# - Update dovecot/postfix configs
# - Add aliases to /etc/aliases or virtual alias map
# - Reload services

echo "Created mailbox for ${EMAIL} (displayName='${DISPLAY_NAME}', aliases='${ALIASES}')"
