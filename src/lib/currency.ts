import {
  getCurrency as getCurrencyFromDB,
  setCurrency as saveCurrencyToDB,
} from './storage'
import type { Currency } from '#/types/currency'
import currencies from './currencies.json'

const CURRENCIES: Currency[] = currencies

let currencyCache: Currency | null = null

export async function getActiveCurrency(): Promise<Currency> {
  if (currencyCache) return currencyCache

  const cc = await getCurrencyFromDB()
  const found = CURRENCIES.find((c) => c.cc === cc)
  currencyCache =
    found || CURRENCIES.find((c) => c.cc === 'USD') || CURRENCIES[0]
  return currencyCache
}

export async function setActiveCurrency(cc: string): Promise<void> {
  await saveCurrencyToDB(cc)
  const found = CURRENCIES.find((c) => c.cc === cc)
  if (found) currencyCache = found
}

export function formatCurrency(amount: number): string {
  const activeCC = currencyCache?.cc || 'USD'
  return `${amount.toFixed(2)} ${activeCC}`
}

export function getCurrencyCode(): string {
  return currencyCache?.cc || 'USD'
}

export function getCurrencyName(): string {
  const cc = currencyCache?.cc || 'USD'
  const found = CURRENCIES.find((c) => c.cc === cc)
  return found?.name || ''
}

export { CURRENCIES }
