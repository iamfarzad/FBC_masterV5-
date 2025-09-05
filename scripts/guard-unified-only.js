const { readFileSync } = require("fs");
const { execSync } = require("child_process");

const patterns = [
  "hooks/useChat-ui",
  "hooks/chat/useChat",
  "/api/chat/route",
  "UnifiedChatInterface"
];

const changed = execSync("git ls-files").toString().trim().split("\n");
const offenders = [];
for (const f of changed) {
  if (!/\.(ts|tsx|js|jsx)$/.test(f) || f.includes('.config.') || f.includes('.eslintrc')) continue;
  try {
    const txt = readFileSync(f, "utf8");
    if (patterns.some(p => txt.includes(p))) offenders.push(f);
  } catch (e) {
    // Skip files that can't be read
  }
}

if (offenders.length) {
  console.error("❌ Found legacy references:");
  offenders.forEach(f => console.error(`  ${f}`));
  process.exit(1);
}
