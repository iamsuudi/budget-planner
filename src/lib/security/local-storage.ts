import type { SecuritySettings } from './types'

export const SETTINGS_KEY = 'security-settings'
export const PASSKEY_CREDENTIAL_KEY = 'passkey-credential-id'
export const USER_ID_KEY = 'user-id'
export const PIN_HASH_KEY = 'pin-hash'

export function loadSecuritySettings(): SecuritySettings {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY)
    if (stored) return JSON.parse(stored)
  } catch {}
  return { pinEnabled: false, biometricEnabled: false }
}

export function saveSecuritySettings(settings: SecuritySettings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
}

export function savePasskeyCredentialId(rawId: ArrayBuffer): void {
  localStorage.setItem(
    PASSKEY_CREDENTIAL_KEY,
    btoa(String.fromCharCode(...new Uint8Array(rawId))),
  )
}

export function loadPasskeyCredentialId(): Uint8Array | null {
  const stored = localStorage.getItem(PASSKEY_CREDENTIAL_KEY)
  if (!stored) return null
  const binary = atob(stored)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

export function clearPasskeyCredentialId(): void {
  localStorage.removeItem(PASSKEY_CREDENTIAL_KEY)
}

export function getUserId(): ArrayBuffer {
  const stored = localStorage.getItem(USER_ID_KEY)
  if (stored) {
    const byteStrings = stored.match(/.{1,2}/g)
    if (byteStrings) {
      return new Uint8Array(byteStrings.map((byte) => parseInt(byte, 16)))
        .buffer
    }
  }
  const newId = crypto.getRandomValues(new Uint8Array(16))
  const idHex = Array.from(new Uint8Array(newId))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
  localStorage.setItem(USER_ID_KEY, idHex)
  return newId.buffer
}
