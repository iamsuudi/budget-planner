import type { StoreUsage } from '#/hooks/useStorageUsage'

interface StorageBarChartProps {
  data: StoreUsage[]
  totalSize: number
  formatBytes: (bytes: number) => string
}

const COLORS = [
  'bg-violet-500',
  'bg-blue-500',
  'bg-cyan-500',
  'bg-green-500',
  'bg-yellow-500',
  'bg-orange-500',
  'bg-pink-500',
  'bg-red-500',
  'bg-slate-500',
]

export function StorageBarChart({ data, totalSize, formatBytes }: StorageBarChartProps) {
  if (data.length === 0 || totalSize === 0) return null

  const maxSize = Math.max(...data.map((d) => d.size))

  return (
    <div className="space-y-2">
      <div className="flex items-end gap-1 h-24 px-1">
        {data.map((store, index) => {
          const height = maxSize > 0 ? (store.size / maxSize) * 100 : 0
          return (
            <div
              key={store.name}
              className="flex-1 flex flex-col items-center justify-end h-full group"
              title={`${store.name}: ${formatBytes(store.size)}`}
            >
              <span className="text-[10px] text-slate-400 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {formatBytes(store.size)}
              </span>
              <div
                className={`w-full ${COLORS[index % COLORS.length]} rounded-t transition-all hover:opacity-80`}
                style={{ height: `${Math.max(height, 4)}%` }}
              />
            </div>
          )
        })}
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-1">
        {data.map((store, index) => (
          <div key={store.name} className="flex items-center gap-1.5">
            <div
              className={`w-2 h-2 rounded-full ${COLORS[index % COLORS.length]}`}
            />
            <span className="text-[10px] text-on-surface-variant">
              {store.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
