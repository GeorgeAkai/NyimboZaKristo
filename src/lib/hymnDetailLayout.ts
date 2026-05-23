export type LayoutMode =
  | 'portrait-with-media'
  | 'portrait-empty'
  | 'landscape-with-media'
  | 'landscape-empty'
  | 'desktop-with-media'
  | 'desktop-empty'

export type LayoutSpec = {
  mode: LayoutMode
  containerClass: string
  lyricsClass: string
  bandClass: string
  /** When true, lyrics render before the band (left column in side-by-side layouts). */
  lyricsBeforeBand: boolean
}

export type HymnDetailLayoutInput = {
  isPhoneLandscape: boolean
  isDesktop: boolean
  hasAccompaniment: boolean
}

const LANDSCAPE_WITH_MEDIA = {
  containerClass: 'flex h-full min-h-0 flex-row',
  lyricsClass: 'flex min-h-0 min-w-0 basis-[60%] flex-col overflow-y-auto overscroll-contain',
  bandClass:
    'flex min-h-0 min-w-0 basis-[40%] shrink-0 flex-col overflow-hidden border-l border-slate-200 dark:border-navy-800',
  lyricsBeforeBand: true,
} as const

const LANDSCAPE_EMPTY = {
  containerClass: 'flex h-full min-h-0 flex-row',
  lyricsClass: 'flex min-h-0 min-w-0 basis-[85%] flex-col overflow-y-auto overscroll-contain',
  bandClass:
    'flex min-h-0 min-w-0 basis-[15%] shrink-0 flex-col items-center justify-center border-l border-slate-200 dark:border-navy-800',
  lyricsBeforeBand: true,
} as const

/** Desktop: lyrics column scrolls; accompaniment column stays fixed in view. */
const DESKTOP_WITH_MEDIA = {
  containerClass: 'flex h-full min-h-0 max-h-full flex-row overflow-hidden',
  lyricsClass:
    'flex min-h-0 min-w-0 basis-[60%] flex-col overflow-y-auto overscroll-contain',
  bandClass:
    'sticky top-0 flex h-full max-h-full min-h-0 min-w-0 basis-[40%] shrink-0 flex-col overflow-hidden self-start border-l border-slate-200 dark:border-navy-800',
  lyricsBeforeBand: true,
} as const

const DESKTOP_EMPTY = {
  containerClass: 'flex h-full min-h-0 max-h-full flex-row overflow-hidden',
  lyricsClass:
    'flex min-h-0 min-w-0 basis-[85%] flex-col overflow-y-auto overscroll-contain',
  bandClass:
    'sticky top-0 flex h-full max-h-full min-h-0 min-w-0 basis-[15%] shrink-0 flex-col items-center justify-center self-start overflow-hidden border-l border-slate-200 dark:border-navy-800',
  lyricsBeforeBand: true,
} as const

export function isDesktopLayoutMode(mode: LayoutMode): boolean {
  return mode === 'desktop-with-media' || mode === 'desktop-empty'
}

export function resolveHymnDetailLayout(input: HymnDetailLayoutInput): LayoutSpec {
  const { isPhoneLandscape, isDesktop, hasAccompaniment } = input
  const isSideBySide = isPhoneLandscape || isDesktop

  if (isSideBySide) {
    if (hasAccompaniment) {
      return {
        mode: isDesktop ? 'desktop-with-media' : 'landscape-with-media',
        ...(isDesktop ? DESKTOP_WITH_MEDIA : LANDSCAPE_WITH_MEDIA),
      }
    }

    return {
      mode: isDesktop ? 'desktop-empty' : 'landscape-empty',
      ...(isDesktop ? DESKTOP_EMPTY : LANDSCAPE_EMPTY),
    }
  }

  if (hasAccompaniment) {
    return {
      mode: 'portrait-with-media',
      containerClass: 'flex h-full min-h-0 flex-col',
      lyricsClass: 'flex min-h-0 flex-1 flex-col overflow-y-auto',
      bandClass:
        'flex min-h-[35%] max-h-[45%] shrink-0 flex-col overflow-hidden border-b border-slate-200 dark:border-navy-800',
      lyricsBeforeBand: false,
    }
  }

  return {
    mode: 'portrait-empty',
    containerClass: 'flex h-full min-h-0 flex-col',
    lyricsClass: 'flex min-h-0 flex-1 flex-col overflow-y-auto',
    bandClass:
      'flex min-h-[10%] max-h-[20%] shrink-0 flex-col items-center justify-center border-b border-slate-200 dark:border-navy-800',
    lyricsBeforeBand: false,
  }
}
