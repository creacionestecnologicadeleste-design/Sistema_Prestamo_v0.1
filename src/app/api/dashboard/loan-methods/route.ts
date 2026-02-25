import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { loans } from '@/lib/db/schema';
import { sql } from 'drizzle-orm';

export async function GET() {
    try {
        const stats = await db
            .select({
                method: loans.method,
                count: sql<number>`count(*)`,
            })
            .from(loans)
            .groupBy(loans.method);

        // Map to a format suitable for PieChart
        const data = stats.map((s, i) => ({
            name: s.method,
            value: Number(s.count),
            fill: `var(--chart-${(i % 5) + 1})`,
        }));

        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching loan type stats:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
