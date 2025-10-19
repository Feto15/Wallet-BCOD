'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/db/client';
import { transactions } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

/**
 * Server Action: Delete Transaction (Hard Delete)
 * 
 * This performs a simple hard delete of a transaction.
 * Note: For transfer transactions, you should delete both
 * related transactions (or implement logic to handle transfer groups).
 * 
 * @param formData - FormData containing transaction id
 * @returns Success or error message
 */
export async function deleteTransactionAction(formData: FormData) {
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

    const transactionId = parseInt(parsed.data.id, 10);

    if (isNaN(transactionId)) {
      return {
        success: false,
        error: 'Invalid transaction ID format',
      };
    }

    // Check if transaction exists
    const [existingTransaction] = await db
      .select()
      .from(transactions)
      .where(eq(transactions.id, transactionId))
      .limit(1);

    if (!existingTransaction) {
      return {
        success: false,
        error: 'Transaction not found',
      };
    }

    // Perform hard delete
    await db.delete(transactions).where(eq(transactions.id, transactionId));

    // Revalidate relevant paths
    revalidatePath('/transactions');
    revalidatePath('/wallets');
    revalidatePath('/');

    return {
      success: true,
      message: 'Transaction deleted successfully',
    };
  } catch (error) {
    console.error('Error deleting transaction:', error);
    return {
      success: false,
      error: 'Failed to delete transaction. Please try again.',
    };
  }
}
