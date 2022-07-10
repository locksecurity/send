<template>
  <main class="p-4">
    <div class="mt-12">
      <form @submit.prevent="uploadFile" class="w-full max-w-lg mx-auto" action="#" method="POST">
        <h2 class="text-lg md:text-2xl text-gray-800 font-semibold text-center">
          Share
        </h2>
        <div class="mt-4 shadow sm:rounded-md sm:overflow-hidden">
          <div class="px-4 py-5 bg-white space-y-6 sm:p-6">
            <div v-show="!(showPreview)">
              <label class="block text-sm font-medium text-gray-700">

              </label>
              <div class="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div class="space-y-1 text-center">
                  <svg class="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                  <div class="flex text-gray-600">
                    <label for="file-upload" class="w-full relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                      <span>Choose a file</span>
                      <input ref="uploadArea" @change="changeFile" id="file-upload" name="file-upload" type="file" class="sr-only" />
                    </label>
                    <p class="pl-1 hidden">or drag and drop</p>
                  </div>
                  <p class="text-sm text-gray-500">Any format, up to 50MB</p>
                </div>
              </div>
            </div>

            <div id="previewArea" v-show="showPreview" class="flex flex-col justify-between h-full">
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
                      <input onchange="toggleKeySection()" id="useKey" name="" type="checkbox" class="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded">
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
                  <button class="w-full py-3 rounded text-center text-gray-100 font-semibold bg-blue-700" type="submit">
                    Encrypt &amp; upload
                  </button>
                </div>
              </div>

              <div class="mt-12">
                <CircularProgressBar/>
              </div>
            </div>

            <div class="mt-4 hidden">
              <button class="w-full py-3 rounded text-center text-sm font-medium text-white bg-blue-700">Encrypt &amp; Upload</button>
            </div>
          </div>
        </div>
      </form>

    </div>

  </main>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { ViewGridAddIcon } from '@heroicons/vue/outline';
import getFileSize from 'filesize'
import * as filenc from '@/crypto/fileenc'
import * as api from '@/api'
import { sliceStream, StreamSlicer } from '@/streans'
import CircularProgressBar from '../components/CircularProgressBar.vue'

const apiRoot = import.meta.env.VITE_API_URL

export default defineComponent({
  components: { ViewGridAddIcon, CircularProgressBar },

  data: () => ({
    filename: '',
    filesize: '',

    showPreview: false,
    cipherUrl: '',
    clearUrl: '',

    progress: <Array<number>> [],
  }),

  computed: {
    noVaults: () => true
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

      const prep = await this.prepareUpload()

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
        return
      }

      // upload encrypted file + meta using id
      const id = (await init.json()).id

      /*
      const body = new FormData()
      body.append('file', encrytedFile.file)

      const upload = await fetch(`${apiRoot}/uploads/${id}`, {
        method: 'post',
        body,
      })

      if (!upload.ok) {
        alert('There was a problem uploading your file. Please try again')
        return
      }
       */

      //
      const totalSize = encrytedFile.file.size
      const encStream = sliceStream(encrytedFile.file.stream(), new StreamSlicer(), () => {})

      const uploadRequest = api.uploadWs(
        id,
        encStream,
        (p: number) => {
          this.progress = [p, totalSize];
          console.log(`pushed ${p} out of ${totalSize}`)
        }
      );

      // console.log('other stuff')
      // console.log('result -->', await uploadRequest.result)

      // show download link including secret key
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


    async encryptFile(ev: Event): Promise<void> {
      if (!ev.target) return

      const file: File = ev.target.files[0]

      const start = (new Date()).getTime()
      const output = await filenc.encryptBlob(file)
      const cost = ((new Date()).getTime() - start) / 1000

      console.log('Enc -->', output)

      const inputSize = Number(file.size / (1024*1024)).toFixed(2)
      const outputSize = Number(output.payload.size / (1024*1024)).toFixed(2)

      console.info(`Input file size: ${inputSize}MB`)
      console.info(`Output file size: ${outputSize}MB`)
      console.info(`Processing time: ${cost} secs`)

      this.cipherUrl = URL.createObjectURL(output.payload)

      const dec = await filenc.decryptBlob(output.payload, output.key)
      this.clearUrl = URL.createObjectURL(dec)
    },

    //
  }
})

</script>
