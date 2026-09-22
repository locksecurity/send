<template>
  <details :open="open" :class="{ 'mb-6': open } ">
    <summary class="cursor-pointer relative" style="display: block list-item;">
      <span v-if="value.title" class="text-gray-700">{{ value.title }}</span>
      <span v-else class="text-gray-500 italic">[Untitled]</span>

      <button
        v-if="idx !== 'id0'"
        type="button"
        class="absolute right-0 h-full inline-flex items-center text-xs text-red-300 font-medium transition duration-200 hover:text-red-400"
        @click="confirmAndDelete"
      >
        <TrashIcon class="h-4 w-auto mr-1"/>
        Remove
      </button>

    </summary>
    <div class="mt-2 p-4 bg-white rounded-md shadow-sm grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6" :class="{ 'mb-20': open }">
      <div class="sm:col-span-3 space-y-6">
        <div>
          <label :id="`title-${idx}-id`" class="block text-sm font-medium leading-6 text-gray-900">
            Title
          </label>
          <div class="mt-2">
            <input required v-model="value.title" type="text" :name="`title-${idx}`" :id="`title-${idx}-id`" autocomplete="on" class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-xs ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6" />
          </div>
        </div>

        <div>
          <label for="" class="block text-sm font-medium leading-6 text-gray-900">
            Allowed formats
          </label>
          <div class="mt-2">
            <div class="relative flex flex-wrap gap-x-3">
              <div class="flex h-6 items-center gap-x-2" v-for="(text, val) in formats" :key="val">
                <input :id="`format-${val}-${idx}`" v-model="value.formats" type="checkbox" :name="`allowedFileFormats-${idx}`" class="h-4 w-4 rounded-sm border-gray-300 cursor-pointer text-blue-600 focus:ring-blue-600" :value="val" />
                <label :for="`format-${val}-${idx}`" class="cursor-pointer text-sm font-medium text-gray-900 uppercase">{{ text }}</label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="sm:col-span-3">
        <div>
          <label :for="`file-description-${idx}`" class="block text-sm font-medium leading-6 text-gray-900">Description</label>
          <div class="mt-2">
            <textarea v-model="value.description" :for="`file-description-${idx}`" :name="`file-description-${idx}`" rows="2" class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-xs ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6" placeholder="Specific instructions on what file(s) to upload here" />
          </div>
        </div>
      </div>
    </div>
  </details>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { TrashIcon } from '@heroicons/vue/20/solid'

const open = ref(true)

const formats = {
  pdf: 'pdf', jpeg: 'jpeg', png: 'png', docx: 'docx'
}
type FormatType = keyof typeof formats

const props = defineProps<{
  value: {
    title: string|undefined,
    description: string|undefined,
    formats: Array<FormatType>,
    maxSize: number
  },
  idx: string,
  removeFn: (idx: string) => void
}>()

const confirmAndDelete = () => {
  const name = props.value.title || 'this field'
  const ok = confirm(`Remove ${name}?`)
  if (ok) {
    props.removeFn(props.idx)
  }
}
</script>
