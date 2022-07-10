import { defineStore } from 'pinia'
import * as funcs from '@/crypto/functions'
import { useAuthStore } from './auth'

const apiRoot = import.meta.env.VITE_API_URL

/**
 * Key Protection Keys store.
 */
export const useKpkStore = defineStore('kpk', {
  state: () => ({
    privateKey: <CryptoKey|null> null,
    publicKey: <CryptoKey|null> null,
  }),

  actions: {
    /**
     * Pull this customer's key-protection keys.
     *
     * @param {CryptoKey} km "Keying material" used to decrypt the private RSA key.
     *
     * @returns {Promise<void>}
     */
    async pull(km: CryptoKey): Promise<void> {
      const { token } = useAuthStore()

      const response = await fetch(`${apiRoot}/kpk`, {
        headers: { Authorization: `Bearer ${token}`, }
      })

      if (!response.ok) {
        console.log('failed to pull kpks', response)
        return
      }

      const pair = await response.json()
      await this.importPublicKey(pair.public.key)
      await this.importPrivateKey(pair.private.cipher, km, pair.private.iv)
    },

    async importPublicKey(source: string): Promise<void> {
      this.$patch({
        publicKey: await funcs.importPublicKey(
          funcs.textToArrayBuffer(source)
        )
      })
    },

    async importPrivateKey(source: string, key: CryptoKey, iv: string): Promise<void> {
      this.$patch({
        privateKey: await funcs.importPrivateKey(
          funcs.textToArrayBuffer(source),
          key,
          Uint32Array.from(funcs.toNumberArray(iv))
        ),
      })
    }
  }
})
