import type { AuthenticatorType } from './types'
import { generateChallenge } from './pin-crypto'
import {
  loadPasskeyCredentialId,
  savePasskeyCredentialId,
  getUserId,
} from './local-storage'

export async function detectAuthenticatorTypes(): Promise<AuthenticatorType[]> {
  const types: AuthenticatorType[] = []

  if (!('PublicKeyCredential' in window)) return types

  try {
    const hasPlatform =
      await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
    if (hasPlatform) types.push('platform')
  } catch {}

  types.push('cross-platform')
  types.push('google-password-manager')

  return types
}

export async function authenticateWithBiometric(): Promise<boolean> {
  if (!('PublicKeyCredential' in window)) return false
  try {
    const credentialId = loadPasskeyCredentialId()
    const challenge = generateChallenge()
    const publicKey: PublicKeyCredentialRequestOptions = {
      challenge: challenge as BufferSource,
      timeout: 60000,
    }
    if (credentialId) {
      publicKey.allowCredentials = [
        { id: credentialId.buffer as ArrayBuffer, type: 'public-key' },
      ]
    }
    const credential = await navigator.credentials.get({ publicKey })
    return !!credential
  } catch (error) {
    console.error('Biometric auth failed:', error)
    return false
  }
}

export async function registerBiometric(
  type?: AuthenticatorType,
): Promise<{ success: boolean; authType: AuthenticatorType }> {
  const authType = type || 'cross-platform'

  const pubKeyCredParams: PublicKeyCredentialParameters[] = [
    { type: 'public-key', alg: -7 },
    { type: 'public-key', alg: -257 },
  ]

  const authenticatorSelection: AuthenticatorSelectionCriteria = {
    residentKey: 'required',
    userVerification: 'required',
  }

  if (authType === 'platform') {
    authenticatorSelection.authenticatorAttachment = 'platform'
  } else if (authType === 'cross-platform') {
    authenticatorSelection.authenticatorAttachment = 'cross-platform'
  }

  const userId = getUserId()

  try {
    const credential = await navigator.credentials.create({
      publicKey: {
        challenge: generateChallenge() as BufferSource,
        rp: {
          name: 'Budget Manager',
          id: window.location.hostname,
        },
        user: {
          id: userId,
          name: 'user@budgetmanager',
          displayName: 'Budget Manager User',
        },
        pubKeyCredParams,
        authenticatorSelection,
        timeout: 60000,
      },
    })

    if (!credential) {
      return { success: false, authType }
    }

    savePasskeyCredentialId((credential as PublicKeyCredential).rawId)
    return { success: true, authType }
  } catch (error) {
    console.error('Biometric setup failed:', error)
    return { success: false, authType }
  }
}
