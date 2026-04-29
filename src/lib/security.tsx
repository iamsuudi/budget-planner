import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react'
import type { ReactNode } from 'react'

export type AuthenticatorType =
  | 'platform'
  | 'cross-platform'
  | 'google-password-manager'

// WebAuthn types are globally available, no import needed

interface SecuritySettings {
  pinEnabled: boolean
  biometricEnabled: boolean
  authenticatorType?: AuthenticatorType
}

interface SecurityContextValue {
  isLocked: boolean
  isAuthenticated: boolean
  pinEnabled: boolean
  biometricEnabled: boolean
  biometricAvailable: boolean
  isFirstTime: boolean
  authenticatorType: AuthenticatorType | undefined
  unlock: () => void
  lock: () => void
  setupPin: (pin: string) => Promise<void>
  verifyPin: (pin: string) => Promise<boolean>
  toggleBiometric: (enabled: boolean, type?: AuthenticatorType) => Promise<void>
  removePin: () => Promise<void>
  resetPinWithBiometric: () => Promise<void>
  resetApp: () => Promise<void>
  getAvailableAuthenticators: () => Promise<AuthenticatorType[]>
}

const SecurityContext = createContext<SecurityContextValue | null>(null)

const SETTINGS_KEY = 'security-settings'
const PASSKEY_CREDENTIAL_KEY = 'passkey-credential-id'
const USER_ID_KEY = 'user-id'
const PIN_HASH_KEY = 'pin-hash'

function generateChallenge(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(32))
}

async function hashPin(pin: string, salt: Uint8Array): Promise<string> {
  const encoder = new TextEncoder()
  const pinData = encoder.encode(pin)
  const saltedData = new Uint8Array([...salt, ...pinData])
  const hashBuffer = await crypto.subtle.digest('SHA-256', saltedData)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
  const saltHex = Array.from(salt)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
  return `${saltHex}:${hashHex}`
}

async function verifyPinHash(
  pin: string,
  storedHash: string,
): Promise<boolean> {
  const [saltHex, hashHex] = storedHash.split(':')
  if (!saltHex || !hashHex) return false
  const saltBytes = saltHex.match(/.{1,2}/g)
  if (!saltBytes) return false
  const salt = new Uint8Array(saltBytes.map((byte) => parseInt(byte, 16)))
  const encoder = new TextEncoder()
  const pinData = encoder.encode(pin)
  const saltedData = new Uint8Array([...salt, ...pinData])
  const hashBuffer = await crypto.subtle.digest('SHA-256', saltedData)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const newHashHex = hashArray
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
  return newHashHex === hashHex
}

function getUserId(): ArrayBuffer {
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

function loadSecuritySettings(): SecuritySettings {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY)
    if (stored) return JSON.parse(stored)
  } catch {}
  return { pinEnabled: false, biometricEnabled: false }
}

function saveSecuritySettings(settings: SecuritySettings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
}

function savePasskeyCredentialId(rawId: ArrayBuffer): void {
  localStorage.setItem(
    PASSKEY_CREDENTIAL_KEY,
    btoa(String.fromCharCode(...new Uint8Array(rawId))),
  )
}

