<template>
  <main class="p-4">
    <div class="mt-12">
      <form @submit.prevent="uploadFile" class="w-full max-w-lg mx-auto" action="#" method="POST">
        <h2 class="text-lg md:text-2xl text-gray-800 font-semibold text-center">
          <!-- Share -->
        </h2>
        <div class="mt-4 shadow sm:rounded-md sm:overflow-hidden">
          <div class="px-4 py-5 bg-white sm:p-6">
            <div v-show="!showPreview && !(working || uploading || completed)">
              <label class="block text-sm font-medium text-gray-700">

              </label>
              <div class="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div class="space-y-1 text-center">
                  <svg class="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                  <div class="flex text-gray-600">
                    <label for="file-upload" class="w-full relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                      <span>Choose a file</span>
                      <input ref="uploadArea" @change="changeFile" id="file-upload" name="file-upload" type="file" class="sr-only" />
                    </label>
                    <p class="pl-1 hidden">or drag and drop</p>
                  </div>
                  <p class="text-sm text-gray-500">Any format, up to 50MB</p>
                </div>
              </div>
            </div>

            <div v-show="showPreview && !(uploading || completed)" id="previewArea" class="flex flex-col justify-between h-full" :class="{'pointer-none': working}">
              <div>
                <div class="p-4 bg-gray-100 rounded">
                  <div class="w-full h-full flex items-center bg-white rounded p-2">
                    <svg class="h-12 w-auto text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <div class="ml-4 leading-snug">
                      <span id="filename" class="text-gray-700">{{ filename }}</span><br />
                      <span id="fileSize" class="text-sm text-gray-400">{{ filesize }}</span>
                    </div>
                    <button @click="removeFile" title="Remove" type="button" class="ml-auto px-2 rounded-full text-2xl text-gray-500 hover:text-gray-600">
                      &times;
                    </button>
                  </div>
                </div>

                <div class="hidden mt-6">
                  <div class="relative flex items-start">
                    <div class="flex items-center h-5">
                      <input onchange="toggleKeySection()" id="useKey" name="" type="checkbox" class="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded">
                    </div>
                    <div class="ml-3 text-sm">
                      <label for="useKey" class="font-medium text-gray-200">Protect with password</label>
                    </div>
                  </div>
                    <div id="keySection" class="hidden mt-3">
                    </div>
                </div>
              </div>

              <div class="pt-8">
                <div class="mt-4">
                  <button
                    :disabled="working"
                    :class="[working ? 'bg-gray-300' : 'bg-blue-700']"
                    class="w-full py-3 rounded text-center text-gray-100 font-semibold"
                    type="submit"
                  >
                    Encrypt &amp; upload
                  </button>
                </div>
              </div>
            </div>

            <div v-show="uploading">
              <div class="flex justify-center">
                <CircularProgressBar
                  :current="Math.floor((progress[0] / progress[1]) * 100)"
                  :max="100"
                />
              </div>
              <div class="mt-12 flex items-center justify-between">
                <div class="text-gray-600 text-sm md:text-base">
                  <h4 class="font-semibold text-blue-700">Uploading</h4>
                  <p>
                    <span class="font-medium">{{ getFileSize(progress[0]) }}</span>
                    /
                    <span>{{ getFileSize(progress[1]) }}</span>
                  </p>
                </div>
                <div class="text-xs md:text-sm">
                  <button type="button" @click="cancelUpload" class="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm font-medium rounded text-gray-700 bg-white md:px-3 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300">Cancel</button>
                </div>
              </div>
            </div>

            <div v-show="completed" class="">
              <h3 class="text-gray-800 text-2xl font-medium text-center">
                Your upload is ready! 🎉
              </h3>

              <p class="mt-6 text-gray-600 text-center">
                The link to your file
                <span class="font-semibold">{{ filename }}</span>
                expires in 24 hours.
              </p>

              <div class="mt-12">
                <label for="download" class="block text-sm font-medium text-gray-700">Copy and share the link to send your file</label>
                <div class="mt-1 flex rounded-md shadow-sm">
                  <div class="relative flex items-stretch flex-grow focus-within:z-10">
                    <input
                      type="text"
                      id="download"
                      readonly
                      :value="downloadUrl"
                      class="focus:ring-blue-500 focus:border-blue-500 block w-full rounded-none rounded-l-md border-gray-300"
                    />
                  </div>
                  <button type="button" class="-ml-px relative inline-flex items-center space-x-2 px-4 py-2 border border-gray-300 text-sm font-medium rounded-r-md text-gray-700 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
                    <ClipboardCopyIcon class="h-5 w-5 text-gray-400" aria-hidden="true" />
                    <span>Copy</span>
                  </button>
                </div>
              </div>

              <div class="mt-12 flex justify-center">
                <button @click="reset" type="button" class="text-blue-700 underline">
                  Send another file
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>

    </div>

  </main>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { ViewGridAddIcon, ClipboardCopyIcon } from '@heroicons/vue/outline';
import getFileSize from 'filesize'
import * as filenc from '@/crypto/fileenc'
import * as api from '@/api'
import { sliceStream, StreamSlicer } from '@/streans'
import CircularProgressBar from '../components/CircularProgressBar.vue'

const apiRoot = import.meta.env.VITE_API_URL

