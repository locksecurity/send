<!-- This example requires Tailwind CSS v2.0+ -->
<template>
  <transition enter-active-class="transform ease-out duration-300 transition" enter-from-class="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2" enter-to-class="translate-y-0 opacity-100 sm:translate-x-0" leave-active-class="transition ease-in duration-100" leave-from-class="opacity-100" leave-to-class="opacity-0">
    <div v-if="show" class="max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden">
      <div class="p-4">
        <div class="flex items-start">
          <div class="flex-shrink-0">
            <CheckCircleIcon class="h-6 w-6 text-green-400" v-if="status === 'success'" aria-hidden="true" />
            <ExclamationCircleIcon class="h-6 w-6 text-yellow-500" v-if="status === 'warning'" aria-hidden="true" />
            <ExclamationCircleIcon class="h-6 w-6 text-red-500" v-if="status === 'error'" aria-hidden="true" />
          </div>
          <div class="ml-3 w-0 flex-1 pt-0.5">
            <p class="text-sm font-medium text-gray-900">{{ title }}</p>
            <p class="mt-1 text-sm text-gray-500" v-if="body && body.length">{{ body }}</p>
          </div>
          <div class="ml-4 flex-shrink-0 flex">
            <button type="button" @click="close" class="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              <span class="sr-only">Close</span>
              <XIcon class="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/vue/outline'
import { XIcon } from '@heroicons/vue/solid'

export default defineComponent({
  components: { CheckCircleIcon, ExclamationCircleIcon, XIcon },

  props: {
    status: { type: String, required: true },
    title: { type: String, required: true },
    body: { type: String, required: false },

    removeFn: { type: Function, required: true }
  },

  data: () => ({
    show: false,
  }),

  mounted() {
    // delay "show" by a tad for transition/transform effect(s)
    setTimeout(() => this.show = true, 200)

    // default: remove after 6 seconds
    setTimeout(() => this.close(), 6000)
  },

  methods: {
    close() {
      this.show = false
      setTimeout(() => this.removeFn(), 200)
    }
  }
})
</script>
