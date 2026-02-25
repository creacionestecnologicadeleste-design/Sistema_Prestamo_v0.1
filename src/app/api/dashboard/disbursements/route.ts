import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { loans } from '@/lib/db/schema';
import { sql } from 'drizzle-orm';

export async function GET() {
    try {
        // Fetch last 6 months of disbursements
        const stats = await db
            .select({
                month: sql<string>`to_char(disbursement_date, 'Mon YYYY')`,
                amount: sql<number>`sum(amount)`,
            })
            .from(loans)
            .where(sql`disbursement_date is not null AND disbursement_date > now() - interval '6 months'`)
            .groupBy(sql`to_char(disbursement_date, 'Mon YYYY')`)
            .orderBy(sql`min(disbursement_date)`);

        return NextResponse.json(stats);
    } catch (error) {
        console.error('Error fetching disbursement stats:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
