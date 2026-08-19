// Creates the root node_modules junction -> qa/automation/node_modules so
// `npx playwright test ...` works from the project root with the SAME
// Playwright install the suite uses (mixing two copies breaks collection:
// "Playwright Test did not expect test.describe() to be called here").
//
// Run: node scripts/link-automation.js   (idempotent — safe to re-run)
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const link = path.join(root, 'node_modules');
const target = path.join(root, 'qa', 'automation', 'node_modules');

if (!fs.existsSync(target)) {
  console.error(`Target does not exist: ${target}\nRun "npm install" inside qa/automation first.`);
  process.exit(1);
}

if (fs.existsSync(link)) {
  const stat = fs.lstatSync(link);
  if (stat.isSymbolicLink() || stat.isDirectory()) {
    // A directory here is almost certainly the junction (or an existing install).
    console.log(`node_modules already exists at ${link} — leaving it as-is.`);
    process.exit(0);
  }
}

fs.symlinkSync(target, link, 'junction');
console.log(`Created junction: ${link} -> ${target}`);
