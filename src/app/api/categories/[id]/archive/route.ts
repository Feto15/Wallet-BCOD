import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/client';
import { categories } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const categoryId = parseInt(id, 10);

    if (isNaN(categoryId)) {
      return NextResponse.json(
        { error: 'ID kategori tidak valid' },
        { status: 400 }
      );
    }

    const [updatedCategory] = await db
      .update(categories)
      .set({ isArchived: true })
      .where(eq(categories.id, categoryId))
      .returning();

    if (!updatedCategory) {
      return NextResponse.json(
        { error: 'Kategori tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedCategory);
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        { error: 'Gagal mengarsipkan kategori', details: error.message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
