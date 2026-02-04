import { NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';

// Explicit runtime configuration for all HTTP methods including DELETE
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        if (!db) return NextResponse.json({ error: 'Database not initialized' }, { status: 500 });

        const { searchParams } = new URL(request.url);
        const rg = searchParams.get('rg');

        let snapshot;
        if (rg) {
            snapshot = await db.ref('AvaliacoesDeRisco')
                .orderByChild('rgVitima')
                .equalTo(rg)
                .once('value');
        } else {
            // In a real app, you might want pagination here
            snapshot = await db.ref('AvaliacoesDeRisco').once('value');
        }

        const data = snapshot.val();
        return NextResponse.json(data || {});
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        if (!db) return NextResponse.json({ error: 'Database not initialized' }, { status: 500 });

        const body = await request.json();
        const { id, data } = body;

        if (!data) return NextResponse.json({ error: 'Missing data' }, { status: 400 });

        if (id) {
            // Update existing
            await db.ref(`AvaliacoesDeRisco/${id}`).update(data);
            return NextResponse.json({ success: true, id });
        } else {
            // Create new
            const newRef = await db.ref('AvaliacoesDeRisco').push(data);
            return NextResponse.json({ success: true, id: newRef.key });
        }
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        if (!db) return NextResponse.json({ error: 'Database not initialized' }, { status: 500 });

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

        await db.ref(`AvaliacoesDeRisco/${id}`).remove();
        return NextResponse.json({ success: true, message: 'Deleted successfully' });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
