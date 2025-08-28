#!/usr/bin/env node

/**
 * TypeScript 'any' Type Fixer Script
 * Replaces 'any' types with more specific types
 */

const fs = require('fs');
const path = require('path');

// Replacement patterns for common 'any' types
const REPLACEMENTS = [
  // Function parameters and return types
  [/(\w+):\s*any\b/g, '$1: unknown'],
  [/:\s*any\[\]/g, ': unknown[]'],
  [/:\s*any\s*\|\s*undefined/g, ': unknown | undefined'],
  [/:\s*any\s*\|\s*null/g, ': unknown | null'],

  // Record types
  [/Record<string,\s*any>/g, 'Record<string, unknown>'],

  // Generic function types
  [/<[^>]*any[^>]*>/g, (match) => match.replace(/any/g, 'unknown')],

  // Interface properties
  [/(\w+)\?:\s*any;/g, '$1?: unknown;'],
  [/(\w+):\s*any;/g, '$1: unknown;'],

  // Variable declarations
  [/let\s+(\w+):\s*any\s*=/g, 'let $1: unknown ='],
  [/const\s+(\w+):\s*any\s*=/g, 'const $1: unknown ='],
  [/var\s+(\w+):\s*any\s*=/g, 'var $1: unknown ='],
];

function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    REPLACEMENTS.forEach(([pattern, replacement]) => {
      if (pattern.test(content)) {
        content = content.replace(pattern, replacement);
        modified = true;
      }
    });

    // Special case for common patterns that need more specific handling
    if (content.includes(': any')) {
      // Replace remaining ': any' with ': unknown'
      content = content.replace(/:\s*any\b/g, ': unknown');
      modified = true;
    }

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      // Log removed
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
}

function findTypeScriptFiles(dir) {
  const results = [];

  function traverse(currentDir) {
    const items = fs.readdirSync(currentDir);

    items.forEach(item => {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        traverse(fullPath);
      } else if (stat.isFile() && /\.(ts|tsx)$/.test(item)) {
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

  // Find TypeScript files
  const files = findTypeScriptFiles(projectRoot);

  // Log removed

  files.forEach(processFile);

  // Log removed
}

module.exports = { processFile, findTypeScriptFiles };

