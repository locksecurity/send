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
      <TLogo class="mx-auto h-12 w-auto text-emerald-600" alt="Workflow"></TLogo>
      <h2 class="mt-6 text-center text-3xl font-bold text-gray-900">
        <span v-if="choosingMasterPassword">Choose a Master Password</span>
        <span v-else>Create an account</span>
      </h2>
      <p class="mt-2 text-center text-sm text-gray-600">
        Already have an account?
        {{ ' ' }}
        <router-link to="/login" class="font-medium text-emerald-600 hover:text-emerald-500"> Login instead </router-link>
      </p>
    </div>
<!-- Email, phone, name, nickname -->
    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="py-8 px-4 sm:rounded-lg sm:px-10">
        <form
          v-show="!choosingMasterPassword"
          @submit.prevent="choosingMasterPassword = true"
          class="space-y-6"
          action="#"
          method="POST"
        >
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700">
              Email address
            </label>
            <div class="mt-1">
              <input v-model="email" id="email" name="email" type="email" autocomplete="email" required class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm" />
            </div>
          </div>

          <div>
            <label for="phoneNumber" class="block text-sm font-medium text-gray-700">
              Phone number
            </label>
            <div class="mt-1">
              <input v-model="phoneNumber" id="phoneNumber" name="phoneNumber" required class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm" />
            </div>
          </div>

          <div>
            <label for="fullName" class="block text-sm font-medium text-gray-700">
              Your name
            </label>
            <div class="mt-1" @change.passive="guessNickname">
              <input v-model="name" id="fullName" name="name" required class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm" placeholder="e.g. Jane Bauer" />
            </div>
          </div>

          <div>
            <label for="nickname" class="block text-sm font-medium text-gray-700">
              What should we call you?
            </label>
            <div class="mt-1">
              <input v-model="nickname" id="nickname" name="nickname" required class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm" placeholder="Jane" />
            </div>
          </div>

          <div>
            <button type="submit" class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500">
              Continue
            </button>
          </div>
        </form>

        <form v-show="choosingMasterPassword" class="space-y-8" @submit.prevent="register">
          <div class="w-full flex justify-center">
            <img src="@/assets/secure-server.svg" class="px-12 w-full h-auto" alt="" />
          </div>

          <div class="mt-10">
            <label for="masterPassword" class="block text-sm font-medium text-gray-700">
              Password
            </label>
            <div class="mt-1">
              <input v-model="masterPassword" id="masterPassword" name="masterPassword" type="text" placeholder="Long and memorable" minlength="12" required class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm" />
            </div>
          </div>

          <article class="mt-6 pl-1 text-gray-500 text-sm">
            <p class="font-medium">Your new Master Password should:</p>
            <ul class="mt-1 list-disc list-inside">
              <li>contain at least 12 characters</li>
              <li>be a new, unique and memorable phrase</li>
              <li>only be known to you</li>
            </ul>
          </article>

          <div class="mt-6">
            <button type="submit" class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500">
              Let's get started!
            </button>

            <button
              type="button"
              @click="choosingMasterPassword = false"
              class="block mt-4 w-full text-center text-sm text-emerald-600 font-medium"
            >
              &larr; I missed something
            </button>
          </div>
        </form>

      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import TLogo from '@/components/TLogo.vue';
import * as functions from '@/crypto/functions'
import { useAuthStore } from '@/stores/auth';
import { useVaultsStore } from '@/stores/vaults';
import { useKpkStore } from '@/stores/kpk';

const apiRoot = import.meta.env.VITE_API_URL

