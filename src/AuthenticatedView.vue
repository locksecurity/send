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
import SimpleSpinner from './components/SimpleSpinner.vue'
// import { $fetch } from './api-client'

export default defineComponent({
  components: { RouterView, DefaultLayout, SimpleSpinner },
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

      logout: this.logout
    }
  },

  async created() {
    const user = getCurrentUser()

    if (user === null) {
      return;
    }
    if (this.session !== null) {
      this.loading = false;
      return
    }

//    $fetch('/auth/session', { retry: 1 })
//      .then(body => {
//        this.session = body;
//        this.loading = false
//      })
//      .catch(error => {
//        /**
//         * this is probably a real problem
//         * @todo halt proceedings and/or try again.
//         */
//        console.error('Failed to load session info!', error)
//        return
//      })
this.loading = false
  },

  methods: {
    logout() {
      auth.signOut()
      this.session = null
    }
  }
})

</script>
