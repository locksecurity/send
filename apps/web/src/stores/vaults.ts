import { defineStore } from 'pinia'
import { useAuthStore } from './auth'
import { useKpkStore } from './kpk'
import * as funcs from '@/crypto/functions'

const apiRoot = import.meta.env.VITE_API_URL

interface BaseVault {
  id: string,
  ownerId: string,
  name: string,
}

interface RemoteVault extends BaseVault {
  key: {
    cipher: string,
    algo: string,
  },
  items: Record<string, {
    content: string,
    iv: string
  }>
}

export interface Vault extends BaseVault {
  key: CryptoKey,
  items: Record<string, SecretType>
}

export type SecretType = Password

export interface Password {
  type: 'password',
  username: string,
  password: string,
  website: string,
  title: string,
}

export interface PaymentCard {
  expiryMonth: string,
  expiryYear: number,
  cvv: string,
  title: string,
}


export const useVaultsStore = defineStore({
  id: 'vaults',

  state: () => ({
    vaults: <Record<string, Vault>> {},
  }),

  getters: {
    doubleCount: (state) => 2,
    authToken: () => useAuthStore().token
  },
  actions: {
    /**
     * Pulls all of the current customer's vaults.
     */
    async pullAll() {
      const result = await fetch(`${apiRoot}/vaults`, {
        headers: { Authorization: `Bearer ${this.authToken}` },
      })

      if (!result.ok) /* problem */ return

      const vaults: Array<RemoteVault> = await result.json()
      const { privateKey } = useKpkStore()

      vaults.forEach(async (vault) => {
        const localVault = <Vault>{
          id: vault.id,
          name: vault.name,
          ownerId: vault.ownerId,
          items: {}
        }

        // decrypt vault key
        const clear = await crypto.subtle.decrypt(
          { name: 'RSA-OAEP' },
          <CryptoKey>privateKey,
          funcs.textToArrayBuffer(vault.key.cipher)
        )

        localVault.key = await crypto.subtle.importKey(
          'raw', clear, 'AES-GCM', false, ['encrypt', 'decrypt']
        )

        // decrypt packet contents
        for (const id in vault.items) {
          const packet = vault.items[id]
          const iv = new Uint32Array(funcs.toNumberArray(packet.iv))

          const content = await crypto.subtle.decrypt(
            { name: 'AES-GCM', iv },
            localVault.key,
            funcs.textToArrayBuffer(packet.content)
          )

          localVault.items[id] = <SecretType>JSON.parse(
            (new TextDecoder()).decode(content)
          )
        }

        this.vaults[vault.id] = localVault
      })
    },

    /**
     * Store a secret in a vault.
     *
     * @param {SecretType} secret Information to store as packet
     * @param {String} id Vault id
     *
     * @returns {Promise<boolean>}
     */
    async addSecret(secret: SecretType, id: string) {
      const vault = this.vaults[id]

      if (vault === undefined) return // problem

      const iv = crypto.getRandomValues(new Uint32Array(24))
      const content = await this.encryptSecret(secret, vault.key, iv)

      const result = await fetch(`${apiRoot}/vaults/${id}/packets`, {
        method: 'post',
        headers: {
          Authorization: `Bearer ${this.authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: funcs.arrayBufferToText(content),
          iv: iv.toString()
        })
      })

      if (!result.ok) return false

      const sid = (await result.json()).id
      vault.items[sid] = secret

      return true
    },

    /**
     *
     * @param secret
     * @param key
     * @param iv
     */
    encryptSecret(secret: SecretType, key: CryptoKey, iv: Uint32Array): Promise<ArrayBuffer> {
      const encoder = new TextEncoder()
      const input = (new TextEncoder()).encode(JSON.stringify(secret))

      return crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        key,
        input
      )
    }
  }
})
