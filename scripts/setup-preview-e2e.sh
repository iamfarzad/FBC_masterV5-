#!/bin/bash

# Setup Vercel Preview E2E Deployment URL
#
# Generates the correct Vercel preview deployment URL for E2E testing
# based on the current git branch name.
#
# Usage:
#   source scripts/setup-preview-e2e.sh
#   # Then run: pnpm test:e2e

set -e  # Exit on any error

get_current_branch() {
  git branch --show-current 2>/dev/null || {
    echo "❌ Failed to get current branch"
    echo "💡 Make sure you're in a git repository with commits"
    exit 1
  }
}

generate_preview_url() {
  local branch_name="$1"

  if [ "$branch_name" = "main" ]; then
    echo "https://www.farzadbayat.com"
    return
  fi

  # Clean branch name: replace non-alphanumeric chars with hyphens
  local clean_branch
  clean_branch=$(echo "$branch_name" | sed 's/[^a-zA-Z0-9]/-/g' | sed 's/^-*//' | sed 's/-*$//')

  echo "https://fbc-master-v5-git-${clean_branch}.vercel.app/"
}

main() {
  local branch_name
  branch_name=$(get_current_branch)

  local preview_url
  preview_url=$(generate_preview_url "$branch_name")

  echo "🌿 Branch: $branch_name"
  echo "🔗 Preview URL: $preview_url"
  echo "✅ Setting E2E_BASE_URL=$preview_url"

  # Export for current shell session
  export E2E_BASE_URL="$preview_url"

  # Also output the export command for manual use
  echo "export E2E_BASE_URL=\"$preview_url\""
}

# Run main function if script is executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
  main
fi
