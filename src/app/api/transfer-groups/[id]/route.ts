import { NextRequest, NextResponse } from 'next/server';
import { z, ZodError } from 'zod';
import { db } from '@/db/client';
import { transactions } from '@/db/schema';
import { eq, asc } from 'drizzle-orm';

// Schema for transfer group ID parameter
const transferGroupIdSchema = z.object({
  id: z.string().transform(Number).pipe(z.number().int().positive('Transfer group ID harus valid')),
});

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Validate transfer group ID
    const { id } = transferGroupIdSchema.parse(params);

    // Query transactions for this transfer group (only minimal fields needed)
    const legs = await db
      .select({
        id: transactions.id,
        walletId: transactions.walletId,
        amount: transactions.amount,
        note: transactions.note,
        occurredAt: transactions.occurredAt,
      })
      .from(transactions)
      .where(eq(transactions.transferGroupId, id))
      .orderBy(asc(transactions.id)); // MIN(id) = outgoing

    // Return the legs (should be 2, but return whatever we have)
    return NextResponse.json(legs, { status: 200 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Parameter transfer group tidak valid' },
        { status: 400 }
      );
    }

    console.error('Failed to fetch transfer legs:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil data transfer' },
      { status: 500 }
    );
  }
}
