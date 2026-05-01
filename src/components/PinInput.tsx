import { useState, useRef, useEffect } from 'react'
import { useSecurity } from '#/lib/security'
import {
  Lock,
  Fingerprint,
  ArrowLeft,
  AlertTriangle,
  Trash2,
  Loader2,
} from 'lucide-react'
import { useRouter } from '@tanstack/react-router'
import { clearAllData } from '#/lib/storage'
import { useToast } from '#/lib/toast'

interface PinInputProps {
  mode: 'enter' | 'setup' | 'confirm' | 'remove'
  onComplete: (pin: string) => void
  onCancel?: () => void
  error?: string
  showBiometric?: boolean
  authenticating?: boolean
  onBiometric?: () => void
}

const PIN_LENGTH = 4

export function PinInput({
  mode,
  onComplete,
  onCancel,
  error,
  showBiometric,
  authenticating,
  onBiometric,
}: PinInputProps) {
  const [pin, setPin] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!e.key.match(/^[0-9]$/) && e.key !== 'Backspace') {
      e.preventDefault()
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, PIN_LENGTH)
    setPin(value)
    if (value.length === PIN_LENGTH) {
      onComplete(value)
    }
  }

  const handleNumberClick = (num: string) => {
    if (pin.length < PIN_LENGTH) {
      const newPin = pin + num
      setPin(newPin)
      if (newPin.length === PIN_LENGTH) {
        onComplete(newPin)
      }
    }
  }

  const handleBackspace = () => {
    setPin(pin.slice(0, -1))
  }

  const numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9']

  const getTitle = () => {
    switch (mode) {
      case 'enter':
        return 'Enter PIN'
      case 'setup':
        return 'Create PIN'
      case 'confirm':
        return 'Confirm PIN'
      case 'remove':
        return 'Enter Current PIN'
    }
  }

  const getDescription = () => {
    if (error) return error
    switch (mode) {
      case 'enter':
        return 'Enter your 4-digit PIN to unlock'
      case 'setup':
        return 'Create a 4-digit PIN to secure your app'
      case 'confirm':
        return 'Re-enter your PIN to confirm'
      case 'remove':
        return 'Enter your current PIN to remove it'
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <div className="w-full max-w-sm">
        {onCancel && (
          <button
            onClick={onCancel}
            className="absolute top-6 left-6 p-2 text-slate-400 hover:text-white"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
        )}

        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-4">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">{getTitle()}</h1>
          <p className="text-slate-400 text-sm text-center">
            {getDescription()}
          </p>
        </div>

        <div className="flex justify-center gap-3 mb-8">
          {Array.from({ length: PIN_LENGTH }).map((_, i) => (
            <div
              key={i}
              className={`w-4 h-4 rounded-full border-2 transition-colors ${
                pin[i] ? 'bg-primary border-primary' : 'border-slate-600'
              }`}
            />
          ))}
        </div>

        <input
          ref={inputRef}
          type="password"
          inputMode="numeric"
          maxLength={PIN_LENGTH}
          value={pin}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          className="sr-only"
          autoFocus
        />

        <div className="grid grid-cols-3 gap-4 max-w-xs mx-auto">
          {numbers.map((num) => (
            <button
              key={num}
              onClick={() => handleNumberClick(num)}
              className="w-16 h-16 rounded-full bg-slate-800 text-white text-2xl font-semibold hover:bg-slate-700 active:bg-slate-600 transition-colors"
            >
              {num}
            </button>
          ))}
          <button
            onClick={() => handleNumberClick('0')}
            className="w-16 h-16 rounded-full bg-slate-800 text-white text-2xl font-semibold hover:bg-slate-700 active:bg-slate-600 transition-colors"
          >
            0
          </button>
          {showBiometric ? (
            <button
              onClick={onBiometric}
              disabled={authenticating}
              className="w-16 h-16 rounded-full bg-slate-800 text-primary hover:bg-slate-700 disabled:opacity-50 flex items-center justify-center transition-colors"
            >
              {authenticating ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <Fingerprint className="w-6 h-6" />
              )}
            </button>
          ) : (
            <div />
          )}
          <button
            onClick={handleBackspace}
            className="w-16 h-16 rounded-full bg-slate-800 text-slate-400 text-xl flex items-center justify-center hover:bg-slate-700 transition-colors"
          >
            ←
          </button>
        </div>
      </div>
    </div>
  )
}

