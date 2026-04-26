import { useState, useEffect, useCallback } from 'react'

interface StorageUsage {
  usage: number
  quota: number
  appUsage: number
  loading: boolean
}

export function useStorageUsage() {
  const [storage, setStorage] = useState<StorageUsage>({
    usage: 0,
    quota: 0,
    appUsage: 0,
    loading: true,
  })

  const refreshStorage = useCallback(async () => {
    if (!('storage' in navigator)) {
      setStorage((prev) => ({ ...prev, loading: false }))
      return
    }

    const navStorage = navigator.storage

    try {
      const estimate = await navStorage.estimate()
      const usage = estimate.usage ?? 0
      const quota = estimate.quota ?? 0

      let appUsage = 0
      if ('getDirectory' in navStorage) {
        try {
          const root = await navStorage.getDirectory()
          async function getDirSize(dir: FileSystemDirectoryHandle): Promise<number> {
            let size = 0
            for await (const entry of (dir as FileSystemDirectoryHandle & { values: () => AsyncIterable<FileSystemHandle> }).values()) {
              if (entry.kind === 'file') {
                const file = await (entry as FileSystemFileHandle).getFile()
                size += file.size
              } else {
                size += await getDirSize(entry as FileSystemDirectoryHandle)
              }
            }
            return size
          }
          appUsage = await getDirSize(root)
        } catch {
          appUsage = usage
        }
      }

      setStorage({
        usage,
        quota,
        appUsage: appUsage || usage,
        loading: false,
      })
    } catch {
      setStorage((prev) => ({ ...prev, loading: false }))
    }
  }, [])

  useEffect(() => {
    refreshStorage()
  }, [refreshStorage])

  function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
  }

  const percentage = storage.quota > 0 ? (storage.usage / storage.quota) * 100 : 0

  return {
    ...storage,
    refreshStorage,
    formatBytes,
    percentage,
  }
}