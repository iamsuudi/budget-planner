import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { useCurrency } from '#/lib/currency-context'
import { useGetWallets, useGetPaymentMethods } from '#/hooks/query'
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

  const firstPaymentMethod = paymentMethods.at(0)

  return (
    <div className="">
      <TopAppBar showProfile={true} />

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
                to="/wallets"
                className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-tertiary/10 flex items-center justify-center text-tertiary">
                    <span className="material-symbols-outlined text-lg">
                      account_balance
                    </span>
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
                <span className="material-symbols-outlined text-slate-500 group-hover:text-cyan-400 transition-colors">
                  chevron_right
                </span>
              </Link>
              <Link
                to="/payment-method"
                className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
                    <span className="material-symbols-outlined text-lg">
                      credit_card
                    </span>
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
                <span className="material-symbols-outlined text-slate-500 group-hover:text-cyan-400 transition-colors">
                  chevron_right
                </span>
              </Link>
            </GlassCard>
          </section>

          <section>
            <h3 className="text-xs font-semibold text-violet-400 uppercase tracking-widest mb-3">
              General
            </h3>
            <GlassCard className="p-1 flex flex-col gap-1">
              <Link
                to="/expense-category"
                className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-tertiary/10 flex items-center justify-center text-tertiary">
                    <span className="material-symbols-outlined text-lg">
                      category
                    </span>
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
                <span className="material-symbols-outlined text-slate-500 group-hover:text-cyan-400 transition-colors">
                  chevron_right
                </span>
              </Link>
              <div className="flex items-center justify-between p-3 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-tertiary/10 flex items-center justify-center text-tertiary">
                    <span className="material-symbols-outlined text-lg">
                      payments
                    </span>
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
                    <span className="material-symbols-outlined text-slate-400 text-base">
                      expand_more
                    </span>
                  </div>
                </Link>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-on-primary-fixed-variant/10 flex items-center justify-center text-on-primary-fixed-variant">
                    <span className="material-symbols-outlined text-lg">
                      dark_mode
                    </span>
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
                    <span className="material-symbols-outlined text-lg">
                      notifications_active
                    </span>
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
                    <span className="material-symbols-outlined text-lg">
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
