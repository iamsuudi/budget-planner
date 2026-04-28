import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useSecurity } from '#/lib/security'
import { useToast } from '#/lib/toast'
import { Lock, ArrowLeft } from 'lucide-react'
import { PinInput } from '#/components/PinInput'
import { TopAppBar } from '#/components/TopAppBar'
import { Page } from '#/components/Page'

export const Route = createFileRoute('/settings/security/pin')({
  component: PinPage,
})

function PinPage() {
  const { pinEnabled, setupPin, removePin } = useSecurity()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [step, setStep] = useState<'choice' | 'setup' | 'verify'>(
    pinEnabled ? 'choice' : 'setup',
  )
  const [newPin, setNewPin] = useState('')
  const [error, setError] = useState('')

  const handleSetup = async (pin: string) => {
    if (step === 'setup') {
      setNewPin(pin)
      setStep('verify')
      setError('')
    } else if (step === 'verify') {
      if (pin === newPin) {
        await setupPin(pin)
        showToast('PIN set successfully', 'success')
        navigate({ to: '/settings' })
      } else {
        setError('PINs do not match')
        setStep('setup')
        setNewPin('')
      }
    }
  }

  const handleChoice = async (action: 'change' | 'remove') => {
    if (action === 'remove') {
      if (confirm('Are you sure you want to remove PIN security?')) {
        await removePin()
        showToast('PIN removed', 'success')
      }
    } else {
      setStep('setup')
      setError('')
    }
  }

  if (step === 'choice') {
    return (
      <div className="">
        <TopAppBar showBack backTo="/settings" />

        <Page
          title="Security PIN"
          description={'Set up, edit or delete your PIN security.'}
        >
          <div className="space-y-4">
            <button
              onClick={() => handleChoice('change')}
              className="w-full p-4 bg-slate-800 rounded-xl text-white flex items-center justify-between"
            >
              <span>{pinEnabled ? 'Change PIN' : 'Set PIN'}</span>
              <ArrowLeft className="w-5 h-5 rotate-180" />
            </button>
            {pinEnabled && (
              <button
                onClick={() => handleChoice('remove')}
                className="w-full p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 flex items-center justify-between"
              >
                <span>Remove PIN</span>
              </button>
            )}
          </div>
        </Page>
      </div>
    )
  }

  const mode = step === 'setup' ? 'setup' : 'confirm'
  return (
    <div className="fixed inset-0 bg-slate-950 z-100">
      <PinInput key={step} mode={mode} onComplete={handleSetup} error={error} />
    </div>
  )
}
