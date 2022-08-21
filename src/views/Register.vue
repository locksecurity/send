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
      <TLogo class="mx-auto h-12 w-auto text-blue-500" alt="Locksend"></TLogo>
      <h2 class="mt-6 text-center text-3xl font-bold text-gray-900">
        Create an account
      </h2>
      <p class="mt-2 text-center text-sm text-gray-600">
        Already have an account?
        {{ ' ' }}
        <router-link to="/login" class="font-medium text-blue-600 hover:text-blue-500"> Login instead </router-link>
      </p>
    </div>
<!-- Email, phone, name, nickname -->
    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="py-8 px-4 sm:rounded-lg sm:px-10">
        <form
          @submit.prevent="register"
          class="space-y-6"
          action="#"
          method="POST"
        >
          <div>
            <label for="nickname" class="block text-sm font-medium text-gray-700">
              What should we call you?
            </label>
            <div class="mt-1">
              <input v-model="nickname" id="nickname" name="nickname" required class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="Jane" />
            </div>
          </div>

          <div>
            <label for="email" class="block text-sm font-medium text-gray-700">
              Your email address
            </label>
            <div class="mt-1">
              <input v-model="email" id="email" name="email" type="email" autocomplete="email" required class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
            </div>
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-gray-700">
              Choose a Password
            </label>
            <div class="mt-1">
              <input v-model="password" type="password" id="password" name="password" required minlength="8" class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="at least 8 characters long" />
            </div>
          </div>

          <div>
            <LoadableButton type="submit" :loading="submitting" class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              Continue
            </LoadableButton>
          </div>
        </form>

      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import TLogo from '@/components/TLogo.vue'
import LoadableButton from '@/components/LoadableButton.vue'
import notifier from '@/notifications'
import { signInWithEmailAndPassword } from '@firebase/auth'
import { auth } from '@/auth/firebase'

const apiRoot = import.meta.env.VITE_API_URL

export default defineComponent({
    components: { TLogo, LoadableButton },

    data() {
      return {
        email: '',
        nickname: '',
        password: '',

        submitting: false,
      }
    },

    methods: {

      async register() {
        this.submitting = true

        const apiRoot = import.meta.env.VITE_API_URL

        const response = await fetch(`${apiRoot}/auth/register`, {
          method: 'post',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nickname: this.nickname,
            email: this.email,
            password: this.password
          })
        })

        if (response.ok) {
          try {
            await signInWithEmailAndPassword(auth, this.email, this.password)
            this.$router.push('/plans/choose')
          }
          catch(error) {
            this.$router.push('/login')
          }
          finally { return  }
        }

        this.submitting = false

        return notifier().error(
          'Something went wrong.',
          'We couldn\'t sign you up then. Please try again.'
        )
      },

    }
})

</script>
