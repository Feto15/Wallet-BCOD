#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

async function runPendingMigrations() {
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL tidak ditemukan di .env.local');
    process.exit(1);
  }

  console.log('🔄 Running pending migrations...\n');
  
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    // Read migration journal to see what's been applied
    const journalPath = path.join(__dirname, '..', 'drizzle', 'meta', '_journal.json');
    const journal = JSON.parse(fs.readFileSync(journalPath, 'utf8'));
    
    console.log('📋 Migration journal:');
    journal.entries.forEach(entry => {
      console.log(`  ✓ ${entry.tag}`);
    });
    console.log('');

    // Check which migrations need to be run
    // Migration 0001: Drop indexes and is_archived columns
    console.log('🔧 Running migration 0001 (drop is_archived)...');
    const migration0001 = fs.readFileSync(
      path.join(__dirname, '..', 'drizzle', '0001_dazzling_whirlwind.sql'),
      'utf8'
    );

    const statements0001 = migration0001
      .split('--> statement-breakpoint')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    for (const statement of statements0001) {
      try {
        await pool.query(statement);
        console.log(`  ✓ Executed: ${statement.substring(0, 60)}...`);
      } catch (error) {
        if (error.message.includes('does not exist')) {
          console.log(`  ⚠️  Skipped (already done): ${statement.substring(0, 60)}...`);
        } else {
          console.error(`  ❌ Error: ${error.message}`);
          throw error;
        }
      }
    }

    // Migration 0002: Update foreign key constraints
    console.log('\n🔧 Running migration 0002 (foreign key constraints)...');
    const migration0002 = fs.readFileSync(
      path.join(__dirname, '..', 'drizzle', '0002_tan_jean_grey.sql'),
      'utf8'
    );

    const statements0002 = migration0002
      .split('--> statement-breakpoint')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    for (const statement of statements0002) {
      try {
        await pool.query(statement);
        console.log(`  ✓ Executed: ${statement.substring(0, 60)}...`);
      } catch (error) {
        if (error.message.includes('does not exist')) {
          console.log(`  ⚠️  Skipped (already done): ${statement.substring(0, 60)}...`);
        } else {
          console.error(`  ❌ Error: ${error.message}`);
          // Don't throw, continue with next statement
        }
      }
    }

    console.log('\n✅ Migration completed!\n');
    console.log('🔍 Verifying changes...');

    // Verify the schema
    const walletsCheck = await pool.query(`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'wallets' AND column_name = 'is_archived';
    `);

    if (walletsCheck.rows.length === 0) {
      console.log('  ✅ is_archived removed from wallets');
    } else {
      console.log('  ⚠️  is_archived still exists in wallets');
    }

    const fkCheck = await pool.query(`
      SELECT conname, confdeltype
      FROM pg_constraint
      WHERE conrelid = 'transactions'::regclass AND contype = 'f';
    `);

    console.log('\n  Foreign key constraints:');
    fkCheck.rows.forEach(row => {
      const deleteAction = {
        'a': 'NO ACTION',
        'r': 'RESTRICT',
        'c': 'CASCADE',
        'n': 'SET NULL',
        'd': 'SET DEFAULT'
      }[row.confdeltype];
      console.log(`    - ${row.conname}: ${deleteAction}`);
    });

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error('Details:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runPendingMigrations();
