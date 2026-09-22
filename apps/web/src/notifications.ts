import { useNotificationsStore } from '@/stores/notifications'

/**
 * Should only be called at points where pinia has been initialized.
 * @returns
 */
export default function () {
  return useNotificationsStore()
}
