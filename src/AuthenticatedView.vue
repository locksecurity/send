<template>
  <div v-if="loading" className="w-full h-screen pt-48 bg-gray-50 flex justify-center">
    <SimpleSpinner class="!h-10 !w-auto !text-gray-700" />
  </div>

  <component :is="layout" v-else>
    <RouterView />
  </component>
</template>

<script lang="ts">
import { RouterView } from 'vue-router'
import { computed, defineComponent } from 'vue'
import { auth, getCurrentUser } from './auth/firebase'
import DefaultLayout from '@/layout/default.vue'
import UserLayout from '@/layout/user.vue'
import SimpleSpinner from './components/SimpleSpinner.vue'
// import { $fetch } from './api-client'

const apiRoot = import.meta.env.VITE_API_URL

export default defineComponent({
  components: { RouterView, DefaultLayout, SimpleSpinner, UserLayout },
  props: {
    layout: {
      required: true,
    }
  },

  data() {
    return {
      loading: true,
      session: null,
    }
  },

  provide() {
    return {
      session: computed(() => this.session),
      loadSession: this.loadSession,
    }
  },

  async created() {
    const user = await getCurrentUser()

    if (user === null) {
      return
    }
    if (this.session !== null) {
      this.loading = false
      return
    }

    try {
      this.loadSession()
    } catch(e) {
      /**
       * this is probably a real problem
       * @todo halt proceedings and/or try again.
       */
      console.error('Failed to load session info!', e)
      return
    }
  },

  methods: {
    logout() {
      auth.signOut()
      this.session = null
    },

    async loadSession() {
      const user = await getCurrentUser()

      return fetch(`${apiRoot}/auth/session`, {
        headers: { Authorization: `Bearer ${await user?.getIdToken()}` }
      })
        .then(res => {
          if (res.ok) {
            return res.json()
          }
          // session pull failed. What next?
        })
        .then(body => {
          this.session = body
          this.loading = false
        })
    }
  }
})

</script>
