import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/client';
import { transactions, categories } from '@/db/schema';
import { monthlySummaryQuerySchema } from '@/lib/validation';
import { eq, and, gte, lte, sql, inArray } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const month = searchParams.get('month');
    
    if (!month) {
      return NextResponse.json(
        { error: 'Parameter month diperlukan (format: YYYY-MM)' },
        { status: 400 }
      );
    }

    const query = monthlySummaryQuerySchema.parse({ month });

    // Parse month to get start and end dates
    const [year, monthNum] = query.month.split('-');
    const startDate = new Date(`${year}-${monthNum}-01 00:00:00`);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);
    endDate.setSeconds(endDate.getSeconds() - 1); // Last second of the month

    // Get summary grouped by category
    const results = await db
      .select({
        categoryId: transactions.categoryId,
        categoryName: categories.name,
        categoryType: categories.type,
        type: transactions.type,
        total: sql<number>`SUM(${transactions.amount})`.as('total'),
      })
      .from(transactions)
      .leftJoin(categories, eq(transactions.categoryId, categories.id))
      .where(
        and(
          gte(transactions.occurredAt, startDate),
          lte(transactions.occurredAt, endDate),
          inArray(transactions.type, ['expense', 'income'])
        )
      )
      .groupBy(transactions.categoryId, categories.name, categories.type, transactions.type);

    // Calculate totals
    const totalExpense = results
      .filter((r) => r.type === 'expense')
      .reduce((sum, r) => sum + (r.total || 0), 0);

    const totalIncome = results
      .filter((r) => r.type === 'income')
      .reduce((sum, r) => sum + (r.total || 0), 0);

    return NextResponse.json({
      month: query.month,
      period: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
      },
      summary: {
        totalExpense,
        totalIncome,
        net: totalIncome - totalExpense,
      },
      byCategory: results.map((r) => ({
        categoryId: r.categoryId,
        categoryName: r.categoryName,
        categoryType: r.categoryType,
        type: r.type,
        total: r.total || 0,
      })),
    });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        { error: 'Gagal mengambil ringkasan bulanan', details: error.message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
