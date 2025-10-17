import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/client';
import { wallets } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const walletId = parseInt(id, 10);

    if (isNaN(walletId)) {
      return NextResponse.json(
        { error: 'ID wallet tidak valid' },
        { status: 400 }
      );
    }

    const [updatedWallet] = await db
      .update(wallets)
      .set({ isArchived: true })
      .where(eq(wallets.id, walletId))
      .returning();

    if (!updatedWallet) {
      return NextResponse.json(
        { error: 'Wallet tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedWallet);
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        { error: 'Gagal mengarsipkan wallet', details: error.message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
