import { z } from 'zod';

export const paymentSchema = z.object({
    loanId: z.string().uuid('ID de préstamo inválido'),
    scheduleId: z.string().uuid('ID de cuota inválido').optional(),
    amountPaid: z.string().or(z.number()).transform((val) => Number(val)),
    paymentMethod: z.enum(['cash', 'transfer', 'card']),
    referenceNumber: z.string().optional(),
    lateFee: z.string().or(z.number()).transform((val) => Number(val)).default(0),
    notes: z.string().optional(),
});

export type PaymentInput = z.infer<typeof paymentSchema>;
