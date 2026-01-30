import { NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';

export async function GET(request: Request) {
    try {
        if (!db) return NextResponse.json({ error: 'Database not initialized' }, { status: 500 });

        const { searchParams } = new URL(request.url);
        const path = searchParams.get('path');

        if (!path) {
            return NextResponse.json({ error: 'Missing path parameter' }, { status: 400 });
        }

        // Special case for POLICIAIS: try root if not in CONFIG
        let nodePath = `CONFIG/${path}`;
        const normalizedPath = path.toUpperCase();

        if (normalizedPath === 'POLICIAIS') {
            // Priority 1: CONFIG/POLICIAIS (for app-specific overrides)
            const configSnapshot = await db.ref(`CONFIG/POLICIAIS`).once('value');
            if (configSnapshot.exists()) return NextResponse.json(configSnapshot.val());

            // Priority 2: Policiais (Public database node)
            const rootSnapshot = await db.ref('Policiais').once('value');
            if (rootSnapshot.exists()) return NextResponse.json(rootSnapshot.val());

            // No fallback to 'dadosPoliciais' to avoid exposing credentials
            return NextResponse.json({});
        }

        const snapshot = await db.ref(nodePath).once('value');
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
        const { path, data, method } = body;

        if (!path) return NextResponse.json({ error: 'Missing path' }, { status: 400 });

        if (method === 'DELETE') {
            await db.ref(`CONFIG/${path}`).remove();
            return NextResponse.json({ success: true });
        }

        if (method === 'UPDATE' || method === 'POST') {
            await db.ref(`CONFIG/${path}`).update(data);
            return NextResponse.json({ success: true });
        }

        await db.ref(`CONFIG/${path}`).set(data);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
