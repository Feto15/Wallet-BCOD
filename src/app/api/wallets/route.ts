import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/client';
import { wallets } from '@/db/schema';
import { walletCreateSchema, walletQuerySchema } from '@/lib/validation';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = walletQuerySchema.parse({
      include_archived: searchParams.get('include_archived') || 'false',
    });

    const includeArchived = query.include_archived === 'true';

    const results = includeArchived
      ? await db.select().from(wallets)
      : await db.select().from(wallets).where(eq(wallets.isArchived, false));

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
        isArchived: false,
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
