import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { useSWProgress } from './useSWProgress'

function stubServiceWorker() {
  Object.defineProperty(navigator, 'serviceWorker', {
    value: {},
    configurable: true,
  })
}

describe('useSWProgress', () => {
  beforeEach(() => {
    delete (window as any).swReady
    delete (window as any).swError
    stubServiceWorker()
  })

  afterEach(() => {
    delete (navigator as any).serviceWorker
  })

  it('reports an error when service workers are unsupported', () => {
    delete (navigator as any).serviceWorker
    const { result } = renderHook(() => useSWProgress())
    expect(result.current).toEqual({ progress: 0, status: 'error' })
  })

  it('starts idle with no progress events', () => {
    const { result } = renderHook(() => useSWProgress())
    expect(result.current).toEqual({ progress: 0, status: 'idle' })
  })

  it('tracks install progress events', () => {
    const { result } = renderHook(() => useSWProgress())
    act(() => {
      window.dispatchEvent(
        new CustomEvent('sw-progress', { detail: { percent: 40 } }),
      )
    })
    expect(result.current).toEqual({ progress: 40, status: 'installing' })
  })

  it('becomes ready after the sw-ready event', () => {
    const { result } = renderHook(() => useSWProgress())
    act(() => {
      window.dispatchEvent(new Event('sw-ready'))
    })
    expect(result.current).toEqual({ progress: 100, status: 'ready' })
  })

  it('reports an error after the sw-error event', () => {
    const { result } = renderHook(() => useSWProgress())
    act(() => {
      window.dispatchEvent(new Event('sw-error'))
    })
    expect(result.current).toEqual({ progress: 0, status: 'error' })
  })
})