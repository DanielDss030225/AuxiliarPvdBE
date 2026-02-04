import 'server-only';
import admin from 'firebase-admin';

function formatPrivateKey(key: string) {
    return key.replace(/\\n/g, '\n');
}

export function createFirebaseAdminApp() {
    if (admin.apps.length > 0) {
        return admin.app();
    }

    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;

    if (!projectId || !clientEmail || !privateKey) {
        // In development, we might not have these set yet, so we can warn or throw.
        // For now, let's throw to ensure safety.
        if (process.env.NODE_ENV === 'development') {
            console.warn('⚠️ Missing Firebase Admin credentials in environment variables.');
        }
        // Depending on how we want to handle this, we might want to return null or throw.
        // But since this is critical, let's allow it to fail if keys are missing in production.
    }

    return admin.initializeApp({
        credential: admin.credential.cert({
            projectId,
            clientEmail,
            privateKey: privateKey ? formatPrivateKey(privateKey) : undefined,
        }),
        // Infer database URL if not provided, or use env var
        databaseURL: process.env.FIREBASE_DATABASE_URL || `https://${projectId}-default-rtdb.firebaseio.com`,
    });
}

// Initialize immediately to export the db instance
let dbInstance: admin.database.Database | undefined;
try {
    const app = createFirebaseAdminApp();
    dbInstance = app.database();
} catch (e) {
    console.error("Failed to initialize Firebase Admin:", e);
}

export const db = dbInstance;
