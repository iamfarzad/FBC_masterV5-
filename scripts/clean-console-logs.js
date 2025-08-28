#!/usr/bin/env node

/**
 * Console Log Cleanup Script
 * Removes development console.log statements while preserving error logs
 */

const fs = require('fs');
const path = require('path');

// Files to exclude from cleanup (keep debug logs for production monitoring)
const EXCLUDE_PATTERNS = [
  /server\/.*\.ts$/, // Keep logs in server files for monitoring
  /middleware\/.*\.ts$/, // Keep logs in middleware
  /admin.*route\.ts$/, // Keep logs in admin routes for monitoring
];

// Patterns to replace
const REPLACEMENTS = [
  // Remove info/debug logs
  [/console\.info\([^)]*\);?/g, '// Info log removed'],
  [/console\.debug\([^)]*\);?/g, '// Debug log removed'],
  [/console\.warn\([^)]*\);?/g, '// Warning log removed - could add proper error handling here'],

  // Keep error logs but make them less verbose
  [/console\.error\('([^']+):', ([^)]+)\);?/g, '// Error: $1'],
  [/console\.error\("([^"]+):", ([^)]+)\);?/g, '// Error: $1'],

  // Remove simple console.log statements
  [/console\.log\([^)]*\);?/g, '// Log removed'],
];

function shouldProcessFile(filePath) {
  // Skip excluded patterns
  return !EXCLUDE_PATTERNS.some(pattern => pattern.test(filePath));
}

function processFile(filePath) {
  if (!shouldProcessFile(filePath)) {
    // Log removed
    return;
  }

  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    REPLACEMENTS.forEach(([pattern, replacement]) => {
      if (pattern.test(content)) {
        content = content.replace(pattern, replacement);
        modified = true;
      }
    });

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      // Log removed
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
}

function findFiles(dir, pattern) {
  const results = [];

  function traverse(currentDir) {
    const items = fs.readdirSync(currentDir);

    items.forEach(item => {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        traverse(fullPath);
      } else if (stat.isFile() && pattern.test(item)) {
        results.push(fullPath);
      }
    });
  }

  traverse(dir);
  return results;
}

// Main execution
if (require.main === module) {
  const projectRoot = path.resolve(__dirname, '..');
  // Log removed

  // Find TypeScript and JavaScript files
  const files = findFiles(projectRoot, /\.(ts|tsx|js|jsx)$/);

  // Log removed

  files.forEach(processFile);

  // Log removed
}

module.exports = { processFile, findFiles };

