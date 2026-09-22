import { CryptoTransform, MSG_CHUNK_SIZE, StreamSlicer } from "@/streans"

export type DownloadSource = () => Promise<null | ReadableStream<Uint8Array>>

abstract class FileDownloader {
  protected cipherChunkSize = MSG_CHUNK_SIZE + 12 + 16
  protected fileName: string

  constructor(fileName: string) {
    this.fileName = fileName
  }

  decryptStream(stream: ReadableStream, key: CryptoKey) {
    return stream
      .pipeThrough(new TransformStream(new StreamSlicer(this.cipherChunkSize)))
      .pipeThrough(new TransformStream(new CryptoTransform(key, 'decrypt')))
  }

  abstract download(source: DownloadSource, key: CryptoKey): Promise<void>
}

class NativeFileDownloader extends FileDownloader {
  protected writable: WritableStream

  constructor(fileName: string, writable: WritableStream) {
    super(fileName)
    this.writable = writable
  }

  static async init(preferredFileName: string) {
    try {
      const options = { suggestedName: preferredFileName }
      const handle = await (<any>window).showSaveFilePicker(options)

      return new NativeFileDownloader(
        preferredFileName,
        await handle.createWritable()
      )
    }
    catch (e) {
      return null
    }
  }

  async download(source: DownloadSource, key: CryptoKey) {
    const stream = await source()
    if (stream === null) {
      throw new Error('Download source is empty')
    }

    return this.decryptStream(stream, key).pipeTo(this.writable)
  }
}

class InMemoryDownloader extends FileDownloader {
  async download(source: DownloadSource, key: CryptoKey, name?: string) {
    const stream = await source()

    if (stream === null) {
      throw new Error('Download source is empty')
    }
    const file = await (new Response(this.decryptStream(stream, key))).blob()
    const link = document.createElement('a')

    link.style.display = 'none'
    link.href = URL.createObjectURL(file)
    link.download = this.fileName

    // needs to be added to the DOM so it can be clicked
    document.body.appendChild(link)
    link.click()

    // To make this work on Firefox we need to wait
    // a little while before removing it.
    setTimeout(() => {
      URL.revokeObjectURL(link.href)
      link.parentNode?.removeChild(link)
    }, 5000)
  }
}


export async function getDownloader(fileName: string): Promise<FileDownloader> {
  return await NativeFileDownloader.init(fileName) ?? new InMemoryDownloader(fileName)
}
