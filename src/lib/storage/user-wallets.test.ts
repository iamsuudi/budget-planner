import { beforeEach, describe, expect, it } from 'vitest'
import {
  addWallet,
  clearAllData,
  deleteWallet,
  getAllWallets,
  getCurrency,
  getUser,
  getWalletById,
  saveUser,
  setCurrency,
  updateWallet,
} from '#/lib/storage'

describe('user & wallets', () => {
  beforeEach(async () => {
    await clearAllData()
  })

  it('returns no user before one is saved', async () => {
    await expect(getUser()).resolves.toBeUndefined()
  })

  it('saves a single user with a stable id', async () => {
    const first = await saveUser({ name: 'Suudi', email: 'suudi@example.com' })
    const second = await saveUser({ name: 'Updated', email: 'x@example.com' })

    expect(first.id).toBe('default-user')
    expect(second.id).toBe('default-user')
    const user = await getUser()
    expect(user?.name).toBe('Updated')
  })

  it('defaults the currency to USD', async () => {
    await expect(getCurrency()).resolves.toBe('USD')
  })

  it('persists a selected currency', async () => {
    await setCurrency('BDT')
    await expect(getCurrency()).resolves.toBe('BDT')
    expect((await getUser())?.currency).toBe('BDT')
  })

  it('adds and lists wallets', async () => {
    const wallet = await addWallet({ name: 'Cash', accountNumber: '001' })
    expect(wallet.id).toBeTruthy()

    const all = await getAllWallets()
    expect(all).toHaveLength(1)
  })

  it('updates a wallet', async () => {
    const wallet = await addWallet({ name: 'Cash', accountNumber: '001' })
    await updateWallet(wallet.id, { name: 'Main Cash' })
    expect((await getWalletById(wallet.id))?.name).toBe('Main Cash')
  })

  it('soft-deletes a wallet', async () => {
    const wallet = await addWallet({ name: 'Cash', accountNumber: '001' })
    await deleteWallet(wallet.id)
    expect(await getAllWallets()).toHaveLength(0)
    expect((await getWalletById(wallet.id))?.deletedAt).toBeGreaterThan(0)
  })
})