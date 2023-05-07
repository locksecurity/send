<template>
  <div v-if="working" className="w-full h-screen pt-48 bg-gray-50 flex justify-center">
    <SimpleSpinner class="h-10 w-auto text-gray-700" />
  </div>

  <main v-else class="w-full max-w-lg mx-auto p-4">
    <div class="min-h-full flex flex-col justify-center pb-8 sm:px-6 lg:px-8">
      <div class="sm:mx-auto sm:w-full sm:max-w-md">
        <img src="/img/icon.svg" class="mx-auto h-12 w-auto text-blue-500" alt="Locksend" />
      </div>
    </div>

    <header class="text-2xl text-gray-800 font-semibold">
      <h2 class="text-center">Download file</h2>
    </header>

    <main class="mt-8">
      <p class="text-gray-700 text-center">
        This file was shared using end-to-end encryption and a link that automatically expires.
      </p>

      <div class="mt-12 rounded border border-gray-200">
        <div class="p-4">
          <div class="w-full h-full flex items-center bg-white rounded p-2">
            <svg class="h-12 w-auto text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <div class="ml-4 leading-snug">
              <span id="filename" class="text-gray-700">{{ meta?.name || '' }}</span><br />
              <span id="fileSize" class="text-sm text-gray-400">{{ getFileSize(meta?.size || 0) }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-12">
        <loadable-button
          :loading="downloading"
          class="w-full py-3 rounded text-center bg-blue-700 text-gray-100 font-semibold"
          type="button"
          @click="downloadFile"
        >
          Download
        </loadable-button>
      </div>
    </main>
  </main>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import getFileSize from 'filesize'
import SimpleSpinner from '@/components/SimpleSpinner.vue'
import { getDownloader } from '@/lib/downloaders'
import * as filenc from '@/crypto/fileenc'
import LoadableButton from '@/components/LoadableButton.vue'
import notifier from '@/notifications'

const apiRoot = import.meta.env.VITE_API_URL

export default defineComponent({
  components: { SimpleSpinner, LoadableButton },

  data() {
    return ({
      working: true,
      meta: <{
        name: string,
        type: string,
        size: number
      } | null> null,
      authToken: <string|null> null,
      baseKey: <CryptoKey|null> null,

      file: <{
        salt: Array<number>,
        iv: Array<number>
      }> {},

      uploadId: <string|null> null,
      downloading: false,
    })
  },

  async created() {
    const path = window.location.pathname.split('/')
    const id = path[path.length - 1]

    let secret = window.location.hash
    if (!secret.length) {
      alert('(1) link is invalid or has expired')
      return
    }
    secret = secret.slice(1)

    // try initializing a new download
    const init = await fetch(`${apiRoot}/downloads`, {
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uploadId: id })
    })

    if (!init.ok) {
      // link is invalid or has expired
      alert('(2) link is invalid or has expired')
      return
    }

    const attempt = await init.json()

    // derive keys and do verification
    const baseKey = await this.importBaseKey(secret)
    const signingKey = await filenc.deriveHmacSigningKey(
      baseKey,
      Uint32Array.from(attempt.signingKey.salt),
      false
    )

    const signature = await crypto.subtle.sign(
      { name: 'HMAC' },
      signingKey,
      (new TextEncoder()).encode(attempt.nonce)
    )
    const auth = await fetch(`${apiRoot}/downloads/authorize`, {
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ attemptId: attempt.id, signature: filenc.buf2hex(signature) })
    })

    if (!auth.ok) {
      alert('(3) link is invalid or has expired')
      return
    }

    const { token, meta, file } = await auth.json()
    const metaKey = await filenc.deriveAesGcm256Key(baseKey, Uint32Array.from(meta.salt))
    const decMeta = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: Uint32Array.from(meta.iv) },
      metaKey,
      filenc.base64ToArrayBuffer(meta.cipher)
    )

    const decoder = new TextDecoder()
    this.meta = JSON.parse(decoder.decode(decMeta))
    this.baseKey = baseKey
    this.authToken = token
    this.file = file
    this.uploadId = id
    this.working = false
  },

  methods: {
    importBaseKey(secret: string) {
      const encoder = new TextEncoder()

      return crypto.subtle.importKey(
        'raw',
        encoder.encode(secret),
        'HKDF',
        false,
        ['deriveKey']
      )
    },

    async downloadFile() {
      const fileKey = await filenc.deriveAesGcm256Key(
        <CryptoKey>this.baseKey,
        Uint32Array.from(this.file.salt)
      )

      this.downloading = true
      const response = await fetch(`${apiRoot}/downloads/${this.uploadId}`, {
        headers: { Authorization: 'Bearer ' + this.authToken }
      })

      if (!response.ok) {
        notifier().warning(
          'We couldn\'t start your download',
          'Please try again in a few minutes.'
        )

        this.downloading = false
        return
      }

      let writable: WritableStream|undefined = undefined
      if ((<any>window).showSaveFilePicker) {
        try {
          const options = { suggestedName: this.meta?.name }
          const handle = await (<any>window).showSaveFilePicker(options)
    console.log({ handle })
          writable = handle.createWritable()
        } catch (e) {
          // same as all good
        }
      }

      await getDownloader(await writable).download(
        response,
        fileKey,
        this.meta?.name
      )

      this.downloading = false
      // ({

          // return filenc.decryptFile(
          //   <Blob>blob,
          //   fileKey,
          //   Uint32Array.from(this.file.iv)
          // )
        // })
        // .then(file => {
        //   const link = document.createElement('a')

        //   link.style.display = 'none'
        //   link.href = URL.createObjectURL(file)
        //   link.download = this.meta?.name as string

        //   // It needs to be added to the DOM so it can be clicked
        //   document.body.appendChild(link)
        //   link.click()

        //   // To make this work on Firefox we need to wait
        //   // a little while before removing it.
        //   setTimeout(() => {
        //     URL.revokeObjectURL(link.href)
        //     link.parentNode?.removeChild(link)
        //   }, 5000)

        //   this.downloading = false
        // })
    },

    getFileSize: (bytes: number) => getFileSize(bytes)
  },
})
</script>
