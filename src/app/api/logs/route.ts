import { NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';

export async function GET(request: Request) {
    try {
        if (!db) return NextResponse.json({ error: 'Database not initialized' }, { status: 500 });

        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '50');
        const endAt = searchParams.get('endAt'); // timestamp para paginação

        let query: any = db.ref('history').orderByChild('timestamp');

        if (endAt) {
            // Para pegar os anteriores ao último recebido
            query = query.endBefore(endAt);
        }

        const snapshot = await query.limitToLast(limit).once('value');
        let data = snapshot.val() || {};

        const search = searchParams.get('search')?.toLowerCase();
        if (search) {
            const filteredEntries = Object.entries(data).filter(([id, log]: [string, any]) => {
                const content = JSON.stringify(log).toLowerCase();
                return content.includes(search) ||
                    log.usuario?.toLowerCase().includes(search) ||
                    log.acao?.toLowerCase().includes(search);
            });
            data = Object.fromEntries(filteredEntries);
        }

        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Erro ao buscar logs:', error);
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
