export type LyricFontFamily = 'inter' | 'montserrat' | 'merriweather'
export type LyricSize = 'small' | 'medium' | 'large'
export type ThemePreference = 'light' | 'dark' | 'system'

export type DisplayPreferences = {
  lyricFontFamily: LyricFontFamily
  lyricSize: LyricSize
  theme: ThemePreference
}

export type StorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>

const FONT_KEY = 'nzk-lyric-font'
const SIZE_KEY = 'nzk-lyric-size'
const THEME_KEY = 'nzk-theme'

export const DEFAULT_DISPLAY_PREFERENCES: DisplayPreferences = {
  lyricFontFamily: 'merriweather',
  lyricSize: 'medium',
  theme: 'system',
}

const LYRIC_FONT_FAMILIES: LyricFontFamily[] = ['inter', 'montserrat', 'merriweather']
const LYRIC_SIZES: LyricSize[] = ['small', 'medium', 'large']

export const LYRIC_SIZE_CLASSES: Record<LyricSize, string> = {
  small: 'text-base leading-7',
  medium: 'text-lg leading-8',
  large: 'text-xl leading-9',
}

export const LYRIC_FONT_CLASSES: Record<LyricFontFamily, string> = {
  inter: 'font-sans',
  montserrat: 'font-montserrat',
  merriweather: 'font-serif',
}

function parseLyricFontFamily(value: string | null): LyricFontFamily {
  if (value && LYRIC_FONT_FAMILIES.includes(value as LyricFontFamily)) {
    return value as LyricFontFamily
  }
  return DEFAULT_DISPLAY_PREFERENCES.lyricFontFamily
}

function parseLyricSize(value: string | null): LyricSize {
  if (value && LYRIC_SIZES.includes(value as LyricSize)) {
    return value as LyricSize
  }
  return DEFAULT_DISPLAY_PREFERENCES.lyricSize
}

function parseTheme(value: string | null): ThemePreference {
  if (value === 'dark') return 'dark'
  if (value === 'light') return 'light'
  if (value === 'system') return 'system'
  return DEFAULT_DISPLAY_PREFERENCES.theme
}

export function getDisplayPreferences(storage: StorageLike): DisplayPreferences {
  return {
    lyricFontFamily: parseLyricFontFamily(storage.getItem(FONT_KEY)),
    lyricSize: parseLyricSize(storage.getItem(SIZE_KEY)),
    theme: parseTheme(storage.getItem(THEME_KEY)),
  }
}

export function setDisplayPreferences(
  storage: StorageLike,
  partial: Partial<DisplayPreferences>,
): DisplayPreferences {
  const current = getDisplayPreferences(storage)

  if (partial.lyricFontFamily !== undefined) {
    storage.setItem(FONT_KEY, partial.lyricFontFamily)
  }
  if (partial.lyricSize !== undefined) {
    storage.setItem(SIZE_KEY, partial.lyricSize)
  }
  if (partial.theme !== undefined) {
    storage.setItem(THEME_KEY, partial.theme)
  }

  return { ...current, ...partial }
}

export function lyricDisplayClasses(preferences: DisplayPreferences): string {
  return `${LYRIC_SIZE_CLASSES[preferences.lyricSize]} ${LYRIC_FONT_CLASSES[preferences.lyricFontFamily]}`
}

export function resolveEffectiveTheme(
  preference: ThemePreference,
  prefersDark: boolean,
): 'light' | 'dark' {
  if (preference === 'system') {
    return prefersDark ? 'dark' : 'light'
  }
  return preference
}
