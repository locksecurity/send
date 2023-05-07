import { CryptoTransform, MSG_CHUNK_SIZE, StreamSlicer } from "@/streans"

class FileDownloader {
  protected writable?: WritableStream = undefined
  protected cipherChunkSize = MSG_CHUNK_SIZE + 12 + 16

  constructor(writable?: WritableStream) {
    this.writable = writable
  }

  download(response: Response, key: CryptoKey, name?: string): void {}
}

class NativeFileDownloader extends FileDownloader {

  constructor(writeable?: WritableStream) {
    super(writeable)
console.log('constructing native!')
    if (typeof (<any>window).showSaveFilePicker === 'undefined' || !this.writable) {
      throw new Error('')
    }
  }

  async download(response: Response, key: CryptoKey, name?: string) {
    response
      .blob()
      .then((blob: { stream(): ReadableStream }) => {
        const rs = this.cipherChunkSize
        blob.stream()
          .pipeThrough(new TransformStream(new StreamSlicer(rs)))
          .pipeThrough(new TransformStream(new CryptoTransform(key, 'decrypt')))
          .pipeTo(<WritableStream>this.writable)
      })
  }
}

class InMemoryDownloader extends FileDownloader {}


export function getDownloader(writable?: WritableStream): FileDownloader {
  try {
    return new NativeFileDownloader(writable)
  } catch (e) {
    return new InMemoryDownloader()
  }
}
