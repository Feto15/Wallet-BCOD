import { NextResponse } from 'next/server';
import { db } from '@/db/client';
import { transactions, wallets } from '@/db/schema';
import { eq, sql, isNull } from 'drizzle-orm';

export async function GET() {
  try {
    // Batch aggregation for all wallets' summaries in a single query
    // Exclude transfers (transfer_group_id IS NULL)
    const summaries = await db
      .select({
        walletId: wallets.id,
        income: sql<number>`
          COALESCE(
            SUM(
              CASE 
                WHEN ${transactions.type} = 'income' 
                THEN ${transactions.amount}
                ELSE 0
              END
            ),
            0
          )
        `.as('income'),
        expense: sql<number>`
          COALESCE(
            SUM(
              CASE 
                WHEN ${transactions.type} = 'expense' 
                THEN ${transactions.amount}
                ELSE 0
              END
            ),
            0
          )
        `.as('expense'),
        uncategorized: sql<number>`
          COALESCE(
            SUM(
              CASE 
                WHEN ${transactions.categoryId} IS NULL 
                THEN ${transactions.amount}
                ELSE 0
              END
            ),
            0
          )
        `.as('uncategorized'),
      })
      .from(wallets)
      .leftJoin(
        transactions,
        eq(transactions.walletId, wallets.id)
      )
      .where(isNull(transactions.transferGroupId))
      .groupBy(wallets.id);

    // Calculate net for each wallet
    const results = summaries.map((summary) => ({
      walletId: summary.walletId,
      income: Number(summary.income) || 0,
      expense: Number(summary.expense) || 0,
      uncategorized: Number(summary.uncategorized) || 0,
      net: (Number(summary.income) || 0) - (Number(summary.expense) || 0),
    }));

    return NextResponse.json(results);
  } catch (error) {
    console.error('Failed to fetch wallet summaries:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil ringkasan wallet' },
      { status: 500 }
    );
  }
}
