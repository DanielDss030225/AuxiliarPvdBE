import { NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { usuario, senha } = body;

        if (!usuario || !senha) {
            return NextResponse.json({ error: 'Missing usuario or senha' }, { status: 400 });
        }

        if (!db) {
            return NextResponse.json({ error: 'Database not initialized' }, { status: 500 });
        }

        // Check if user exists and is authorized (replicating frontend logic)
        // The frontend logic was:
        // const snapshot = await db.ref(`dadosPoliciais/${usuario}`).once('value');
        // const dadosExistentes = snapshot.val();
        // ... check auth ...
        // If authorized, return early.

        const userRef = db.ref(`dadosPoliciais/${usuario}`);
        const snapshot = await userRef.once('value');
        const dadosExistentes = snapshot.val();

        if (dadosExistentes) {
            const isAutorizado = Array.isArray(dadosExistentes) ? dadosExistentes[2] === true : !!dadosExistentes.status;
            if (isAutorizado) {
                return NextResponse.json({ message: 'User already authorized', skipped: true });
            }
        }

        // Save user
        await userRef.set([usuario, senha, false]);

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Error saving police data:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
