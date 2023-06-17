import type { Router } from 'vue-router'
import {
  GoogleAuthProvider,
  getAdditionalUserInfo,
  getRedirectResult,
  signInWithRedirect
} from '@firebase/auth'
import { auth } from './firebase'
import { api } from '@/api'

/**
 * Start the process of authenticating a customer using their Google account.
 *
 * @returns {void}
 */
export function startGoogleOauth() {
  const provider = new GoogleAuthProvider()
  const scopes = [
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/userinfo.email'
  ]
  scopes.forEach(scope => provider.addScope(scope))

  signInWithRedirect(auth, provider)
}

/**
 * Completes a sign-up/log-in with Google OAuth.
 *
 * @returns {Promise<boolean>}
 */
export async function googleOauthCallback(router: Router) {
  const result = await getRedirectResult(auth)
  if (!result) {
    return false
  }
  // This gives you a Google Access Token. You can use it to access Google APIs.
  // const credential = GoogleAuthProvider.credentialFromResult(result);
  // const token = credential?.accessToken;

  const user = result.user
  const info = getAdditionalUserInfo(result)

  try {
    await api.post('/oauth/register', {
      body: JSON.stringify({
        nickname: user.displayName,
        email: user.email,
        localId: user.uid,
        provider: info?.providerId
      })
    })
  } catch(e) {}

  router.push('/')

  return true
}
