// @ts-ignore
import { type GenericObject } from "./types.d.ts";

// @ts-ignore
import { Buffer } from "node:buffer";

// @ts-ignore
import { timingSafeEqual } from "node:crypto";

import { SHA256 } from "./SHA256.ts";
import { base64 } from "./base64.ts";

export class JWT {
	private secret: string;

	constructor (secret: string) {
		this.secret = secret;
	}


	public sign (payload: GenericObject, expiresInSeconds: number): string {
		const header = { "alg": "HS256", "typ": "JWT" };

		const expirationTimestamp = Math.floor(Date.now() / 1000) + expiresInSeconds;
		const payloadWithExp = { ...payload, exp: expirationTimestamp };

		const b64header = new base64().encode(JSON.stringify(header));
		const b64payload = new base64().encode(JSON.stringify(payloadWithExp));

		const signature = new SHA256(this.secret).generate(b64header + "." + b64payload);

		return `${b64header}.${b64payload}.${signature}`;
	}


	public verify (jwt: string): GenericObject {
		try {
			const [b64header, b64payload, signature] = jwt.split(".");

			if (!b64header || !b64payload || !signature) {
				throw new Error("Invalid JWT token format.");
			}

			const expectedSignature: string = new SHA256(this.secret).generate(`${b64header}.${b64payload}`);

			const signatureBuffer: Buffer = Buffer.from(signature, "base64url");
			const expectedSignatureBuffer: Buffer = Buffer.from(expectedSignature, "base64url");
		
			if (signatureBuffer.length !== expectedSignatureBuffer.length || !timingSafeEqual(signatureBuffer, expectedSignatureBuffer)) {
				throw new Error("Invalid token signature.");
			}

			const payloadString: string = new base64().decode(b64payload);
			const payload: GenericObject = JSON.parse(payloadString) as GenericObject;

			if (payload.exp && Date.now() >= payload.exp * 1000) {
				throw new Error("Token expired.");
			}

			return payload;
		}
		catch (error) {
            // Propage l'erreur (qu'elle vienne du JSON.parse, de la signature, etc.)
            throw new Error(`Échec de la vérification du token : ${error instanceof Error ? error.message : String(error)}`);
        }
	}
}