#!/usr/bin/env node

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' });

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL tidak ditemukan di .env.local');
    process.exit(1);
  }

  // Debug: Cek format DATABASE_URL (tampilkan 50 karakter pertama)
  const dbUrl = process.env.DATABASE_URL;
  console.log('📍 DATABASE_URL loaded:', dbUrl.substring(0, 50) + '...');
  
  if (dbUrl.includes('user:password@localhost')) {
    console.error('❌ DATABASE_URL masih menggunakan placeholder!');
    console.error('ℹ️  Silakan update file .env.local dengan connection string yang benar.');
    console.error('ℹ️  Format: postgresql://username:password@host:port/database');
    process.exit(1);
  }

  console.log('🔄 Menjalankan migrasi database...');
  
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    // Cek apakah tabel sudah ada
    const checkTable = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'wallets'
      );
    `);

    if (checkTable.rows[0].exists) {
      console.log('ℹ️  Database sudah ter-migrate. Skip migration.');
      return;
    }

    // Read dan execute migration file
    const migrationDir = path.join(__dirname, '..', 'drizzle');
    const files = fs.readdirSync(migrationDir)
      .filter(f => f.endsWith('.sql'))
      .sort();

    for (const file of files) {
      console.log(`📄 Menjalankan: ${file}`);
      const sql = fs.readFileSync(path.join(migrationDir, file), 'utf8');
      
      // Split by statement-breakpoint dan execute satu per satu
      const statements = sql
        .split('--> statement-breakpoint')
        .map(s => s.trim())
        .filter(s => s.length > 0);

      for (const statement of statements) {
        await pool.query(statement);
      }
    }

    console.log('✅ Migrasi berhasil!');
  } catch (error) {
    console.error('❌ Migrasi gagal:', error.message);
    console.error('Detail:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();
