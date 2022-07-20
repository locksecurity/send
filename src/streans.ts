export class StreamSlicer {
  protected rs: number
  protected chunkSize: number
  protected partialChunk: Uint8Array
  protected offset: number

  /**
   * Constructor.
   *
   * @param {number} rs Record size. Number of bytes each chunk should contain.
   *  Defaults to 64kb.
   */
  constructor(rs: number = 1024 * 256) {
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
      console.log('Offset don zero o!')
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

  flush(controller: ReadableStreamController<any>) {
    if (this.offset > 0) {
      controller.enqueue(this.partialChunk.slice(0, this.offset));
    }
  }
}

export function sliceStream(
  stream: ReadableStream,
  transformer: StreamSlicer,
  oncancel: Function
) {
  const reader = stream.getReader();

  return new ReadableStream({
    async pull(controller: ReadableStreamController<any>) {
      let enqueued = false;
      const wrappedController = {
        enqueue(d: ArrayBuffer) {
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
      stream.cancel(reason);

      if (oncancel) {
        oncancel(reason);
      }
    }
  });
}
