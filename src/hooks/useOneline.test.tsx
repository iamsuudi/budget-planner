import { describe, expect, it } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { useOnlineStatus } from './useOneline'

describe('useOnlineStatus', () => {
  it('reflects the initial navigator.onLine state', () => {
    const { result } = renderHook(() => useOnlineStatus())
    expect(result.current).toBe(navigator.onLine)
  })

  it('tracks offline/online events', () => {
    const { result } = renderHook(() => useOnlineStatus())

    act(() => {
      window.dispatchEvent(new Event('offline'))
    })
    expect(result.current).toBe(false)

    act(() => {
      window.dispatchEvent(new Event('online'))
    })
    expect(result.current).toBe(true)
  })
})