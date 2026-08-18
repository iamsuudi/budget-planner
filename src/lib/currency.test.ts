import { beforeEach, describe, expect, it, vi } from 'vitest'

async function loadFresh(clear = true) {
  vi.resetModules()
  if (clear) {
    const { clearAllData } = await import('#/lib/storage')
    await clearAllData()
  }
  return await import('#/lib/currency')
}

describe('currency', () => {
  beforeEach(async () => {
    vi.resetModules()
    const { clearAllData } = await import('#/lib/storage')
    await clearAllData()
  })

  it('formats amounts with the default currency', async () => {
    const { formatCurrency, getCurrencyCode, getCurrencyName } =
      await loadFresh()
    expect(getCurrencyCode()).toBe('USD')
    expect(formatCurrency(1234.5)).toBe('1234.50 USD')
    expect(getCurrencyName()).toBe('United States dollar')
  })

  it('falls back to USD when the stored currency is unknown', async () => {
    const { getActiveCurrency, setActiveCurrency } = await loadFresh()
    await setActiveCurrency('XXX-NOT-REAL')
    const active = await getActiveCurrency()
    expect(active.cc).toBe('USD')
  })

  it('persists and returns a known active currency', async () => {
    const currency = await loadFresh()
    await currency.setActiveCurrency('EUR')
    expect(currency.getCurrencyCode()).toBe('EUR')
    expect(currency.formatCurrency(10)).toBe('10.00 EUR')

    const fresh = await loadFresh(false)
    const active = await fresh.getActiveCurrency()
    expect(active.cc).toBe('EUR')
    expect(fresh.getCurrencyCode()).toBe('EUR')
  })
})