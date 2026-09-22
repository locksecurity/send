<!--
  This example requires some changes to your config:

  ```
  // tailwind.config.js
  module.exports = {
    // ...
    plugins: [
      // ...
      require('@tailwindcss/forms'),
    ],
  }
  ```
-->
<template>
  <form method="post" @submit.prevent="saveTemplate" class="mx-auto max-w-3xl sm:px-6 lg:px-8">
    <div class="mt-12">
      <div class="space-y-12">
        <div class="border-b border-gray-900/10 pb-10">
          <h2 class="text-lg font-semibold leading-7 text-gray-900">
            Create a new Template
          </h2>
          <p class="mt-1 text-sm leading-6 text-gray-600">This information will be displayed publicly so be careful what you share.</p>

          <div class="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            <div class="sm:col-span-4">
              <label for="template-name" class="block text-sm font-medium leading-6 text-gray-900">Name</label>
              <div class="mt-2">
                <div class="flex rounded-md shadow-xs ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-600 sm:max-w-md">
                  <span class="hidden flex select-none items-center pl-3 text-gray-500 sm:text-sm">locksend.app/</span>
                  <input required v-model="name" type="text" name="name" id="template-name" class="block flex-1 border-0 bg-transparent py-1.5 pl-3 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6" placeholder="Onboarding Documents" />
                </div>
              </div>
            </div>

            <div class="col-span-full">
              <label for="template-description" class="block text-sm font-medium leading-6 text-gray-900">Description</label>
              <div class="mt-2">
                <textarea v-model="description" id="template-description" name="about" rows="2" class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-xs ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6" />
              </div>
              <p class="mt-3 text-sm leading-6 text-gray-600">A brief description of the what/why of this sleeve.</p>
            </div>

          </div>
        </div>

        <div class="mt-10! border-b border-gray-900/10 pb-12">
          <h2 class="text-base font-semibold leading-7 text-gray-900">File definitions</h2>
          <p class="mt-1 text-sm leading-6 text-gray-600">Set up the files that each sleeve will contain.</p>

          <div class="mt-6">
            <file-definition
              v-for="(value, idx) in fields"
              :key="idx"
              :value="value"
              :idx="idx"
              :removeFn="removeFieldDef"
            />
          </div>

          <div class="mt-12">
            <button type="button" @click="addFieldDefinition" class="w-full rounded-md bg-blue-50 px-2.5 py-1.5 text-sm font-semibold text-blue-600 shadow- border border-blue-400 hover:bg-blue-100">&plus; Add another file</button>
          </div>

          <div class="hidden mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">

            <div class="mt-36! sm:col-span-4">
              <label for="email" class="block text-sm font-medium leading-6 text-gray-900">Email address</label>
              <div class="mt-2">
                <input id="email" name="email" type="email" autocomplete="email" class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-xs ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6" />
              </div>
            </div>

            <div class="sm:col-span-3">
              <label for="country" class="block text-sm font-medium leading-6 text-gray-900">Country</label>
              <div class="mt-2">
                <select id="country" name="country" autocomplete="country-name" class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-xs ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:max-w-xs sm:text-sm sm:leading-6">
                  <option>United States</option>
                  <option>Canada</option>
                  <option>Mexico</option>
                </select>
              </div>
            </div>

            <div class="col-span-full">
              <label for="street-address" class="block text-sm font-medium leading-6 text-gray-900">Street address</label>
              <div class="mt-2">
                <input type="text" name="street-address" id="street-address" autocomplete="street-address" class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-xs ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6" />
              </div>
            </div>

            <div class="sm:col-span-2 sm:col-start-1">
              <label for="city" class="block text-sm font-medium leading-6 text-gray-900">City</label>
              <div class="mt-2">
                <input type="text" name="city" id="city" autocomplete="address-level2" class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-xs ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6" />
              </div>
            </div>

            <div class="sm:col-span-2">
              <label for="region" class="block text-sm font-medium leading-6 text-gray-900">State / Province</label>
              <div class="mt-2">
                <input type="text" name="region" id="region" autocomplete="address-level1" class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-xs ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6" />
              </div>
            </div>

            <div class="sm:col-span-2">
              <label for="postal-code" class="block text-sm font-medium leading-6 text-gray-900">ZIP / Postal code</label>
              <div class="mt-2">
                <input type="text" name="postal-code" id="postal-code" autocomplete="postal-code" class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-xs ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-6 flex items-center justify-end gap-x-6">
        <button type="button" class="text-sm font-semibold leading-6 text-gray-900">Cancel</button>
        <loadable-button :loading="submitting" type="submit" class="rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">Save</loadable-button>
      </div>
    </div>
  </form>
</template>

<script lang="ts">
import { PhotoIcon, UserCircleIcon } from '@heroicons/vue/24/solid'
import { defineComponent } from 'vue'
import FileDefinition from './FileDefinition.vue'
import { api } from '@/api'
import LoadableButton from '@/components/LoadableButton.vue'
import notifications from '@/notifications'

export default defineComponent({
  components: { FileDefinition, LoadableButton },

  data: () => ({
    nextField: 0,
    fields: <Record<string, {}>>{},

    name: '',
    description: '',

    submitting: false,
  }),

  created() {
    this.addFieldDefinition()
  },

  methods: {
    addFieldDefinition() {
      const id = `id` + String(this.nextField++)
      this.fields[id] = {
        formats: ['pdf'],
        maxSize: 100 * 1048576 // 100MiB
      }
    },

    removeFieldDef(idx: string) {
      if (!this.fields[idx]) {
        return
      }

      delete this.fields[idx]
    },

    async saveTemplate() {
      this.submitting = true

      const result = await api.post(`/templates`, {
        body: JSON.stringify({
          name: this.name,
          description: this.description,
          fields: this.fields,
        })
      }).catch(() => null)

      this.submitting = false

      if (result?.ok) {
        notifications().success('Done!', 'Template created successfully.')

        return this.$router.push('/')
      }

      notifications().warning(
        'We couldn\'t save your template.',
        'Please try again in a minute.'
      )
    }
  }
})
</script>
