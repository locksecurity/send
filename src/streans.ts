export const MSG_CHUNK_SIZE = 1024 * 256

export class StreamSlicer {
  protected rs: number
  protected chunkSize: number
  protected partialChunk: Uint8Array
  protected offset: number

  /**
   * Constructor.
   *
   * @param {number} rs Record size. Number of bytes each chunk should contain.
   *  Defaults to 256kb.
   */
  constructor(rs: number = MSG_CHUNK_SIZE) {
    this.rs = rs;
    this.chunkSize = rs;
    this.partialChunk = new Uint8Array(this.chunkSize); // where partial chunks are saved
    this.offset = 0;
  }

  send(buf: ArrayBuffer, controller: { enqueue(d: ArrayBuffer): void; }) {
    controller.enqueue(buf);
    this.partialChunk = new Uint8Array(this.chunkSize);
    this.offset = 0;
  }

  //reslice input into record sized chunks
  transform(chunk: Uint8Array, controller: { enqueue(d: ArrayBuffer): void; }) {
    //console.log('Received chunk with %d bytes.', chunk.byteLength)
    let i = 0;

    if (this.offset > 0) {
      // console.log('Offset don zero o!')
      const len = Math.min(chunk.byteLength, this.chunkSize - this.offset);
      this.partialChunk.set(chunk.slice(0, len), this.offset);
      this.offset += len;
      i += len;

      if (this.offset === this.chunkSize) {
        this.send(this.partialChunk, controller);
      }
    }

    while (i < chunk.byteLength) {
      const remainingBytes = chunk.byteLength - i;
      if (remainingBytes >= this.chunkSize) {
        const record = chunk.slice(i, i + this.chunkSize);
        i += this.chunkSize;
        this.send(record, controller);
      } else {
        // console.log('Chunk left -> ', chunk)
        const end = chunk.slice(i, i + remainingBytes);
        i += end.byteLength;
        this.partialChunk.set(end);
        this.offset = end.byteLength;
      }
    }
  }

  flush(controller: TransformStreamDefaultController<ArrayBuffer>) {
    if (this.offset > 0) {
      controller.enqueue(this.partialChunk.slice(0, this.offset));
    }
  }
}

/**
 * Fun reading on how (NOT) to GCM:
 *
 * @see https://stackoverflow.com/questions/67028762/why-aes-256-with-gcm-adds-16-bytes-to-the-ciphertext-size
 * @see https://crypto.stackexchange.com/questions/84357/what-are-the-rules-for-using-aes-gcm-correctly
 * @see https://stackoverflow.com/questions/54418429/android-cipherstream-api-for-aead-ciphers-inacceptable-slow/54422153#54422153
 * @see https://crypto.stackexchange.com/questions/26783/ciphertext-and-tag-size-and-iv-transmission-with-aes-in-gcm-mode
 */
export class CryptoTransform {
  protected key: CryptoKey
  protected mode: 'encrypt'|'decrypt'
  protected count = 0

  constructor(key: CryptoKey, mode: 'encrypt'|'decrypt' = 'encrypt') {
    this.key = key
    this.mode = mode
  }

  start() {}

  // encrypt byte array and pass to outstream buffer
  async transform(
    chunk: Uint8Array,
    controller: { enqueue(d: ArrayBuffer): void; }
  ) {
    console.log(`chunk ${++this.count}: ${chunk.byteLength / 1024} KiB`)

    if (this.mode === 'encrypt') {
      controller.enqueue(await this.encryptChunk(chunk))
      return
    }

    controller.enqueue(await this.decryptChunk(chunk))
    return
  }

  async encryptChunk(chunk: Uint8Array) {
    const iv = crypto.getRandomValues(new Uint8Array(12)) // GCM's 12-byte iv

    const cipher = await window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv }, this.key, chunk
    )
    const cipherBytes = new Uint8Array(cipher)
    const newChunk = new Uint8Array(iv.length + cipherBytes.length)

    newChunk.set(iv)
    newChunk.set(cipherBytes, iv.length)

    return newChunk
  }

  async decryptChunk(chunk: Uint8Array) {
    if (chunk.length <= (12 + 16)) {
      // 12 bytes IV, 16 bytes GCM tag
      throw new Error('Each encrypted chunk must be more than 28 bytes in length.')
    }

    const iv = chunk.subarray(0, 12)
    const clear = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv }, this.key, chunk.subarray(12)
    )

    return new Uint8Array(clear)
  }
}

export function sliceStream(readable: ReadableStream) {
  return transformStream(readable, new StreamSlicer(), () => {})
}

/**
 * Backwards-compatible(?) `ReadableStream.pipeThrough()`.
 */
export function transformStream(
  readable: ReadableStream,
  transformer: Transformer<ArrayBuffer, ArrayBuffer> | any,
  oncancel: Function
) {
  try {
    return readable.pipeThrough(new TransformStream(transformer))
  } catch(e) {
    const reader = readable.getReader();

    return new ReadableStream({
      async pull(controller: ReadableStreamController<ArrayBuffer>) {
        let enqueued = false;
        const wrappedController = {
          enqueue(d: any) {
            enqueued = true;
            controller.enqueue(d);
          }
        };

        while (!enqueued) {
          const data = await reader.read();
          if (data.done) {
            if (transformer.flush) {
              await transformer.flush(controller);
            }
            return controller.close();
          }
          await transformer.transform(data.value, wrappedController);
        }
      },

      cancel(reason) {
        readable.cancel(reason);

        if (oncancel) {
          oncancel(reason);
        }
      }
    });
  }
}
