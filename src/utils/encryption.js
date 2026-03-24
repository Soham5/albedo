/**
 * Encryption Utility
 *
 * Provides AES-256-GCM encryption/decryption using the Web Crypto API.
 * A random encryption key is generated on first use and stored in localStorage.
 * This prevents sensitive data (e.g. API keys) from being stored in plain text.
 */

const ENCRYPTION_KEY_STORAGE = 'albedo_encryptionKey';

/**
 * Get or create the AES-GCM encryption key.
 * On first call, generates a new 256-bit key and persists it as JWK.
 * On subsequent calls, imports the stored JWK.
 * @returns {Promise<CryptoKey>}
 */
const getEncryptionKey = async () => {
  const storedKey = localStorage.getItem(ENCRYPTION_KEY_STORAGE);

  if (storedKey) {
    const jwk = JSON.parse(storedKey);
    return crypto.subtle.importKey(
      'jwk',
      jwk,
      { name: 'AES-GCM' },
      true,
      ['encrypt', 'decrypt']
    );
  }

  // Generate a new key
  const key = await crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );

  // Export and persist
  const jwk = await crypto.subtle.exportKey('jwk', key);
  localStorage.setItem(ENCRYPTION_KEY_STORAGE, JSON.stringify(jwk));

  return key;
};

/**
 * Encrypt a plaintext string using AES-256-GCM.
 * @param {string} plaintext - The string to encrypt
 * @returns {Promise<string>} Base64-encoded IV + ciphertext
 */
export const encrypt = async (plaintext) => {
  const key = await getEncryptionKey();
  const iv = crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV for GCM
  const encoded = new TextEncoder().encode(plaintext);

  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoded
  );

  // Combine IV (12 bytes) + ciphertext into a single buffer
  const combined = new Uint8Array(iv.length + ciphertext.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(ciphertext), iv.length);

  // Encode as base64
  return btoa(String.fromCharCode(...combined));
};

/**
 * Decrypt an AES-256-GCM encrypted string.
 * @param {string} encryptedBase64 - Base64-encoded IV + ciphertext
 * @returns {Promise<string>} Decrypted plaintext
 */
export const decrypt = async (encryptedBase64) => {
  const key = await getEncryptionKey();

  // Decode base64
  const combined = Uint8Array.from(atob(encryptedBase64), c => c.charCodeAt(0));

  // Extract IV (first 12 bytes) and ciphertext (rest)
  const iv = combined.slice(0, 12);
  const ciphertext = combined.slice(12);

  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    ciphertext
  );

  return new TextDecoder().decode(decrypted);
};
