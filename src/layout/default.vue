<template>
  <div class="bg-gray-50 min-h-full flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
    <slot />
  </div>

  <live-notification-region/>
</template>

<script lang="ts" setup>
import LiveNotificationRegion from '@/components/Notifications/LiveRegion.vue'

</script>
