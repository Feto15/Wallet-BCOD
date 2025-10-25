import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/client';
import { transactions, wallets } from '@/db/schema';
import { balanceQuerySchema } from '@/lib/validation';
import { eq, sql, and, isNotNull } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = balanceQuerySchema.parse({
      wallet_id: searchParams.get('wallet_id') || undefined,
    });

    // Single-query aggregation to avoid N+1
    // Step 1: Create subquery for min ID per transfer group
    const minIdPerGroup = db
      .select({
        transferGroupId: transactions.transferGroupId,
        minId: sql<number>`MIN(${transactions.id})`.as('minId'),
      })
      .from(transactions)
      .where(isNotNull(transactions.transferGroupId))
      .groupBy(transactions.transferGroupId)
      .as('g');

    // Step 2: Join wallets with transactions and transfer group info
    const t = transactions;
    const g = minIdPerGroup;

    // Build wallet filter condition
    const walletConditions = [];
    if (query.wallet_id) {
      walletConditions.push(eq(wallets.id, query.wallet_id));
    }

    // Step 3: Single aggregation query
    const balances = await db
      .select({
        walletId: wallets.id,
        walletName: wallets.name,
        currency: wallets.currency,
        balance: sql<number>`
          COALESCE(
            SUM(
              CASE
                WHEN ${t.type} = 'income' THEN ${t.amount}
                WHEN ${t.type} = 'expense' THEN -${t.amount}
                WHEN ${t.type} = 'transfer' AND ${t.id} = COALESCE(${g.minId}, (
                  SELECT MIN(t2.id)
                  FROM ${transactions} t2
                  WHERE t2.transfer_group_id = ${t.transferGroupId}
                )) THEN -${t.amount}
                WHEN ${t.type} = 'transfer' THEN ${t.amount}
                ELSE 0
              END
            ),
            0
          )
        `.as('balance'),
      })
      .from(wallets)
      .leftJoin(t, eq(t.walletId, wallets.id))
      .leftJoin(g, eq(g.transferGroupId, t.transferGroupId))
      .where(walletConditions.length > 0 ? and(...walletConditions) : undefined)
      .groupBy(wallets.id, wallets.name, wallets.currency);

    // Normalize balance to number (Postgres/Drizzle may return bigint as string)
    const normalized = balances.map((b) => ({
      ...b,
      balance: Number(b.balance ?? 0),
    }));

    return NextResponse.json(normalized);
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        { error: 'Gagal mengambil saldo', details: error.message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
