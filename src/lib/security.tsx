import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react'
import type { ReactNode } from 'react'

interface SecuritySettings {
  pinEnabled: boolean
  biometricEnabled: boolean
}

interface SecurityContextValue {
  isLocked: boolean
  isAuthenticated: boolean
  pinEnabled: boolean
  biometricEnabled: boolean
  biometricAvailable: boolean
  isFirstTime: boolean
  unlock: () => void
  lock: () => void
  setupPin: (pin: string) => Promise<void>
  verifyPin: (pin: string) => Promise<boolean>
  toggleBiometric: (enabled: boolean) => Promise<void>
  removePin: () => Promise<void>
  resetPinWithBiometric: () => Promise<void>
}

const SecurityContext = createContext<SecurityContextValue | null>(null)

const SETTINGS_KEY = 'security-settings'

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

const PASSKEY_CREDENTIAL_KEY = 'passkey-credential-id'

function savePasskeyCredentialId(rawId: ArrayBuffer): void {
  localStorage.setItem(PASSKEY_CREDENTIAL_KEY, btoa(String.fromCharCode(...new Uint8Array(rawId))))
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

export function SecurityProvider({ children }: { children: ReactNode }) {
  const [isLocked, setIsLocked] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [pinEnabled, setPinEnabled] = useState(false)
  const [biometric, setBiometric] = useState(false)
  const [biometricAvailable, setBiometricAvailable] = useState(false)
  const [isFirstTime, setIsFirstTime] = useState(true)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setBiometricAvailable('PublicKeyCredential' in window)
  }, [])

  useEffect(() => {
    const settings = loadSecuritySettings()
    setPinEnabled(settings.pinEnabled)
    setBiometric(settings.biometricEnabled)
    setIsFirstTime(!settings.pinEnabled && !settings.biometricEnabled)

    if (!settings.pinEnabled && !settings.biometricEnabled) {
      // No security enabled - unlocking
      setIsLocked(false)
      setIsAuthenticated(true)
    } else if (settings.biometricEnabled) {
      // Biometric enabled - trying biometric auth
      setIsLocked(true)
      authenticateWithBiometric()
    } else {
      // PIN enabled - showing lock screen
      setIsLocked(true)
    }
    setLoading(false)
  }, [])

  const authenticateWithBiometric = async (): Promise<boolean> => {
    if (!('PublicKeyCredential' in window)) return false
    try {
      const credentialId = loadPasskeyCredentialId()
      const publicKey: PublicKeyCredentialRequestOptions = {
        challenge: new TextEncoder().encode('authenticate'),
      }
      if (credentialId) {
        publicKey.allowCredentials = [
          { id: credentialId.buffer as ArrayBuffer, type: 'public-key' },
        ]
      }
      const credential = await navigator.credentials.get({
        publicKey,
      })
      if (credential) {
        setIsLocked(false)
        setIsAuthenticated(true)
      }
      return !!credential
    } catch {
      return false
    }
  }

  const unlock = useCallback(() => {
    setIsLocked(false)
    setIsAuthenticated(true)
  }, [])

  const lock = useCallback(() => {
    setIsLocked(true)
    setIsAuthenticated(false)
  }, [])

  const setupPin = useCallback(
    async (pin: string) => {
      const settings: SecuritySettings = {
        pinEnabled: true,
        biometricEnabled: biometric,
      }
      saveSecuritySettings(settings)
      localStorage.setItem('pin-hash', btoa(pin))
      setPinEnabled(true)
      setIsFirstTime(false)
      unlock()
    },
    [biometric, unlock],
  )

  const verifyPin = useCallback(
    async (pin: string): Promise<boolean> => {
      const stored = localStorage.getItem('pin-hash')
      if (stored && atob(stored) === pin) {
        unlock()
        return true
      }
      return false
    },
    [unlock],
  )

  const toggleBiometric = useCallback(
    async (enabled: boolean) => {
      if (enabled) {
        try {
          const credential = await navigator.credentials.create({
            publicKey: {
              challenge: new TextEncoder().encode('register'),
              rp: { name: 'Budget Manager' },
              user: {
                id: new TextEncoder().encode('user'),
                name: 'user',
                displayName: 'User',
              },
              pubKeyCredParams: [{ type: 'public-key', alg: -7 }],
              authenticatorSelection: {
                residentKey: 'required',
                authenticatorAttachment: 'platform',
              },
            },
          })
          if (credential) {
            const c = credential as PublicKeyCredential
            savePasskeyCredentialId(c.rawId)
          }
        } catch {
          enabled = false
        }
      } else {
        clearPasskeyCredentialId()
      }
      const settings: SecuritySettings = {
        pinEnabled,
        biometricEnabled: enabled,
      }
      saveSecuritySettings(settings)
      setBiometric(enabled)
    },
    [pinEnabled],
  )

  const removePin = useCallback(async () => {
    localStorage.removeItem('pin-hash')
    const settings: SecuritySettings = {
      pinEnabled: false,
      biometricEnabled: biometric,
    }
    saveSecuritySettings(settings)
    setPinEnabled(false)
    unlock()
  }, [biometric, unlock])

  const resetPinWithBiometric = useCallback(async () => {
    localStorage.removeItem('pin-hash')
    clearPasskeyCredentialId()
    const settings: SecuritySettings = {
      pinEnabled: false,
      biometricEnabled: false,
    }
    saveSecuritySettings(settings)
    setPinEnabled(false)
    setBiometric(false)
    unlock()
  }, [unlock])

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
        unlock,
        lock,
        setupPin,
        verifyPin,
        toggleBiometric,
        removePin,
        resetPinWithBiometric,
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
