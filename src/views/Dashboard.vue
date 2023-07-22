<template>
  <div class="mx-auto max-w-7xl sm:px-6 lg:px-8">
    <!-- Content goes here -->
    <main class="py-10 lg:pt-16">
      <div v-if="!list.length" class="text-center px-2">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path vector-effect="non-scaling-stroke" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
        </svg>
        <h3 class="mt-2 text-sm font-semibold text-gray-900">No submissions</h3>
        <p class="mt-1 text-sm text-gray-500">Get started by creating a new sleeve template.</p>
        <div class="mt-6">
          <router-link to="/templates/new" type="button" class="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">
            <PlusIcon class="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
            New Template
          </router-link>
        </div>
      </div>

      <section v-else>
        <header class="px-2 flex items-center justify-between">
          <h2 class="text-gray-800 text-lg font-medium">Your jacket templates</h2>
          <router-link to="/templates/new" class="text-sm text-blue-600 font-medium">&plus; New Template</router-link>
        </header>
        <ul role="list" class="mt-6 bg-white px-4 divide-y divide-gray-100">
          <li v-for="item in list" :key="item.id" class="relative flex justify-between py-5">
            <div class="flex gap-x-4 pr-6 sm:w-1/2 sm:flex-none">
              <img class="hidden h-12 w-12 flex-none rounded-full bg-gray-50" :src="item.imageUrl" alt="" />
              <div class="min-w-0 flex-auto">
                <p class="text-sm font-semibold leading-6 text-gray-900">
                  <router-link :to="`/templates/${item.id}`">
                    <span class="absolute inset-x-0 -top-px bottom-0" />
                    {{ item.name }}
                  </router-link>
                </p>
                <p class="mt-1 flex text-xs leading-5 text-gray-500">
                  <span>{{ Object.keys(item.fields).length }} fields</span>
                  <span class="px-1 font-semibold">&middot;</span>
                  <a href="#" class="relative truncate">{{ item.description }}</a>
                </p>
              </div>
            </div>
            <div class="flex items-center justify-between gap-x-4 sm:w-1/2 sm:flex-none">
              <div class="hidden sm:block">
                <p class="text-sm leading-6 text-gray-900">No responses yet</p>
                <p class="mt-1 text-xs leading-5 text-gray-500">
                  Created <time :datetime="item.createdAt">{{ item.createdAt }}</time>
                </p>
              </div>
              <ChevronRightIcon class="h-5 w-5 flex-none text-gray-400" aria-hidden="true" />
            </div>
          </li>
        </ul>
      </section>
    </main>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { api } from '@/api';
import { PlusIcon, ChevronRightIcon } from '@heroicons/vue/20/solid'

const list = ref([])

async function created () {
  const result = await api.get('/templates').catch(() => null)
  if (result?.ok) {
    list.value = await result.json()
  }
}
created()

/**
 * name
 * description/internal label
 * date created
 * number of submissions <1 NEW!>
 * -- number of fields
 */

</script>
