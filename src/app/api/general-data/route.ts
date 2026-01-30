import { NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';

export async function GET(request: Request) {
    try {
        if (!db) return NextResponse.json({ error: 'Database not initialized' }, { status: 500 });

        const { searchParams } = new URL(request.url);
        const rg = searchParams.get('rg');

        const path = rg ? `DADOSGERAIS/${rg}` : 'DADOSGERAIS';
        const snapshot = await db.ref(path).once('value');
        const data = snapshot.val();

        return NextResponse.json(data || null);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        if (!db) return NextResponse.json({ error: 'Database not initialized' }, { status: 500 });

        const body = await request.json();
        const { rg, data } = body;

        if (!rg || !data) {
            return NextResponse.json({ error: 'Missing rg or data' }, { status: 400 });
        }

        // Salva ou atualiza os dados gerais para o RG especificado
        await db.ref(`DADOSGERAIS/${rg}`).set({
            ...data,
            ultimaAtualizacao: new Date().toISOString()
        });

        return NextResponse.json({ success: true, rg });
    } catch (error: any) {
        console.error('Error saving general data:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
