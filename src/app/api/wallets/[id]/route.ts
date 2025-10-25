import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/client';
import { wallets } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { walletUpdateSchema } from '@/lib/validation';
import { z } from 'zod';

// Param schema untuk validasi ID
const paramSchema = z.object({
  id: z.string().transform(Number).pipe(z.number().int().positive('Wallet ID harus valid')),
});

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Parse params (awaited)
    const params = await context.params;
    const paramResult = paramSchema.safeParse(params);

    if (!paramResult.success) {
      return NextResponse.json(
        { error: 'Invalid wallet ID' },
        { status: 400 }
      );
    }

    const { id } = paramResult.data;

    // Parse body
    const body = await request.json();
    const validationResult = walletUpdateSchema.safeParse(body);

    if (!validationResult.success) {
      const errors = validationResult.error.errors.map((e) => e.message).join(', ');
      return NextResponse.json(
        { error: errors },
        { status: 400 }
      );
    }

    const { name } = validationResult.data;

    // Check if wallet exists
    const existingWallet = await db
      .select()
      .from(wallets)
      .where(eq(wallets.id, id))
      .limit(1);

    if (existingWallet.length === 0) {
      return NextResponse.json(
        { error: 'Wallet not found' },
        { status: 404 }
      );
    }

    // Update wallet
    const [updatedWallet] = await db
      .update(wallets)
      .set({ name })
      .where(eq(wallets.id, id))
      .returning();

    return NextResponse.json(updatedWallet, { status: 200 });
  } catch (error) {
    console.error('Failed to update wallet:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
