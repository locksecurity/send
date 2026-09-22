<template>
  <div class="relative min-h-screen bg-gray-50 pb-20">
    <!-- When the mobile menu is open, add `overflow-hidden` to the `body` element to prevent double scrollbars -->
    <Disclosure as="nav" class="bg-gray-800" v-slot="{ open }">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="flex h-16 items-center justify-between">
          <div class="flex items-center">
            <router-link to="/" class="shrink-0">
              <TLogo class="block h-8 w-auto text-blue-500 lg:hidden" alt="Send" />
              <TLogo class="hidden h-8 w-auto text-blue-500 lg:block" alt="Send" />
            </router-link>
            <div class="hidden sm:ml-6 sm:block">
              <div class="flex space-x-4">
                <!-- Current: "bg-gray-900 text-white", Default: "text-gray-300 hover:bg-gray-700 hover:text-white" -->
                <router-link
                  v-for="(nav, k) in navigation"
                  :key="k"
                  :to="nav.href"
                  active-class="bg-gray-900 text-white"
                  class="rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
                >
                  {{ nav.name }}
                </router-link>
              </div>
            </div>
          </div>
          <div class="hidden sm:ml-6 sm:block">
            <div class="flex items-center">
              <button
                type="button"
                class="hidden rounded-full bg-gray-800 p-1 text-gray-400 hover:text-white focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800 focus:outline-hidden"
              >
                <span class="sr-only">View notifications</span>
                <BellIcon class="h-6 w-6" aria-hidden="true" />
              </button>

              <!-- Profile dropdown -->
              <Menu as="div" class="relative z-10 ml-3">
                <div class="flex items-center">
                  <span class="text-truncate mr-4 max-w-20 text-sm text-white">
                    {{ user?.displayName || '' }}
                  </span>

                  <MenuButton
                    class="flex rounded-full bg-gray-800 text-sm focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800 focus:outline-hidden"
                  >
                    <span class="sr-only">Open user menu</span>
                    <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-indigo-800">
                      <span className="font-semibold leading-none text-white">
                        {{ user?.displayName?.charAt(0).toUpperCase() || '..' }}
                      </span>
                    </span>
                  </MenuButton>
                </div>
                <transition
                  enter-active-class="transition ease-out duration-100"
                  enter-from-class="transform opacity-0 scale-95"
                  enter-to-class="transform opacity-100 scale-100"
                  leave-active-class="transition ease-in duration-75"
                  leave-from-class="transform opacity-100 scale-100"
                  leave-to-class="transform opacity-0 scale-95"
                >
                  <MenuItems
                    class="ring-opacity-5 absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white py-1 ring-1 shadow-lg ring-black focus:outline-hidden"
                  >
                    <!-- <MenuItem v-slot="{ active }">
                      <router-link to="/settings" :class="[active ? 'bg-gray-100' : '', 'block px-4 py-2 text-sm text-gray-700']">Settings</router-link>
                    </MenuItem> -->
                    <MenuItem v-slot="{ active }">
                      <a
                        href="#"
                        :class="[active ? 'bg-gray-100' : '', 'block px-4 py-2 text-sm text-gray-700']"
                        @click.prevent="signOut"
                        >Sign out</a
                      >
                    </MenuItem>
                  </MenuItems>
                </transition>
              </Menu>
            </div>
          </div>
          <div class="-mr-2 flex sm:hidden">
            <!-- Mobile menu button -->
            <DisclosureButton
              class="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:ring-2 focus:ring-white focus:outline-hidden focus:ring-inset"
            >
              <span class="sr-only">Open main menu</span>
              <Bars3Icon v-if="!open" class="block h-6 w-6" aria-hidden="true" />
              <XMarkIcon v-else class="block h-6 w-6" aria-hidden="true" />
            </DisclosureButton>
          </div>
        </div>
      </div>

      <DisclosurePanel class="sm:hidden">
        <div class="space-y-1 px-2 pt-2 pb-3">
          <!-- Current: "bg-gray-900 text-white", Default: "text-gray-300 hover:bg-gray-700 hover:text-white" -->
          <DisclosureButton
            v-for="(nav, k) in navigation"
            :as="RouterLink"
            :key="k"
            :to="nav.href"
            active-class="bg-gray-900 text-white"
            class="block rounded-md px-3 py-2 text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
          >
            {{ nav.name }}
          </DisclosureButton>
        </div>
        <div class="border-t border-gray-700 pt-4 pb-3">
          <div class="flex items-center px-5">
            <div class="shrink-0">
              <span class="inline-block h-10 w-10 overflow-hidden rounded-full bg-gray-100">
                <svg class="h-full w-full text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              </span>
            </div>
            <div class="ml-3">
              <div class="text-base font-medium text-white">{{ user ? user.displayName : '' }}</div>
              <div class="text-sm font-medium text-gray-400">{{ user ? user.email : '' }}</div>
            </div>
            <button
              type="button"
              class="ml-auto hidden shrink-0 rounded-full bg-gray-800 p-1 text-gray-400 hover:text-white focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800 focus:outline-hidden"
            >
              <span class="sr-only">View notifications</span>
              <BellIcon class="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
          <div class="mt-3 space-y-1 px-2">
            <DisclosureButton
              as="a"
              href="#"
              class="block rounded-md px-3 py-2 text-base font-medium text-gray-400 hover:bg-gray-700 hover:text-white"
              >Settings</DisclosureButton
            >
            <DisclosureButton
              as="a"
              href="#"
              class="block rounded-md px-3 py-2 text-base font-medium text-gray-400 hover:bg-gray-700 hover:text-white"
              @click.prevent="signOut"
              >Sign out</DisclosureButton
            >
          </div>
        </div>
      </DisclosurePanel>
    </Disclosure>

    <slot />

    <nav class="fixed bottom-0 left-0 block hidden w-full bg-white p-4 shadow-md shadow-black md:hidden">
      <div class="w-full text-center text-xl">Bottom menu here</div>
    </nav>
  </div>

  <live-notification-region />
</template>

<script lang="ts" setup>
import { Disclosure, DisclosureButton, DisclosurePanel, Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/vue'
import { BellIcon, Bars3Icon, XMarkIcon } from '@heroicons/vue/24/outline'
import { RouterLink } from 'vue-router'

import { auth } from '@/auth/firebase'
import LiveNotificationRegion from '@/components/Notifications/LiveRegion.vue'
import TLogo from '@/components/TLogo.vue'

import { useAuthStore } from '../stores/auth'

const navigation = [
  { name: 'dashboard', href: '/' },
  { name: 'send', href: '/send' }
]
const userNavigation = [
  { name: 'Your Profile', href: '#' },
  { name: 'Settings', href: '#' },
  { name: 'Sign out', href: '#' }
]

const user = useAuthStore().user

const signOut = async () => {
  auth.signOut()
  window.location = '/login' as string & Location
}
</script>
