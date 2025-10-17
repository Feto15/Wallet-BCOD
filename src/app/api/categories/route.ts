import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/client';
import { categories } from '@/db/schema';
import { categoryCreateSchema, categoryQuerySchema } from '@/lib/validation';
import { eq, and } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = categoryQuerySchema.parse({
      type: searchParams.get('type') || undefined,
      include_archived: searchParams.get('include_archived') || 'false',
    });

    const includeArchived = query.include_archived === 'true';
    
    let conditions = [];
    if (!includeArchived) {
      conditions.push(eq(categories.isArchived, false));
    }
    if (query.type) {
      conditions.push(eq(categories.type, query.type));
    }

    const results = conditions.length > 0
      ? await db.select().from(categories).where(and(...conditions))
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
