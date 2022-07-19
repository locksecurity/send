
export function buf2hex(buffer: ArrayBuffer) {
  return [...new Uint8Array(buffer)]
    .map(x => x.toString(16).padStart(2, '0'))
    .join('')
}

export function blobToArrayBuffer(blob: Blob): Promise<ProgressEvent<FileReader>> {
  const fileReader = new FileReader();

  return new Promise(function (resolve, reject) {
    fileReader.onload = resolve;
    fileReader.onerror = reject;

    fileReader.readAsArrayBuffer(blob);
  });
};

function arrayBufferToBlob(ab: ArrayBuffer): Blob {
    return new window.Blob([new Uint8Array(ab)]);
}

export function base64ToArrayBuffer(base64: string) {
    var binary_string = window.atob(base64);
    var len = binary_string.length;
    var bytes = new Uint8Array(len);
    for (var i = 0; i < len; i++) {
        bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
}

// source: https://gist.github.com/jonleighton/958841
export function arrayBufferToBase64(arrayBuffer: ArrayBuffer) {
    var base64 = ''
    var encodings = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'

    var bytes = new Uint8Array(arrayBuffer)
    var byteLength = bytes.byteLength
    var byteRemainder = byteLength % 3
    var mainLength = byteLength - byteRemainder

    var a, b, c, d
    var chunk

    // Main loop deals with bytes in chunks of 3
    for (var i = 0; i < mainLength; i = i + 3) {
        // Combine the three bytes into a single integer
        chunk = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2]

        // Use bitmasks to extract 6-bit segments from the triplet
        a = (chunk & 16515072) >> 18 // 16515072 = (2^6 - 1) << 18
        b = (chunk & 258048) >> 12 // 258048   = (2^6 - 1) << 12
        c = (chunk & 4032) >> 6 // 4032     = (2^6 - 1) << 6
        d = chunk & 63               // 63       = 2^6 - 1

        // Convert the raw binary segments to the appropriate ASCII encoding
        base64 += encodings[a] + encodings[b] + encodings[c] + encodings[d]
    }

    // Deal with the remaining bytes and padding
    if (byteRemainder == 1) {
        chunk = bytes[mainLength]

        a = (chunk & 252) >> 2 // 252 = (2^6 - 1) << 2

        // Set the 4 least significant bits to zero
        b = (chunk & 3) << 4 // 3   = 2^2 - 1

        base64 += encodings[a] + encodings[b] + '=='
    } else if (byteRemainder == 2) {
        chunk = (bytes[mainLength] << 8) | bytes[mainLength + 1]

        a = (chunk & 64512) >> 10 // 64512 = (2^6 - 1) << 10
        b = (chunk & 1008) >> 4 // 1008  = (2^6 - 1) << 4

        // Set the 2 least significant bits to zero
        c = (chunk & 15) << 2 // 15    = 2^4 - 1

        base64 += encodings[a] + encodings[b] + encodings[c] + '='
    }

    return base64
}

export function deriveAesGcm256Key(baseKey: CryptoKey, salt: ArrayBuffer, extractable: boolean = false): Promise<CryptoKey> {
  return window.crypto.subtle.deriveKey(
    {
      name: 'HKDF',
      hash: 'SHA-256',
      salt,
      info: new Uint8Array(0) /** @todo maybe add user/application-specific contextual data here */
    },
    baseKey,
    // this keying material we're generating will be applied to encrypt stuff
    // using 256-bit AES in Galois/Counter Mode, hence the following line:
    { name: 'AES-GCM', length: 256 },
    extractable,
    ['encrypt', 'decrypt']
  )
}

export function deriveHmacSigningKey(baseKey: CryptoKey, salt: ArrayBuffer, extractable: boolean = false): Promise<CryptoKey> {
  return window.crypto.subtle.deriveKey(
    {
      name: 'HKDF',
      hash: 'SHA-256',
      salt,
      info: new Uint8Array(0)
    },
    baseKey,
    { name: 'HMAC', hash: 'SHA-256' },
    extractable,
    ['sign', 'verify']
  )
}

export async function encryptFile(file: ArrayBuffer, key: CryptoKey) {
  const result = await encrypt(file, key)

  return {
    file: arrayBufferToBlob(result.cipher),
    iv: result.iv
  }
}

export async function encrypt(input: ArrayBuffer, key: CryptoKey) {
  const iv = crypto.getRandomValues(new Uint32Array(4))

  const cipher = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    input
  )

  return {
    cipher: cipher as Uint8Array,
    iv,
  }
}
