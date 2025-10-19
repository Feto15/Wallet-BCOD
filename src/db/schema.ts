import { pgTable, serial, varchar, boolean, timestamp, integer, pgEnum, text, index, check } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// Enum untuk transaction type
export const txTypeEnum = pgEnum('tx_type', ['expense', 'income', 'transfer']);

// Enum untuk category type
export const categoryTypeEnum = pgEnum('category_type', ['expense', 'income']);

// Tabel Wallets
export const wallets = pgTable('wallets', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  currency: varchar('currency', { length: 3 }).notNull().default('IDR'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Tabel Categories
export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  type: categoryTypeEnum('type').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Tabel Transfer Groups
export const transferGroups = pgTable('transfer_groups', {
  id: serial('id').primaryKey(),
  note: text('note'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Tabel Transactions
export const transactions = pgTable('transactions', {
  id: serial('id').primaryKey(),
  walletId: integer('wallet_id').notNull().references(() => wallets.id, { onDelete: 'cascade' }),
  categoryId: integer('category_id').references(() => categories.id, { onDelete: 'set null' }),
  type: txTypeEnum('type').notNull(),
  amount: integer('amount').notNull(),
  note: text('note'),
  occurredAt: timestamp('occurred_at').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  transferGroupId: integer('transfer_group_id').references(() => transferGroups.id, { onDelete: 'cascade' }),
}, (table) => ({
  // Indexes (v1.2: added wallet_created, category, transfer_group)
  occurredAtIdx: index('transactions_occurred_at_idx').on(table.occurredAt),
  walletCreatedIdx: index('idx_tx_wallet_created').on(table.walletId, table.createdAt),
  categoryIdx: index('idx_tx_category').on(table.categoryId),
  transferGroupIdx: index('idx_tx_transfer_group').on(table.transferGroupId),
  
  // Constraints
  amountCheck: check('amount_positive', sql`${table.amount} > 0`),
  transferCategoryCheck: check('transfer_no_category', sql`(${table.type} = 'transfer' AND ${table.categoryId} IS NULL) OR (${table.type} != 'transfer')`),
}));

// Types untuk TypeScript
export type Wallet = typeof wallets.$inferSelect;
export type NewWallet = typeof wallets.$inferInsert;

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;

export type TransferGroup = typeof transferGroups.$inferSelect;
export type NewTransferGroup = typeof transferGroups.$inferInsert;

export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;
