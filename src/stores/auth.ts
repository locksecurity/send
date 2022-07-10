import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: <string|null> null,
    user: <object|null> null,
  }),

  actions: {
    signIn(token: string): void {
      this.token = token
    }
  },

  getters: {
    signedIn: (store): boolean => store.token !== null
  }
})
/**
 * ALL FRESH LOGINS for now i.e. no persistence in device/local storage
 *
 * On sigunp
    * same process as on fresh login
 *
 * On fresh login
    * Store keyingMaterial(?) (to decrypt private key)
    * pull asymmetric keyset & decrypt private key
    * pull all vaults (inc. keys and items)
    * foreach vault:
        * decrypt vault key (using private kpk)
        * decrypt packet contents (using vault key)
  *
  * On adding an item
    * collect information
    * encrypt as packet and push to api
    * store information, along with new packet id, in pinia
  *
  * On editing an item
    * collect information
    * encrypt as packet and push to api
    * update information in store by vault/packet-id
  *
  * On deleting an item, delete with api by packet-id and delete from store
 */