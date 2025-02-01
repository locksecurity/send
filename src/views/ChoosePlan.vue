<template>
  <div class="not-bg-white">
    <!-- Header and Page Header -->
    <div class="relative">

      <!-- Page Header -->
      <div class="relative max-w-2xl mx-auto py-24 px-4 sm:px-6 lg:max-w-7xl lg:py-32 lg:px-8">
        <div class="relative lg:text-center">
          <h1 class="text-3xl tracking-tight font-bold text-gray-900 sm:text-5xl sm:tracking-tight sm:leading-none lg:tracking-tight">Go premium or go home</h1>
          <p class="mt-6 max-w-2xl lg:mx-auto text-xl text-gray-500">Choose an affordable plan that's packed with the best features for you. No free rides here 🙂</p>
        </div>
      </div>
    </div>

    <main>
      <!-- Pricing Section -->
      <section class="relative" aria-labelledby="pricing-heading">
        <h2 id="pricing-heading" class="sr-only">Pricing</h2>

        <!-- Tiers -->
        <div class="max-w-2xl mx-auto px-4 space-y-12 sm:px-6 lg:max-w-7xl lg:space-y-0 lg:px-8 lg:grid lg:grid-cols-3 lg:gap-x-8">
          <div class="hidden lg:block"></div>
          <div v-for="tier in pricing.tiers" :key="tier.title" class="relative p-8 bg-white border border-gray-200 rounded-2xl shadow-xs flex flex-col">
            <div class="flex-1">
              <h3 class="text-xl font-semibold text-gray-900">{{ tier.title }}</h3>
              <p v-if="tier.mostPopular" class="absolute top-0 py-1.5 px-4 bg-blue-500 rounded-full text-sm font-semibold text-white transform -translate-y-1/2">Most popular</p>
              <p class="mt-4 flex items-baseline text-gray-900">
                <span class="text-5xl tracking-tight font-bold">${{ tier.price }}</span>
                <span class="ml-1 text-xl font-semibold">{{ tier.frequency }}</span>
              </p>
              <p class="mt-6 text-gray-500">{{ tier.description }}</p>

              <!-- Feature list -->
              <ul role="list" class="mt-6 space-y-6">
                <li v-for="feature in tier.features" :key="feature" class="flex">
                  <CheckIcon class="shrink-0 w-6 h-6 text-blue-500" aria-hidden="true" />
                  <span class="ml-3 text-gray-500">{{ feature }}</span>
                </li>
              </ul>
            </div>

            <LoadableButton
              type="button"
              :loading="working"
              @click="trySubscription"
              :class="[tier.mostPopular ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-blue-50 text-blue-700 hover:bg-blue-100', 'mt-8 block w-full py-3 px-6 border border-transparent rounded-md text-center font-medium']"
            >{{ tier.cta }}</LoadableButton>
          </div>
          <div class="hidden lg:block"></div>
        </div>
      </section>
    </main>

  </div>
</template>

<script lang="ts">
import { defineComponent, h } from 'vue'
import {
  CheckIcon,
} from '@heroicons/vue/outline'
import { useAuthStore } from '@/stores/auth'
import LoadableButton from '@/components/LoadableButton.vue'
import notifier from '@/notifications'

/**
 * $3/mo. paying yearly
 * $5/mo. paying monthly
 *
 * Unlimited uploads
 * Up to 2GB per upload
 * Premium chat support
 */
declare type Handler = { openIframe: () => void }
declare const PaystackPop : {
  setup: ({}) => Handler
}
declare type PaystackResponse = {
  status: string
  message: string
  reference: string
}

const apiRoot = import.meta.env.VITE_API_URL

export default defineComponent({
  components: { CheckIcon, LoadableButton },

  inject: ['loadSession'],

  beforeMount() {
    if (this.paystackScriptIsAbsent()) {
      this.togglePaystackScript()
    }
  },

  beforeUnmount() {
    this.togglePaystackScript()
  },

  data: () => ({
    pricing: {
      tiers: [
        {
          title: 'Basic',
          price: 3,
          frequency: '/month',
          description: 'The essentials to provide your best work for clients.',
          features: [
            'Unlimited uploads',
            'Up to 2GB per upload',
            'Premium support',
          ],
          cta: 'Get this',
          mostPopular: false,
        },
        /*{
          title: 'Premium+',
          price: 32,
          frequency: '/month',
          description: 'A plan that scales with your rapidly growing business.',
          features: [
            '25 products',
            'Up to 10,000 subscribers',
            'Advanced analytics',
            '24-hour support response time',
            'Marketing automations',
          ],
          cta: 'Monthly billing',
          mostPopular: true,
        },
        {
          title: 'Enterprise',
          price: 48,
          frequency: '/month',
          description: 'Dedicated support and infrastructure for your company.',
          features: [
            'Unlimited products',
            'Unlimited subscribers',
            'Advanced analytics',
            '1-hour, dedicated support response time',
            'Marketing automations',
            'Custom integrations',
          ],
          cta: 'Monthly billing',
          mostPopular: false,
        },
        */
      ],
    },

    working: false,
  }),

  methods: {
    paystackScriptIsAbsent(): boolean {
      const id = 'paystack-inline'
      return !document.getElementById(id)
    },

    /**
     * Toggle the presence of Paystack Inline's script.
     *
     * @returns {HTMLElement}
     */
    togglePaystackScript(): HTMLElement {
      const id = 'paystack-inline'
      const script = document.getElementById(id)

      if (script) {
        return document.body.removeChild(script)
      }

      const child = document.createElement('script')
      child.id = id
      child.src = 'https://js.paystack.co/v1/inline.js'

      return document.body.appendChild(child)
    },

    trySubscription() {
      const auth = useAuthStore()

      const key = import.meta.env.VITE_PAYSTACK_KEY
      const plan = import.meta.env.VITE_PAYSTACK_BASIC_PLAN

      const handler = PaystackPop.setup({
        key,
        plan,
        email: auth.user?.email,
        callback: (response: PaystackResponse) => this.paystackCb(response),
      })

      handler.openIframe()
      this.working = true
    },

    async paystackCb(res: PaystackResponse) {
      if (!(res.message.toLowerCase() === 'approved')) {
        return this.working = false
      }

      const auth = useAuthStore()
      const check = await fetch(`${apiRoot}/billing/start/${res.reference}`, {
        method: 'post',
        headers: { 'Authorization': `Bearer ${await auth.token}` },
      })

      if (!check.ok) {
        this.working = false

        return notifier().warning(
          'That didn\'t work',
          'We could not confirm your payment. Please try again.'
        )
      }

      try {
        await (<any>this).loadSession()

        notifier().success(
          'Thank You! 🎉',
          'Happy encrypted sharing!'
        )
        this.$router.push('/')
      } catch (e) {
        window.location = <Location & string>'/'
      }
    },
  }
})

</script>
