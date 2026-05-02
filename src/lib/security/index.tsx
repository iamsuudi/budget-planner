import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react'
import type { ReactNode } from 'react'

import type { SecurityContextValue, AuthenticatorType } from './types'
import {
  loadSecuritySettings,
  saveSecuritySettings,
  PIN_HASH_KEY,
  clearPasskeyCredentialId,
} from './local-storage'
import { hashPin, verifyPinHash } from './pin-crypto'
import { authenticateWithBiometric, registerBiometric, detectAuthenticatorTypes } from './biometric'

const SecurityContext = createContext<SecurityContextValue | null>(null)

const DEFAULT_AUTO_LOCK_TIME = 15 // minutes

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
  const [autoLockTime, setAutoLockTimeState] = useState(DEFAULT_AUTO_LOCK_TIME)
  const [inactivityTimer, setInactivityTimer] = useState<NodeJS.Timeout | null>(
    null,
  )

  useEffect(() => {
    const checkBiometric = async () => {
      if ('PublicKeyCredential' in window) {
        try {
          const hasPlatform =
            await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
          setBiometricAvailable(hasPlatform || true)
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
    setAutoLockTimeState(settings.autoLockTime ?? DEFAULT_AUTO_LOCK_TIME)
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
    }, autoLockTime * 60 * 1000)
    setInactivityTimer(timer)
  }, [isLocked, isAuthenticated, autoLockTime])

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

  const getAvailableAuthenticators = useCallback(async () => {
    return detectAuthenticatorTypes()
  }, [])

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
      const settings = {
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
        const { success, authType } = await registerBiometric(
          type || authenticatorType,
        )
        if (!success) {
          enabled = false
        } else {
          setAuthenticatorType(authType)
        }
      } else {
        clearPasskeyCredentialId()
        setAuthenticatorType(undefined)
      }

      const settings = {
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
    const settings = {
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
    const settings = {
      pinEnabled: false,
      biometricEnabled: biometric,
      authenticatorType,
    }
    saveSecuritySettings(settings)
    setPinEnabled(false)
    unlock()
  }, [biometric, authenticatorType, unlock])

  const resetApp = useCallback(async () => {
    const { clearAllData } = await import('../storage')
    await clearAllData()
    localStorage.clear()
    sessionStorage.clear()
    window.location.reload()
  }, [])

  const setAutoLockTime = useCallback((minutes: number) => {
    setAutoLockTimeState(minutes)
    const settings = loadSecuritySettings()
    saveSecuritySettings({
      ...settings,
      autoLockTime: minutes,
    })
    if (!isLocked && isAuthenticated) {
      resetInactivityTimer()
    }
  }, [isLocked, isAuthenticated, resetInactivityTimer])

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
        autoLockTime,
        unlock,
        lock,
        setupPin,
        verifyPin,
        toggleBiometric,
        removePin,
        resetPinWithBiometric,
        getAvailableAuthenticators,
        resetApp,
        setAutoLockTime,
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
