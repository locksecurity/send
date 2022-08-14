<template>
  <authenticated-view v-if="requiresAuth" :layout="layout" />

  <component v-else :is="layout">
    <RouterView />
  </component>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { RouterView } from 'vue-router';
import DefaultLayout from './layout/default.vue';
import AuthLayout from './layout/auth.vue';
import AuthenticatedView from './AuthenticatedView.vue';
import { auth } from './auth/firebase';
import { useAuthStore } from './stores/auth';

export default defineComponent({
  components: {
    RouterView,
    AuthLayout,
    DefaultLayout,
    AuthenticatedView
  },

  computed: {
    layout(): string {
      const name = this.$route.meta.layout || 'default';

      return name + '-layout'
    },

    requiresAuth(): boolean {
      return !!this.$route.meta.requiresAuth
    }
  },

  created() {
    const authStore = useAuthStore()

    auth.onAuthStateChanged(user => {
      authStore.setUser(user)
    })
  }
})

</script>

<style>
@import '@/assets/base.css';

</style>
