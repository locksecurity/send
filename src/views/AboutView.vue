<template>

  <section class="about">
    <form @submit.prevent="draft">
      <fieldset>
        <div>
          <label for="password" class="block text-base font-medium text-gray-400">Password</label>
          <div class="mt-1">
            <input v-model="pass" type="text" name="password" id="password" class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md">
          </div>
        </div>
      </fieldset>
    </form>
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import * as functions from '@/crypto/functions'

export default defineComponent({

  data() {
    return {
      pass: null,
    }
  },

  methods: {
    async draft() {
      const masterPassword = this.pass;

      /**
       * @summary remove leading and trailing white spaces from master password
       *  and apply Unicode Normalization (NFKD).
       *
       * This helps us arrive at a consistent from for Unicode characters
       * that could otherwise have different byte-representations
       * (e.g. when they're typed in using different keyboards).
       */
      const normalizedPassword = String(masterPassword).trim().normalize('NFKD')

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
      const MK = await functions.deriveMk(passwordAsKey, salt, 100000)

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

      // encrypt sample string.
      const clearText = 'Some login <? //: ^='
      const cipherText = await crypto.subtle.encrypt(
        {name: 'RSA-OAEP'},
        dpkPair.publicKey,
        (new TextEncoder()).encode(clearText)
      );

      // convert encrypted private key to string for storage
      const encDpkText = this.arrayBufferToText(encryptedPrivateDpk);

      // decrypt stored private key from stored text
      const decKey = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: privateDpkIv },
        keyingMaterial,
        this.textToArrayBuffer(encDpkText)
      );
      const impDecKey = await crypto.subtle.importKey('pkcs8', decKey, {name: 'RSA-OAEP', hash: 'SHA-256'}, false, ['decrypt'])

      // try decrypting text using decrypted, stored private key
      console.log((new TextDecoder).decode(
        await crypto.subtle.decrypt(
          {name: 'RSA-OAEP'},
          impDecKey,
          cipherText
        )
      ))


      // write tests for initial registration & return usage operations.
      // generate a 256-bit AES-GCM vault key
      // encrypt that with our public key and store

      // maybe store/transmit keys in JWK format. Maybe not.

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

    //////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////

    arrayBufferToText(encKey: ArrayBuffer): string {
      return btoa(
        <string>(
          <unknown>(new Int8Array(encKey))
        )
      );
    },

    textToArrayBuffer(text: string): ArrayBuffer {
      const stream = atob(text).split(',');

      return Int8Array.from(
        <Array<number>>(<unknown>(stream))
      )
    }
  }
})
</script>

<style>
@media (min-width: 1024px) {
  .about {
    min-height: 100vh;
    display: flex;
    align-items: center;
  }
}
</style>
