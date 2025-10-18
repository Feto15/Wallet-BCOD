#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

async function checkSchema() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('🔍 Checking database schema...\n');

    // Check wallets table columns
    const walletsColumns = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'wallets'
      ORDER BY ordinal_position;
    `);

    console.log('📋 Wallets table columns:');
    walletsColumns.rows.forEach(row => {
      console.log(`  - ${row.column_name} (${row.data_type})`);
    });
    console.log('');

    // Check categories table columns
    const categoriesColumns = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'categories'
      ORDER BY ordinal_position;
    `);

    console.log('📋 Categories table columns:');
    categoriesColumns.rows.forEach(row => {
      console.log(`  - ${row.column_name} (${row.data_type})`);
    });
    console.log('');

    // Check foreign key constraints on transactions
    const fkConstraints = await pool.query(`
      SELECT
        con.conname AS constraint_name,
        CASE con.confdeltype
          WHEN 'a' THEN 'NO ACTION'
          WHEN 'r' THEN 'RESTRICT'
          WHEN 'c' THEN 'CASCADE'
          WHEN 'n' THEN 'SET NULL'
          WHEN 'd' THEN 'SET DEFAULT'
        END AS on_delete
      FROM pg_constraint con
      WHERE con.conrelid = 'transactions'::regclass
        AND con.contype = 'f';
    `);

    console.log('🔗 Foreign key constraints on transactions:');
    fkConstraints.rows.forEach(row => {
      console.log(`  - ${row.constraint_name}: ON DELETE ${row.on_delete}`);
    });
    console.log('');

    // Test: Check if is_archived still exists
    const hasIsArchived = walletsColumns.rows.some(row => row.column_name === 'is_archived');
    if (hasIsArchived) {
      console.log('⚠️  WARNING: is_archived column still exists in wallets table!');
    } else {
      console.log('✅ is_archived column successfully removed from wallets');
    }

    const hasIsArchivedCat = categoriesColumns.rows.some(row => row.column_name === 'is_archived');
    if (hasIsArchivedCat) {
      console.log('⚠️  WARNING: is_archived column still exists in categories table!');
    } else {
      console.log('✅ is_archived column successfully removed from categories');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkSchema();
