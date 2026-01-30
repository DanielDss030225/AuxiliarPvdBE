import { NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';

export async function GET() {
    try {
        if (!db) return NextResponse.json({ error: 'Database not initialized' }, { status: 500 });

        // Buscar últimos 200 logs para não sobrecarregar
        const snapshot = await db.ref('history').limitToLast(200).once('value');
        const data = snapshot.val() || {};

        return NextResponse.json(data);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        if (!db) return NextResponse.json({ error: 'Database not initialized' }, { status: 500 });

        const body = await request.json();
        const { usuario, acao, detalhes, timestamp } = body;

        if (!usuario || !acao) {
            return NextResponse.json({ error: 'Campos obrigatórios ausentes: usuario e acao' }, { status: 400 });
        }

        const logTimestamp = timestamp || new Date().toISOString();

        const logEntry = {
            usuario,
            acao,
            detalhes: detalhes || {},
            timestamp: logTimestamp
        };

        const ref = db.ref('history');
        const newLogRef = ref.push();
        await newLogRef.set(logEntry);

        return NextResponse.json({ success: true, id: newLogRef.key });

    } catch (error: any) {
        console.error('Erro no endpoint de logs:', error);
        return NextResponse.json({ error: error.message || 'Erro interno do servidor' }, { status: 500 });
    }
}
