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

    // Parse month to get start and end dates (use UTC for consistency)
    const [yearStr, monthStr] = query.month.split('-');
    const year = Number(yearStr);
    const monthNum = Number(monthStr);
    
    // Create UTC date range: first day 00:00:00 to last day 23:59:59.999
    const startDate = new Date(Date.UTC(year, monthNum - 1, 1, 0, 0, 0, 0));
    const endDate = new Date(Date.UTC(year, monthNum, 0, 23, 59, 59, 999));

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

    const normalizedResults = results.map((r) => ({
      ...r,
      total: Number(r.total ?? 0),
    }));

    // Calculate totals
    const totalExpense = normalizedResults
      .filter((r) => r.type === 'expense')
      .reduce((sum, r) => sum + r.total, 0);

    const totalIncome = normalizedResults
      .filter((r) => r.type === 'income')
      .reduce((sum, r) => sum + r.total, 0);

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
      byCategory: normalizedResults.map((r) => ({
        categoryId: r.categoryId,
        categoryName: r.categoryName,
        categoryType: r.categoryType,
        type: r.type,
        total: r.total,
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
