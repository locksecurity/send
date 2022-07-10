import { describe, expect, test } from 'vitest'
import nodeCrypto from 'crypto'
import * as functions from './functions'

// Node 15+ comes with web SubtleCrypto
// https://stackoverflow.com/a/66687075
Object.defineProperty(global.self, 'crypto', {
  value: nodeCrypto.webcrypto
});

describe('crypto functions', () => {
  expect(typeof window.crypto.subtle).toBeDefined()
  const { crypto } = window

  /**
   * Derive an MK, and further stretch that to derive another key, from a base password.
   *
   * @param {String} password Base password
   * @param {ArrayBuffer} salt
   * @param iterations
   */
  async function deriveKeyingMaterialFromPassword(password: string, salt: ArrayBuffer, iterations: number): Promise<CryptoKey> {
    const encoder = new TextEncoder()
    const passwordKey = await functions.passwordToCryptoKey(
      encoder.encode(password)
    );

    const MK = await functions.deriveMk(passwordKey, salt, iterations)

    return functions.deriveKeyFromMk(MK, salt)
  }


  /**
   * @summary Test method idea here is that the same symmetric key, using the same
   *  iv and encrypting the same message, should result in the same cipherText.
   *  i.e if the about shows to be true, the master password must've produced the
   *  same crytographic keys when processed multiple times.
   */
  test('same password (and salt, iv., etc) should result in same MK', async () => {
    const password = 'alicePranksBob'
    const salt = window.crypto.getRandomValues(new Uint32Array(4))
    const iterations = 100000

    const firstKey = await deriveKeyingMaterialFromPassword(password, salt, iterations)
    const secondKey = await deriveKeyingMaterialFromPassword(password, salt, iterations)

    const clearText = (new TextEncoder).encode('whatto3ncryptwhenyou\'re3ncrypt|ng#')
    const iv = window.crypto.getRandomValues(new Uint32Array(24))

    const cipherText1 = await window.crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        firstKey,
        clearText
    )

    const cipherText2 = await window.crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        secondKey,
        clearText
    )

    // convert to byte array, then to string, then compare
    expect((new Int8Array(cipherText1).toString()))
      .toBe((new Int8Array(cipherText2)).toString())
  })

  test('different passwords should result in different keys', async () => {
    const firstPass = 'alicePranksBob'
    const secondPass = 'aliceRePranksBob'

    const salt = window.crypto.getRandomValues(new Uint32Array(4))
    const iterations = 100000

    const firstKey = await deriveKeyingMaterialFromPassword(firstPass, salt, iterations)
    const secondKey = await deriveKeyingMaterialFromPassword(secondPass, salt, iterations)

    const clearText = (new TextEncoder).encode('whatto3ncryptwhenyou\'re3ncrypt|ng#')
    const iv = window.crypto.getRandomValues(new Uint32Array(24))

    const cipherText1 = await window.crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        firstKey,
        clearText
    )

    const cipherText2 = await window.crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        secondKey,
        clearText
    )

    expect((new Int8Array(cipherText1).toString()))
      .not
      .toBe((new Int8Array(cipherText2)).toString())
  })

  test.todo('privateKey can be safely exported & re-imported')

  test.todo('')
})
