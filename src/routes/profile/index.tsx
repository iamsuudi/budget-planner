import { createFileRoute, Link } from '@tanstack/react-router'
import { useGetUser } from '#/hooks/query'
import { ActionListItem } from '#/components/ActionListItem'
import { Page } from '#/components/Page'
import { TopAppBar } from '#/components/TopAppBar'

export const Route = createFileRoute('/profile/')({
  component: ProfilePage,
})

function ProfilePage() {
  const { data: user } = useGetUser()

  const profileImage =
    user?.profilePicture ||
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect fill='%23d0bcff' width='100' height='100'/%3E%3Ctext x='50' y='50' dominant-baseline='middle' text-anchor='middle' fill='%230b1326' font-size='40'%3E%3F%3C/text%3E%3C/svg%3E"

  return (
    <div className="min-h-screen bg-surface-dim text-on-background antialiased">
      <TopAppBar showProfile={true} />

      <Page className="">
        <section className="flex flex-col items-center text-center mb-6">
          <Link
            to="/profile/edit"
            className="relative group mb-3 cursor-pointer"
          >
            <div className="w-20 h-20 rounded-full p-0.5 bg-linear-to-tr from-violet-500 to-secondary glow-violet">
              <div className="w-full h-full rounded-full overflow-hidden border-2 border-surface">
                <img
                  alt="Profile Avatar"
                  className="w-full h-full object-cover"
                  src={profileImage}
                />
              </div>
            </div>
            <button className="absolute bottom-0 right-0 bg-primary-container text-on-primary-container p-1.5 rounded-full shadow-lg border border-white/20 transition-all hover:scale-110 active:scale-95">
              <span className="material-symbols-outlined text-sm">edit</span>
            </button>
          </Link>
          <h1 className="text-xl font-bold text-on-background">
            {user?.name || 'Set your name'}
          </h1>
          <p className="text-slate-400 text-sm">
            {user?.email || 'Add your email'}
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1 px-1">
            Account
          </h2>
          <Link to="/profile/edit">
            <ActionListItem
              icon="person"
              iconBg="bg-surface-container"
              title="Personal Info"
              description={
                user?.name ? 'Edit your profile' : 'Set up your profile'
              }
            />
          </Link>
          <Link to="/settings">
            <ActionListItem
              icon="settings"
              iconBg="bg-surface-container"
              title="Settings"
              description="App preferences and security"
            />
          </Link>
          <ActionListItem
            icon="logout"
            iconBg="bg-error-container/20"
            iconColor="text-error"
            title="Logout"
            description="Securely end session"
            showChevron={false}
            danger
          />
        </section>
      </Page>
    </div>
  )
}
