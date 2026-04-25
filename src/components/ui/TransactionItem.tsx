interface Transaction {
  id: string
  name: string
  category: string
  date: string
  amount: number
  paymentMethod: string
  icon: string
  iconColor: string
}

interface TransactionItemProps {
  transaction: Transaction
}

export function TransactionItem({ transaction }: TransactionItemProps) {
  return (
    <div className="glass-card flex items-center justify-between p-4 rounded-xl hover:bg-surface-container-high transition-colors group cursor-pointer">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${transaction.iconColor}`}>
          <span className="material-symbols-outlined">{transaction.icon}</span>
        </div>
        <div>
          <p className="text-sm font-semibold text-on-surface">{transaction.name}</p>
          <p className="text-xs text-on-surface-variant opacity-60">
            {transaction.category} • {transaction.date}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm font-semibold text-on-surface">
          -${transaction.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </p>
        <p className="text-[10px] text-on-surface-variant uppercase tracking-tighter">
          {transaction.paymentMethod}
        </p>
      </div>
    </div>
  )
}