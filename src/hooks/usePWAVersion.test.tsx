import { beforeEach, describe, expect, it } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { usePWAVersion } from './usePWAVersion'

describe('usePWAVersion', () => {
  beforeEach(() => {
    localStorage.clear()
    delete (window as any).currentSWVersion
    delete (window as any).latestSWVersion
  })

  it('returns null versions when nothing is registered', () => {
    const { result } = renderHook(() => usePWAVersion())
    expect(result.current.currentVersion).toBeNull()
    expect(result.current.latestVersion).toBeNull()
  })

  it('reads the registered and latest version on mount', () => {
    localStorage.setItem('swRegisteredVersion', '1.1.9')
    ;(window as any).currentSWVersion = '1.1.9'
    ;(window as any).latestSWVersion = '1.1.10'

    const { result } = renderHook(() => usePWAVersion())
    expect(result.current.currentVersion).toBe('1.1.9')
    expect(result.current.latestVersion).toBe('1.1.10')
  })

  it('updates when the sw-version-detected event fires', () => {
    ;(window as any).currentSWVersion = '1.1.10'
    ;(window as any).latestSWVersion = '1.1.10'

    const { result } = renderHook(() => usePWAVersion())
    act(() => {
      window.dispatchEvent(new Event('sw-version-detected'))
    })
    expect(result.current.currentVersion).toBe('1.1.10')
    expect(result.current.latestVersion).toBe('1.1.10')
  })
})