import { describe, expect, it } from 'vitest'
import { generateChallenge, hashPin, verifyPinHash } from './pin-crypto'

describe('pin-crypto', () => {
  it('generates a 32-byte challenge', () => {
    const challenge = generateChallenge()
    expect(challenge).toBeInstanceOf(Uint8Array)
    expect(challenge.length).toBe(32)
  })

  it('produces unique challenges', () => {
    const a = Array.from(generateChallenge()).join(',')
    const b = Array.from(generateChallenge()).join(',')
    expect(a).not.toBe(b)
  })

  it('verifies a correct PIN against its stored hash', async () => {
    const salt = generateChallenge()
    const stored = await hashPin('1234', salt)
    await expect(verifyPinHash('1234', stored)).resolves.toBe(true)
  })

  it('rejects a wrong PIN', async () => {
    const salt = generateChallenge()
    const stored = await hashPin('1234', salt)
    await expect(verifyPinHash('9999', stored)).resolves.toBe(false)
  })

  it('rejects a malformed stored hash', async () => {
    await expect(verifyPinHash('1234', 'not-a-valid-hash')).resolves.toBe(false)
    await expect(verifyPinHash('1234', '')).resolves.toBe(false)
  })
})