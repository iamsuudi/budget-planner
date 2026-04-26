import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { useCurrency } from '#/lib/currency-context'
import { useToast } from '#/lib/toast'
import { clearAllData } from '#/lib/storage'
import { useGetWallets, useGetPaymentMethods } from '#/hooks/query'
import { usePWAInstall } from '#/hooks/usePWAInstall'
import { usePWAUpdate } from '#/hooks/usePWAUpdate'
import { useStorageUsage } from '#/hooks/useStorageUsage'
import {
  Building2,
  CreditCard,
  ChevronRight,
  CircleDollarSign,
  Moon,
  Bell,
  Fingerprint,
  ArrowDownUp,
  Download,
  RefreshCw,
  HardDrive,
  WifiOff,
  Wifi,
  FolderOpen,
  Trash2,
} from 'lucide-react'
import { GlassCard } from '#/components/GlassCard'
import { Page } from '#/components/Page'
import { ToggleSwitch } from '#/components/ToggleSwitch'
import { ActionListItem } from '#/components/ActionListItem'
import { TopAppBar } from '#/components/TopAppBar'

export const Route = createFileRoute('/settings/')({
  component: SettingsPage,
})

function SettingsPage() {
  const [darkTheme, setDarkTheme] = useState(true)
  const [notifications, setNotifications] = useState(true)
  const [biometric, setBiometric] = useState(true)
  const { currency } = useCurrency()
  const { data: wallets = [] } = useGetWallets()
  const { data: paymentMethods = [] } = useGetPaymentMethods()
  const { installable, showInstallPrompt } = usePWAInstall()
  const { showUpdate, applyUpdate } = usePWAUpdate()
  const { usage, quota, loading, formatBytes, percentage } = useStorageUsage()
  const { showToast } = useToast()
  const isOnline = navigator.onLine

  const firstPaymentMethod = paymentMethods.at(0)

  const handleInstall = async () => {
    if (!installable) return
    const outcome = await showInstallPrompt()
    if (outcome === 'accepted') {
      showToast('App installed successfully!', 'success')
    }
  }

  const handleUpdate = () => {
    if (!installable || !showUpdate) return
    applyUpdate()
    showToast('Updating app...', 'info')
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

      <Page>
        <div className="mb-6">
          <h2 className="text-3xl font-extrabold text-primary leading-tight">
            Settings
          </h2>
          <p className="text-on-surface-variant text-sm">Customize your app</p>
        </div>

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
                      My Wallets
                    </p>
                    <p className="text-xs text-on-surface-variant">
                      {wallets.length} Bank accounts
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors" />
              </Link>
              <Link
                to="/settings/payment-method"
                className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-on-surface">
                      Payment Methods
                    </p>
                    <p className="text-xs text-on-surface-variant">
                      {firstPaymentMethod
                        ? `Default: ${firstPaymentMethod.name}`
                        : 'Add payment methods'}
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
                to="/settings/expense-category"
                className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-tertiary/10 flex items-center justify-center text-tertiary">
                    <FolderOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-on-surface">
                      Expense Categories
                    </p>
                    <p className="text-xs text-on-surface-variant">
                      Manage spending categories
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors" />
              </Link>
              <div className="flex items-center justify-between p-3 rounded-lg">
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
                <Link to="/settings/currency">
                  <div className="flex items-center gap-1 px-2 py-1 bg-surface-container rounded-lg border border-white/5">
                    <span className="text-xs text-primary">{currency.cc}</span>
                    <ArrowDownUp className="w-3 h-3 text-slate-400" />
                  </div>
                </Link>
              </div>
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
                      Biometric Lock
                    </p>
                    <p className="text-xs text-on-surface-variant">
                      FaceID or Fingerprint
                    </p>
                  </div>
                </div>
                <ToggleSwitch checked={biometric} onChange={setBiometric} />
              </div>
              <ActionListItem
                icon="lock_reset"
                iconBg="bg-slate-700/30"
                iconColor="text-slate-300"
                title="Change Security PIN"
                description="Last updated 2 months ago"
              />
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
                {!installable && (
                  <span className="text-xs text-orange-400 bg-orange-500/20 px-2 py-1 rounded-lg">
                    Not Installable
                  </span>
                )}
              </div>
              <div
                className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                onClick={handleUpdate}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-400">
                    <RefreshCw className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-on-surface">
                      Update App
                    </p>
                    <p className="text-xs text-on-surface-variant">
                      Tap to install new version
                    </p>
                  </div>
                </div>
                {showUpdate ? (
                  <span className="text-xs text-green-400 bg-green-500/20 px-2 py-1 rounded-lg">
                    Available
                  </span>
                ) : (
                  <span className="text-xs text-gray-400 bg-gray-400/20 px-2 py-1 rounded-lg">
                    Latest Version
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

          <section>
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

          <div className="py-6 text-center">
            <p className="text-xs text-slate-500 mb-3">Vivid Ledger v2.4.0</p>
            <button className="px-5 py-2 rounded-full border border-error/30 text-error text-xs font-semibold hover:bg-error/10 transition-colors">
              Logout
            </button>
          </div>
        </div>
      </Page>
    </div>
  )
}
