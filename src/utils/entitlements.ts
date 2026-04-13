/**
 * Entitlement Security Utility (No-Backend Alternative)
 * 
 * Provides a mechanism to sign and verify "Pro" status locally to deter simple 
 * localStorage tampering. While not cryptographically secure against a 
 * determined attacker (since the "secret" is on the client), it raises the 
 * bar significantly compared to a raw boolean.
 */

const SECRET_SALT = 'combo-coach-v1-entitlement-salt';

/**
 * Generates a verification signature for a given user ID.
 */
export async function signEntitlement(userId: string): Promise<string> {
  const msgUint8 = new TextEncoder().encode(userId + SECRET_SALT);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Verifies if the stored "Pro" status signature matches the user ID.
 */
export async function verifyEntitlement(userId: string, signature: string | null): Promise<boolean> {
  if (!signature || !userId) return false;
  const expected = await signEntitlement(userId);
  return expected === signature;
}