export default defineComponent({
    components: { TLogo },

    data() {
      return {
        nicknameGuessed: false,
        choosingMasterPassword: false,

        email: '',
        phoneNumber: '',
        name: '',
        nickname: '',

        masterPassword: '',
      }
    },

    methods: {
      guessNickname(event: Event): void {
        const t = event.target as HTMLInputElement;

        this.name = t.value
        const guess = this.name.split(' ')[0]

        if (!guess || guess.length == 0) {
          return
        }

        this.nickname = t.value.split(' ')[0]
        this.nicknameGuessed = true
      },

      async register() {
        /**
         * @summary remove leading and trailing white spaces from master password
         *  and apply Unicode Normalization (NFKD).
         *
         * This helps us arrive at a consistent from for Unicode characters
         * that could otherwise have different byte-representations
         * (e.g. when they're typed in using different keyboards).
         */
        const normalizedPassword = String(this.masterPassword).trim().normalize('NFKD')

        /**
         * @summary generate a 16-byte (128-bit) salt
         *
         * `Uint32Array`s contain elements which are all 4-byte integers.
         * Here, we're creating an array that'll contain 4 of such elements
         * (per the constructor argument), and filling it up with random values.
         *
         * @todo consider stretching this salt using non-secret user info
         *  (e.g. their email) and an `HKDF` (likely `SubtleCrypto.deriveBits==()`).
         */
        const salt = crypto.getRandomValues(new Uint32Array(4))

        /**
         * @summary convert our plaintext password into a usable `CryptoKey`
         */
        const passwordAsKey = await functions.passwordToCryptoKey(new TextEncoder().encode(normalizedPassword));

        /**
         * @summary derive a Master Key using the Master Password, our 16-byte salt, and `PBKDF2`.
         */
        const iterations = 100000;
        const MK = await functions.deriveMk(passwordAsKey, salt, iterations)

        /**
         * @summary use the generated MK to derive keying
         *  material using (NIST-approved) `HKDF`.
         */
        const keyingMaterial = await functions.deriveKeyFromMk(MK, salt);

        // generate asymmetric DPK-pair
        const dpkPair = await crypto.subtle.generateKey(
          {
            name: "RSA-OAEP",
            modulusLength: 4096, // min 2048. larger values mean more computing power
            publicExponent: new Uint8Array([1, 0, 1]),
            hash: 'SHA-256'
          },
          true,
          ['encrypt', 'decrypt']
        );

        /**
         * @summary use the derived keying material to encrypt the private DPK — we store
         *  the encrypted version of this private DPK.
         */
        const privateDpkIv = crypto.getRandomValues(new Uint32Array(24))

        const encryptedPrivateDpk = await crypto.subtle.encrypt(
          { name: 'AES-GCM', iv: privateDpkIv },
          keyingMaterial,
          await crypto.subtle.exportKey('pkcs8', dpkPair.privateKey)
        );

        // ..........................................................
        // ..........................................................

        const challengeIv = crypto.getRandomValues(new Uint32Array(24))
        const challenge = await crypto.subtle.encrypt(
          { name: 'AES-GCM', iv: challengeIv },
          keyingMaterial,
          (new TextEncoder).encode(`${challengeIv}|${this.email}`)
        );

        // attempt user registration
        let result = await this.registerRequest(salt, iterations, {
          cipher: functions.arrayBufferToText(challenge),
          iv: challengeIv.toString()
        })

        if (!result.ok) {
          console.log('Registration failed ->', result)
          console.log(await result.json())
          return
          // problem
        }
        const uid = <string>(await result.json()).uid
        const authStore = useAuthStore()
        authStore.signIn(uid)

        const publicKey = functions.arrayBufferToText(
          await crypto.subtle.exportKey('spki', dpkPair.publicKey)
        )

        // store customer's private and public keys
        result = await this.storeKeysetRequest(uid, publicKey, {
          iv: privateDpkIv.toString(),
          algo: 'AES-GCM',
          cipher: functions.arrayBufferToText(encryptedPrivateDpk)
        })

        if (!result.ok) {
          // problem
          console.log('StoreKeySet failed ->', result)
          console.log(await result.json())
          return
        }

        // create default vault
        result = await this.createDefaultVault(uid, dpkPair.publicKey)

        if (!result.ok) {
          // problem
          console.log('Creating default vault failed ->', result)
          console.log(await result.json())
          return
        }

        // set us as logged in
        // redirect to dashboard.
        await useKpkStore().pull(keyingMaterial)
        useVaultsStore().pullAll()

        this.$router.push('/')

        // write tests for initial registration & return usage operations.
        // generate a 256-bit AES-GCM vault key
        // encrypt that with our public key and store

        /**
         * Store:
         *  - KDF salt
         *  - encrypted private dpk. including:
         *    - algo used
         *    - IV used
         *    -
         *  - public dpk
         *  - vault key, encrypted with public dpk
         */
      },

      registerRequest(salt: Uint32Array, iterations: Number, challenge: Object): Promise<Response> {

        return fetch(`${apiRoot}/auth/register`, {
          method: 'post',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: this.name,
            nickname: this.nickname,
            email: this.email,
            phoneNumber: this.phoneNumber,
            password: {
              salt: salt.toString(),
              iterations,
              challenge
            }
          })
        })
      },

      storeKeysetRequest(auth: string, publicKey: string, privateKey: object): Promise<Response> {
        return fetch(`${apiRoot}/kpk`, {
          method: 'post',
          headers: {
            Authorization: `Bearer ${auth}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            public: { key: publicKey },
            private: privateKey,
          })
        })
      },

      async createDefaultVault(auth: string, publicKey: CryptoKey): Promise<Response> {
        const params = { name: 'AES-GCM', length: 256 }
        const key = await crypto.subtle.generateKey(params, true, ['encrypt', 'decrypt'])
        const extracted = await crypto.subtle.exportKey('raw', key)

        const encrypted = await crypto.subtle.encrypt(
          { name: 'RSA-OAEP' },
          publicKey,
          extracted
        )

        return fetch(`${apiRoot}/vaults`, {
          method: 'post',
          headers: {
            Authorization: `Bearer ${auth}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: 'Personal',
            key: {
              algo: params.name,
              cipher: functions.arrayBufferToText(encrypted),
            }
          })
        })
      }
    }
});

</script>
/*
 - Get signed up
 	- Get logged in with a token
 	- Store mk-test, salt, iterations
 - Store priv. and public key protection keys
 - Create (default) Personal vault?
 -
 */
