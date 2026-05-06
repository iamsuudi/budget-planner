export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt: () => Promise<void>
}

declare global {
  interface Navigator {
    standalone?: boolean
  }

  interface Window {
    deferredInstallPrompt: BeforeInstallPromptEvent | null
    latestSWVersion?: string
    currentSWVersion?: string
    swRegisteredVersion?: string
    swAvailableVersion?: string
    swUpdateRequired?: boolean
    swMinSupportedVersion?: string
    swReady?: boolean
    swError?: boolean
  }
}
