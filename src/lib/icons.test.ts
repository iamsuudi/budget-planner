import { describe, expect, it } from 'vitest'
import { AVAILABLE_ICONS, getIcon, getIconStyle } from './icons'

describe('getIcon', () => {
  it('returns a component for a known icon name', () => {
    expect(getIcon('restaurant')).toBeTruthy()
  })

  it('falls back to a default icon for unknown names', () => {
    const fallback = getIcon('does-not-exist')
    expect(fallback).toBeTruthy()
    expect(fallback).toBe(getIcon(''))
  })
})

describe('getIconStyle', () => {
  it('returns matching style classes for a known icon', () => {
    const style = getIconStyle('restaurant')
    expect(style.bg).toContain('bg-')
    expect(style.border).toContain('border-')
    expect(style.color).toContain('text-')
  })

  it('falls back to the restaurant style for unknown icons', () => {
    expect(getIconStyle('does-not-exist')).toEqual(getIconStyle('restaurant'))
  })
})

describe('AVAILABLE_ICONS', () => {
  it('exposes a non-empty list of icon names', () => {
    expect(AVAILABLE_ICONS.length).toBeGreaterThan(0)
    expect(AVAILABLE_ICONS).toContain('restaurant')
  })
})