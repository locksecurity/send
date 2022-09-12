<template>
  <div class="min-h-screen relative bg-gray-50 pb-20">
    <!-- When the mobile menu is open, add `overflow-hidden` to the `body` element to prevent double scrollbars -->
    <Disclosure as="nav" class="bg-gray-800" v-slot="{ open }">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center">
            <router-link to="/" class="flex-shrink-0">
              <TLogo class="block lg:hidden h-8 w-auto text-blue-500" alt="Locksend" />
              <TLogo class="hidden lg:block h-8 w-auto text-blue-500" alt="Locksend" />
            </router-link>
            <div class="hidden sm:block sm:ml-6">
              <div class="flex space-x-4">
                <!-- Current: "bg-gray-900 text-white", Default: "text-gray-300 hover:bg-gray-700 hover:text-white" -->
                <router-link
                  v-for="nav, k in navigation"
                  :key="k"
                  :to="nav.href"
                  active-class="bg-gray-900 text-white"
                  class="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                >
                  {{ nav.name }}
                </router-link>
              </div>
            </div>
          </div>
          <div class="hidden sm:ml-6 sm:block">
            <div class="flex items-center">
              <button type="button" class="hidden bg-gray-800 p-1 rounded-full text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white">
                <span class="sr-only">View notifications</span>
                <BellIcon class="h-6 w-6" aria-hidden="true" />
              </button>

              <!-- Profile dropdown -->
              <Menu as="div" class="ml-3 relative z-10">
                <div class="flex items-center">
                  <span class="max-w-20 mr-4 text-truncate text-sm text-white">
                    {{ user?.displayName || '' }}
                  </span>

                  <MenuButton class="bg-gray-800 flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white">
                    <span class="sr-only">Open user menu</span>
                    <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-indigo-800">
                      <span className="font-semibold leading-none text-white">
                        {{ user?.displayName?.charAt(0).toUpperCase() || '..' }}
                      </span>
                    </span>
                  </MenuButton>
                </div>
                <transition enter-active-class="transition ease-out duration-100" enter-from-class="transform opacity-0 scale-95" enter-to-class="transform opacity-100 scale-100" leave-active-class="transition ease-in duration-75" leave-from-class="transform opacity-100 scale-100" leave-to-class="transform opacity-0 scale-95">
                  <MenuItems class="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <MenuItem v-slot="{ active }">
                      <router-link to="/settings" :class="[active ? 'bg-gray-100' : '', 'block px-4 py-2 text-sm text-gray-700']">Settings</router-link>
                    </MenuItem>
                    <MenuItem v-slot="{ active }">
                      <a href="#" :class="[active ? 'bg-gray-100' : '', 'block px-4 py-2 text-sm text-gray-700']" @click.prevent="signOut">Sign out</a>
                    </MenuItem>
                  </MenuItems>
                </transition>
              </Menu>
            </div>
          </div>
          <div class="-mr-2 flex sm:hidden">
            <!-- Mobile menu button -->
            <DisclosureButton class="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
              <span class="sr-only">Open main menu</span>
              <MenuIcon v-if="!open" class="block h-6 w-6" aria-hidden="true" />
              <XIcon v-else class="block h-6 w-6" aria-hidden="true" />
            </DisclosureButton>
          </div>
        </div>
      </div>

      <DisclosurePanel class="sm:hidden">
        <div class="px-2 pt-2 pb-3 space-y-1">
          <!-- Current: "bg-gray-900 text-white", Default: "text-gray-300 hover:bg-gray-700 hover:text-white" -->
          <DisclosureButton
            v-for="nav, k in navigation"
            :as="RouterLink"
            :key="k"
            :to="nav.href"
            active-class="bg-gray-900 text-white"
            class="text-gray-300 hover:bg-gray-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
          >
            {{ nav.name }}
          </DisclosureButton>
        </div>
        <div class="pt-4 pb-3 border-t border-gray-700">
          <div class="flex items-center px-5">
            <div class="flex-shrink-0">
              <span class="inline-block h-10 w-10 rounded-full overflow-hidden bg-gray-100">
                <svg class="h-full w-full text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </span>
            </div>
            <div class="ml-3">
              <div class="text-base font-medium text-white">{{ user ? user.displayName : '' }}</div>
              <div class="text-sm font-medium text-gray-400">{{ user ? user.email : '' }}</div>
            </div>
            <button type="button" class="hidden ml-auto flex-shrink-0 bg-gray-800 p-1 rounded-full text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white">
              <span class="sr-only">View notifications</span>
              <BellIcon class="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
          <div class="mt-3 px-2 space-y-1">
            <DisclosureButton as="a" href="#" class="block px-3 py-2 rounded-md text-base font-medium text-gray-400 hover:text-white hover:bg-gray-700">Settings</DisclosureButton>
            <DisclosureButton
              as="a"
              href="#"
              class="block px-3 py-2 rounded-md text-base font-medium text-gray-400 hover:text-white hover:bg-gray-700"
              @click.prevent="signOut"
            >Sign out</DisclosureButton>
          </div>
        </div>
      </DisclosurePanel>
    </Disclosure>

    <slot/>

    <nav class="hidden fixed bottom-0 left-0 block w-full bg-white p-4 shadow-md shadow-black md:hidden">
      <div class="w-full text-center text-xl">Bottom menu here</div>
    </nav>
  </div>

  <live-notification-region/>
</template>

<script lang="ts" setup>
import { RouterLink } from 'vue-router'
import { Disclosure, DisclosureButton, DisclosurePanel, Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/vue'
import { BellIcon, MenuIcon, XIcon } from '@heroicons/vue/outline'
import TLogo from '@/components/TLogo.vue'
import LiveNotificationRegion from '@/components/Notifications/LiveRegion.vue'
import { useAuthStore } from '../stores/auth'
import { auth } from '@/auth/firebase'

const navigation = [
  { name: 'upload', href: '/', },
  { name: 'settings', href: '/settings' },
]
const userNavigation = [
  { name: 'Your Profile', href: '#' },
  { name: 'Settings', href: '#' },
  { name: 'Sign out', href: '#' },
]

const user = useAuthStore().user

const signOut = async () => {
  auth.signOut()
  window.location = '/login' as string & Location
}

</script>
