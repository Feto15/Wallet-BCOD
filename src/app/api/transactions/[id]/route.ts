import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { db } from '@/db/client';
import { transactions, transferGroups } from '@/db/schema';
import { txIdParamSchema } from '@/lib/validation';
import { eq } from 'drizzle-orm';

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = txIdParamSchema.parse(params);

    const [existing] = await db
      .select({
        id: transactions.id,
        transferGroupId: transactions.transferGroupId,
      })
      .from(transactions)
      .where(eq(transactions.id, id));

    if (!existing) {
      return NextResponse.json(
        { error: 'Transaksi tidak ditemukan' },
        { status: 404 }
      );
    }

    if (existing.transferGroupId) {
      await db
        .delete(transferGroups)
        .where(eq(transferGroups.id, existing.transferGroupId));
    } else {
      await db.delete(transactions).where(eq(transactions.id, id));
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Parameter transaksi tidak valid' },
        { status: 400 }
      );
    }

    if (error instanceof Error) {
      return NextResponse.json(
        { error: 'Gagal menghapus transaksi' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server' },
      { status: 500 }
    );
  }
}
