<template>
  <!--
    This example requires updating your template:

    ```
    <html class="h-full bg-gray-50">
    <body class="h-full">
    ```
  -->
  <div v-if="loading" className="w-full h-screen pt-48 bg-gray-50 flex justify-center">
    <SimpleSpinner class="h-10! w-auto! text-gray-700!" />
  </div>

  <div v-else class="flex min-h-full flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <TLogo class="mx-auto h-12 w-auto text-blue-500" alt="Send"></TLogo>
      <h2 class="mt-6 text-center text-2xl font-bold text-gray-900">Log in to your account</h2>
      <p class="mt-2 text-center text-sm text-gray-600">
        Or
        {{ ' ' }}
        <router-link to="/register" class="font-medium text-blue-600 hover:text-blue-500"> create an account </router-link>
      </p>
    </div>

    <!-- Email, phone, name, nickname -->
    <div class="mt-12 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="px-4 sm:rounded-lg sm:px-10">
        <div>
          <span class="text- block text-xs font-medium text-gray-600"> Recommended </span>
          <button
            type="button"
            @click="loginWithGoogle"
            class="mt-1 inline-flex w-full items-center justify-center gap-x-2 rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-gray-900 ring-1 shadow-xs ring-gray-300 ring-inset hover:bg-gray-50"
          >
            <google-icon class="-ml-0.5 h-5 w-5" aria-hidden="true" />
            Sign in with Google
          </button>
        </div>

        <div class="relative my-8">
          <div class="absolute inset-0 flex items-center" aria-hidden="true">
            <div class="w-full border-t border-gray-300" />
          </div>
          <div class="relative flex justify-center">
            <span class="bg-white px-2 text-sm text-gray-500">Or continue with email</span>
          </div>
        </div>
        <form class="space-y-6" @submit.prevent="tryLogin" method="POST" action="#">
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700"> Email address </label>
            <div class="mt-1">
              <input
                v-model="email"
                id="email"
                name="email"
                type="email"
                autocomplete="email"
                required
                class="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-xs focus:border-blue-500 focus:ring-blue-500 focus:outline-hidden sm:text-sm"
              />
            </div>
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-gray-700"> Password </label>
            <div class="mt-1">
              <input
                v-model="password"
                type="password"
                id="password"
                name="password"
                required
                class="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-xs focus:border-blue-500 focus:ring-blue-500 focus:outline-hidden sm:text-sm"
              />
            </div>
          </div>

          <div>
            <LoadableButton
              type="submit"
              :loading="submitting"
              class="flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-xs hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-hidden"
            >
              Log In
            </LoadableButton>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { signInWithEmailAndPassword } from '@firebase/auth'
import type { FirebaseError } from '@firebase/util'
import { defineComponent } from 'vue'

import { auth, getCurrentUser } from '@/auth/firebase'
import { googleOauthCallback, startGoogleOauth } from '@/auth/googleSignIn'
import GoogleIcon from '@/components/icons/GoogleIcon.vue'
import SimpleSpinner from '@/components/SimpleSpinner.vue'
import TLogo from '@/components/TLogo.vue'
import notifier from '@/notifications'

import LoadableButton from '../components/LoadableButton.vue'

export default defineComponent({
  components: { SimpleSpinner, GoogleIcon, TLogo, LoadableButton },

  data() {
    return {
      loading: true,
      submitting: false,

      email: '',
      password: ''
    }
  },

  async created() {
    const isSigninRedirect = await googleOauthCallback(this.$router)
    if (isSigninRedirect) {
      return
    }

    const user = await getCurrentUser()
    if (user) {
      this.$router.push('/')
      return
    }

    this.loading = false
  },

  methods: {
    loginWithGoogle() {
      startGoogleOauth()
    },

    async tryLogin() {
      this.submitting = true

      signInWithEmailAndPassword(auth, this.email, this.password)
        .then(() => this.$router.push('/'))
        .catch((error: FirebaseError) => {
          const userErrors = ['auth/user-not-found', 'auth/wrong-password']

          this.submitting = false

          if (userErrors.includes(error.code)) {
            return notifier().warning('Invalid email / password', 'Please check and try again.')
          }

          notifier().error('Something went wrong', "We couldn't log you in then. Please try again in a minute.")
        })
    }
  }
})
</script>
