import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { useCurrency } from '#/lib/currency-context'
import { TopAppBar } from '#/components/TopAppBar'
import { GlassCard } from '#/components/GlassCard'
import { ToggleSwitch } from '#/components/ToggleSwitch'
import { ActionListItem } from '#/components/ActionListItem'
import { BottomNavBar } from '#/components/BottomNavBar'

export const Route = createFileRoute('/settings/')({
  component: SettingsPage,
})

function SettingsPage() {
  const [darkTheme, setDarkTheme] = useState(true)
  const [notifications, setNotifications] = useState(true)
  const [biometric, setBiometric] = useState(true)
  const { currency } = useCurrency()

  return (
    <div className="min-h-screen bg-background text-on-background">
      <TopAppBar showProfile={true} />

      <main className="pt-20 px-6 max-w-4xl mx-auto">
        {/* Settings Header */}
        <div className="mb-10">
          <h2 className="text-5xl font-extrabold text-primary leading-tight">
            Settings
          </h2>
          <p className="text-on-surface-variant">
            Customize your financial experience
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Preferences Section */}
          <section className="md:col-span-12">
            <h3 className="text-sm font-semibold text-violet-400 uppercase tracking-widest mb-4">
              App Preferences
            </h3>
            <GlassCard className="p-2 flex flex-col gap-2">
              <Link
                to="/expense-category"
                className="flex items-center justify-between p-4 rounded-lg hover:bg-white/5 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-tertiary/10 flex items-center justify-center text-tertiary">
                    <span className="material-symbols-outlined">category</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-on-surface">
                      Expense Categories
                    </p>
                    <p className="text-xs text-on-surface-variant">
                      Manage spending categories & budgets
                    </p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-slate-500 group-hover:text-cyan-400 transition-colors">
                  chevron_right
                </span>
              </Link>
              <div className="flex items-center justify-between p-4 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-tertiary/10 flex items-center justify-center text-tertiary">
                    <span className="material-symbols-outlined">payments</span>
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
                  <div className="flex items-center gap-1 px-3 py-1 bg-surface-container rounded-lg border border-white/5">
                    <span className="text-xs text-primary">{currency.cc}</span>
                    <span className="material-symbols-outlined text-slate-400 text-base">
                      expand_more
                    </span>
                  </div>
                </Link>
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-on-primary-fixed-variant/10 flex items-center justify-center text-on-primary-fixed-variant">
                    <span className="material-symbols-outlined">dark_mode</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-on-surface">
                      Electric Dark Theme
                    </p>
                    <p className="text-xs text-on-surface-variant">
                      High-contrast visual mode
                    </p>
                  </div>
                </div>
                <ToggleSwitch checked={darkTheme} onChange={setDarkTheme} />
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
                    <span className="material-symbols-outlined">
                      notifications_active
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-on-surface">
                      Push Notifications
                    </p>
                    <p className="text-xs text-on-surface-variant">
                      Alerts for unusual spending
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

          {/* Security Section */}
          <section className="md:col-span-12">
            <h3 className="text-sm font-semibold text-violet-400 uppercase tracking-widest mb-4">
              Security
            </h3>
            <GlassCard className="p-2 flex flex-col gap-2">
              <div className="flex items-center justify-between p-4 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-error/10 flex items-center justify-center text-error">
                    <span className="material-symbols-outlined">
                      fingerprint
                    </span>
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

          {/* Support Section */}
          <section className="md:col-span-12">
            <h3 className="text-sm font-semibold text-violet-400 uppercase tracking-widest mb-4">
              Support & Legal
            </h3>
            <GlassCard className="p-2 flex flex-col gap-2">
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

          {/* Footer Meta */}
          <div className="md:col-span-12 py-10 text-center">
            <p className="text-xs text-slate-500 mb-4">
              Vivid Ledger Premium v2.4.0
            </p>
            <button className="px-6 py-2 rounded-full border border-error/30 text-error text-sm font-semibold hover:bg-error/10 transition-colors">
              Logout of All Devices
            </button>
          </div>
        </div>
      </main>

      <BottomNavBar />
    </div>
  )
}
