<!-- This example requires Tailwind CSS v2.0+ -->
<template>
  <main class="p-4">
    <h2 class="text-xl text-gray-700 font-semibold">Add a new secret</h2>

    <form @submit.prevent="storeSecret" class="mt-8">
      <fieldset class="space-y-6">
        <secret-type-select @updated="value => secretType = value" />

        <!-- vault -->
        <div>
          <label for="website" class="block text-sm font-medium text-gray-700">Website</label>
          <div class="mt-1 flex rounded-md shadow-sm">
            <span class="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm"> https:// </span>
            <input type="text" name="website" @change="guessTitle" id="website" class="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm border-gray-300" placeholder="example.com" />
          </div>
        </div>

        <div>
          <label for="username" class="block text-sm font-medium text-gray-700">Username</label>
          <div class="mt-1">
            <input type="text" name="username" v-model="username" id="username" class="shadow-sm focus:ring-emerald-500 focus:border-emerald-500 block w-full sm:text-sm border-gray-300 rounded-md" />
          </div>
        </div>

        <div>
          <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
          <div class="mt-1 flex rounded-md shadow-sm">
            <div class="relative flex items-stretch flex-grow focus-within:z-10">
              <input type="text" name="password" v-model="password" id="password" class="focus:ring-emerald-500 focus:border-emerald-500 block w-full rounded-none rounded-l-md sm:text-sm border-gray-300" />
            </div>
            <button @click="password = randomPassword()" type="button" class="-ml-px relative inline-flex items-center space-x-2 px-4 py-2 border border-gray-300 text-sm font-medium rounded-r-md text-gray-700 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500">

              <span>Generate</span>
            </button>
          </div>
        </div>

        <div>
          <label for="title" class="block text-sm font-medium text-gray-700">Title</label>
          <div class="mt-1">
            <input type="text" name="title" v-model="title" id="title" class="shadow-sm focus:ring-emerald-500 focus:border-emerald-500 block w-full sm:text-sm border-gray-300 rounded-md" />
          </div>
        </div>

        <div v-if="vaults">
          <label for="vault" class="block text-sm font-medium text-gray-700">Vault</label>
          <select id="vault" name="vault" v-model="vault" class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm rounded-md">
            <option
              v-for="v in vaults" :key="v.id"
              :value="v.id"
            >
              {{ v.name }}
            </option>
          </select>
        </div>

      </fieldset>

      <button type="submit" class="mt-8 block w-full text-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500">Save</button>
    </form>
  </main>
</template>

<script lang="ts">
import { useVaultsStore } from '@/stores/vaults'
import { defineComponent } from 'vue'
import SecretTypeSelect from './SecretTypeSelect.vue'
import type { Vault, Password } from '@/stores/vaults'

export default defineComponent({
  components: { SecretTypeSelect },

  data() {
    return {
      secretType: <null|string> null,
      vaults: <Record<string, Vault>|null> null,

      title: '',
      website: '',
      username: '',
      password: '',
      vault: <string|null> null,
    }
  },

  created() {
    this.vaults = useVaultsStore().vaults
    this.vault = Object.keys(this.vaults)[0]
  },

  methods: {
    guessTitle(event: Event): void {
      const t = event.target as HTMLInputElement;

      if (!t.value || t.value.length == 0) {
        return
      }

      this.website = 'https://' + t.value
      const { host } = new URL(this.website)
      const parts = host.split('.')
      const title = parts[parts.length - 2]

      this.title = title.charAt(0).toUpperCase() + title.slice(1)
    },

    randomPassword(length = 20, wishlist = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz~!@-#$') {
      return Array.from(crypto.getRandomValues(new Uint32Array(length)))
        .map((x) => wishlist[x % wishlist.length])
        .join('')
    },

    async storeSecret(): Promise<void> {
      const secret = <Password>{
        title: this.title,
        website: this.website,
        username: this.username,
        password: this.password,
      }

      const vaults = useVaultsStore()
      const added = await vaults.addSecret(secret, <string>this.vault)

      if (added) this.$router.push('/')
    }
  }
})
</script>
