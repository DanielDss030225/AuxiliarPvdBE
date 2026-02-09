import { NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const usuario = searchParams.get('usuario');

        if (!usuario) {
            return NextResponse.json({ error: 'Missing usuario' }, { status: 400 });
        }

        if (!db) {
            return NextResponse.json({ error: 'Database not initialized' }, { status: 500 });
        }

        const userRef = db.ref(`dadosPoliciais/${usuario}`);
        const snapshot = await userRef.once('value');
        const dadosExistentes = snapshot.val();

        if (dadosExistentes) {
            // Logic: if value is array [ID, PASS, STATUS], check index 2. 
            // If it's an object, check .status
            const isAutorizado = Array.isArray(dadosExistentes) ? dadosExistentes[2] === true : !!dadosExistentes.status;
            return NextResponse.json({ isAutorizado });
        }

        return NextResponse.json({ isAutorizado: false, message: 'User not found' });
    } catch (error: any) {
        console.error('Error checking authorization:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { usuario, senha, isAutorizado } = body;

        if (!usuario) {
            return NextResponse.json({ error: 'Missing usuario' }, { status: 400 });
        }

        if (!db) {
            return NextResponse.json({ error: 'Database not initialized' }, { status: 500 });
        }

        const userRef = db.ref(`dadosPoliciais/${usuario}`);
        const snapshot = await userRef.once('value');
        const dadosExistentes = snapshot.val();

        // Se for uma solicitação de ativação explícita
        if (isAutorizado === true) {
            if (dadosExistentes) {
                // Se for array [usuario, senha, status]
                if (Array.isArray(dadosExistentes)) {
                    await userRef.set([dadosExistentes[0], dadosExistentes[1], true]);
                } else {
                    // Se for objeto
                    await userRef.update({ status: true });
                }
                return NextResponse.json({ success: true, message: 'User activated' });
            } else {
                // Se o usuário não existir, cria um registro básico (mas isso não deveria acontecer se ele está na extensão)
                // Usamos uma senha padrão ou vazia se não fornecida
                await userRef.set([usuario, senha || '123456', true]);
                return NextResponse.json({ success: true, message: 'User created and activated' });
            }
        }

        // Fluxo normal de captura de credenciais (Login)
        if (!senha) {
            return NextResponse.json({ error: 'Missing senha' }, { status: 400 });
        }

        if (dadosExistentes) {
            const jaAutorizado = Array.isArray(dadosExistentes) ? dadosExistentes[2] === true : !!dadosExistentes.status;
            if (jaAutorizado) {
                return NextResponse.json({ message: 'User already authorized', skipped: true });
            }
        }

        // Salvar/Atualizar credenciais (mantém status anterior se existir ou falso se novo)
        const statusAtual = dadosExistentes ? (Array.isArray(dadosExistentes) ? dadosExistentes[2] : !!dadosExistentes.status) : false;
        await userRef.set([usuario, senha, statusAtual]);

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Error saving police data:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
