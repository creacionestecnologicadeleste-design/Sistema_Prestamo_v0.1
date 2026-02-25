import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { loans, clients, payments } from '@/lib/db/schema';
import { sql } from 'drizzle-orm';

export async function GET() {
    try {
        // 1. Total Active Loans Amount
        const [activeLoansStats] = await db
            .select({
                totalAmount: sql<string>`sum(amount)`,
                count: sql<number>`count(*)`,
            })
            .from(loans)
            .where(sql`status = 'active'`);

        // 2. Total Clients
        const [clientsStats] = await db
            .select({
                count: sql<number>`count(*)`,
            })
            .from(clients);

        // 3. Total Payments Received
        const [paymentsStats] = await db
            .select({
                totalCollected: sql<string>`sum(amount_paid)`,
            })
            .from(payments);

        return NextResponse.json({
            activeLoans: {
                amount: Number(activeLoansStats?.totalAmount || 0),
                count: Number(activeLoansStats?.count || 0),
            },
            totalClients: Number(clientsStats?.count || 0),
            totalCollected: Number(paymentsStats?.totalCollected || 0),
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
