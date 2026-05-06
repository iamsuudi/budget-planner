export function compareVersions(v1: string, v2: string): number {
  const parts1 = v1.split('.').map(Number)
  const parts2 = v2.split('.').map(Number)
  const maxLen = Math.max(parts1.length, parts2.length)
  for (let i = 0; i < maxLen; i++) {
    const p1 = parts1[i] || 0
    const p2 = parts2[i] || 0
    if (p1 < p2) return -1
    if (p1 > p2) return 1
  }
  return 0
}

export function isVersionLessThan(v1: string, v2: string): boolean {
  return compareVersions(v1, v2) < 0
}

export function isVersionGreaterThan(v1: string, v2: string): boolean {
  return compareVersions(v1, v2) > 0
}

export function isVersionEqual(v1: string, v2: string): boolean {
  return compareVersions(v1, v2) === 0
}
