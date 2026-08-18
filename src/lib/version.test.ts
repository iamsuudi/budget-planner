import { describe, expect, it } from 'vitest'
import {
  compareVersions,
  isVersionEqual,
  isVersionGreaterThan,
  isVersionLessThan,
} from './version'

describe('compareVersions', () => {
  it('returns 0 for identical versions', () => {
    expect(compareVersions('1.1.7', '1.1.7')).toBe(0)
    expect(compareVersions('1.2.3', '1.2.3')).toBe(0)
  })

  it('returns -1 when the first version is lower', () => {
    expect(compareVersions('1.1.9', '1.1.10')).toBe(-1)
    expect(compareVersions('1.0.0', '2.0.0')).toBe(-1)
    expect(compareVersions('1.2.3', '1.3.0')).toBe(-1)
  })

  it('returns 1 when the first version is higher', () => {
    expect(compareVersions('1.1.10', '1.1.9')).toBe(1)
    expect(compareVersions('2.0.0', '1.0.0')).toBe(1)
  })

  it('treats missing segments as zero', () => {
    expect(compareVersions('1.2', '1.2.1')).toBe(-1)
    expect(compareVersions('1.2.1', '1.2')).toBe(1)
    expect(compareVersions('1.2', '1.2.0')).toBe(0)
  })
})

describe('version comparison helpers', () => {
  it('isVersionLessThan detects lower versions', () => {
    expect(isVersionLessThan('1.0.0', '1.1.0')).toBe(true)
    expect(isVersionLessThan('1.1.0', '1.0.0')).toBe(false)
    expect(isVersionLessThan('1.1.0', '1.1.0')).toBe(false)
  })

  it('isVersionGreaterThan detects higher versions', () => {
    expect(isVersionGreaterThan('1.1.0', '1.0.0')).toBe(true)
    expect(isVersionGreaterThan('1.0.0', '1.1.0')).toBe(false)
  })

  it('isVersionEqual detects equality', () => {
    expect(isVersionEqual('1.1.0', '1.1.0')).toBe(true)
    expect(isVersionEqual('1.1.0', '1.2.0')).toBe(false)
  })
})