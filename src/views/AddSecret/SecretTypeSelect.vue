<!-- This example requires Tailwind CSS v2.0+ -->
<template>
  <Listbox as="div" v-model="selected">
    <ListboxLabel class="block text-sm font-medium text-gray-700"> Type </ListboxLabel>
    <div class="mt-1 relative">
      <ListboxButton class="relative w-full bg-white border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm">
        <span class="flex items-center">
          <component :is="selected.icon" :class="`flex-shrink-0 h-6 w-6 ${selected.color} `" />
          <span class="ml-3 block truncate">{{ selected.name }}</span>
        </span>
        <span class="ml-3 absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          <SelectorIcon class="h-5 w-5 text-gray-400" aria-hidden="true" />
        </span>
      </ListboxButton>

      <transition leave-active-class="transition ease-in duration-100" leave-from-class="opacity-100" leave-to-class="opacity-0">
        <ListboxOptions class="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-56 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
          <ListboxOption as="template" v-for="person in secretTypes" :key="person.id" :value="person" v-slot="{ active, selected }">
            <li :class="[active ? 'bg-gray-200' : 'text-gray-900', 'cursor-default select-none relative py-2 pl-3 pr-9']">
              <div class="flex items-center">
                <component :is="person.icon" :class="`flex-shrink-0 h-6 w-6 ${person.color} `" />
                <span :class="[selected ? 'font-semibold' : 'font-normal', 'ml-3 block truncate']">
                  {{ person.name }}
                </span>
              </div>

              <span v-if="selected" :class="[active ? 'text-emerald-600' : 'text-emerald-600', 'absolute inset-y-0 right-0 flex items-center pr-4']">
                <CheckIcon class="h-5 w-5" aria-hidden="true" />
              </span>
            </li>
          </ListboxOption>
        </ListboxOptions>
      </transition>
    </div>
  </Listbox>
</template>

<script lang="ts" setup>
import { ref, watch, defineEmits } from 'vue'
import { Listbox, ListboxButton, ListboxLabel, ListboxOption, ListboxOptions } from '@headlessui/vue'
import { CheckIcon, CreditCardIcon, SelectorIcon, } from '@heroicons/vue/solid'
import { KeyIcon } from '@heroicons/vue/outline'

const emit = defineEmits(['updated'])

const secretTypes = [
  {
    id: 1,
    name: 'Password',
    value: 'password',
    icon: KeyIcon,
    color: 'text-amber-500'
  },
  {
    id: 2,
    name: 'Payment Card',
    value: 'payment-card',
    icon: CreditCardIcon,
    color: 'text-blue-400'
  },
]

const selected = ref(secretTypes[0])

watch(selected, async (newOption, old) => {
  emit('updated', newOption.value)
})
</script>
