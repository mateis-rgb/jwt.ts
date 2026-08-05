// @ts-ignore
import { createHmac } from "node:crypto";

export class SHA256 {
	private key: string;

	constructor (key: string) {
		this.key = key;
	}

	public generate (message: string = ""): string {
		return createHmac("sha256", this.key)
			.update(message)
			.digest("base64url");
	}

	public verify (message: string, expectedSHA256: string): boolean {
		const computedSHA256 = this.generate(message);
		
		return computedSHA256 === expectedSHA256;
	}
}
