import 'dotenv/config';
import { db } from '../src/db/client';
import { wallets, categories, transactions, transferGroups } from '../src/db/schema';

async function seed() {
  console.log('🌱 Starting seed...');

  try {
    // Insert wallets (v1.2: removed isArchived)
    console.log('Creating wallets...');
    const [bcaWallet, cashWallet] = await db
      .insert(wallets)
      .values([
        { name: 'BCA', currency: 'IDR' },
        { name: 'Cash', currency: 'IDR' },
      ])
      .returning();

    console.log(`✅ Created wallets: ${bcaWallet.name}, ${cashWallet.name}`);

    // Insert categories (v1.2: removed isArchived)
    console.log('Creating categories...');
    const expenseCategories = await db
      .insert(categories)
      .values([
        { name: 'Makan & Minum', type: 'expense' },
        { name: 'Transport', type: 'expense' },
        { name: 'Belanja Rumah', type: 'expense' },
      ])
      .returning();

    const incomeCategories = await db
      .insert(categories)
      .values([
        { name: 'Gaji', type: 'income' },
        { name: 'Lain-lain', type: 'income' },
      ])
      .returning();

    console.log(`✅ Created ${expenseCategories.length} expense categories and ${incomeCategories.length} income categories`);

    // Get categories
    const [makanMinumCat, transportCat, belanjaCat] = expenseCategories;
    const [gajiCat, lainCat] = incomeCategories;

    // Insert sample transactions
    console.log('Creating sample transactions...');

    // 1. Income: Gaji bulan ini (ke BCA)
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 9, 0);
    
    await db.insert(transactions).values({
      walletId: bcaWallet.id,
      categoryId: gajiCat.id,
      type: 'income',
      amount: 5000000, // 5 juta
      occurredAt: firstDayOfMonth,
      note: 'Gaji bulan ini',
    });

    console.log('✅ Created income transaction: Gaji');

    // 2. Expense: Makan siang (dari BCA)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(12, 30);

    await db.insert(transactions).values({
      walletId: bcaWallet.id,
      categoryId: makanMinumCat.id,
      type: 'expense',
      amount: 50000, // 50rb
      occurredAt: yesterday,
      note: 'Makan siang di warteg',
    });

    console.log('✅ Created expense transaction: Makan siang');

    // 3. Expense: Transport (dari Cash)
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    twoDaysAgo.setHours(8, 15);

    await db.insert(transactions).values({
      walletId: cashWallet.id,
      categoryId: transportCat.id,
      type: 'expense',
      amount: 20000, // 20rb
      occurredAt: twoDaysAgo,
      note: 'Ojek online',
    });

    console.log('✅ Created expense transaction: Transport');

    // 4. Transfer: BCA -> Cash (500rb)
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    threeDaysAgo.setHours(14, 0);

    const [transferGroup] = await db
      .insert(transferGroups)
      .values({
        note: 'Ambil tunai untuk jajan',
      })
      .returning();

    // Outgoing from BCA
    await db.insert(transactions).values({
      walletId: bcaWallet.id,
      categoryId: null,
      type: 'transfer',
      amount: 500000, // 500rb
      occurredAt: threeDaysAgo,
      note: 'Ambil tunai untuk jajan',
      transferGroupId: transferGroup.id,
    });

    // Incoming to Cash
    await db.insert(transactions).values({
      walletId: cashWallet.id,
      categoryId: null,
      type: 'transfer',
      amount: 500000, // 500rb
      occurredAt: threeDaysAgo,
      note: 'Ambil tunai untuk jajan',
      transferGroupId: transferGroup.id,
    });

    console.log('✅ Created transfer transaction: BCA -> Cash');

    // 5. More sample expenses
    const fourDaysAgo = new Date();
    fourDaysAgo.setDate(fourDaysAgo.getDate() - 4);
    fourDaysAgo.setHours(19, 30);

    await db.insert(transactions).values({
      walletId: bcaWallet.id,
      categoryId: belanjaCat.id,
      type: 'expense',
      amount: 150000, // 150rb
      occurredAt: fourDaysAgo,
      note: 'Belanja bulanan di minimarket',
    });

    console.log('✅ Created expense transaction: Belanja rumah');

    console.log('\n🎉 Seed completed successfully!');
    console.log('\nSummary:');
    console.log(`- 2 wallets created`);
    console.log(`- 5 categories created`);
    console.log(`- 6 transactions created (including 2 transfer transactions)`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

seed();
