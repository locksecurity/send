import { defineStore } from 'pinia'

export type NotificationStatus = 'success' | 'error' | 'warning'

export interface LiveNotification {
  status: NotificationStatus,
  title: string,
  body?: string
}

export const useNotificationsStore = defineStore('notifications', {
  state: () => ({
    queue: <Array<LiveNotification>> [],
    pushCount: 0,
  }),

  actions: {
    /**
     * Enqueue a new notification for display.
     *
     * @param {NotificationStatus} status
     * @param {String} message
     * @param {?String} details
     *
     * @returns {void}
     */
    enqueue(status: NotificationStatus, message: string, details?: string): void {
      this.queue.push(<LiveNotification>{
        status,
        title: message,
        body: details
      })

      this.pushCount++
    },

    success(message: string, details?: string) { return this.enqueue('success', message, details) },
    error  (message: string, details?: string) { return this.enqueue('error', message, details) },
    warning(message: string, details?: string) { return this.enqueue('warning', message, details) },

    /**
     * Get the next notification to be shown. In FIFO order.
     *
     * @returns {LiveNotification}
     */
    next(): LiveNotification | undefined {
      return this.queue.shift()
    }

  },
})
