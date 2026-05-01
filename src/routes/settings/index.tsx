import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { getActiveCurrency } from '#/lib/currency'
import { useToast } from '#/lib/toast'
import { useSecurity } from '#/lib/security'
import { clearAllData } from '#/lib/storage'
import { useGetWallets } from '#/hooks/query'
import { usePWAInstall } from '#/hooks/usePWAInstall'
import { usePWAUpdate } from '#/hooks/usePWAUpdate'
import { useStorageUsage } from '#/hooks/useStorageUsage'
import {
  Building2,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  CircleDollarSign,
  Moon,
  Bell,
  Fingerprint,
  Download,
  RefreshCw,
  HardDrive,
  WifiOff,
  Wifi,
  Trash2,
  LockKeyhole,
  Clock,
} from 'lucide-react'
import { GlassCard } from '#/components/GlassCard'
import { Page } from '#/components/Page'
import { ToggleSwitch } from '#/components/ToggleSwitch'
import { TopAppBar } from '#/components/TopAppBar'
import { StorageBarChart } from '#/components/StorageBarChart'
import type { AuthenticatorType } from '#/lib/security/types'

export const Route = createFileRoute('/settings/')({
  component: SettingsPage,
})

function SettingsPage() {
  const [darkTheme, setDarkTheme] = useState(true)
  const [notifications, setNotifications] = useState(true)
  const [currency, setCurrency] = useState<{ cc: string; name: string }>({
    cc: 'USD',
    name: 'United States dollar',
  })
  const { data: wallets = [] } = useGetWallets()
  const { installStatus, showInstallPrompt } = usePWAInstall()
  const {
    currentVersion,
    availableVersion,
    updateStatus,
    progress,
    acceptUpdate,
    checkForUpdates,
  } = usePWAUpdate()
  const {
    usage,
    quota,
    indexedDBSize,
    otherSize,
    storeBreakdown,
    loading,
    formatBytes,
    percentage,
    refreshStorage,
  } = useStorageUsage()
  const [showStorageDetails, setShowStorageDetails] = useState(false)
  const { showToast } = useToast()
  const {
    pinEnabled,
    biometricEnabled,
    biometricAvailable,
    toggleBiometric,
    lock,
    authenticatorType,
    getAvailableAuthenticators,
    autoLockTime,
    setAutoLockTime,
  } = useSecurity()
  const isOnline = navigator.onLine
  const [showAuthTypeDialog, setShowAuthTypeDialog] = useState(false)
  const [availableAuthTypes, setAvailableAuthTypes] = useState<
    AuthenticatorType[]
  >([])

  useEffect(() => {
    getActiveCurrency().then(setCurrency)
  }, [])

  const handleInstall = async () => {
    if (installStatus !== 'installable') return
    const outcome = await showInstallPrompt()
    if (outcome === 'accepted') {
      showToast('App installed successfully!', 'success')
    }
  }

  const handleUpdate = () => {
    if (updateStatus === 'idle') {
      checkForUpdates()
    } else if (updateStatus === 'available') {
      acceptUpdate()
    }
  }

  const handleDeleteAll = async () => {
    if (
      !confirm(
        'Are you sure you want to delete all data? This cannot be undone.',
      )
    ) {
      return
    }
    await clearAllData()
    showToast('All data has been deleted', 'success')
    window.location.reload()
  }

  const handleBiometricToggle = async (enabled: boolean) => {
    if (enabled && !authenticatorType) {
      // Show authenticator type selection dialog
      const types = await getAvailableAuthenticators()
      setAvailableAuthTypes(types)
      setShowAuthTypeDialog(true)
      return
    }
    try {
      await toggleBiometric(enabled)
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : 'Failed to toggle biometric',
        'error',
      )
    }
  }

  const handleAuthTypeSelect = async (type: AuthenticatorType) => {
    setShowAuthTypeDialog(false)
    try {
      await toggleBiometric(true, type)
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : 'Failed to setup biometric',
        'error',
      )
    }
  }

  const getAuthTypeLabel = (type: AuthenticatorType): string => {
    switch (type) {
      case 'platform':
        return 'This Device (Fingerprint, Face ID, Windows Hello)'
      case 'cross-platform':
        return 'Security Device (USB key, phone, tablet)'
      case 'google-password-manager':
        return 'Google Password Manager'
    }
  }

  return (
    <div className="">
      <TopAppBar showProfile />

      <Page title="Settings" description="Manage settings of your app here.">
        <div className="flex flex-col gap-6">
          <section>
            <h3 className="text-xs font-semibold text-violet-400 uppercase tracking-widest mb-3">
              General
            </h3>
            <GlassCard className="p-1 flex flex-col gap-1">
              <Link
                to="/settings/wallets"
                className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-tertiary/10 flex items-center justify-center text-tertiary">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-on-surface">
                      Wallets
                    </p>
                    <p className="text-xs text-on-surface-variant">
                      {wallets.length} Accounts
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors" />
              </Link>
              <Link
                to="/settings/currency"
                className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-tertiary/10 flex items-center justify-center text-tertiary">
                    <CircleDollarSign className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-on-surface">
                      Base Currency
                    </p>
                    <p className="text-xs text-on-surface-variant">
                      {currency.cc} - {currency.name}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors" />
              </Link>

              <div className="flex items-center justify-between p-3 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-on-primary-fixed-variant/10 flex items-center justify-center text-on-primary-fixed-variant">
                    <Moon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-on-surface">
                      Electric Dark Theme
                    </p>
                  </div>
                </div>
                <ToggleSwitch checked={darkTheme} onChange={setDarkTheme} />
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
                    <Bell className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-on-surface">
                      Push Notifications
                    </p>
                  </div>
                </div>
                <ToggleSwitch
                  checked={notifications}
                  onChange={setNotifications}
                />
              </div>
            </GlassCard>
          </section>

          <section>
            <h3 className="text-xs font-semibold text-violet-400 uppercase tracking-widest mb-3">
              Security
            </h3>
            <GlassCard className="p-1 flex flex-col gap-1">
              <div className="flex items-center justify-between p-3 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-error/10 flex items-center justify-center text-error">
                    <Fingerprint className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-on-surface">
                      Biometric Unlock
                    </p>
                    <p className="text-xs text-on-surface-variant">
                      {!biometricAvailable
                        ? 'Not available on this device'
                        : biometricEnabled
                          ? authenticatorType
                            ? getAuthTypeLabel(authenticatorType)
                            : 'Enabled'
                          : 'Disabled'}
                    </p>
                  </div>
                </div>
                {!biometricAvailable ? (
                  <span className="text-xs text-orange-400 bg-orange-500/20 px-2 py-1 rounded-lg">
                    Not Available
                  </span>
                ) : (
                  <ToggleSwitch
                    checked={biometricEnabled}
                    onChange={handleBiometricToggle}
                    disabled={!pinEnabled && biometricEnabled}
                  />
                )}
              </div>
              <Link
                to="/settings/security/pin"
                className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-slate-400/10 flex items-center justify-center text-slate-300">
                    <LockKeyhole className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-on-surface">
                      Security PIN
                    </p>
                    <p className="text-xs text-on-surface-variant">
                      {pinEnabled ? 'Enabled' : 'Not set'}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors" />
              </Link>
              <div className="flex items-center justify-between p-3 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-400">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-on-surface">
                      Auto-Lock Time
                    </p>
                    <p className="text-xs text-on-surface-variant">
                      Lock after {autoLockTime}{' '}
                      {autoLockTime === 1 ? 'minute' : 'minutes'} of inactivity
                    </p>
                  </div>
                </div>
                <select
                  value={autoLockTime}
                  onChange={(e) => setAutoLockTime(Number(e.target.value))}
                  className=" bg-slate-800 text-white text-sm rounded-lg px-3 py-1.5 border border-slate-700 focus:outline-none focus:border-primary"
                >
                  <option value={1}>1 minute</option>
                  <option value={5}>5 minutes</option>
                  <option value={15}>15 minutes</option>
                  <option value={30}>30 minutes</option>
                  <option value={60}>1 hour</option>
                </select>
              </div>
            </GlassCard>
          </section>

          <section>
            <h3 className="text-xs font-semibold text-violet-400 uppercase tracking-widest mb-3">
              App & Storage
            </h3>
            <GlassCard className="p-1 flex flex-col gap-1">
              <div className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center ${isOnline ? 'bg-green-500/10 text-green-400' : 'bg-slate-500/10 text-slate-400'}`}
                  >
                    {isOnline ? (
                      <Wifi className="w-5 h-5" />
                    ) : (
                      <WifiOff className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-on-surface">
                      Connection Status
                    </p>
                    <p className="text-xs text-on-surface-variant">
                      {isOnline
                        ? 'Online - Data synced'
                        : 'Offline - Using cached data'}
                    </p>
                  </div>
                </div>
              </div>
              <div>
                <div
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                  onClick={() => setShowStorageDetails(!showStorageDetails)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <HardDrive className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-on-surface">
                        Storage Used
                      </p>
                      <p className="text-xs text-on-surface-variant">
                        {loading
                          ? 'Calculating...'
                          : `${formatBytes(usage)} of ${formatBytes(quota)}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        refreshStorage()
                      }}
                      className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                      title="Refresh storage info"
                    >
                      <RefreshCw className="w-4 h-4 text-slate-400" />
                    </button>
                    {!loading && percentage > 80 && (
                      <span className="text-xs text-orange-400 bg-orange-500/20 px-2 py-1 rounded-lg">
                        {percentage.toFixed(0)}%
                      </span>
                    )}
                    {showStorageDetails ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </div>

                {showStorageDetails && !loading && (
                  <div className="px-3 pb-3 space-y-3">
                    <div className="bg-white/5 rounded-lg p-3 space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-on-surface-variant">
                          IndexedDB
                        </span>
                        <span className="text-on-surface font-medium">
                          {formatBytes(indexedDBSize)}
                        </span>
                      </div>
                      {otherSize > 0 && (
                        <div className="flex justify-between text-xs">
                          <span className="text-on-surface-variant">
                            Other (Cache, etc.)
                          </span>
                          <span className="text-on-surface font-medium">
                            {formatBytes(otherSize)}
                          </span>
                        </div>
                      )}
                      {storeBreakdown.length > 0 && (
                        <div className="pt-2 border-t border-white/10">
                          <p className="text-xs text-on-surface font-bold mb-2">
                            Data Breakdown
                          </p>
                          <StorageBarChart
                            data={storeBreakdown}
                            totalSize={indexedDBSize}
                            formatBytes={formatBytes}
                          />
                          <div className="mt-3 space-y-1">
                            {storeBreakdown.map((store) => (
                              <div
                                key={store.name}
                                className="flex justify-between text-xs py-1"
                              >
                                <span className="text-on-surface-variant">
                                  {store.name}
                                </span>
                                <span className="text-on-surface">
                                  {formatBytes(store.size)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <div
                className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                onClick={handleInstall}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400">
                    <Download className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-on-surface">
                      Install App
                    </p>
                    <p className="text-xs text-on-surface-variant">
                      Add to home screen
                    </p>
                  </div>
                </div>
                {installStatus === 'installable' && (
                  <span className="text-xs text-blue-400 bg-blue-500/20 px-2 py-1 rounded-lg">
                    Ready
                  </span>
                )}
                {installStatus === 'installed' && (
                  <span className="text-xs text-green-400 bg-green-500/20 px-2 py-1 rounded-lg">
                    Installed
                  </span>
                )}
                {installStatus === 'not-installable' && (
                  <span className="text-xs text-orange-400 bg-orange-500/20 px-2 py-1 rounded-lg">
                    Not Available
                  </span>
                )}
              </div>
              <div
                className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                onClick={handleUpdate}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-400">
                    <RefreshCw
                      className={`w-5 h-5 ${updateStatus === 'downloading' ? 'animate-spin' : ''}`}
                    />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-on-surface">
                      Update App
                    </p>
                    <p className="text-xs text-on-surface-variant">
                      {updateStatus === 'downloading'
                        ? `Downloading... ${progress}%`
                        : updateStatus === 'available'
                          ? `v${availableVersion} available`
                          : currentVersion
                            ? `v${currentVersion}`
                            : 'Checking...'}
                    </p>
                  </div>
                </div>
                {updateStatus === 'available' && (
                  <span className="text-xs text-green-400 bg-green-500/20 px-2 py-1 rounded-lg">
                    Download
                  </span>
                )}
                {updateStatus === 'downloading' && (
                  <span className="text-xs text-cyan-400 bg-cyan-500/20 px-2 py-1 rounded-lg">
                    {progress}%
                  </span>
                )}
                {(updateStatus === 'idle' || updateStatus === 'available') &&
                  currentVersion &&
                  !availableVersion && (
                    <span className="text-xs text-green-400 bg-green-500/20 px-2 py-1 rounded-lg">
                      Up to Date
                    </span>
                  )}
              </div>
              <div
                className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                onClick={handleDeleteAll}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-red-500/10 flex items-center justify-center text-red-400">
                    <Trash2 className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-on-surface">
                      Delete Data
                    </p>
                    <p className="text-xs text-on-surface-variant">
                      Clear all app data
                    </p>
                  </div>
                </div>
              </div>
            </GlassCard>
          </section>

          <div className="py-6 text-center">
            <p className="text-xs text-slate-500 mb-3">
              Budget Planner v{currentVersion}
            </p>
            <button
              className="px-5 py-2 rounded-full border border-error/30 text-error text-xs font-semibold hover:bg-error/10 transition-colors"
              onClick={() => lock()}
            >
              Log Out
            </button>
          </div>
        </div>
      </Page>

      {showAuthTypeDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-900 w-full max-w-lg rounded-2xl p-6">
            <h3 className="text-xl font-semibold text-white px-1">
              Choose Authenticator Type
            </h3>
            <p className="text-sm text-slate-400 px-1">
              Select how you want to authenticate
            </p>
            <div className="space-y-2 my-5">
              {availableAuthTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => handleAuthTypeSelect(type)}
                  className="text-sm w-full p-3 bg-secondary-container/5 rounded-lg text-secondary-container border border-secondary-container text-left hover:bg-secondary-container/15 transition-colors cursor-pointer"
                >
                  {getAuthTypeLabel(type)}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowAuthTypeDialog(false)}
              className="text-xs w-full p-3 bg-error/5 border border-error rounded-lg text-error cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
