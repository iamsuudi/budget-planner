export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt: () => Promise<void>
}

declare global {
  interface Window {
    deferredInstallPrompt: BeforeInstallPromptEvent | null
    latestSWVersion?: string
    currentSWVersion?: string
    swRegisteredVersion?: string
    swAvailableVersion?: string
    swForceUpdate?: boolean
    swReady?: boolean
    swError?: boolean
  }
}
