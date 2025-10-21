import { z } from 'zod';

// Wallet schemas
export const walletCreateSchema = z.object({
  name: z.string().min(1, 'Nama wallet harus diisi'),
});

export const walletQuerySchema = z.object({
  include_archived: z.enum(['true', 'false']).optional().default('false'),
});

// Category schemas
export const categoryCreateSchema = z.object({
  name: z.string().min(1, 'Nama kategori harus diisi'),
  type: z.enum(['expense', 'income'], {
    message: 'Tipe kategori harus expense atau income',
  }),
});

export const categoryQuerySchema = z.object({
  type: z.enum(['expense', 'income']).optional(),
  include_archived: z.enum(['true', 'false']).optional().default('false'),
});

// Transaction schemas
export const txCreateExpenseIncomeSchema = z.object({
  type: z.enum(['expense', 'income']),
  wallet_id: z.number().int().positive('Wallet ID harus valid'),
  category_id: z.number().int().positive('Kategori ID harus valid').nullable(),
  amount: z.number().int().positive('Jumlah harus lebih dari 0'),
  occurred_at: z.string().regex(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/, 'Format tanggal harus YYYY-MM-DD HH:mm'),
  note: z.string().optional(),
});

export const txCreateTransferSchema = z.object({
  type: z.literal('transfer'),
  from_wallet_id: z.number().int().positive('From wallet ID harus valid'),
  to_wallet_id: z.number().int().positive('To wallet ID harus valid'),
  amount: z.number().int().positive('Jumlah harus lebih dari 0'),
  occurred_at: z.string().regex(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/, 'Format tanggal harus YYYY-MM-DD HH:mm'),
  note: z.string().optional(),
}).refine(
  (data) => data.from_wallet_id !== data.to_wallet_id,
  { message: 'Wallet asal dan tujuan tidak boleh sama' }
);

export const txCreateSchema = z.discriminatedUnion('type', [
  txCreateExpenseIncomeSchema,
  txCreateTransferSchema,
]);

// Transaction query schema
export const txQuerySchema = z.object({
  type: z.enum(['expense', 'income', 'transfer']).optional(),
  wallet_id: z.string().transform(Number).pipe(z.number().int().positive()).optional(),
  category_id: z.string().transform(Number).pipe(z.number().int().positive()).optional(),
  date_from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  date_to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

export const txIdParamSchema = z.object({
  id: z.string().transform(Number).pipe(z.number().int().positive('Transaction ID harus valid')),
});

// Balance query schema
export const balanceQuerySchema = z.object({
  wallet_id: z.string().transform(Number).pipe(z.number().int().positive()).optional(),
});

// Monthly summary query schema
export const monthlySummaryQuerySchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/, 'Format bulan harus YYYY-MM'),
});
