#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

async function checkData() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('🔍 Checking database data...\n');

    const walletsCount = await pool.query('SELECT COUNT(*) as count FROM wallets;');
    const categoriesCount = await pool.query('SELECT COUNT(*) as count FROM categories;');
    const transactionsCount = await pool.query('SELECT COUNT(*) as count FROM transactions;');

    console.log(`📊 Data summary:`);
    console.log(`  - Wallets: ${walletsCount.rows[0].count}`);
    console.log(`  - Categories: ${categoriesCount.rows[0].count}`);
    console.log(`  - Transactions: ${transactionsCount.rows[0].count}`);

    if (walletsCount.rows[0].count === '0') {
      console.log('\n⚠️  No data found. Run: pnpm db:seed');
    } else {
      console.log('\n✅ Database has data');
      
      const wallets = await pool.query('SELECT * FROM wallets LIMIT 3;');
      console.log('\n📋 Sample wallets:');
      wallets.rows.forEach(w => {
        console.log(`  - ID: ${w.id}, Name: ${w.name}, Currency: ${w.currency}`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkData();
