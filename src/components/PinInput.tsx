import { useState, useRef, useEffect } from 'react'
import { useSecurity } from '#/lib/security'
import { Lock, Fingerprint, ArrowLeft, ArrowUpCircle } from 'lucide-react'
import { useRouter } from '@tanstack/react-router'

interface PinInputProps {
  mode: 'enter' | 'setup' | 'confirm'
  onComplete: (pin: string) => void
  onCancel?: () => void
  error?: string
}

const PIN_LENGTH = 4

export function PinInput({ mode, onComplete, onCancel, error }: PinInputProps) {
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

  const numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0']

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
          <h1 className="text-2xl font-bold text-white mb-2">
            {mode === 'enter'
              ? 'Enter PIN'
              : mode === 'setup'
                ? 'Create PIN'
                : 'Confirm PIN'}
          </h1>
          <p className="text-slate-400 text-sm text-center">
            {error ||
              (mode === 'enter'
                ? 'Enter your 4-digit PIN to unlock'
                : 'Create a 4-digit PIN to secure your app')}
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
          <div />
          <button
            onClick={handleBackspace}
            className="w-16 h-16 rounded-full bg-slate-800 text-slate-400 text-xl flex items-center justify-center hover:bg-slate-700"
          >
            ←
          </button>
          <div />
        </div>
      </div>
    </div>
  )
}

export function LockScreen() {
  const { isLocked, verifyPin, isFirstTime, setupPin, biometricEnabled, unlock, pinEnabled, removePin, resetPinWithBiometric } = useSecurity()
  const [error, setError] = useState('')
  const [pinKey, setPinKey] = useState(0)
  const [authenticating, setAuthenticating] = useState(false)
  const [showForgot, setShowForgot] = useState(false)
  const router = useRouter()

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
      console.log('Trying biometric auth...')
      
      if (!('PublicKeyCredential' in window)) {
        console.log('WebAuthn not supported')
        return
      }
      
      const credential = await navigator.credentials.get({
        publicKey: {
          challenge: new TextEncoder().encode('authenticate'),
          timeout: 60000,
          userVerification: 'required',
        },
      })
      
      console.log('Credential result:', credential)
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

  if (isFirstTime) {
    return (
      <div className="fixed inset-0 bg-slate-950 z-[100]">
        <PinInput key="setup" mode="setup" onComplete={handleSetup} />
      </div>
    )
  }

  if (!isLocked) return null

  return (
    <div className="fixed inset-0 bg-slate-950 z-[100]">
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        {biometricEnabled && (
          <button
            onClick={handleBiometric}
            disabled={authenticating}
            className="p-3 rounded-full bg-primary/20 text-primary hover:bg-primary/30"
          >
            <Fingerprint className="w-6 h-6" />
          </button>
        )}
      </div>
      <PinInput key={pinKey} mode="enter" onComplete={handleVerify} error={error} />
      {biometricEnabled && (
        <div className="absolute bottom-8 left-0 right-0 text-center">
          <button
            onClick={() => setShowForgot(true)}
            className="text-sm text-slate-400 hover:text-white"
          >
            Forgot PIN? Reset with biometric
          </button>
        </div>
      )}
    </div>
  )
}
