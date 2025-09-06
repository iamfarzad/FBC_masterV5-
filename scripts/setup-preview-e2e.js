#!/usr/bin/env node

/**
 * Setup Vercel Preview E2E Deployment URL
 *
 * Generates the correct Vercel preview deployment URL for E2E testing
 * based on the current git branch name.
 *
 * Usage:
 *   node scripts/setup-preview-e2e.js
 *   # Outputs: export E2E_BASE_URL="https://fbc-master-v5-git-branch-name.vercel.app/"
 */

const { execSync } = require('child_process');

function getCurrentBranch() {
  try {
    return execSync('git branch --show-current', { encoding: 'utf8' }).trim();
  } catch (error) {
    console.error('❌ Failed to get current branch:', error.message);
    console.log('💡 Make sure you\'re in a git repository with commits');
    process.exit(1);
  }
}

function generatePreviewUrl(branchName) {
  if (branchName === 'main') {
    return 'https://www.farzadbayat.com';
  }

  // Clean branch name: replace non-alphanumeric chars with hyphens
  const cleanBranch = branchName
    .replace(/[^a-zA-Z0-9]/g, '-')
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens

  return `https://fbc-master-v5-git-${cleanBranch}.vercel.app/`;
}

function main() {
  const branchName = getCurrentBranch();
  const previewUrl = generatePreviewUrl(branchName);

  console.log(`🌿 Branch: ${branchName}`);
  console.log(`🔗 Preview URL: ${previewUrl}`);
  console.log(`✅ Setting E2E_BASE_URL=${previewUrl}`);

  // Set environment variable for current process
  process.env.E2E_BASE_URL = previewUrl;

  // Output for shell sourcing (compatible with both bash and zsh)
  console.log(`export E2E_BASE_URL="${previewUrl}"`);
}

if (require.main === module) {
  main();
}

module.exports = { generatePreviewUrl, getCurrentBranch };
