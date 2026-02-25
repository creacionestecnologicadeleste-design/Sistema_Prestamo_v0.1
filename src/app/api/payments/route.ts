import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { payments, amortizationSchedule } from '@/lib/db/schema';
import { paymentSchema } from '@/lib/validations/payment.schema';
import { eq } from 'drizzle-orm';

export async function POST(request: Request) {
    try {
        const json = await request.json();
        const validatedData = paymentSchema.parse(json);

        const result = await db.transaction(async (tx) => {
            // 1. Record the payment
            const [newPayment] = await tx.insert(payments).values({
                ...validatedData,
                amountPaid: validatedData.amountPaid.toString(),
                lateFee: validatedData.lateFee.toString(),
            }).returning();

            // 2. If it's linked to a specific installment, update its status
            if (validatedData.scheduleId) {
                await tx
                    .update(amortizationSchedule)
                    .set({
                        status: 'paid', // Simple logic for now: full payment assumed if scheduleId is provided
                        paidAt: new Date(),
                    })
                    .where(eq(amortizationSchedule.id, validatedData.scheduleId));
            }

            return newPayment;
        });

        return NextResponse.json(result, { status: 201 });
    } catch (error) {
        if (error instanceof Error && error.name === 'ZodError') {
            return NextResponse.json({ error: 'Validation Error', details: error }, { status: 400 });
        }
        console.error('Error recording payment:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function GET() {
    try {
        const allPayments = await db.query.payments.findMany({
            with: {
                loan: {
                    with: {
                        client: true,
                    },
                },
            },
            orderBy: (payments, { desc }) => [desc(payments.createdAt)],
        });
        return NextResponse.json(allPayments);
    } catch (error) {
        console.error('Error fetching payments:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
