import { initializeApp } from '@firebase/app'
import { getAuth, connectAuthEmulator, type User } from '@firebase/auth'

const app = initializeApp({
  apiKey: <string>import.meta.env.VITE_CLOUD_IDENTITY_API_KEY || 'abc123',
  authDomain: <string>import.meta.env.VITE_CLOUD_IDENTITY_AUTH_DOMAIN || undefined,
});

const auth = getAuth(app)

if (import.meta.env.MODE === 'development') {
  connectAuthEmulator(auth, <string>import.meta.env.VITE_AUTH_EMULATOR_URL)
}

/**
 * Promise-based abstraction for the recommended way to get the
 * currently active Cloud Identity user. If any.
 *
 * @returns {Promise<User|null>}
 *
 * @see https://github.com/firebase/firebase-js-sdk/issues/462#issuecomment-359711740
 */
function getCurrentUser(): Promise<User|null> {
  return new Promise((resolve, reject) => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      unsubscribe()
      resolve(user)
    }, reject)
  });
}

export { app, auth, getCurrentUser }
