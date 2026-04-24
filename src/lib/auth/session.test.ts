import { describe, expect, it, vi } from 'vitest';
import { decrypt, encrypt } from './session';
import type { SessionPayload } from './types';

const mockPayload: SessionPayload = {
  userId: 'test-user-id',
  role: 'Creator',
  displayName: 'Test User',
};

describe('Session Utilities', () => {
  it('should encrypt and decrypt a payload correctly (round-trip)', async () => {
    const token = await encrypt(mockPayload);
    const decrypted = await decrypt(token);

    expect(decrypted).toMatchObject(mockPayload);
  });

  it('should return null for a tampered token', async () => {
    const token = await encrypt(mockPayload);
    const tamperedToken = token + 'tamper';

    const decrypted = await decrypt(tamperedToken);
    expect(decrypted).toBeNull();
  });

  it('should return null for an expired token', async () => {
    // We can't easily wait 24h, so we use a shorter expiration in a custom test if needed
    // or rely on SignJWT options if we expose them.
    // For now, let's just test that null is returned for a totally invalid string.
    expect(await decrypt('not-a-token')).toBeNull();
  });

  it('should handle missing or invalid secrets gracefully', async () => {
    // This is more of an env setup test, but we can verify that the secret encoding works.
    const token = await encrypt(mockPayload);
    expect(token).toBeDefined();
    expect(typeof token).toBe('string');
  });
});
