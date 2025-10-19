import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/client';
import { transactions, categories, wallets } from '@/db/schema';
import { eq, and, gte, lte, isNull, sql } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

/**
 * GET /api/wallets/[id]/summary
 * 
 * Returns summary statistics for a wallet:
 * - income: Total income (excluding transfers)
 * - expense: Total expenses (excluding transfers)
 * - net: Net balance change (income - expense)
 * - uncategorized: Total amount of transactions without category
 * 
 * Query params:
 * - from: ISO date string (YYYY-MM-DD) - start date filter
 * - to: ISO date string (YYYY-MM-DD) - end date filter
 * 
 * Transfers are excluded via WHERE transfer_group_id IS NULL
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const walletId = parseInt(id, 10);

    if (isNaN(walletId)) {
      return NextResponse.json(
        { error: 'Invalid wallet ID' },
        { status: 400 }
      );
    }

    // Check if wallet exists
    const [wallet] = await db
      .select()
      .from(wallets)
      .where(eq(wallets.id, walletId))
      .limit(1);

    if (!wallet) {
      return NextResponse.json(
        { error: 'Wallet not found' },
        { status: 404 }
      );
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const fromDate = searchParams.get('from');
    const toDate = searchParams.get('to');

    // Build WHERE conditions
    const conditions = [
      eq(transactions.walletId, walletId),
      isNull(transactions.transferGroupId), // Exclude transfers
    ];

    // Add date filters if provided
    if (fromDate) {
      conditions.push(gte(transactions.createdAt, new Date(fromDate)));
    }
    if (toDate) {
      // Add 1 day to include the entire end date
      const endDate = new Date(toDate);
      endDate.setDate(endDate.getDate() + 1);
      conditions.push(lte(transactions.createdAt, endDate));
    }

    // Perform aggregation query
    // Use transaction.type directly (v1.2: support uncategorized transactions)
    const [summary] = await db
      .select({
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
        `,
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
        `,
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
        `,
      })
      .from(transactions)
      .leftJoin(categories, eq(transactions.categoryId, categories.id))
      .where(and(...conditions));

    // Calculate net (income - expense)
    const net = summary.income - summary.expense;

    return NextResponse.json({
      walletId,
      income: summary.income,
      expense: summary.expense,
      net,
      uncategorized: summary.uncategorized,
      ...(fromDate && { from: fromDate }),
      ...(toDate && { to: toDate }),
    });
  } catch (error) {
    console.error('Error fetching wallet summary:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
