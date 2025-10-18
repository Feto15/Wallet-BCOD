import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/client';
import { categories } from '@/db/schema';
import { categoryCreateSchema } from '@/lib/validation';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    // v1.2: Removed include_archived parameter - only active categories exist now
    const searchParams = request.nextUrl.searchParams;
    const typeParam = searchParams.get('type');
    
    const results = typeParam
      ? await db.select().from(categories).where(eq(categories.type, typeParam as 'expense' | 'income'))
      : await db.select().from(categories);

    return NextResponse.json(results);
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        { error: 'Gagal mengambil data kategori', details: error.message },
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
    const validated = categoryCreateSchema.parse(body);

    const [newCategory] = await db
      .insert(categories)
      .values({
        name: validated.name,
        type: validated.type,
        isArchived: false,
      })
      .returning();

    return NextResponse.json(newCategory, { status: 201 });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        { error: 'Gagal membuat kategori', details: error.message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
 {
    if (error instanceof Error) {
      return NextResponse.json(
        { error: 'Gagal membuat kategori', details: error.message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
