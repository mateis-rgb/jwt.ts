# jwt.ts

Ce projet est une implémentation légère et pédagogique de JSON Web Tokens (JWT) en TypeScript, conçue pour un environnement Node.js. Elle n'a aucune dépendance externe et s'appuie uniquement sur les modules natifs de Node.js (`crypto`, `buffer`).

L'objectif est de fournir un module simple pour comprendre les mécanismes de base de la signature et de la vérification des JWT (spécifiquement avec l'algorithme HS256), tout en étant utilisable dans des projets "vanilla" ou des environnements où l'on souhaite minimiser les dépendances.

## Fonctionnalités

*   **Génération de tokens JWT** signés avec l'algorithme HMAC-SHA256.
*   **Vérification de tokens JWT** avec une comparaison de signature sécurisée (`timingSafeEqual`).
*   **Gestion de l'expiration** des tokens via le "claim" `exp`.
*   **Encodage et décodage Base64Url** conforme au standard JWT.
*   **Aucune dépendance externe** (`npm install` n'est pas nécessaire).

## Contexte d'utilisation

Ce module est idéal pour :
*   Les projets en TypeScript pur (vanilla) fonctionnant sur Node.js.
*   Les développeurs souhaitant comprendre le fonctionnement interne des JWT.
*   Les applications légères où l'ajout de bibliothèques complètes comme `jsonwebtoken` est excessif.

## Installation

Comme ce projet n'est pas un package npm, il vous suffit de copier les fichiers suivants dans votre projet :

*   `jwt.ts`
*   `sha256.ts`
*   `base64.ts`
*   `types.d.ts`

## Exemple d'utilisation (Cas général)

Voici un exemple de base montrant comment signer et vérifier un token.

```typescript
// demo.ts

import { JWT } from "./jwt.ts";
import { type GenericObject } from "./types.d.ts";

// 1. Initialisez le module avec une clé secrète sécurisée.
const secretKey = "votre_cle_secrete_tres_difficile_a_deviner";
const jwtManager = new JWT(secretKey);

// 2. Définissez le payload et générez un token avec une expiration de 1 heure.
const userPayload: GenericObject = {
    userId: 123,
    username: "alice",
};
const oneHourInSeconds = 3600;
const token = jwtManager.sign(userPayload, oneHourInSeconds);

console.log("Token généré :", token);

// 3. Vérifiez le token.
try {
    const decodedPayload = jwtManager.verify(token);
    console.log("Le token est valide ! Payload :", decodedPayload);
} catch (error) {
    console.error("La vérification du token a échoué :", error.message);
}
```

## Exemple dans une application TypeScript (Middleware Express.js)

Voici un cas d'usage plus concret : un middleware d'authentification pour une application Express.js. Ce middleware protège une route en vérifiant la présence et la validité d'un token dans l'en-tête `Authorization`.

```typescript
// authMiddleware.ts

import { type Request, type Response, type NextFunction } from "express";
import { JWT } from "./jwt.ts";

// Initialisez le gestionnaire JWT avec la clé secrète (depuis les variables d'environnement)
const jwtManager = new JWT(process.env.JWT_SECRET || "default_secret");

// Étendez l'interface Request pour y attacher le payload de l'utilisateur
interface AuthenticatedRequest extends Request {
    user?: { [key: string]: any };
}

export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Accès non autorisé : token manquant ou mal formaté." });
    }

    const token = authHeader.split(' ')[1];

    try {
        // Vérifiez le token
        const payload = jwtManager.verify(token);

        // Attachez le payload à l'objet `request` pour un usage ultérieur
        req.user = payload;

        // Passez au prochain middleware ou au contrôleur de la route
        next();
    } catch (error) {
        // Le token est invalide (signature incorrecte, expiré, etc.)
        return res.status(403).json({ message: `Accès interdit : ${error.message}` });
    }
}
```

## API de la classe `JWT`

### `new JWT(secret: string)`
Crée une nouvelle instance du gestionnaire JWT.
*   **`secret`**: La clé secrète utilisée pour signer et vérifier les tokens.

### `jwt.sign(payload: GenericObject, expiresInSeconds: number): string`
Génère et signe un nouveau token JWT.
*   **`payload`**: Un objet contenant les données à inclure dans le token.
*   **`expiresInSeconds`**: La durée de validité du token en secondes.
*   **Retourne**: Le token JWT sous forme de chaîne de caractères.

### `jwt.verify(jwt: string): GenericObject`
Vérifie un token JWT. Lance une erreur si le token est invalide.
*   **`jwt`**: Le token à vérifier.
*   **Retourne**: Le payload décodé si le token est valide.
*   **Lance**: Une `Error` si le format est incorrect, la signature est invalide ou le token a expiré.

## Structure du projet

```
.
├── base64.ts       # Classe utilitaire pour l'encodage/décodage Base64Url.
├── jwt.ts          # Classe principale pour la gestion des JWT.
├── sha256.ts       # Classe utilitaire pour la génération de signatures HMAC-SHA256.
└── types.d.ts      # Définitions de types TypeScript.
```
