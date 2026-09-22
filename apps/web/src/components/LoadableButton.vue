<template>
  <button
    :disabled="loading"
    :class="[loading ? 'bg-gray-300! cursor-progress' : null]"
  >
    <span v-if="loading" class="w-full flex items-center justify-center">
      <SimpleSpinner class="h-4 w-auto text-gray-700" />
    </span>

    <slot v-else></slot>
  </button>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import SimpleSpinner from './SimpleSpinner.vue'

export default defineComponent({
  components: { SimpleSpinner },
  props: {
    loading: { type: Boolean, default: false }
  }
})
</script>
