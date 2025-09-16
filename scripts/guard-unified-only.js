#!/usr/bin/env node
/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();

// Only scan real app code, not tooling
const SCAN_DIRS = [
  'app',
  'src',
  'components',
  'hooks',
  'pages',        // in case you have legacy Next folders
  'lib'           // common place for helpers
];

// Ignore these paths completely
const IGNORE_DIRS = new Set([
  'node_modules',
  '.next',
  '.git',
  'scripts',      // 👈 ignore guard scripts so we don't flag ourselves
  'dist',
  'build',
  'coverage'
]);

// Disallow *actual usage* patterns (imports/usages), not just plain strings.
// This avoids false positives inside comments or this guard file.
const BANNED_PATTERNS = [
  // legacy hook import
  /\bfrom\s+['"]@\/hooks\/useChat-ui['"]\b/,
  // legacy api route imports/usages
  /\bfrom\s+['"]@\/app\/api\/chat\/route['"]\b/,
  // direct fetch/axios to legacy endpoint (but allow AI SDK routes)
  /\/api\/chat(?!\/unified|\/intelligent|\/admin|\/realtime|\/multimodal|\/simple)\b/,
];

// Optional allowlist files (tests, mocks) – expand if needed
const ALLOWLIST = new Set([
  // 'src/tests/fixtures/legacy.spec.ts',
]);

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  let files = [];
  for (const e of entries) {
    const p = path.join(dir, e.name);
    const rel = path.relative(ROOT, p);
    if (e.isDirectory()) {
      const top = rel.split(path.sep)[0];
      if (IGNORE_DIRS.has(e.name) || IGNORE_DIRS.has(top)) continue;
      files = files.concat(walk(p));
    } else {
      files.push(p);
    }
  }
  return files;
}

function shouldScan(file) {
  const rel = path.relative(ROOT, file);
  if (ALLOWLIST.has(rel)) return false;
  const top = rel.split(path.sep)[0];
  if (!SCAN_DIRS.includes(top)) return false;         // only our code
  if (IGNORE_DIRS.has(top)) return false;             // safety
  return true;
}

function main() {
  const offenders = [];
  const files = []
    .concat(...SCAN_DIRS
      .filter(d => fs.existsSync(path.join(ROOT, d)))
      .map(d => walk(path.join(ROOT, d)))
    )
    .filter(shouldScan);

  for (const file of files) {
    const src = fs.readFileSync(file, 'utf8');
    for (const re of BANNED_PATTERNS) {
      if (re.test(src)) {
        offenders.push(file);
        break;
      }
    }
  }

  if (offenders.length > 0) {
    console.error('❌ Found legacy references:');
    for (const f of offenders) console.error('  ' + path.relative(ROOT, f));
    process.exit(1);
  } else {
    console.log('✅ Unified-only guard passed.');
  }
}

main();
