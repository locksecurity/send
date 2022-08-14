import type { User } from '@firebase/auth'
import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: <string|null> null,
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
      this.token = user ? (user as any).accessToken : null
    },
  },

  getters: {
    signedIn: (store): boolean => store.token !== null
  }
})
