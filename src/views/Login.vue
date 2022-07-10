<template>
  <!--
    This example requires updating your template:

    ```
    <html class="h-full bg-gray-50">
    <body class="h-full">
    ```
  -->
  <div class="min-h-full flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <TLogo class="mx-auto h-12 w-auto text-emerald-600" alt="locktor"></TLogo>
      <h2 class="mt-6 text-center text-2xl font-bold text-gray-900">
        Log in to your account
      </h2>
      <p class="mt-2 text-center text-sm text-gray-600">
        Or
        {{ ' ' }}
        <router-link to="/register" class="font-medium text-emerald-600 hover:text-emerald-500"> start your 14-day free trial </router-link>
      </p>
    </div>

<!-- Email, phone, name, nickname -->
    <div class="mt-12 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="px-4 sm:rounded-lg sm:px-10">
        <form class="space-y-6" @submit.prevent="trySignIn" method="POST" action="#">
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700">
              Email address
            </label>
            <div class="mt-1">
              <input v-model="email" id="email" name="email" type="email" autocomplete="email" required class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm" />
            </div>
          </div>

          <div>
            <label for="masterPassword" class="block text-sm font-medium text-gray-700">
              Master Password
            </label>
            <div class="mt-1">
              <input
                v-model="masterPassword"
                type="password"
                id="masterPassword"
                name="masterPassword"
                required
                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
              />
            </div>
          </div>

          <div>
            <button type="submit" class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500">
              Log In
            </button>
          </div>
        </form>

      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useAuthStore } from '@/stores/auth';
import TLogo from '../components/TLogo.vue';
import * as functions from '@/crypto/functions'
import { useKpkStore } from '@/stores/kpk';
import { useVaultsStore } from '@/stores/vaults';

interface PasswordInfo {
  salt: string,
  iterations: number,
  challenge: {
    iv: string,
  }
}
const apiRoot = import.meta.env.VITE_API_URL

export default defineComponent({
    components: { TLogo },
    data() {
      return {
        email: '',
        masterPassword: '',
      }
    },

    methods: {

      async trySignIn(): Promise<void> {

        /** @summary faux account verification here, should be upserted by  */
        const login = await fetch(`${apiRoot}/auth/login`, {
          method: 'post',
          body: JSON.stringify({ email: this.email }),
          headers: { 'Content-Type': 'application/json' },
        })

        if (!login.ok) {
          console.log('Login failed', login)
          return
        }

        const store = useAuthStore()
        store.signIn((await login.json()).token)

        const getMp = await fetch(`${apiRoot}/master-passwords/me`, {
          headers: { Authorization: `Bearer ${store.token}` },
        })

        if (!getMp.ok) {
          console.log('retrieving mp failed', getMp)
          return
        }

        const passInfo = <PasswordInfo>(await getMp.json())
        const km = await this.deriveKeyingMaterial(this.masterPassword, passInfo)

        const verified = await this.verifyChallenge(
          km,
          Uint32Array.from(functions.toNumberArray(passInfo.challenge.iv)),
          this.email
        )

        if (!verified) {
          console.log('challenge verification failed', verified)
          return
        }

        await useKpkStore().pull(km)
        await useVaultsStore().pullAll()

        this.$router.push('/')
      },

      /**
       *
       * @param {CryptoKey} key
       * @param {Uint32Array} iv
       * @param {string} email
       */
      async verifyChallenge(key: CryptoKey, iv: Uint32Array, email: string): Promise<boolean> {
        const challenge = functions.arrayBufferToText(
          await crypto.subtle.encrypt(
            { name: 'AES-GCM', iv },
            key,
            (new TextEncoder).encode(`${iv}|${email}`)
          )
        )

        const { token } = useAuthStore()

        const check = await fetch(`${apiRoot}/auth/challenge`, {
          method: 'post',
          body: JSON.stringify({ challenge }),
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        })

        return check.ok
      },

      /**
       * Derive keying material using password info.
       *
       * @param {string} password
       * @param {PasswordInfo} info
       *
       * @returns {Promise<CryptoKey>}
       */
      async deriveKeyingMaterial(password: string, info: PasswordInfo): Promise<CryptoKey> {
        const normalizedPassword = String(password).trim().normalize('NFKD')
        const passwordAsKey = await functions.passwordToCryptoKey(new TextEncoder().encode(normalizedPassword))

        const salt = Uint32Array.from(functions.toNumberArray(info.salt))
        const MK = await functions.deriveMk(passwordAsKey, salt, info.iterations)

        return await functions.deriveKeyFromMk(MK, salt)
      }
    }
})

</script>
