require('dotenv').config();
const { db } = require('../src/lib/db');

(async () => {
  console.log('Running DB connectivity test...');
  try {
    const result = await db.$queryRaw`SELECT 1 as result`;
    console.log('✅ DB connection successful, result:', result);
  } catch (err) {
    console.error('❌ DB connection failed:', err);
  } finally {
    if (db && typeof db.$disconnect === 'function') {
      await db.$disconnect();
    }
  }
})();
