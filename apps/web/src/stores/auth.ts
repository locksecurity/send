import type { User } from '@firebase/auth'
import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: <User|null> null,
  }),

  actions: {
    /**
     * Set the currently authenticated user.
     *
     * @param {User} user User profile or `null` to log the current one out.
     */
    setUser(user: User|null) {
      this.user = user
    },
  },

  getters: {
    token: (store): Promise<string>|undefined => store.user?.getIdToken(),
    signedIn: (store): boolean => store.user !== null
  }
})