export function LockScreen() {
  const {
    isLocked,
    verifyPin,
    isFirstTime,
    setupPin,
    biometricEnabled,
    unlock,
    resetPinWithBiometric,
  } = useSecurity()
  const [error, setError] = useState('')
  const [pinKey, setPinKey] = useState(0)
  const [authenticating, setAuthenticating] = useState(false)
  const [showForgot, setShowForgot] = useState(false)
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const router = useRouter()
  const { showToast } = useToast()

  useEffect(() => {
    if (showForgot && biometricEnabled) {
      handleBiometric()
    }
  }, [showForgot, biometricEnabled])

  const handleVerify = async (pin: string) => {
    const valid = await verifyPin(pin)
    if (!valid) {
      setError('Incorrect PIN')
      setPinKey((k) => k + 1)
    }
  }

  const handleSetup = async (pin: string) => {
    await setupPin(pin)
  }

  const handleBiometric = async () => {
    if (!biometricEnabled) return
    setAuthenticating(true)
    try {
      if (!('PublicKeyCredential' in window)) {
        return
      }

      const credential = await navigator.credentials.get({
        publicKey: {
          challenge: crypto.getRandomValues(new Uint8Array(32)),
          timeout: 60000,
          userVerification: 'required',
        },
      })

      if (credential) {
        if (showForgot) {
          await resetPinWithBiometric()
          router.navigate({ to: '/settings/security/pin' })
        } else {
          unlock()
        }
      }
    } catch (err) {
      console.log('Biometric failed:', err)
    } finally {
      setAuthenticating(false)
    }
  }

  const handleResetApp = async () => {
    try {
      // Clear IndexedDB (all data)
      await clearAllData()

      // Clear localStorage (security settings, passkey data, etc.)
      localStorage.clear()

      // Clear sessionStorage
      sessionStorage.clear()

      // Show message and reload
      showToast('App has been reset. The page will now reload.', 'info')
      window.location.reload()
    } catch (error) {
      console.error('Failed to reset app:', error)
      showToast('Failed to reset app. ' + error, 'error')
    }
  }

  // Don't show PIN setup if user hasn't seen welcome page yet
  const welcomeSeen = localStorage.getItem('welcome-seen') === 'true'

  if (isFirstTime && welcomeSeen) {
    return (
      <div className="fixed inset-0 bg-slate-950 z-[100]">
        <PinInput key="setup" mode="setup" onComplete={handleSetup} />
      </div>
    )
  }

  if (!isLocked) return null

  return (
    <div className="fixed inset-0 bg-slate-950 z-[100]">
      <PinInput
        key={pinKey}
        mode="enter"
        onComplete={handleVerify}
        error={error}
        showBiometric={biometricEnabled}
        authenticating={authenticating}
        onBiometric={handleBiometric}
      />

      <div className="absolute bottom-8 left-0 right-0 flex flex-col items-center gap-6">
        {biometricEnabled && (
          <button
            onClick={() => setShowForgot(true)}
            className="text-sm text-slate-400 hover:text-white cursor-pointer"
          >
            Forgot PIN? Reset with biometric
          </button>
        )}

        <button
          onClick={() => setShowResetConfirm(true)}
          className="text-sm flex items-center gap-2 bg-red-600 text-on-surface py-1 px-4 rounded-md cursor-pointer"
        >
          <Trash2 className="w-4 h-4" />
          Reset App
        </button>
      </div>

      {showResetConfirm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[200] p-6">
          <div className="bg-slate-900 rounded-2xl p-6 max-w-sm w-full space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Reset App?</h3>
              </div>
            </div>

            <p className="text-sm text-slate-400">
              This will permanently delete ALL your data including:
            </p>
            <ul className="text-sm text-slate-400 list-disc list-inside space-y-1">
              <li>Wallets and accounts</li>
              <li>Expenses and income records</li>
              <li>Budgets and categories</li>
              <li>Todo lists and notes</li>
              <li>Security settings (PIN, biometric)</li>
            </ul>
            <p className="text-sm text-slate-400 font-semibold">
              This action cannot be undone.
            </p>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-3 rounded-xl bg-slate-800 text-white font-semibold hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleResetApp}
                className="flex-1 py-3 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600"
              >
                Reset App
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
