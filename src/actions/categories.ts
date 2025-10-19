'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/db/client';
import { categories } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

/**
 * Server Action: Delete Category (Hard Delete)
 * 
 * This performs a hard delete with SET NULL behavior.
 * Transactions associated with this category will have their
 * category_id set to NULL (becoming "Uncategorized") due to
 * the ON DELETE SET NULL constraint in the database schema.
 * 
 * @param formData - FormData containing category id
 * @returns Success or error message
 */
export async function deleteCategoryAction(formData: FormData) {
  try {
    // Validate input
    const schema = z.object({
      id: z.string().min(1, 'ID is required'),
    });

    const rawId = formData.get('id');
    const parsed = schema.safeParse({ id: rawId });

    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || 'Invalid input',
      };
    }

    const categoryId = parseInt(parsed.data.id, 10);

    if (isNaN(categoryId)) {
      return {
        success: false,
        error: 'Invalid category ID format',
      };
    }

    // Check if category exists
    const [existingCategory] = await db
      .select()
      .from(categories)
      .where(eq(categories.id, categoryId))
      .limit(1);

    if (!existingCategory) {
      return {
        success: false,
        error: 'Category not found',
      };
    }

    // Perform hard delete
    // Transactions will have their category_id set to NULL automatically
    await db.delete(categories).where(eq(categories.id, categoryId));

    // Revalidate relevant paths
    revalidatePath('/categories');
    revalidatePath('/transactions');
    revalidatePath('/');

    return {
      success: true,
      message: `Category "${existingCategory.name}" deleted successfully. Related transactions are now uncategorized.`,
    };
  } catch (error) {
    console.error('Error deleting category:', error);
    return {
      success: false,
      error: 'Failed to delete category. Please try again.',
    };
  }
}
