export type AuthenticatorType =
  | 'platform'
  | 'cross-platform'
  | 'google-password-manager'

export interface SecuritySettings {
  pinEnabled: boolean
  biometricEnabled: boolean
  authenticatorType?: AuthenticatorType
  autoLockTime?: number
}

export interface SecurityContextValue {
  isLocked: boolean
  isAuthenticated: boolean
  pinEnabled: boolean
  biometricEnabled: boolean
  biometricAvailable: boolean
  isFirstTime: boolean
  authenticatorType: AuthenticatorType | undefined
  autoLockTime: number
  unlock: () => void
  lock: () => void
  setupPin: (pin: string) => Promise<void>
  verifyPin: (pin: string) => Promise<boolean>
  toggleBiometric: (enabled: boolean, type?: AuthenticatorType) => Promise<void>
  removePin: () => Promise<void>
  resetPinWithBiometric: () => Promise<void>
  resetApp: () => Promise<void>
  getAvailableAuthenticators: () => Promise<AuthenticatorType[]>
  setAutoLockTime: (minutes: number) => void
}
