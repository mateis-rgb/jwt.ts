// @ts-ignore
import { Buffer } from "node:buffer";

export class base64 {
	public encode (message: string): string {
		return Buffer.from(message).toString("base64url");
	}

	public decode(encoded: string): string {	
		return Buffer.from(encoded, "base64url").toString("utf-8");
	};
}
