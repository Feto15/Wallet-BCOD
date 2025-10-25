import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { db } from '@/db/client';
import { transactions, transferGroups } from '@/db/schema';
import { txIdParamSchema, txUpdateExpenseIncomeSchema, txUpdateTransferSchema } from '@/lib/validation';
import { eq, asc } from 'drizzle-orm';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = txIdParamSchema.parse(params);
    const body = await request.json();

    // Get existing transaction
    const [existing] = await db
      .select({
        id: transactions.id,
        type: transactions.type,
        transferGroupId: transactions.transferGroupId,
        walletId: transactions.walletId,
      })
      .from(transactions)
      .where(eq(transactions.id, id));

    if (!existing) {
      return NextResponse.json(
        { error: 'Transaksi tidak ditemukan' },
        { status: 404 }
      );
    }

    // Handle based on transaction type
    if (existing.type === 'transfer') {
      // Validate transfer update schema
      const validationResult = txUpdateTransferSchema.safeParse(body);
      if (!validationResult.success) {
        const errors = validationResult.error.issues.map((e) => e.message).join(', ');
        return NextResponse.json(
          { error: errors },
          { status: 400 }
        );
      }

      const { from_wallet_id, to_wallet_id, amount, occurred_at, note } = validationResult.data;

      // Update both transfer legs atomically
      await db.transaction(async (tx) => {
        // Get both transfer legs, ordered by id (MIN(id) is outgoing)
        const transferLegs = await tx
          .select({
            id: transactions.id,
            walletId: transactions.walletId,
          })
          .from(transactions)
          .where(eq(transactions.transferGroupId, existing.transferGroupId!))
          .orderBy(asc(transactions.id));

        if (transferLegs.length !== 2) {
          throw new Error('Transfer tidak valid');
        }

        const [outgoingLeg, incomingLeg] = transferLegs;

        // Update outgoing leg (from wallet)
        await tx
          .update(transactions)
          .set({
            walletId: from_wallet_id,
            categoryId: null,
            type: 'transfer',
            amount,
            occurredAt: new Date(occurred_at.replace(' ', 'T')),
            note: note || null,
          })
          .where(eq(transactions.id, outgoingLeg.id));

        // Update incoming leg (to wallet)
        await tx
          .update(transactions)
          .set({
            walletId: to_wallet_id,
            categoryId: null,
            type: 'transfer',
            amount,
            occurredAt: new Date(occurred_at.replace(' ', 'T')),
            note: note || null,
          })
          .where(eq(transactions.id, incomingLeg.id));
      });

      return NextResponse.json({ success: true }, { status: 200 });
    } else {
      // Handle expense/income update
      const validationResult = txUpdateExpenseIncomeSchema.safeParse(body);
      if (!validationResult.success) {
        const errors = validationResult.error.issues.map((e) => e.message).join(', ');
        return NextResponse.json(
          { error: errors },
          { status: 400 }
        );
      }

      const { wallet_id, category_id, amount, occurred_at, note } = validationResult.data;

      // Update single transaction
      await db
        .update(transactions)
        .set({
          walletId: wallet_id,
          categoryId: category_id,
          amount,
          occurredAt: new Date(occurred_at.replace(' ', 'T')),
          note: note || null,
        })
        .where(eq(transactions.id, id));

      return NextResponse.json({ success: true }, { status: 200 });
    }
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Parameter transaksi tidak valid' },
        { status: 400 }
      );
    }

    console.error('Failed to update transaction:', error);
    return NextResponse.json(
      { error: 'Gagal memperbarui transaksi' },
      { status: 500 }
    );
  }
}

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