function loadPasskeyCredentialId(): Uint8Array | null {
  const stored = localStorage.getItem(PASSKEY_CREDENTIAL_KEY)
  if (!stored) return null
  const binary = atob(stored)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

function clearPasskeyCredentialId(): void {
  localStorage.removeItem(PASSKEY_CREDENTIAL_KEY)
}

// Detect available authenticator types
async function detectAuthenticatorTypes(): Promise<AuthenticatorType[]> {
  const types: AuthenticatorType[] = []

  if (!('PublicKeyCredential' in window)) return types

  // Check for platform authenticator (fingerprint, Face ID, Windows Hello)
  try {
    const hasPlatform =
      await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
    if (hasPlatform) types.push('platform')
  } catch {}

  // Cross-platform authenticators are always possible if WebAuthn is available
  // (USB keys, phones, tablets, etc.)
  types.push('cross-platform')

  // Google Password Manager is a special case of cross-platform
  // We can't detect it specifically, but we can offer it as an option
  types.push('google-password-manager')

  return types
}

export function SecurityProvider({ children }: { children: ReactNode }) {
  const [isLocked, setIsLocked] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [pinEnabled, setPinEnabled] = useState(false)
  const [biometric, setBiometric] = useState(false)
  const [biometricAvailable, setBiometricAvailable] = useState(false)
  const [authenticatorType, setAuthenticatorType] = useState<
    AuthenticatorType | undefined
  >(undefined)
  const [isFirstTime, setIsFirstTime] = useState(true)
  const [loading, setLoading] = useState(true)
  const [inactivityTimer, setInactivityTimer] = useState<NodeJS.Timeout | null>(
    null,
  )
  const INACTIVITY_TIMEOUT = 5 * 60 * 1000 // 5 minutes

  useEffect(() => {
    const checkBiometric = async () => {
      if ('PublicKeyCredential' in window) {
        try {
          const hasPlatform =
            await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
          setBiometricAvailable(hasPlatform || true) // Always true if WebAuthn is available
        } catch {
          setBiometricAvailable(false)
        }
      } else {
        setBiometricAvailable(false)
      }
    }
    checkBiometric()
  }, [])

  useEffect(() => {
    const settings = loadSecuritySettings()
    setPinEnabled(settings.pinEnabled)
    setBiometric(settings.biometricEnabled)
    setAuthenticatorType(settings.authenticatorType)
    setIsFirstTime(!settings.pinEnabled && !settings.biometricEnabled)

    const isSessionAuthenticated =
      sessionStorage.getItem('security-auth') === 'true'

    if (
      isSessionAuthenticated &&
      (settings.pinEnabled || settings.biometricEnabled)
    ) {
      setIsLocked(false)
      setIsAuthenticated(true)
    } else if (!settings.pinEnabled && !settings.biometricEnabled) {
      setIsLocked(false)
      setIsAuthenticated(true)
      sessionStorage.setItem('security-auth', 'true')
    } else if (settings.biometricEnabled && !isSessionAuthenticated) {
      setIsLocked(true)
      authenticateWithBiometric()
    } else if (settings.pinEnabled && !isSessionAuthenticated) {
      setIsLocked(true)
    } else {
      setIsLocked(true)
    }
    setLoading(false)
  }, [])

  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimer) {
      clearTimeout(inactivityTimer)
      setInactivityTimer(null)
    }
    if (isLocked || !isAuthenticated) return
    const timer = setTimeout(() => {
      lock()
    }, INACTIVITY_TIMEOUT)
    setInactivityTimer(timer)
  }, [isLocked, isAuthenticated])

  useEffect(() => {
    if (isLocked || !isAuthenticated) return
    const events = ['mousemove', 'keydown', 'click', 'touchstart', 'scroll']
    const handler = () => resetInactivityTimer()
    events.forEach((event) => window.addEventListener(event, handler))
    resetInactivityTimer()
    return () => {
      events.forEach((event) => window.removeEventListener(event, handler))
      if (inactivityTimer) {
        clearTimeout(inactivityTimer)
      }
    }
  }, [resetInactivityTimer])

  const getAvailableAuthenticators = useCallback(async (): Promise<
    AuthenticatorType[]
  > => {
    return detectAuthenticatorTypes()
  }, [])

  const authenticateWithBiometric = async (): Promise<boolean> => {
    if (!('PublicKeyCredential' in window)) return false
    try {
      const credentialId = loadPasskeyCredentialId()
      const challenge = generateChallenge()
      const publicKey: PublicKeyCredentialRequestOptions = {
        challenge: challenge as BufferSource,
        timeout: 60000,
      }
      if (credentialId) {
        publicKey.allowCredentials = [
          { id: credentialId.buffer as ArrayBuffer, type: 'public-key' },
        ]
      }
      const credential = await navigator.credentials.get({ publicKey })
      if (credential) {
        setIsLocked(false)
        setIsAuthenticated(true)
        sessionStorage.setItem('security-auth', 'true')
        return true
      }
      return false
    } catch (error) {
      console.error('Biometric auth failed:', error)
      return false
    }
  }

  const unlock = useCallback(() => {
    setIsLocked(false)
    setIsAuthenticated(true)
    sessionStorage.setItem('security-auth', 'true')
    resetInactivityTimer()
  }, [resetInactivityTimer])

  const lock = useCallback(() => {
    setIsLocked(true)
    setIsAuthenticated(false)
    sessionStorage.removeItem('security-auth')
    if (inactivityTimer) {
      clearTimeout(inactivityTimer)
      setInactivityTimer(null)
    }
  }, [inactivityTimer])

  const setupPin = useCallback(
    async (pin: string) => {
      const salt = crypto.getRandomValues(new Uint8Array(16))
      const hashedPin = await hashPin(pin, salt)
      localStorage.setItem(PIN_HASH_KEY, hashedPin)
      const settings: SecuritySettings = {
        pinEnabled: true,
        biometricEnabled: biometric,
        authenticatorType,
      }
      saveSecuritySettings(settings)
      setPinEnabled(true)
      setIsFirstTime(false)
      unlock()
    },
    [biometric, authenticatorType, unlock],
  )

  const verifyPin = useCallback(
    async (pin: string): Promise<boolean> => {
      const stored = localStorage.getItem(PIN_HASH_KEY)
      if (!stored) return false
      const isValid = await verifyPinHash(pin, stored)
      if (isValid) {
        unlock()
      }
      return isValid
    },
    [unlock],
  )

  const toggleBiometric = useCallback(
    async (enabled: boolean, type?: AuthenticatorType) => {
      if (enabled) {
        try {
          const challenge = generateChallenge()
          const authType = type || authenticatorType || 'cross-platform'

          const pubKeyCredParams: PublicKeyCredentialParameters[] = [
            { type: 'public-key', alg: -7 }, // ES256
            { type: 'public-key', alg: -257 }, // RS256
          ]

          const authenticatorSelection: AuthenticatorSelectionCriteria = {
            residentKey: 'required',
            userVerification: 'required',
          }

          // Set authenticatorAttachment based on type
          if (authType === 'platform') {
            authenticatorSelection.authenticatorAttachment = 'platform'
          } else if (authType === 'cross-platform') {
            authenticatorSelection.authenticatorAttachment = 'cross-platform'
          }
          // For google-password-manager, don't set authenticatorAttachment (let browser choose)

          const userId = getUserId()

          const credential = await navigator.credentials.create({
            publicKey: {
              challenge: challenge as BufferSource,
              rp: {
                name: 'Budget Manager',
                id: window.location.hostname,
              },
              user: {
                id: userId,
                name: 'user@budgetmanager',
                displayName: 'Budget Manager User',
              },
              pubKeyCredParams,
              authenticatorSelection,
              timeout: 60000,
            },
          })

          if (!credential) {
            enabled = false
          } else {
            const c = credential as PublicKeyCredential
            savePasskeyCredentialId(c.rawId)
            setAuthenticatorType(authType)
          }
        } catch (error) {
          console.error('Biometric setup failed:', error)
          enabled = false
        }
      } else {
        clearPasskeyCredentialId()
        setAuthenticatorType(undefined)
      }

      const settings: SecuritySettings = {
        pinEnabled,
        biometricEnabled: enabled,
        authenticatorType: enabled ? type || authenticatorType : undefined,
      }
      saveSecuritySettings(settings)
      setBiometric(enabled)
    },
    [pinEnabled, authenticatorType],
  )

  const removePin = useCallback(async () => {
    localStorage.removeItem(PIN_HASH_KEY)
    const settings: SecuritySettings = {
      pinEnabled: false,
      biometricEnabled: biometric,
      authenticatorType,
    }
    saveSecuritySettings(settings)
    setPinEnabled(false)
    unlock()
  }, [biometric, authenticatorType, unlock])

  const resetPinWithBiometric = useCallback(async () => {
    const isAuth = await authenticateWithBiometric()
    if (!isAuth) {
      throw new Error('Biometric authentication failed')
    }
    localStorage.removeItem(PIN_HASH_KEY)
    const settings: SecuritySettings = {
      pinEnabled: false,
      biometricEnabled: biometric,
      authenticatorType,
    }
    saveSecuritySettings(settings)
    setPinEnabled(false)
    unlock()
  }, [biometric, authenticatorType, unlock])

  const resetApp = useCallback(async () => {
    // Clear IndexedDB (all app data)
    const { clearAllData } = await import('#/lib/storage')
    await clearAllData()

    // Clear all localStorage (security settings, passkey data, etc.)
    localStorage.clear()

    // Clear sessionStorage
    sessionStorage.clear()

    // Reload the page to reset the app state
    window.location.reload()
  }, [])

  if (loading) {
    return null
  }

  return (
    <SecurityContext.Provider
      value={{
        isLocked,
        isAuthenticated,
        pinEnabled,
        biometricEnabled: biometric,
        biometricAvailable,
        isFirstTime,
        authenticatorType,
        unlock,
        lock,
        setupPin,
        verifyPin,
        toggleBiometric,
        removePin,
        resetPinWithBiometric,
        getAvailableAuthenticators,
        resetApp,
      }}
    >
      {children}
    </SecurityContext.Provider>
  )
}

export function useSecurity() {
  const context = useContext(SecurityContext)
  if (!context) {
    throw new Error('useSecurity must be used within SecurityProvider')
  }
  return context
}
