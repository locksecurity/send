<template>
  <!--
    This example requires updating your template:

    ```
    <html class="h-full bg-gray-50">
    <body class="h-full">
    ```
  -->
  <div v-if="loading" className="w-full h-screen pt-48 bg-gray-50 flex justify-center">
    <SimpleSpinner class="!h-10 !w-auto !text-gray-700" />
  </div>
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
          action="#"
          method="POST"
        >
          <div>
            <span class="block text-xs text- font-medium text-gray-600">
              Recommended
            </span>
            <button type="button" @click="registerWithGoogle" class="mt-1 w-full inline-flex items-center justify-center gap-x-2 rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
              <google-icon class="-ml-0.5 h-5 w-5" aria-hidden="true" />
              Sign in with Google
            </button>
          </div>

          <div v-show="!usingEmail" class="mt-12">
            <button type="button" @click="usingEmail = true" class="transition duration-200 text-sm font-medium text-slate-700 hover:text-slate-900">
              Or continue with email &rarr;
            </button>
          </div>

          <div v-show="usingEmail" class="relative my-10">
            <div class="absolute inset-0 flex items-center" aria-hidden="true">
              <div class="w-full border-t border-gray-300" />
            </div>
            <div class="relative flex justify-center">
              <span class="bg-white px-2 text-sm text-gray-500">Or continue with email</span>
            </div>
          </div>

          <fieldset v-show="usingEmail" :id="emailSignupId" class="space-y-6">
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
                <input v-model="password" type="password" id="password" name="password" required minlength="12" class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="at least 12 characters long" />
              </div>
            </div>

            <div>
              <LoadableButton type="submit" :loading="submitting" class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                Continue
              </LoadableButton>
            </div>
          </fieldset>
        </form>

      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import GoogleIcon from '@/components/icons/GoogleIcon.vue'
import TLogo from '@/components/TLogo.vue'
import SimpleSpinner from '@/components/SimpleSpinner.vue'
import LoadableButton from '@/components/LoadableButton.vue'
import notifier from '@/notifications'
import { signInWithEmailAndPassword } from '@firebase/auth'
import { auth, getCurrentUser } from '@/auth/firebase'
import { googleOauthCallback, startGoogleOauth } from '@/auth/googleSignIn'

const apiRoot = import.meta.env.VITE_API_URL

export default defineComponent({
  components: { GoogleIcon, LoadableButton, SimpleSpinner, TLogo },

  data() {
    return {
      loading: true,
      emailSignupId: 'emailSignup',
      usingEmail: false,

      email: '',
      nickname: '',
      password: '',

      submitting: false,
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
    async register() {
      this.submitting = true

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

          notifier().success(
            'You\'re all signed up',
            'Happy encrypting!'
          )
          this.$router.push('/')
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

    async registerWithGoogle() {
      startGoogleOauth()
    }
  }
})

</script>
