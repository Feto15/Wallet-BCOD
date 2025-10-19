import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/client';
import { wallets } from '@/db/schema';
import { walletCreateSchema } from '@/lib/validation';

export async function GET(request: NextRequest) {
  try {
    // v1.2: removed isArchived filtering, just return all wallets
    const results = await db.select().from(wallets);
    return NextResponse.json(results);
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        { error: 'Gagal mengambil data wallet', details: error.message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = walletCreateSchema.parse(body);

    const [newWallet] = await db
      .insert(wallets)
      .values({
        name: validated.name,
        currency: 'IDR',
      })
      .returning();

    return NextResponse.json(newWallet, { status: 201 });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        { error: 'Gagal membuat wallet', details: error.message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
