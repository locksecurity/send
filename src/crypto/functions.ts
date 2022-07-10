/**
 * @package locktor/crypto
 * @author Ope Adeyomoye<ope@locktor.io>
 */

/**
 * Convert a plain text password to a `CryptoKey` usable in cryptographic operations.
 *
 * @param {Uint8Array} buffer Plain text password in byte-array form.
 * @param {KeyUsage[]} uses A list of functions we expect the resulting key to perform.
 *
 * @returns {Promise<CryptoKey>}
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/importKey
 */
export function passwordToCryptoKey(buffer: Uint8Array, uses: Array<KeyUsage> = []) {
  if (uses.length < 1) uses = ['deriveKey', 'deriveBits']

  return window.crypto.subtle.importKey('raw', buffer, 'PBKDF2', false, uses);
}

export async function deriveMk(
  passwordAsKey: CryptoKey,
  salt: ArrayBuffer,
  iterations = 100000
): Promise<CryptoKey> {
  /**
   * @summary derive a Master Key using the Master Password, our 16-byte salt, and `PBKDF2`.
   */
  const MBits = await window.crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, hash: 'SHA-256', iterations },
    passwordAsKey,
    256
  );


  const usages = <Array<KeyUsage>>['deriveBits', 'deriveKey']
  // we're using this MK to subsequently derive keying material via the
  // HKDF key-derivation function. Hence:
  return window.crypto.subtle.importKey('raw', MBits, 'HKDF', false, usages);
}

export function deriveKeyFromMk(MK: CryptoKey, salt: ArrayBuffer) {

  return window.crypto.subtle.deriveKey(
    {
      name: 'HKDF',
      hash: 'SHA-256',
      salt,
      info: new Uint8Array(0) /** @todo maybe add user/application-specific contextual data here */
    },
    MK,
    // this keying material we're generating will be applied to encrypt stuff
    // using 256-bit AES in Galois/Counter Mode, hence the following line:
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * @see https://developer.chrome.com/blog/how-to-convert-arraybuffer-to-and-from-string/ for alternate methods
 */
export function arrayBufferToText(buffer: ArrayBuffer): string {
  return btoa(
    <string>(
      <unknown>(new Int8Array(buffer))
    )
  );
}

// https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/importKey#pkcs_8_import
export function textToArrayBuffer(text: string): ArrayBuffer {
  const stream = atob(text).split(',');

  return Int8Array.from(
    <Array<number>>(<unknown>(stream))
  )
}

export function toNumberArray(numbers: string, separator: string = ','): Array<number> {
  return <Array<number>>(
    <Array<unknown>>numbers.split(separator)
  )
}

/**
 * Import the `public` part of a customer's kpk-pair, from raw storage, into a `CryptoKey`.
 *
 * @param {ArrayBuffer} source PEM-encoded key in `ArrayBuffer` form
 */
export function importPublicKey(source: ArrayBuffer): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'spki',
    source,
    { name: 'RSA-OAEP', hash: 'SHA-256' },
    false,
    ['encrypt']
  )
}

/**
 * Decrypt and import the `private` part of a customer's kpk-pair,
 * from raw storage, into a `CryptoKey`.
 *
 * @param {ArrayBuffer} cipher Private key ciphertext.
 * @param {CryptoKey} key AES key used to encrypt the private key. Usually derived from the customer's MK.
 * @param {ArrayBuffer} iv IV used in AES encryption.
 *
 * @returns {Promise<CryptoKey>}
 */
export async function importPrivateKey(cipher: ArrayBuffer, key: CryptoKey, iv: ArrayBuffer): Promise<CryptoKey> {
  // first decrypt
  const clearKey: ArrayBuffer = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    cipher
  )

  // then import
  return crypto.subtle.importKey(
    'pkcs8',
    clearKey,
    { name: 'RSA-OAEP', hash: 'SHA-256' },
    false,
    ['decrypt']
  )
}
