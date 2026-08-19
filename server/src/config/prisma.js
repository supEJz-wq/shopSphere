/**
 * Single shared PrismaClient instance.
 *
 * Every module must import THIS instance instead of calling
 * `new PrismaClient()` itself. Creating one client per module opens one
 * connection pool per module; with the Supabase session pooler (max 15
 * connections) that exhausted the pool under concurrent load and caused
 * sporadic 500s — `FATAL: (EMAXCONNSESSION) max clients reached`.
 * Found by the Playwright automation suite (qa/automation).
 *
 * The pool is also capped explicitly (connection_limit=8) so the app can
 * never re-saturate the pooler's 15-slot limit, even at maximum parallelism.
 */
const { PrismaClient } = require('@prisma/client');

const url = new URL(process.env.DATABASE_URL);
if (!url.searchParams.has('connection_limit')) {
  url.searchParams.set('connection_limit', '8');
}

const prisma = new PrismaClient({
  datasources: { db: { url: url.toString() } },
});

module.exports = prisma;
