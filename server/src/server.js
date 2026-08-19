const app = require('./app');
const { env } = require('./config/env');
const prisma = require('./config/prisma');

const server = app.listen(env.port, async () => {
  try {
    await prisma.$connect();
    console.log(`[server] PostgreSQL connected`);
  } catch (error) {
    console.error('[server] Failed to connect to PostgreSQL:', error.message);
  }
  console.log(`[server] ShopSphere API listening on http://localhost:${env.port}`);
});

process.on('SIGINT', () => {
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
});
