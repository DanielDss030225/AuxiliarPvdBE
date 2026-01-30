import { NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { usuario, senha } = body;

        if (!usuario || !senha) {
            return NextResponse.json({ error: 'Missing credentials' }, { status: 400 });
        }

        if (!db) {
            return NextResponse.json({ error: 'Database not initialized' }, { status: 500 });
        }

        // Try to find user in various paths as per legacy app logic
        const pathsToCheck = [
            `dadosPoliciais/${usuario}`,
            `DadosPoliciais/${usuario}`,
            `${usuario}` // root fallback
        ];

        let userData = null;

        for (const path of pathsToCheck) {
            const snapshot = await db.ref(path).once('value');
            const val = snapshot.val();
            if (val) {
                userData = val;
                break;
            }
        }

        if (!userData) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Parse logic from app.js
        const arrayDados = typeof userData === 'string' ? JSON.parse(userData) : userData;
        const senhaCorreta = Array.isArray(arrayDados) ? arrayDados[1] : (arrayDados.senha || arrayDados[1]);
        const estaAtivo = Array.isArray(arrayDados) ? arrayDados[2] : (arrayDados.ativo !== undefined ? arrayDados.ativo : true);

        if (!estaAtivo) {
            return NextResponse.json({ error: 'Account inactive' }, { status: 403 });
        }

        if (senha === senhaCorreta.toString()) {
            return NextResponse.json({ success: true, usuario });
        } else {
            return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
        }

    } catch (error: any) {
        console.error('Error during login:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
