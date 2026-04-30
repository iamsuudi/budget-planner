import { getDB, generateId } from './db'
import type { User } from '#/types/user'
import type { Wallet } from '#/types/wallet'

export async function getUser(): Promise<User | undefined> {
  const db = await getDB()
  const all = await db.getAll('user')
  return all[0]
}

export async function saveUser(
  user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<User> {
  const db = await getDB()
  const existing = await getUser()
  const now = Date.now()
  const newUser: User = {
    ...user,
    id: existing?.id || 'default-user',
    createdAt: existing?.createdAt || now,
    updatedAt: now,
  }
  await db.put('user', newUser)
  return newUser
}

export async function getCurrency(): Promise<string> {
  const user = await getUser()
  return user?.currency || 'USD'
}

export async function setCurrency(currency: string): Promise<void> {
  const db = await getDB()
  const existing = await getUser()
  const now = Date.now()
  const user: User = {
    id: existing?.id || 'default-user',
    name: existing?.name || '',
    email: existing?.email || '',
    profilePicture: existing?.profilePicture,
    currency,
    createdAt: existing?.createdAt || now,
    updatedAt: now,
  }
  await db.put('user', user)
}

export async function getAllWallets(): Promise<Wallet[]> {
  const db = await getDB()
  const all = await db.getAll('wallets')
  return all
    .filter((w) => !w.deletedAt)
    .sort((a, b) => a.createdAt - b.createdAt)
}

export async function getWalletById(id: string): Promise<Wallet | undefined> {
  const db = await getDB()
  return db.get('wallets', id)
}

export async function addWallet(
  wallet: Omit<Wallet, 'id' | 'createdAt'>,
): Promise<Wallet> {
  const db = await getDB()
  const newWallet: Wallet = {
    ...wallet,
    id: await generateId(),
    createdAt: Date.now(),
  }
  await db.put('wallets', newWallet)
  return newWallet
}

export async function updateWallet(
  id: string,
  updates: Partial<Omit<Wallet, 'id' | 'createdAt'>>,
): Promise<void> {
  const db = await getDB()
  const existing = await db.get('wallets', id)
  if (existing) {
    await db.put('wallets', { ...existing, ...updates })
  }
}

export async function deleteWallet(id: string): Promise<void> {
  const db = await getDB()
  const existing = await db.get('wallets', id)
  if (existing) {
    await db.put('wallets', { ...existing, deletedAt: Date.now() })
  }
}
