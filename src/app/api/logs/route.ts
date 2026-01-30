import { NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';

export async function POST(request: Request) {
    try {
        if (!db) return NextResponse.json({ error: 'Database not initialized' }, { status: 500 });

        const body = await request.json();
        const { usuario, acao, detalhes, timestamp } = body;

        if (!usuario || !acao) {
            return NextResponse.json({ error: 'Campos obrigatórios ausentes: usuario e acao' }, { status: 400 });
        }

        // Gerar timestamp se não enviado
        const logTimestamp = timestamp || new Date().toISOString();

        // Criar entrada de log
        const logEntry = {
            usuario,
            acao,
            detalhes: detalhes || {},
            timestamp: logTimestamp
        };

        // Salvar no Firebase (node /history)
        // Usamos o SDK admin para fazer o push
        const ref = db.ref('history');
        const newLogRef = ref.push();
        await newLogRef.set(logEntry);

        return NextResponse.json({ success: true, id: newLogRef.key });

    } catch (error: any) {
        console.error('Erro no endpoint de logs:', error);
        return NextResponse.json({ error: error.message || 'Erro interno do servidor' }, { status: 500 });
    }
}
