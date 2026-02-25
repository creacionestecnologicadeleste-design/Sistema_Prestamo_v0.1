import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { loans, amortizationSchedule } from '@/lib/db/schema';
import { loanSchema } from '@/lib/validations/loan.schema';
import { calculateFrenchAmortization, calculateGermanAmortization } from '@/lib/calculations/amortization';

export async function GET() {
    try {
        const allLoans = await db.query.loans.findMany({
            with: {
                client: true,
            },
            orderBy: (loans, { desc }) => [desc(loans.createdAt)],
        });
        return NextResponse.json(allLoans);
    } catch (error) {
        console.error('Error fetching loans:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const json = await request.json();
        const validatedData = loanSchema.parse(json);

        const result = await db.transaction(async (tx) => {
            // 1. Create the loan
            const [newLoan] = await tx.insert(loans).values({
                ...validatedData,
                amount: validatedData.amount.toString(),
                approvedAmount: validatedData.approvedAmount?.toString(),
                interestRate: validatedData.interestRate.toString(),
            }).returning();

            // 2. Generate amortization schedule if active or approved with dates
            if (
                (validatedData.status === 'active' || validatedData.status === 'approved') &&
                validatedData.firstPaymentDate
            ) {
                const params = {
                    amount: validatedData.approvedAmount || validatedData.amount,
                    annualInterestRate: validatedData.interestRate,
                    termMonths: validatedData.termMonths,
                    startDate: new Date(validatedData.firstPaymentDate),
                };

                const schedule = validatedData.method === 'german'
                    ? calculateGermanAmortization(params)
                    : calculateFrenchAmortization(params);

                await tx.insert(amortizationSchedule).values(
                    schedule.map((row) => ({
                        loanId: newLoan.id,
                        installmentNumber: row.installmentNumber,
                        dueDate: row.dueDate.toISOString().split('T')[0],
                        principalAmount: row.principalAmount.toString(),
                        interestAmount: row.interestAmount.toString(),
                        totalAmount: row.totalAmount.toString(),
                        remainingBalance: row.remainingBalance.toString(),
                        status: 'pending' as const,
                    }))
                );
            }

            return newLoan;
        });

        return NextResponse.json(result, { status: 201 });
    } catch (error) {
        if (error instanceof Error && error.name === 'ZodError') {
            return NextResponse.json({ error: 'Validation Error', details: error }, { status: 400 });
        }
        console.error('Error creating loan:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
