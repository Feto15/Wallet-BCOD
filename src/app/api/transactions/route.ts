import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/client';
import { transactions, wallets, categories, transferGroups } from '@/db/schema';
import { txCreateSchema, txQuerySchema } from '@/lib/validation';
import { eq, and, gte, lte, desc, sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = txQuerySchema.parse({
      type: searchParams.get('type') || undefined,
      wallet_id: searchParams.get('wallet_id') || undefined,
      category_id: searchParams.get('category_id') || undefined,
      date_from: searchParams.get('date_from') || undefined,
      date_to: searchParams.get('date_to') || undefined,
    });

    // Build WHERE conditions
    const conditions = [];
    if (query.type) {
      conditions.push(eq(transactions.type, query.type));
    }
    if (query.wallet_id) {
      conditions.push(eq(transactions.walletId, query.wallet_id));
    }
    if (query.category_id) {
      conditions.push(eq(transactions.categoryId, query.category_id));
    }
    if (query.date_from) {
      conditions.push(gte(transactions.occurredAt, new Date(query.date_from + ' 00:00:00')));
    }
    if (query.date_to) {
      conditions.push(lte(transactions.occurredAt, new Date(query.date_to + ' 23:59:59')));
    }

    // Query with joins
    const results = await db
      .select({
        id: transactions.id,
        walletId: transactions.walletId,
        walletName: wallets.name,
        categoryId: transactions.categoryId,
        categoryName: categories.name,
        categoryType: categories.type,
        type: transactions.type,
        amount: transactions.amount,
        note: transactions.note,
        occurredAt: transactions.occurredAt,
        createdAt: transactions.createdAt,
        transferGroupId: transactions.transferGroupId,
      })
      .from(transactions)
      .leftJoin(wallets, eq(transactions.walletId, wallets.id))
      .leftJoin(categories, eq(transactions.categoryId, categories.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(transactions.occurredAt));

    return NextResponse.json(results);
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        { error: 'Gagal mengambil data transaksi', details: error.message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = txCreateSchema.parse(body);

    // Validate wallets and categories are not archived
    if (validated.type === 'expense' || validated.type === 'income') {
      // Check wallet
      const [wallet] = await db
        .select()
        .from(wallets)
        .where(eq(wallets.id, validated.wallet_id));
      
      if (!wallet) {
        return NextResponse.json(
          { error: 'Wallet tidak ditemukan' },
          { status: 404 }
        );
      }
      
      if (wallet.isArchived) {
        return NextResponse.json(
          { error: 'Tidak dapat membuat transaksi dengan wallet yang diarsipkan' },
          { status: 400 }
        );
      }

      // Check category
      const [category] = await db
        .select()
        .from(categories)
        .where(eq(categories.id, validated.category_id));
      
      if (!category) {
        return NextResponse.json(
          { error: 'Kategori tidak ditemukan' },
          { status: 404 }
        );
      }
      
      if (category.isArchived) {
        return NextResponse.json(
          { error: 'Tidak dapat membuat transaksi dengan kategori yang diarsipkan' },
          { status: 400 }
        );
      }

      // Create expense or income transaction
      const [newTransaction] = await db
        .insert(transactions)
        .values({
          walletId: validated.wallet_id,
          categoryId: validated.category_id,
          type: validated.type,
          amount: validated.amount,
          occurredAt: new Date(validated.occurred_at.replace(' ', 'T')),
          note: validated.note,
        })
        .returning();

      return NextResponse.json(newTransaction, { status: 201 });
    } else if (validated.type === 'transfer') {
      // Check from wallet
      const [fromWallet] = await db
        .select()
        .from(wallets)
        .where(eq(wallets.id, validated.from_wallet_id));
      
      if (!fromWallet) {
        return NextResponse.json(
          { error: 'Wallet asal tidak ditemukan' },
          { status: 404 }
        );
      }
      
      if (fromWallet.isArchived) {
        return NextResponse.json(
          { error: 'Tidak dapat membuat transaksi dengan wallet yang diarsipkan' },
          { status: 400 }
        );
      }

      // Check to wallet
      const [toWallet] = await db
        .select()
        .from(wallets)
        .where(eq(wallets.id, validated.to_wallet_id));
      
      if (!toWallet) {
        return NextResponse.json(
          { error: 'Wallet tujuan tidak ditemukan' },
          { status: 404 }
        );
      }
      
      if (toWallet.isArchived) {
        return NextResponse.json(
          { error: 'Tidak dapat membuat transaksi dengan wallet yang diarsipkan' },
          { status: 400 }
        );
      }

      // Create transfer group and two transaction records
      const [transferGroup] = await db
        .insert(transferGroups)
        .values({
          note: validated.note,
        })
        .returning();

      const occurredAt = new Date(validated.occurred_at.replace(' ', 'T'));

      // Insert outgoing transaction (negative)
      const [outgoingTx] = await db
        .insert(transactions)
        .values({
          walletId: validated.from_wallet_id,
          categoryId: null,
          type: 'transfer',
          amount: validated.amount,
          occurredAt,
          note: validated.note,
          transferGroupId: transferGroup.id,
        })
        .returning();

      // Insert incoming transaction (positive)
      const [incomingTx] = await db
        .insert(transactions)
        .values({
          walletId: validated.to_wallet_id,
          categoryId: null,
          type: 'transfer',
          amount: validated.amount,
          occurredAt,
          note: validated.note,
          transferGroupId: transferGroup.id,
        })
        .returning();

      return NextResponse.json(
        {
          transferGroupId: transferGroup.id,
          outgoing: outgoingTx,
          incoming: incomingTx,
        },
        { status: 201 }
      );
    }

    return NextResponse.json(
      { error: 'Tipe transaksi tidak valid' },
      { status: 400 }
    );
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        { error: 'Gagal membuat transaksi', details: error.message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
