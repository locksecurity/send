<!-- This example requires Tailwind CSS v2.0+ -->
<template>
  <!-- Global notification live region, render this permanently at the end of the document -->
  <div aria-live="assertive" class="fixed inset-0 flex items-end px-4 py-6 pointer-events-none sm:p-6 sm:items-start">
    <div class="w-full flex flex-col items-center space-y-4 sm:items-end">
      <notification-item
        v-for="(n, key) in list"
        :key="key"
        :status="n.status"
        :title="n.title"
        :body="n.body"
        :removeFn="() => removeItem(key)"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { mapState, mapStores } from 'pinia'
import { useNotificationsStore, type LiveNotification } from '@/stores/notifications'
import NotificationItem from './Notification.vue'

export default defineComponent({
  components: { NotificationItem },

  data: () => ({
    list: <Record<number, LiveNotification>> {}
  }),

  computed: {
    ...mapState(useNotificationsStore, ['pushCount']),
    ...mapStores(useNotificationsStore)
  },

  watch: {
    pushCount(newCount: number) {
      if (newCount < 1) return

      this.showNextNotification()
    }
  },

  methods: {
    nextId() {
      return this.pushCount + 1
    },

    showNextNotification() {
      const notification = this.notificationsStore.next()
      if (!notification) return

      this.list[this.nextId()] = notification
    },

    removeItem(index: number) {
      if (this.list[index]) {
        delete this.list[index]
      }
    }
  }
})
</script>
