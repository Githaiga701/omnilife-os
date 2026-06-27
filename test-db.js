const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const pg = require('pg');
require('dotenv').config();

async function runTest(label, url) {
  console.log(`\nTesting connection for: ${label}`);
  console.log(`URL (masked): ${url.replace(/:[^@]+@/, ':****@')}`);
  
  const pool = new pg.Pool({ connectionString: url });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });
  
  try {
    const result = await Promise.race([
      prisma.$queryRaw`SELECT 1 as result`,
      new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout after 10s")), 10000))
    ]);
    console.log(`${label} Connection Success:`, result);
    return true;
  } catch (error) {
    console.error(`${label} Connection Failed:`, error.message);
    return false;
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

async function testConnection() {
  const originalDbUrl = process.env.DATABASE_URL;
  const originalDirectUrl = process.env.DIRECT_URL;
  
  await runTest("DATABASE_URL (currently port 5432)", originalDbUrl);
  await runTest("DIRECT_URL (port 5432)", originalDirectUrl);
}

testConnection();
