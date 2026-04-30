export function generateChallenge(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(32))
}

export async function hashPin(pin: string, salt: Uint8Array): Promise<string> {
  const encoder = new TextEncoder()
  const pinData = encoder.encode(pin)
  const saltedData = new Uint8Array([...salt, ...pinData])
  const hashBuffer = await crypto.subtle.digest('SHA-256', saltedData)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
  const saltHex = Array.from(salt)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
  return `${saltHex}:${hashHex}`
}

export async function verifyPinHash(
  pin: string,
  storedHash: string,
): Promise<boolean> {
  const [saltHex, hashHex] = storedHash.split(':')
  if (!saltHex || !hashHex) return false
  const saltBytes = saltHex.match(/.{1,2}/g)
  if (!saltBytes) return false
  const salt = new Uint8Array(saltBytes.map((byte) => parseInt(byte, 16)))
  const encoder = new TextEncoder()
  const pinData = encoder.encode(pin)
  const saltedData = new Uint8Array([...salt, ...pinData])
  const hashBuffer = await crypto.subtle.digest('SHA-256', saltedData)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const newHashHex = hashArray
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
  return newHashHex === hashHex
}
