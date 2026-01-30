import { NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';

export async function GET() {
    try {
        if (!db) return NextResponse.json({ error: 'Database not initialized' }, { status: 500 });

        const snapshot = await db.ref('DadosVitimaGerais').once('value');
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
        const { victimKey, status, equipe } = body;

        if (!victimKey) return NextResponse.json({ error: 'Missing victimKey' }, { status: 400 });

        const updates: any = {};
        if (status !== undefined) updates[`/DadosVitimaGerais/${victimKey}/status`] = status;
        if (equipe !== undefined) updates[`/DadosVitimaGerais/${victimKey}/equipe`] = equipe;

        updates[`/DadosVitimaGerais/${victimKey}/ultimaAtualizacao`] = new Date().toLocaleString('pt-BR');

        await db.ref().update(updates);

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
