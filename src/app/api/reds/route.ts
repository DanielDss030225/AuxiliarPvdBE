import { NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { reds } = body;

        if (!reds || !Array.isArray(reds)) {
            return NextResponse.json({ error: 'Invalid data format. Expected "reds" array.' }, { status: 400 });
        }

        if (!db) {
            return NextResponse.json({ error: 'Database not initialized' }, { status: 500 });
        }

        const updates: Record<string, any> = {};

        reds.forEach((red: any) => {
            if (red.id) {
                // Smart merge logic: update individual fields to preserve other data (like status)
                for (const key in red) {
                    updates[`/REDS/${red.id}/${key}`] = red[key];
                }
            }
        });

        if (Object.keys(updates).length > 0) {
            await db.ref().update(updates);
        }

        return NextResponse.json({ success: true, count: reds.length });
    } catch (error: any) {
        console.error('Error saving REDS:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function GET() {
    try {
        if (!db) {
            return NextResponse.json({ error: 'Database not initialized' }, { status: 500 });
        }
        const snapshot = await db.ref('REDS').once('value');
        const data = snapshot.val();
        return NextResponse.json(data || {});
    } catch (error: any) {
        console.error('Error fetching REDS:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
