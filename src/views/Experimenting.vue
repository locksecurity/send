<template>
  <div v-if="noActiveSubscription" class="relative bg-amber-100">
    <div class="max-w-7xl mx-auto py-3 px-3 sm:px-6 lg:px-8">
      <div class="pr-16 sm:text-center sm:px-16">
        <p class="font-medium text-amber-800">
          <span class="md:hidden"> Some features may not work as you have no active subscription. </span>
          <span class="hidden md:inline"> Some features may not work as you have no active subscription. </span>
          <span class="block sm:ml-2 sm:inline-block">
            <router-link to="/plans/choose" class="text-amber-800 font-bold underline"> Choose a plan <span aria-hidden="true">&rarr;</span></router-link>
          </span>
        </p>
      </div>
      <div class="absolute inset-y-0 right-0 pt-1 pr-1 flex items-start sm:pt-1 sm:pr-2 sm:items-start">
        <button type="button" class="flex p-2 rounded-md hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-white">
          <span class="sr-only">Dismiss</span>
          <XIcon class="h-6 w-6 text-white" aria-hidden="true" />
        </button>
      </div>
    </div>
  </div>

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
                <label for="file-upload" class="space-y-1 text-center">
                  <svg class="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                  <div class="flex text-gray-600">
                    <div class="w-full relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                      <span>Choose a file</span>
                      <input ref="uploadArea" @change="changeFile" id="file-upload" name="file-upload" type="file" class="sr-only" />
                    </div>
                    <p class="pl-1 hidden">or drag and drop</p>
                  </div>
                  <p class="text-sm text-gray-500">Any format, up to 2GB</p>
                </label>
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
                  <LoadableButton
                    :loading="working"
                    class="w-full py-3 inline-flex items-center justify-center rounded text-center text-gray-100 bg-blue-700 font-semibold"
                    type="submit"
                  >
                    <LockClosedIcon class="w-5 h-auto mr-2" />
                    <span>Secure Upload</span>
                  </LoadableButton>
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
                  <button @click="copyDownloadLink" type="button" class="-ml-px relative inline-flex items-center space-x-2 px-4 py-2 border border-gray-300 text-sm font-medium rounded-r-md text-gray-700 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
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
import { defineComponent } from 'vue'
import {
  ComputerDesktopIcon as ViewGridAddIcon,
  ClipboardIcon as ClipboardCopyIcon,
  XMarkIcon as XIcon
} from '@heroicons/vue/24/outline'
import { LockClosedIcon } from '@heroicons/vue/24/solid'
import getFileSize from 'filesize'
import * as filenc from '@/crypto/fileenc'
import * as api from '@/api'
import { StreamSlicer, CryptoTransform } from '@/streans'
import CircularProgressBar from '@/components/CircularProgressBar.vue'
import LoadableButton from '@/components/LoadableButton.vue'
import { copyToClipboard } from '@/copy'
import notifier from '@/notifications'
import { useAuthStore } from '../stores/auth'

const apiRoot = import.meta.env.VITE_API_URL
const MAX_SIZE = 2147483632 // 2GiB minus 16 bytes

export default defineComponent({
  components: {
    ViewGridAddIcon,
    CircularProgressBar,
    ClipboardCopyIcon,
    LockClosedIcon,
    LoadableButton,
    XIcon
  },

  inject: ['session'],

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
    noActiveSubscription() {
      // hiding subscriptions for now.
      return false

      const session = (<any>this).session
      if (!session || !session.subscription) {
        return true
      }

      return Date.now() > (session.subscription.expires * 1000)
    }
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

      this.working = true
      if (file.size > MAX_SIZE) {
        notifier().warning(
          'That\'s a bit too large',
          'Please select a file 2GB or less and try again.'
        )

        this.working = false
        return
      }


      const prep = await this.prepareUpload()

      // encrypt file
      // const encrytedFile = await filenc.encryptFile(
      //   <ArrayBuffer>reader.result,
      //   prep.file.key
      // )

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
        file: { salt: prep.file.salt, iv: new Uint8Array(12) },
        meta: {
          salt: prep.meta.salt,
          iv: encryptedMeta.iv,
          cipher: filenc.arrayBufferToBase64(encryptedMeta.cipher)
        },
      })

      if (!init.ok) {
        notifier().warning('Something went wrong', 'Please try again.')
        this.working = false
        return
      }

      // slice file, encrypt & upload + meta using id
      const id = (await init.json()).id

      // TODO: update with total (encrypted) file size
      const totalSize = file.size

      // fileStream.pipeThrough(slicer).pipeThrough.(encrypter)
      // pass result to WS
      const writeReport = <Array<string>>[]

      const encStream = file.stream()
        .pipeThrough(new TransformStream(new StreamSlicer()))
        .pipeThrough(new TransformStream(new CryptoTransform(prep.file.key)))

      try {
        this.uploadRequest = api.uploadWs(
          id,
          encStream,
          (p: number) => {
            this.progress = [p, totalSize];
            console.log(`pushed ${p} out of ${totalSize}`)
          }
        )
        this.uploading = true
      } catch (e) {
        notifier().error('We were unable to start your upload.', 'Please try again.')
        console.error(e)

        this.uploading = false

        return
      }

      // show download link including secret key
      try {
        await this.uploadRequest.result
        this.progress = [totalSize, totalSize]
        this.downloadUrl = window.location.origin + `/download/${id}?#${prep.secret}`

        this.working = this.uploading = this.showPreview = false
        this.completed = true

      } catch (e) {
        notifier().error(
          'Something went wrong',
          'We were unable to complete your upload. Please try again.'
        )

        this.working = this.uploading = false
        return
      }
    },

    /**
     * Initialize an upload with the remote server.
     *
     * @param {object} body
     */
    async registerUpload(body: object) {
      const { token } = useAuthStore()

      return fetch(`${apiRoot}/uploads/prepare`, {
        method: 'post',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${await token}` },
        body: JSON.stringify(body)
      })
    },

    /**
     * Setup encryption && signing keys to be used in protecting
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
        false,
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

    getFileSize: (bytes: number) => getFileSize(bytes),

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

    copyDownloadLink(): void {
      if (copyToClipboard(<string>this.downloadUrl)) {
        return notifier().success('Link copied!')
      }

      notifier().warning(
        'Couldn\'t copy that 😬',
        'Please try copying the link manually.'
      )
    }

    //
  }
})

</script>
