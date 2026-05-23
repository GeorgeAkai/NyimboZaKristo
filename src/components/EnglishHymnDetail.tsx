import { ChevronLeft, ExternalLink } from 'lucide-react'
import { useMemo } from 'react'
import type { EnglishHymn } from '../types/hymn'
import { resolveAccompanimentBandState } from '../lib/accompanimentBandState'
import type { DisplayPreferences } from '../lib/displayPreferences'
import { resolveInstrumentalPlayback } from '../lib/instrumentalSource'
import { buildMediaSession, type MediaSession } from '../lib/hymnMedia'
import type { OfflineInstrumentalManifest } from '../lib/offlineInstrumentals'
import { useHymnDetailLayout } from '../hooks/useHymnDetailLayout'
import { isDesktopLayoutMode } from '../lib/hymnDetailLayout'
import { AccompanimentBand } from './AccompanimentBand'
import { DetailAccompanimentPlayer } from './DetailAccompanimentPlayer'
import { FormattedLyrics } from './FormattedLyrics'
import { HymnDetailShell } from './HymnDetailShell'
import { LyricsScrollColumn } from './LyricsScrollColumn'

interface EnglishHymnDetailProps {
  hymn: EnglishHymn
  isOnline: boolean
  offlineManifest: OfflineInstrumentalManifest | null
  displayPreferences: DisplayPreferences
  selectedVideoId: string
  onSelectedVideoIdChange: (videoId: string) => void
  onAccompanimentStart: (videoId?: string) => void
  onBack: () => void
}

export function EnglishHymnDetail({
  hymn,
  isOnline,
  offlineManifest,
  displayPreferences,
  selectedVideoId,
  onSelectedVideoIdChange,
  onAccompanimentStart,
  onBack,
}: EnglishHymnDetailProps) {
  const bandSession = useMemo(
    () => buildMediaSession(hymn, `${hymn.id}. ${hymn.title}`),
    [hymn],
  )

  const instrumental = useMemo(
    () =>
      resolveInstrumentalPlayback({
        hymnId: hymn.id,
        remoteUrl: hymn.instrumental_url,
        isOnline,
        manifest: offlineManifest,
      }),
    [hymn.id, hymn.instrumental_url, isOnline, offlineManifest],
  )

  const hasAccompaniment = Boolean(
    bandSession || hymn.instrumental_url || instrumental.source === 'offline',
  )
  const layout = useHymnDetailLayout(hasAccompaniment)
  const fixedAccompanimentPanel = isDesktopLayoutMode(layout.mode)

  const bandState = resolveAccompanimentBandState({
    isOnline,
    hasVideo: Boolean(bandSession?.videoId),
    hasInstrumental: Boolean(hymn.instrumental_url) || instrumental.source === 'offline',
    instrumentalOffline: instrumental.source === 'offline',
  })

  const playerSession: MediaSession | null = bandSession
    ? {
        ...bandSession,
        instrumentalUrl: instrumental.url ?? '',
      }
    : instrumental.url
      ? {
          label: `${hymn.id}. ${hymn.title}`,
          youtubeOptions: [],
          videoId: '',
          instrumentalUrl: instrumental.url,
        }
      : null

  return (
    <HymnDetailShell
      layout={layout}
      backButton={
        <button
          onClick={onBack}
          className="mb-3 flex items-center gap-2 text-sm font-medium text-navy-900 dark:text-gold-400"
        >
          <ChevronLeft size={16} /> Back to English Hymns
        </button>
      }
      header={
        <>
          <p className="text-xs font-semibold uppercase tracking-wide text-gold-500">{hymn.category}</p>
          <h1 className="mt-1 font-display text-xl font-bold text-navy-900 dark:text-white md:text-2xl">
            {hymn.title}
          </h1>
        </>
      }
      accompaniment={
        <AccompanimentBand
          state={bandState}
          layout={layout}
          offlineInstrumental={instrumental.source === 'offline'}
        >
          {playerSession && (bandState === 'online' || bandState === 'offline-video') ? (
            <DetailAccompanimentPlayer
              session={playerSession}
              selectedVideoId={selectedVideoId}
              onSelectedVideoIdChange={onSelectedVideoIdChange}
              instrumentalUrl={instrumental.url}
              fixedPanel={fixedAccompanimentPanel}
              onAccompanimentStart={onAccompanimentStart}
            />
          ) : null}
        </AccompanimentBand>
      }
      lyrics={
        <LyricsScrollColumn
          className={`${layout.lyricsClass} px-4 py-4 md:px-5`}
          footer={
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600 dark:border-navy-700 dark:bg-navy-950 dark:text-slate-300">
              <p className="font-semibold text-navy-900 dark:text-gold-400">Lyrics source</p>
              <p className="mt-1">{hymn.hymnal}</p>
              <p className="mt-1">
                Lyrics from{' '}
                <a
                  href="https://gccsatx.com/hymns/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-gold-600 underline dark:text-gold-400"
                >
                  GCCSATX Hymns
                </a>
              </p>
              {hymn.text_copyright && <p className="mt-1">{hymn.text_copyright}</p>}
              {hymn.text_source && (
                <a
                  href={hymn.text_source}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-1 font-medium text-gold-600 hover:underline dark:text-gold-400"
                >
                  View on gccsatx.com <ExternalLink size={12} />
                </a>
              )}
            </div>
          }
        >
          <FormattedLyrics
            lyrics={hymn.lyrics}
            hymnTitle={hymn.title}
            displayPreferences={displayPreferences}
          />
        </LyricsScrollColumn>
      }
    />
  )
}
