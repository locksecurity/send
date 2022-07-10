<template>
  <component :is="layout">
    <RouterView />
  </component>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { RouterView } from 'vue-router';
import DefaultLayout from './layout/default.vue';
import AuthLayout from './layout/auth.vue';

export default defineComponent({
  components: {
    RouterView,
    AuthLayout,
    DefaultLayout,
  },

  computed: {
    layout(): string {
      const name = this.$route.meta.layout || 'default';

      return name + '-layout'
    },

    requiresAuth(): boolean {
      return !!this.$route.meta.requiresAuth
    }
  }
})

</script>

<style>
@import '@/assets/base.css';

</style>
