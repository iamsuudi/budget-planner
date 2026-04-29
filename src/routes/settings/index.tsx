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
} from 'lucide-react'
import { GlassCard } from '#/components/GlassCard'
import { Page } from '#/components/Page'
import { ToggleSwitch } from '#/components/ToggleSwitch'
import { TopAppBar } from '#/components/TopAppBar'

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
    activateUpdate,
    checkForUpdates,
  } = usePWAUpdate()
  const { usage, quota, loading, formatBytes, percentage } = useStorageUsage()
  const { showToast } = useToast()
  const {
    pinEnabled,
    biometricEnabled,
    biometricAvailable,
    toggleBiometric,
    lock,
  } = useSecurity()
  const isOnline = navigator.onLine

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
    } else if (updateStatus === 'waiting') {
      activateUpdate()
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

  return (
    <div className="">
      <TopAppBar showProfile />

      <Page title="Settings" description="Manage settings of your app here.">
        <div className="flex flex-col gap-6">
          <section>
            <h3 className="text-xs font-semibold text-violet-400 uppercase tracking-widest mb-3">
              Wallet
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
            </GlassCard>
          </section>

          <section>
            <h3 className="text-xs font-semibold text-violet-400 uppercase tracking-widest mb-3">
              General
            </h3>
            <GlassCard className="p-1 flex flex-col gap-1">
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
                          ? 'Enabled'
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
                    onChange={toggleBiometric}
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
              <div className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
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
                {!loading && percentage > 80 && (
                  <span className="text-xs text-orange-400 bg-orange-500/20 px-2 py-1 rounded-lg">
                    {percentage.toFixed(0)}%
                  </span>
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
                        : updateStatus === 'waiting'
                          ? `Tap to activate v${availableVersion}`
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
                {updateStatus === 'waiting' && (
                  <span className="text-xs text-yellow-400 bg-yellow-500/20 px-2 py-1 rounded-lg">
                    Activate
                  </span>
                )}
                {updateStatus === 'downloading' && (
                  <span className="text-xs text-cyan-400 bg-cyan-500/20 px-2 py-1 rounded-lg">
                    {progress}%
                  </span>
                )}
                {(updateStatus === 'idle' ||
                  updateStatus === 'available' ||
                  updateStatus === 'waiting') &&
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

          {/* <section>
            <h3 className="text-xs font-semibold text-violet-400 uppercase tracking-widest mb-3">
              Support & Legal
            </h3>
            <GlassCard className="p-1 flex flex-col gap-1">
              <ActionListItem
                icon="help_center"
                iconBg="bg-tertiary/10"
                iconColor="text-tertiary"
                title="Help Center"
                description=""
                showChevron={false}
              />
              <ActionListItem
                icon="policy"
                iconBg="bg-primary/10"
                iconColor="text-primary"
                title="Privacy Policy"
                description=""
              />
            </GlassCard>
          </section>
          */}

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
    </div>
  )
}
