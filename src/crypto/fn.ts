const IV_LENGTH = 16;

export async function encryptBlob(input) {
  return await encrypt(input, true, true);
}

export async function decryptBlob(payload, jwk) {
  return await decrypt(payload, jwk, true, true);
}

export async function encryptBase64(input) {
  return await encrypt(input, false, false);
}

export async function decryptBase64(payload, jwk) {
  return await decrypt(payload, jwk, false, false);
}

export async function encryptBlobToBase64(input) {
  return await encrypt(input, true, false);
}

export async function decryptBase64ToBlob(payload, jwk) {
  return await decrypt(payload, jwk, false, true);
}

async function encrypt(input, inputIsBlob, outputIsBlob) {
  const key = await window.crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']);
  const iv = window.crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const inputArray = inputIsBlob ? (await blobToArrayBuffer(input)).target.result : base64ToArrayBuffer(input);
  const cipher = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, inputArray);
  const payload = new Uint8Array(cipher.byteLength + iv.byteLength);
  payload.set(new Uint8Array(cipher));
  payload.set(iv, cipher.byteLength);
  const exportedKey = await crypto.subtle.exportKey('jwk', key);

  return {
    key: exportedKey.k,
    payload: outputIsBlob ? arrayBufferToBlob(payload) : arrayBufferToBase64(payload),
  };
}

async function decrypt(payload, keyToken, inputIsBlob, outputIsBlob) {
  const jwk = {
    alg: "A256GCM",
    ext: true,
    k: keyToken,
    key_ops: ["encrypt", "decrypt"],
    kty: "oct",
  }
  const key = await crypto.subtle.importKey('jwk', jwk, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
  const dataArray = inputIsBlob ? (await blobToArrayBuffer(payload)).target.result : base64ToArrayBuffer(payload);
  const cipher = dataArray.slice(0, dataArray.byteLength - IV_LENGTH);
  const iv = dataArray.slice(cipher.byteLength, dataArray.byteLength);
  const deciphered = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: iv }, key, cipher);
  const decipheredAsBlob = outputIsBlob ? arrayBufferToBlob(deciphered) : arrayBufferToBase64(deciphered);
  return decipheredAsBlob;
}

function blobToArrayBuffer(blob) {
  var fileReader = new FileReader();

  return new Promise(function (resolve, reject) {
    fileReader.onload = resolve;
    fileReader.onerror = reject;

    fileReader.readAsArrayBuffer(blob);
  });
};

function arrayBufferToBlob(ab) {
  return new Blob([new Uint8Array(ab)]);
}

function base64ToArrayBuffer(base64) {
  var binary_string = window.atob(base64);
  var len = binary_string.length;
  var bytes = new Uint8Array(len);
  for (var i = 0; i < len; i++) {
    bytes[i] = binary_string.charCodeAt(i);
  }
  return bytes.buffer;
}

// source: https://gist.github.com/jonleighton/958841
export function arrayBufferToBase64(arrayBuffer) {
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
