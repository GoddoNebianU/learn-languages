import { randomBytes, createHash } from "crypto";

const KEY_PREFIX = "ll_";

/** Generate a new API key. Returns plaintext (shown ONCE to user) + hash + prefix for storage. */
export function generateApiKey(): { plaintext: string; keyHash: string; keyPrefix: string } {
  const random = randomBytes(16).toString("hex");
  const plaintext = `${KEY_PREFIX}${random}`;
  return {
    plaintext,
    keyHash: hashApiKey(plaintext),
    keyPrefix: plaintext.slice(0, 10),
  };
}

export function hashApiKey(key: string): string {
  return createHash("sha256").update(key).digest("hex");
}
