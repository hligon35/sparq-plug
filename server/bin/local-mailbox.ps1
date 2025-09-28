param(
  [Parameter(Mandatory=$true)] [string]$user,
  [Parameter(Mandatory=$true)] [string]$domain,
  [Parameter(Mandatory=$true)] [string]$password,
  [string]$display_name,
  [string]$aliases
)

# Demo provisioning script for Windows/PowerShell. Replace with real mailbox creation logic.
# Outputs a simple success message.

$ErrorActionPreference = 'Stop'

$displayName = $display_name
$email = "$user@$domain"

# TODO: Implement actual provisioning steps (e.g., call a local mail server API or CLI)

Write-Output "Created mailbox for $email (displayName='$displayName', aliases='$aliases')"
