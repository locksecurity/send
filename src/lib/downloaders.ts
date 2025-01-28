import { CryptoTransform, MSG_CHUNK_SIZE, StreamSlicer } from "@/streans"

// possible types for `Response.body`
type DownloadSource = () => null | ReadableStream | Promise<ReadableStream | null>

abstract class FileDownloader {
  protected writable?: WritableStream = undefined
  protected cipherChunkSize = MSG_CHUNK_SIZE + 12 + 16

  constructor(writable?: WritableStream) {
    this.writable = writable
  }

  abstract download(source: DownloadSource, key: CryptoKey, name?: string): void
}

class NativeFileDownloader extends FileDownloader {

  constructor(writeable?: WritableStream) {
    super(writeable)
console.log('constructing native!')
    if (typeof (<any>window).showSaveFilePicker === 'undefined' || !this.writable) {
      throw new Error('')
    }
  }

  async download(source: DownloadSource, key: CryptoKey) {
    const rs = this.cipherChunkSize
    const stream = await source()

    if (stream === null) {
      throw new Error('Download source is empty')
    }

    stream
      .pipeThrough(new TransformStream(new StreamSlicer(rs)))
      .pipeThrough(new TransformStream(new CryptoTransform(key, 'decrypt')))
      .pipeTo(<WritableStream>this.writable)
  }
}

class InMemoryDownloader extends FileDownloader {
  download(source: DownloadSource, key: CryptoKey, name?: string): void {
    // TODO: implement
  }
}


export function getDownloader(writable?: WritableStream): FileDownloader {
  try {
    return new NativeFileDownloader(writable)
  } catch (e) {
    return new InMemoryDownloader()
  }
}
