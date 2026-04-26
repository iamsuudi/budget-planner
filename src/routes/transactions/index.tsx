import { createFileRoute } from '@tanstack/react-router'
import { Page } from '#/components/Page'
import { TopAppBar } from '#/components/TopAppBar'

export const Route = createFileRoute('/transactions/')({
  component: TransactionsPage,
})

function TransactionsPage() {
  return (
    <div className="">
      <TopAppBar />

      <Page>
        <p className="text-slate-500">Transactions page coming soon...</p>
      </Page>
    </div>
  )
}