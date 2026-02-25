import { z } from 'zod';

export const loanSchema = z.object({
    clientId: z.string().uuid('ID de cliente inválido'),
    loanNumber: z.string().min(1, 'Número de préstamo es requerido'),
    amount: z.string().or(z.number()).transform((val) => Number(val)),
    approvedAmount: z.string().or(z.number()).transform((val) => Number(val)).optional(),
    interestRate: z.string().or(z.number()).transform((val) => Number(val)),
    termMonths: z.number().int().positive(),
    method: z.enum(['french', 'german']).default('french'),
    purpose: z.string().optional(),
    status: z.enum(['pending', 'approved', 'active', 'paid', 'rejected', 'defaulted']).default('pending'),
    disbursementDate: z.string().optional(), // YYYY-MM-DD
    firstPaymentDate: z.string().optional(), // YYYY-MM-DD
});

export type LoanInput = z.infer<typeof loanSchema>;