export default defineComponent({
  components: {
    ViewGridAddIcon,
    CircularProgressBar,
    ClipboardCopyIcon,
  },

  data: () => ({
    filename: '',
    filesize: '',

    showPreview: false,

    progress: <Array<number>> [0, 0],
    working: false,
    uploading: false,
    completed: false,

    uploadRequest: <{
      cancel: () => void
      result: Promise<{ duration: number }>
    } | null> null,

    downloadUrl: <string|null> null,
  }),

  computed: {
    noVaults: () => true,
  },

  methods: {
    changeFile(ev: Event): void {
      if (!ev.target) return

      const { files } = ev.target as HTMLInputElement
      if (!files || files.length == 0) return

      const f = files[0]
      this.filename = f.name
      this.filesize = getFileSize(f.size)
      this.showPreview = true
    },

    removeFile(): void {
      const uploadArea = this.$refs.uploadArea as HTMLInputElement
      uploadArea.files = (new DataTransfer()).files

      this.showPreview = false
    },

    async uploadFile(ev: Event) {
      const { files } = this.$refs.uploadArea as HTMLInputElement

      if (!files) return
      const file = files[0]
      const reader = (await filenc.blobToArrayBuffer(file)).target

      if (!reader) {
        alert('There was a problem loading up your file. Please check and try again.')
        return
      }
      //

      const prep = await this.prepareUpload()
      this.working = true

      // encrypt file
      const encrytedFile = await filenc.encryptFile(
        <ArrayBuffer>reader.result,
        prep.file.key
      )

      // encrypt metadata
      const encoder = new TextEncoder()
      const encryptedMeta = await filenc.encrypt(
        encoder.encode(JSON.stringify({
          name: file.name,
          size: file.size,
          type: file.type || 'application/octet-stream',
        })),
        prep.meta.key
      )

      // initialize upload
      const init = await this.registerUpload({
        signingKey: prep.signingKey,
        file: { salt: prep.file.salt, iv: encrytedFile.iv },
        meta: {
          salt: prep.meta.salt,
          iv: encryptedMeta.iv,
          cipher: filenc.arrayBufferToBase64(encryptedMeta.cipher)
        },
      })

      if (!init.ok) {
        alert('Something went wrong. Please try again.')
        this.working = false
        return
      }

      // upload encrypted file + meta using id
      const id = (await init.json()).id

      //
      const totalSize = encrytedFile.file.size
      const encStream = sliceStream(encrytedFile.file.stream(), new StreamSlicer(), () => {})

      this.uploadRequest = api.uploadWs(
        id,
        encStream,
        (p: number) => {
          this.progress = [p, totalSize];
          console.log(`pushed ${p} out of ${totalSize}`)
        }
      )
      this.uploading = true

      // show download link including secret key
      try {
        await this.uploadRequest.result
        this.progress = [totalSize, totalSize]
        this.downloadUrl = window.location.origin + `/download/${id}?#${prep.secret}`

        this.working = this.uploading = this.showPreview = false
        this.completed = true

      } catch (e) {
        alert(e)
        this.working = this.uploading = false
        return
      }
    },

    /**
     * Initialize an upload with the remote server.
     *
     * @param {object} body
     */
    registerUpload(body: object) {
      return fetch(`${apiRoot}/uploads/prepare`, {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
    },

    /**
     * Setup encryption and signing keys to be used in protecting
     * a new file upload.
     */
    async prepareUpload() {
      /**
       * generate base key
       * derive:
        * HMAC signing key
        * AES-GCM key for the file metadata
        * AES-GCM key for the file itself
       */
      const encoder = new TextEncoder()

      let key = await crypto.subtle.exportKey('jwk',
        await crypto.subtle.generateKey(
          { name: 'AES-GCM', length: 256 },
          true,
          ['encrypt']
        )
      )

      const baseKey = await crypto.subtle.importKey(
        'raw',
        encoder.encode(key.k),
        'HKDF',
        true,
        ['deriveKey']
      )

      const signingKeySalt = crypto.getRandomValues(new Uint32Array(4))
      const signingKey = await filenc.deriveHmacSigningKey(baseKey, signingKeySalt, true)

      const metaSalt = crypto.getRandomValues(new Uint32Array(4))
      const metaKey = await filenc.deriveAesGcm256Key(baseKey, metaSalt)

      const fileSalt = crypto.getRandomValues(new Uint32Array(4))
      const fileKey = await filenc.deriveAesGcm256Key(baseKey, fileSalt)

      // store signing key and all salts
      const exportedSigningKey = await window.crypto.subtle.exportKey('jwk', signingKey)

      return {
        signingKey: {
          key: exportedSigningKey,
          salt: signingKeySalt,
        },
        file: {
          salt: fileSalt,
          key: fileKey,
        },
        meta: {
          salt: metaSalt,
          key: metaKey,
        },
        secret: <string>key.k
      }
    },

    getFileSize(bytes: number): string {
      return getFileSize(bytes)
    },

    reset(): void {
      this.showPreview
       = this.working
       = this.uploading
       = this.completed
       = false

      this.progress = [0, 0]
      this.downloadUrl = null
      this.uploadRequest = null
    },

    cancelUpload(): void {
      this.uploadRequest?.cancel()
      this.reset()
    },

    //
  }
})

</script>
