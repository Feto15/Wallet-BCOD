import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/client';
import { transactions, wallets } from '@/db/schema';
import { balanceQuerySchema } from '@/lib/validation';
import { eq, sql, and } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = balanceQuerySchema.parse({
      wallet_id: searchParams.get('wallet_id') || undefined,
    });

    // Get all active wallets or specific wallet
    const conditions = [eq(wallets.isArchived, false)];
    
    if (query.wallet_id) {
      conditions.push(eq(wallets.id, query.wallet_id));
    }

    const walletsList = await db
      .select()
      .from(wallets)
      .where(and(...conditions));

    // Calculate balance for each wallet
    const balances = await Promise.all(
      walletsList.map(async (wallet) => {
        // Calculate balance:
        // - Income: +amount
        // - Expense: -amount
        // - Transfer: For the "from" wallet it's the first record (negative), 
        //             for the "to" wallet it's the second record (positive)
        // We determine this by checking if there's an earlier transaction ID 
        // in the same transfer_group

        const result = await db
          .select({
            balance: sql<number>`
              COALESCE(
                SUM(
                  CASE
                    WHEN ${transactions.type} = 'income' THEN ${transactions.amount}
                    WHEN ${transactions.type} = 'expense' THEN -${transactions.amount}
                    WHEN ${transactions.type} = 'transfer' THEN
                      CASE
                        WHEN (
                          SELECT MIN(t2.id)
                          FROM transactions t2
                          WHERE t2.transfer_group_id = ${transactions.transferGroupId}
                        ) = ${transactions.id} 
                        THEN -${transactions.amount}
                        ELSE ${transactions.amount}
                      END
                  END
                ),
                0
              )
            `.as('balance'),
          })
          .from(transactions)
          .where(eq(transactions.walletId, wallet.id));

        return {
          walletId: wallet.id,
          walletName: wallet.name,
          currency: wallet.currency,
          balance: result[0]?.balance || 0,
        };
      })
    );

    return NextResponse.json(balances);
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
