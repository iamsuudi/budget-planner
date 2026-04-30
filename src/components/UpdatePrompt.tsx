import { usePWAUpdate } from '#/hooks/usePWAUpdate'
import { useToast } from '#/lib/toast'
import { RefreshCw, Download, X } from 'lucide-react'

export function UpdatePrompt() {
  const {
    updateStatus,
    currentVersion,
    availableVersion,
    progress,
    forceUpdate,
    dismissUpdate,
    acceptUpdate,
  } = usePWAUpdate()
  const { showToast } = useToast()

  if (updateStatus === 'idle') return null

  const handleUpdate = () => {
    if (updateStatus === 'available') {
      showToast('Downloading update...', 'info')
      acceptUpdate()
    }
  }

  const canDismiss = !forceUpdate

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-md">
      <div className="flex items-start gap-3 px-4 py-3 rounded-xl border border-cyan-500/30 bg-cyan-500/10 backdrop-blur-md">
        {updateStatus === 'available' && (
          <RefreshCw className="size-5 text-cyan-400 shrink-0 mt-0.5" />
        )}
        {updateStatus === 'downloading' && (
          <Download className="size-5 text-cyan-400 shrink-0 mt-0.5" />
        )}

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-on-surface">
            {updateStatus === 'available' && 'Update Available'}
            {updateStatus === 'downloading' && 'Downloading Update...'}
          </p>
          <p className="text-xs text-on-surface-variant">
            {currentVersion && availableVersion
              ? `v${currentVersion} \u2192 v${availableVersion}`
              : 'New version ready'}
          </p>

          {updateStatus === 'downloading' && (
            <div className="mt-2 w-full bg-white/10 rounded-full h-1.5">
              <div
                className="bg-cyan-400 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}

          {updateStatus === 'available' && (
            <div className="flex items-center gap-2 mt-2">
              <button
                onClick={handleUpdate}
                className="px-3 py-1.5 rounded-lg bg-cyan-500 text-white text-xs font-semibold hover:bg-cyan-600 transition-colors"
              >
                Update
              </button>
              {canDismiss && (
                <button
                  onClick={dismissUpdate}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-on-surface-variant hover:text-on-surface transition-colors"
                >
                  Later
                </button>
              )}
            </div>
          )}
        </div>

        {canDismiss && (
          <button
            onClick={dismissUpdate}
            className="text-on-surface-variant hover:text-on-surface transition-colors shrink-0"
          >
            <X className="size-4" />
          </button>
        )}
      </div>
    </div>
  )
}
