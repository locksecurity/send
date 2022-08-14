<template>
  <!--
    This example requires updating your template:

    ```
    <html class="h-full bg-gray-50">
    <body class="h-full">
    ```
  -->
  <div class="min-h-full flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <TLogo class="mx-auto h-12 w-auto text-blue-500" alt="locktor"></TLogo>
      <h2 class="mt-6 text-center text-2xl font-bold text-gray-900">
        Log in to your account
      </h2>
      <p class="mt-2 text-center text-sm text-gray-600">
        Or
        {{ ' ' }}
        <router-link to="/register" class="font-medium text-blue-600 hover:text-blue-500"> start your 14-day free trial </router-link>
      </p>
    </div>

<!-- Email, phone, name, nickname -->
    <div class="mt-12 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="px-4 sm:rounded-lg sm:px-10">
        <form class="space-y-6" @submit.prevent="tryLogin" method="POST" action="#">
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700">
              Email address
            </label>
            <div class="mt-1">
              <input v-model="email" id="email" name="email" type="email" autocomplete="email" required class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
            </div>
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-gray-700">
              Password
            </label>
            <div class="mt-1">
              <input
                v-model="password"
                type="password"
                id="password"
                name="password"
                required
                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
          </div>

          <div>
            <button type="submit" class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              Log In
            </button>
          </div>
        </form>

      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { signInWithEmailAndPassword } from '@firebase/auth'
import { auth } from '@/auth/firebase'
import notifier from '@/notifications'
import ButtonSpinner from '@/components/SimpleSpinner.vue'
import TLogo from '@/components/TLogo.vue'
import type { FirebaseError } from '@firebase/util';

export default defineComponent({
  components: { ButtonSpinner, TLogo },

  data() {
    return {
      submitting: false,

      email: '',
      password: ''
    };
  },

  methods: {
    async tryLogin() {
      this.submitting = true

      signInWithEmailAndPassword(auth, this.email, this.password)
        .then(() => this.$router.push('/'))
        .catch((error: FirebaseError) => {
          const userErrors = [
            'auth/user-not-found',
            'auth/wrong-password'
          ]

          this.submitting = false

          if (userErrors.includes(error.code)) {
            return notifier().warning(
              'Invalid email / password',
              'Please check and try again.'
            )
          }

          notifier().error(
            'Something went wrong',
            'We couldn\'t log you in then. Please try again in a minute.'
          )
        })

    },
  }
})
</script>
