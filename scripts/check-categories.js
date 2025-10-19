#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

async function checkCategories() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('🔍 Checking categories in database...\n');

    const categories = await pool.query(`
      SELECT id, name, type, created_at 
      FROM categories 
      ORDER BY type, name;
    `);

    console.log(`📊 Total categories: ${categories.rows.length}\n`);

    const expense = categories.rows.filter(c => c.type === 'expense');
    const income = categories.rows.filter(c => c.type === 'income');

    console.log(`💸 Expense categories (${expense.length}):`);
    expense.forEach(c => {
      console.log(`  - ID: ${c.id}, Name: "${c.name}", Type: ${c.type}`);
    });

    console.log(`\n💰 Income categories (${income.length}):`);
    income.forEach(c => {
      console.log(`  - ID: ${c.id}, Name: "${c.name}", Type: ${c.type}`);
    });

    if (categories.rows.length === 0) {
      console.log('\n⚠️  No categories found! Run: pnpm db:seed');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkCategories();
