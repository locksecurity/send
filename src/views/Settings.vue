<template>
  <!--
    This example requires updating your template:

    ```
    <html class="h-full bg-gray-100">
    <body class="h-full">
    ```
  -->
  <div class="h-full">

    <main class="max-w-7xl mx-auto pb-10 lg:py-12 lg:px-8">
      <div class="lg:grid lg:grid-cols-12 lg:gap-x-5">
        <aside class="py-6 px-2 sm:px-6 lg:py-0 lg:px-0 lg:col-span-3">
          <nav class="space-y-1">
            <a v-for="item in subNavigation" :key="item.name" :href="item.href" :class="[item.current ? 'bg-gray-50 text-blue-600 hover:bg-white' : 'text-gray-900 hover:text-gray-900 hover:bg-gray-50', 'group rounded-md px-3 py-2 flex items-center text-sm font-medium']" :aria-current="item.current ? 'page' : undefined">
              <component :is="item.icon" :class="[item.current ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500', 'flex-shrink-0 -ml-1 mr-3 h-6 w-6']" aria-hidden="true" />
              <span class="truncate">
                {{ item.name }}
              </span>
            </a>
          </nav>
        </aside>

        <!-- Payment details -->
        <div class="space-y-6 sm:px-6 lg:px-0 lg:col-span-9">

          <!-- Empty state -->
          <div class="mt-12 text-center">
            <AdjustmentsVerticalIcon class="mx-auto h-12 w-12 text-gray-400" />
            <h3 class="mt-2 text-sm font-medium text-gray-900">No payment plans yet</h3>
            <p class="mt-1 text-sm text-gray-500">
              Watch this space?
            </p>
          </div>

          <!-- Plan -->
          <section class="hidden" aria-labelledby="plan-heading">
            <form action="#" @submit.prevent="getManageLink">
              <div class="shadow sm:rounded-md sm:overflow-hidden">
                <div class="bg-white py-6 px-4 space-y-6 sm:p-6">
                  <div>
                    <h2 id="plan-heading" class="text-lg leading-6 font-medium text-gray-900">Your Plan</h2>
                  </div>

                  <RadioGroup v-model="selectedPlan">
                    <RadioGroupLabel class="sr-only"> Pricing plans </RadioGroupLabel>
                    <div class="relative bg-white rounded-md -space-y-px">
                      <RadioGroupOption as="template" v-for="(plan, planIdx) in plans" :key="plan.name" :value="plan" v-slot="{ checked, active }">
                        <div :class="[planIdx === 0 ? 'rounded-tl-md rounded-tr-md' : '', planIdx === plans.length - 1 ? 'rounded-bl-md rounded-br-md' : '', checked ? 'bg-blue-50 border-blue-200 z-10' : 'border-gray-200', 'relative border p-4 flex flex-col cursor-pointer md:pl-4 md:pr-6 md:grid md:grid-cols-3 focus:outline-none']">
                          <span class="flex items-center text-sm">
                            <span class="hidden" :class="[checked ? 'bg-blue-500 border-transparent' : 'bg-white border-gray-300', active ? 'ring-2 ring-offset-2 ring-gray-900' : '', 'h-4 w-4 rounded-full border flex items-center justify-center']" aria-hidden="true">
                              <span class="rounded-full bg-white w-1.5 h-1.5" />
                            </span>
                            <RadioGroupLabel as="span" class="ml-3 font-medium text-gray-900">{{ plan.name }}</RadioGroupLabel>
                          </span>
                          <RadioGroupDescription as="span" class="ml-6 pl-1 text-sm md:ml-0 md:pl-0 md:text-center">
                            <span :class="[checked ? 'text-blue-900' : 'text-gray-900', 'font-medium']">${{ plan.priceMonthly }} / mo</span>
                            {{ ' ' }}
                            <span :class="checked ? 'text-blue-700' : 'text-gray-500'">(${{ plan.priceYearly }} / yr)</span>
                          </RadioGroupDescription>
                          <RadioGroupDescription as="span" :class="[checked ? 'text-blue-700' : 'text-gray-500', 'ml-6 pl-1 text-sm md:ml-0 md:pl-0 md:text-right']">{{ plan.limit }}</RadioGroupDescription>
                        </div>
                      </RadioGroupOption>
                    </div>
                  </RadioGroup>

                </div>
                <div class="px-4 py-3 bg-gray-50 text-right sm:px-6">
                  <LoadableButton @click="getManageLink" :loading="working" type="button" class="bg-gray-800 border border-transparent rounded-md shadow-sm py-2 px-4 inline-flex justify-center text-sm font-medium text-white hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900">
                    Manage Plan
                  </LoadableButton>
                </div>
              </div>
            </form>
          </section>

        </div>
      </div>
    </main>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import {
  RadioGroup,
  RadioGroupDescription,
  RadioGroupLabel,
  RadioGroupOption,
} from '@headlessui/vue'
import {
  AdjustmentsVerticalIcon,
//  BellIcon,
//  CogIcon,
  CreditCardIcon,
//  KeyIcon,
//  UserCircleIcon,
//  ViewGridAddIcon,
} from '@heroicons/vue/24/outline'
import { useAuthStore } from '@/stores/auth'
import notifier from '@/notifications'
import LoadableButton from '@/components/LoadableButton.vue'

const apiRoot = import.meta.env.VITE_API_URL

export default defineComponent({
  components: {
    AdjustmentsVerticalIcon,
    RadioGroup,
    RadioGroupDescription,
    RadioGroupLabel,
    RadioGroupOption,
    LoadableButton
},

  data() {
    return {
      subNavigation: [
        //{ name: 'Profile', href: '#', icon: UserCircleIcon, current: false },
        //{ name: 'Account', href: '#', icon: CogIcon, current: false },
        // { name: 'Password', href: '#', icon: KeyIcon, current: false },
        //{ name: 'Notifications', href: '#', icon: BellIcon, current: false },
        { name: 'Plan & Billing', href: '#', icon: CreditCardIcon, current: true },
        //{ name: 'Integrations', href: '#', icon: ViewGridAddIcon, current: false },
      ],
      plans: [
        { name: 'Basic', priceMonthly: 3, priceYearly: 36, limit: 'Up to 2GB per upload' },
        // { name: 'Business', priceMonthly: 99, priceYearly: 990, limit: 'Up to 25 active job postings' },
        // { name: 'Enterprise', priceMonthly: 249, priceYearly: 2490, limit: 'Unlimited active job postings' },
      ],
      selectedPlan: {},
      working: false,
    }
  },

  methods: {
    async getManageLink() {
      this.working = true

      const { user } = useAuthStore()
      let response
      const apology = () => notifier().warning('Something went wrong', 'Please try again soon.')

      try {
        response = await fetch(`${apiRoot}/billing/manage-link`, {
          headers: { Authorization: `Bearer ${await user?.getIdToken()}` }
        })
      } catch (e) {
        this.working = false
        return apology()
      }

      if (!response.ok) {
        this.working = false
        return apology()
      }
      const body = await response.json()

      window.location = body.link
    }
  }
})

</script>
