'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/db/client';
import { wallets } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

/**
 * Server Action: Delete Wallet (Hard Delete)
 * 
 * This performs a CASCADE delete - all transactions associated
 * with this wallet will also be deleted automatically due to
 * the ON DELETE CASCADE constraint in the database schema.
 * 
 * @param formData - FormData containing wallet id
 * @returns Success or error message
 */
export async function deleteWalletAction(formData: FormData) {
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
        error: parsed.error.errors[0]?.message || 'Invalid input',
      };
    }

    const walletId = parseInt(parsed.data.id, 10);

    if (isNaN(walletId)) {
      return {
        success: false,
        error: 'Invalid wallet ID format',
      };
    }

    // Check if wallet exists
    const [existingWallet] = await db
      .select()
      .from(wallets)
      .where(eq(wallets.id, walletId))
      .limit(1);

    if (!existingWallet) {
      return {
        success: false,
        error: 'Wallet not found',
      };
    }

    // TODO: Add guard to prevent deleting default wallet if that concept exists
    // Example:
    // if (existingWallet.isDefault) {
    //   return {
    //     success: false,
    //     error: 'Cannot delete default wallet',
    //   };
    // }

    // Perform hard delete
    // Transactions will be cascade deleted automatically
    await db.delete(wallets).where(eq(wallets.id, walletId));

    // Revalidate relevant paths
    revalidatePath('/wallets');
    revalidatePath('/');
    revalidatePath('/transactions');

    return {
      success: true,
      message: `Wallet "${existingWallet.name}" deleted successfully`,
    };
  } catch (error) {
    console.error('Error deleting wallet:', error);
    return {
      success: false,
      error: 'Failed to delete wallet. Please try again.',
    };
  }
}
