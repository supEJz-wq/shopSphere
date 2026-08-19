// Project-root Playwright config.
//
// Re-exports the qa/automation suite config so you can run
//   npx playwright test ...
// straight from the project root (no need to cd into qa/automation).
//
// Requires the node_modules junction at root/node_modules -> qa/automation/node_modules
// (created by `node scripts/link-automation.js`) so there is exactly ONE
// Playwright install — mixing two copies causes "Playwright Test did not
// expect test.describe() to be called here".
module.exports = require('./qa/automation/playwright.config.js');
