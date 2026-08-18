import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, render, screen } from '@testing-library/react'
import { ToastProvider, useToast } from './toast'

function Consumer() {
  const { showToast } = useToast()
  return (
    <button onClick={() => showToast('Hello world', 'success')}>
      trigger
    </button>
  )
}

function renderWithToast() {
  return render(
    <ToastProvider>
      <Consumer />
    </ToastProvider>,
  )
}

describe('ToastProvider', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('shows a toast when triggered', async () => {
    renderWithToast()
    await act(async () => {
      screen.getByRole('button', { name: 'trigger' }).click()
    })
    expect(screen.getByText('Hello world')).toBeInTheDocument()
  })

  it('auto-dismisses a toast after 3 seconds', async () => {
    renderWithToast()
    await act(async () => {
      screen.getByRole('button', { name: 'trigger' }).click()
    })
    expect(screen.getByText('Hello world')).toBeInTheDocument()

    await act(async () => {
      vi.advanceTimersByTime(3000)
    })
    expect(screen.queryByText('Hello world')).not.toBeInTheDocument()
  })

  it('dismisses a toast on click', async () => {
    renderWithToast()
    await act(async () => {
      screen.getByRole('button', { name: 'trigger' }).click()
    })
    const toast = screen.getByText('Hello world')
    await act(async () => {
      toast.click()
    })
    expect(screen.queryByText('Hello world')).not.toBeInTheDocument()
  })
})