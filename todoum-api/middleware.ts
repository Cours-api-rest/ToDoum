import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    // Créer une réponse
    const response = NextResponse.next();

    // Ajouter les en-têtes CORS
    response.headers.set('Access-Control-Allow-Origin', '*'); // Autorise toutes les origines
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    response.headers.set('Access-Control-Allow-Credentials', 'true');

    // Vérifier la méthode pour les pré-requêtes OPTIONS
    if (request.method === 'OPTIONS') {
        // Si c'est une requête OPTIONS (preflight), répondre avec 200 OK
        return response;
    }

    return response;
}

// Spécifiez les chemins où ce middleware sera appliqué (par exemple, sur toutes les routes API)
export const config = {
    matcher: ['/api/:path*'], // Applique ce middleware uniquement aux routes de l'API
};
