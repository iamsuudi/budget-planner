import { createFileRoute, Link } from '@tanstack/react-router'
import { useGetUser } from '#/hooks/query'
import { ActionListItem } from '#/components/ActionListItem'
import { Page } from '#/components/Page'
import { TopAppBar } from '#/components/TopAppBar'
import { useSecurity } from '#/lib/security'

export const Route = createFileRoute('/profile/')({
  component: ProfilePage,
})

function ProfilePage() {
  const { data: user } = useGetUser()
  const { lock } = useSecurity()

  const profileImage = user?.profilePicture

  return (
    <div className="">
      <TopAppBar showProfile />

      <Page className="">
        <section className="flex flex-col items-center text-center mb-6">
          <Link
            to="/profile/edit"
            className="relative group mb-3 cursor-pointer"
          >
            <div className="w-20 h-20 rounded-full p-0.5 bg-linear-to-tr from-violet-500 to-secondary glow-violet">
              <div className="w-full h-full rounded-full overflow-hidden border-2 border-surface">
                <img
                  className="w-full h-full object-cover bg-secondary"
                  src={profileImage}
                />
              </div>
            </div>
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
              iconBg="bg-tertiary/10"
              iconColor="text-tertiary"
              title="Personal Info"
              description={
                user?.name ? 'Edit your profile' : 'Set up your profile'
              }
            />
          </Link>
          <ActionListItem
            icon="help_center"
            iconBg="bg-yellow-500/10"
            iconColor="text-yellow-400"
            title="Help Center"
            description=""
          />
          <ActionListItem
            icon="policy"
            iconBg="bg-blue-500/10"
            iconColor="text-blue-400"
            title="Privacy Policy"
            description=""
          />
        </section>

        <div className="py-6 text-center">
          <p className="text-xs text-slate-500 mb-3">Budget Planner v2.44.6</p>
          <button
            className="px-5 py-2 rounded-full border border-error/30 text-error text-xs font-semibold hover:bg-error/10 transition-colors"
            onClick={() => lock()}
          >
            Log Out
          </button>
        </div>
      </Page>
    </div>
  )
}
