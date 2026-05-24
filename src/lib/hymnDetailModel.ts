import type { EnglishHymn, Hymn, HymnalCollection, IgboHymn } from '../types/hymn'
import { resolveAccompanimentBandState, type AccompanimentBandState } from './accompanimentBandState'
import {
  buildResolvedMediaSession,
  type MediaSessionContext,
} from './accompanimentSession'
import type { MediaSession } from './hymnMedia'
import { resolveInstrumentalPlayback } from './instrumentalSource'
import type { OfflineInstrumentalManifest } from './offlineInstrumentals'

export type HymnDetailBand = {
  session: MediaSession | null
  bandState: AccompanimentBandState
  instrumentalUrl: string | null
  offlineInstrumental: boolean
  showPlayer: boolean
}

type FooterLink = {
  label: string
  href: string
  external?: boolean
}

export type LyricsFooterData = {
  heading: string
  lines: string[]
  link?: FooterLink
}

export type HymnDetailModel = {
  collection: HymnalCollection
  category: string
  title: string
  lyrics: string
  numberVerses: boolean
  backLabel: string
  subtitle?: string
  englishHint?: string
  languageToggle?: {
    currentLabel: string
    buttonLabel: string
    onToggle: () => void
  }
  band: HymnDetailBand
  lyricsFooter: LyricsFooterData
}

function mediaContext(isOnline: boolean, offlineManifest: OfflineInstrumentalManifest | null): MediaSessionContext {
  return { isOnline, offlineManifest }
}

function bandFromSession(
  session: MediaSession | null,
  isOnline: boolean,
  hasInstrumentalUrl: boolean,
  instrumentalOffline: boolean,
): Pick<HymnDetailBand, 'session' | 'bandState' | 'showPlayer'> {
  const bandState = resolveAccompanimentBandState({
    isOnline,
    hasVideo: Boolean(session?.videoId),
    hasInstrumental: hasInstrumentalUrl || instrumentalOffline,
    instrumentalOffline,
  })

  const showPlayer =
    Boolean(session) && (bandState === 'online' || bandState === 'offline-video')

  return { session, bandState, showPlayer }
}

export function buildNzkDetailModel(
  hymn: Hymn,
  language: 'sw' | 'en',
  isOnline: boolean,
  onToggleLanguage: () => void,
): HymnDetailModel {
  const session = buildResolvedMediaSession(hymn, 'nzk', mediaContext(isOnline, null))
  const bandParts = bandFromSession(session, isOnline, false, false)

  return {
    collection: 'nzk',
    category: hymn.category,
    title: hymn.title,
    lyrics: language === 'sw' ? hymn.swahili_lyrics : hymn.english_lyrics,
    numberVerses: language === 'sw',
    backLabel: 'Back to Nyimbo za Kristo',
    languageToggle: {
      currentLabel: language === 'sw' ? 'Swahili lyrics' : 'English lyrics',
      buttonLabel: language === 'sw' ? 'Switch to English' : 'Badili kwa Kiswahili',
      onToggle: onToggleLanguage,
    },
    band: {
      ...bandParts,
      instrumentalUrl: null,
      offlineInstrumental: false,
    },
    lyricsFooter: {
      heading: 'Lyrics source',
      lines: [
        'Nyimbo za Kristo (Swahili SDA hymnal)',
        language === 'sw'
          ? 'Swahili lyrics from nyimbozakristo.com.'
          : 'English text is a machine-assisted reference, not an official translation.',
      ],
      link: {
        label: 'View on nyimbozakristo.com',
        href: `https://www.nyimbozakristo.com/song/${hymn.id}`,
        external: true,
      },
    },
  }
}

export function buildGccsatxDetailModel(
  hymn: EnglishHymn,
  isOnline: boolean,
  offlineManifest: OfflineInstrumentalManifest | null,
): HymnDetailModel {
  const context = mediaContext(isOnline, offlineManifest)
  const session = buildResolvedMediaSession(hymn, 'gccsatx', context)
  const instrumental = resolveInstrumentalPlayback({
    hymnId: hymn.id,
    remoteUrl: hymn.instrumental_url,
    isOnline,
    manifest: offlineManifest,
  })
  const bandParts = bandFromSession(
    session,
    isOnline,
    Boolean(hymn.instrumental_url) || instrumental.source === 'offline',
    instrumental.source === 'offline',
  )

  const footerLines = [`Lyrics from GCCSATX Hymns (${hymn.hymnal})`]
  if (hymn.text_copyright) footerLines.push(hymn.text_copyright)

  return {
    collection: 'gccsatx',
    category: hymn.category,
    title: hymn.title,
    lyrics: hymn.lyrics,
    numberVerses: false,
    backLabel: 'Back to English Hymns',
    band: {
      ...bandParts,
      instrumentalUrl: instrumental.url,
      offlineInstrumental: instrumental.source === 'offline',
    },
    lyricsFooter: {
      heading: 'Lyrics source',
      lines: footerLines,
      link: hymn.text_source
        ? {
            label: 'View on gccsatx.com',
            href: hymn.text_source,
            external: true,
          }
        : {
            label: 'View on gccsatx.com',
            href: 'https://gccsatx.com/hymns/',
            external: true,
          },
    },
  }
}

export function buildAbuDetailModel(hymn: IgboHymn, isOnline: boolean): HymnDetailModel {
  const session = buildResolvedMediaSession(hymn, 'abu', mediaContext(isOnline, null))
  const bandParts = bandFromSession(session, isOnline, false, false)

  return {
    collection: 'abu',
    category: hymn.category,
    title: hymn.title,
    subtitle: hymn.subtitle || undefined,
    englishHint: hymn.english_hint || undefined,
    lyrics: hymn.lyrics,
    numberVerses: false,
    backLabel: 'Back to Igbo Hymns',
    band: {
      ...bandParts,
      instrumentalUrl: null,
      offlineInstrumental: false,
    },
    lyricsFooter: {
      heading: 'Lyrics source',
      lines: [hymn.hymnal, hymn.text_source],
      link: {
        label: 'View on GitHub (Abu)',
        href: hymn.source_url,
        external: true,
      },
    },
  }
}
