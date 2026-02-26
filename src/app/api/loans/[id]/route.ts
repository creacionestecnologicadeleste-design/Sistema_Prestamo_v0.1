import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { loans, amortizationSchedule } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const loan = await db.query.loans.findFirst({
            where: eq(loans.id, id),
            with: {
                client: true,
                schedule: {
                    orderBy: (schedule, { asc }) => [asc(schedule.installmentNumber)],
                },
            },
        });

        if (!loan) {
            return NextResponse.json({ error: 'Loan not found' }, { status: 404 });
        }

        return NextResponse.json(loan);
    } catch (error) {
        console.error('Error fetching loan:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const result = await db.transaction(async (tx) => {
            // Delete schedule first due to FK constraints if not using cascade
            await tx.delete(amortizationSchedule).where(eq(amortizationSchedule.loanId, id));
            const [deletedLoan] = await tx.delete(loans).where(eq(loans.id, id)).returning();
            return deletedLoan;
        });

        if (!result) {
            return NextResponse.json({ error: 'Loan not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Loan and its schedule deleted successfully' });
    } catch (error) {
        console.error('Error deleting loan:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
