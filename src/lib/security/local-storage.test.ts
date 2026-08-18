import { beforeEach, describe, expect, it } from 'vitest'
import {
  SETTINGS_KEY,
  loadPasskeyCredentialId,
  loadSecuritySettings,
  savePasskeyCredentialId,
  saveSecuritySettings,
  clearPasskeyCredentialId,
  getUserId,
  PASSKEY_CREDENTIAL_KEY,
  USER_ID_KEY,
} from './local-storage'

describe('security local-storage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('loads default settings when nothing is stored', () => {
    expect(loadSecuritySettings()).toEqual({
      pinEnabled: false,
      biometricEnabled: false,
    })
  })

  it('falls back to defaults on corrupt JSON', () => {
    localStorage.setItem(SETTINGS_KEY, '{not-json')
    expect(loadSecuritySettings()).toEqual({
      pinEnabled: false,
      biometricEnabled: false,
    })
  })

  it('round-trips security settings', () => {
    saveSecuritySettings({
      pinEnabled: true,
      biometricEnabled: true,
      autoLockTime: 5,
    })
    expect(loadSecuritySettings()).toEqual({
      pinEnabled: true,
      biometricEnabled: true,
      autoLockTime: 5,
    })
  })

  it('round-trips a passkey credential id', () => {
    const rawId = new Uint8Array([1, 2, 3, 255, 128]).buffer
    savePasskeyCredentialId(rawId)

    expect(localStorage.getItem(PASSKEY_CREDENTIAL_KEY)).toBeTruthy()
    const loaded = loadPasskeyCredentialId()
    expect(Array.from(loaded!)).toEqual([1, 2, 3, 255, 128])
  })

  it('clears a passkey credential id', () => {
    savePasskeyCredentialId(new Uint8Array([1]).buffer)
    clearPasskeyCredentialId()
    expect(loadPasskeyCredentialId()).toBeNull()
  })

  it('generates a stable user id across calls', () => {
    const first = getUserId()
    const second = getUserId()
    expect(new Uint8Array(first)).toHaveLength(16)
    expect(new Uint8Array(second)).toEqual(new Uint8Array(first))
    expect(localStorage.getItem(USER_ID_KEY)).toBeTruthy()
  })
})