const fs = require("fs");
const path = require("path");

/** Recursively collect files matching extensions */
function collectFiles(dir, exts, acc = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    if (e.name.startsWith(".")) continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) collectFiles(full, exts, acc);
    else if (exts.includes(path.extname(e.name))) acc.push(full);
  }
  return acc;
}

function rewriteZodRecords(src) {
  let out = src;
  const patterns = [
    // z.record(z.any()) or z.record( z . any ( ) )
    { re: /z\.record\(\s*z\.any\(\)\s*\)/g, to: "z.record(z.string(), z.any())" },
    // z.record(z.unknown())
    { re: /z\.record\(\s*z\.unknown\(\)\s*\)/g, to: "z.record(z.string(), z.unknown())" },
  ];
  for (const { re, to } of patterns) out = out.replace(re, to);
  return out;
}

(function main() {
  const ROOT = path.resolve(process.cwd(), "src");
  if (!fs.existsSync(ROOT)) {
    console.error("src/ directory not found. Run from repo root.");
    process.exit(1);
  }
  const files = collectFiles(ROOT, [".ts", ".tsx", ".mts", ".cts", ".d.ts"]);
  let changed = 0;
  for (const file of files) {
    const before = fs.readFileSync(file, "utf8");
    const after = rewriteZodRecords(before);
    if (after !== before) {
      fs.writeFileSync(file, after, "utf8");
      changed++;
      console.log("updated:", path.relative(process.cwd(), file));
    }
  }
  console.log(`\nZod record codemod complete. Files changed: ${changed}`);
})();
