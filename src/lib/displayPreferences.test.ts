import { describe, expect, it, beforeEach } from 'vitest'
import {
  DEFAULT_DISPLAY_PREFERENCES,
  getDisplayPreferences,
  lyricDisplayClasses,
  resolveEffectiveTheme,
  setDisplayPreferences,
} from './displayPreferences'

function createMemoryStorage(): Storage {
  const store = new Map<string, string>()
  return {
    get length() {
      return store.size
    },
    clear() {
      store.clear()
    },
    getItem(key: string) {
      return store.has(key) ? store.get(key)! : null
    },
    setItem(key: string, value: string) {
      store.set(key, value)
    },
    removeItem(key: string) {
      store.delete(key)
    },
    key() {
      return null
    },
  }
}

describe('display preferences', () => {
  let storage: Storage

  beforeEach(() => {
    storage = createMemoryStorage()
  })

  it('defaults to Medium size and Merriweather when nothing is stored', () => {
    expect(getDisplayPreferences(storage)).toEqual(DEFAULT_DISPLAY_PREFERENCES)
  })

  it('persists lyric font and size changes', () => {
    setDisplayPreferences(storage, { lyricFontFamily: 'inter', lyricSize: 'large' })

    expect(getDisplayPreferences(storage)).toMatchObject({
      lyricFontFamily: 'inter',
      lyricSize: 'large',
      theme: 'system',
    })
  })

  it('falls back to defaults for invalid stored values', () => {
    storage.setItem('nzk-lyric-font', 'comic-sans')
    storage.setItem('nzk-lyric-size', 'huge')
    storage.setItem('nzk-theme', 'sepia')

    expect(getDisplayPreferences(storage)).toEqual(DEFAULT_DISPLAY_PREFERENCES)
  })

  it('maps lyric preferences to typography classes', () => {
    const classes = lyricDisplayClasses({
      lyricFontFamily: 'montserrat',
      lyricSize: 'small',
      theme: 'light',
    })

    expect(classes).toContain('text-base')
    expect(classes).toContain('font-montserrat')
  })

  it('resolves system theme from prefers-color-scheme', () => {
    expect(resolveEffectiveTheme('system', true)).toBe('dark')
    expect(resolveEffectiveTheme('system', false)).toBe('light')
    expect(resolveEffectiveTheme('light', true)).toBe('light')
  })
})
