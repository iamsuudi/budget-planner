import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { getCurrency, setCurrency as saveCurrency } from './storage'
import currencies from './currencies.json'
import type { Currency } from '../types/currency'

export const CURRENCIES: Currency[] = currencies as Currency[]

interface CurrencyContextType {
  currency: Currency
  setCurrency: (code: string) => Promise<void>
  formatAmount: (amount: number) => string
  getSymbol: () => string
}

const CurrencyContext = createContext<CurrencyContextType | null>(null)

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>(() => {
    const defaultCurrency = CURRENCIES.find(c => c.cc === 'USD') || CURRENCIES[0]
    return defaultCurrency
  })

  useEffect(() => {
    getCurrency().then(code => {
      const found = CURRENCIES.find(c => c.cc === code)
      if (found) setCurrencyState(found)
    })
  }, [])

  const setCurrency = async (code: string) => {
    const found = CURRENCIES.find(c => c.cc === code)
    if (found) {
      await saveCurrency(code)
      setCurrencyState(found)
    }
  }

  const formatAmount = (amount: number) => {
    return `${currency.symbol}${amount.toFixed(2)}`
  }

  const getSymbol = () => currency.symbol

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatAmount, getSymbol }}>
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency() {
  const context = useContext(CurrencyContext)
  if (!context) {
    throw new Error('useCurrency must be used within CurrencyProvider')
  }
  return context
}