// demo.ts

import { JWT } from "./jwt.ts";
// @ts-ignore
import { type GenericObject } from "./types.d.ts";

// 1. Initialisation
// ==================
// Créez une instance de JWT avec une clé secrète.
// Il est crucial de stocker cette clé dans un endroit sécurisé (ex: variables d'environnement).
const secretKey = "votre_cle_secrete_tres_difficile_a_deviner";
const jwtManager = new JWT(secretKey);

console.log("--- Démonstration de la génération et vérification d'un JWT ---");

// 2. Génération d'un token
// =========================
// Définissez le payload (les données que vous voulez stocker dans le token).
const userPayload: GenericObject = {
    userId: 123,
    username: "alice",
    roles: ["user", "reader"]
};

// Le token expirera dans 60 secondes.
const expiresInSeconds = 60;

try {
    const token = jwtManager.sign(userPayload, expiresInSeconds);
    console.log("\n[✅] Token généré avec succès !");
    console.log("Token:", token);

    // 3. Vérification d'un token valide
    // =================================
    console.log("\n[⏳] Tentative de vérification du token valide...");
    const decodedPayload = jwtManager.verify(token);
    console.log("[✅] Vérification réussie !");
    console.log("Payload décodé:", decodedPayload);

} catch (error) {
    console.error("\n[❌] Une erreur inattendue est survenue:", error);
}

// 4. Démonstration de l'échec de vérification (token invalide)
// ============================================================
console.log("\n--- Démonstration des cas d'erreur ---");

const invalidToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEyMywidXNlcm5hbWUiOiJhbGljZSIsInJvbGVzIjpbInVzZXIiLCJyZWFkZXIiXSwiZXhwIjoxNzAxMzc0NjQxfQ.signature_incorrecte";

try {
    console.log("\n[⏳] Tentative de vérification d'un token avec une signature invalide...");
    jwtManager.verify(invalidToken);
} catch (error) {
    console.error("[✅] Échec attendu:", (error as Error).message);
}

// 5. Démonstration de l'échec (token expiré)
// ==========================================
// Générons un token qui expire dans 2 secondes.
const shortLivedToken = jwtManager.sign({ data: "ceci va expirer" }, 2);
console.log("\n[⏳] Génération d'un token avec une expiration de 2 secondes...");
console.log("Nous attendons 3 secondes pour qu'il expire...");

setTimeout(() => {
    try {
        console.log("\n[⏳] Tentative de vérification du token expiré...");
        jwtManager.verify(shortLivedToken);
    } catch (error) {
        console.error("[✅] Échec attendu:", (error as Error).message);
    }
}, 3000);
