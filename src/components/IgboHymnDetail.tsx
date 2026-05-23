import { ChevronLeft, ExternalLink } from 'lucide-react'
import { useMemo } from 'react'
import type { IgboHymn } from '../types/hymn'
import { resolveAccompanimentBandState } from '../lib/accompanimentBandState'
import type { DisplayPreferences } from '../lib/displayPreferences'
import { buildMediaSession } from '../lib/hymnMedia'
import { useHymnDetailLayout } from '../hooks/useHymnDetailLayout'
import { isDesktopLayoutMode } from '../lib/hymnDetailLayout'
import { AccompanimentBand } from './AccompanimentBand'
import { DetailAccompanimentPlayer } from './DetailAccompanimentPlayer'
import { FormattedLyrics } from './FormattedLyrics'
import { HymnDetailShell } from './HymnDetailShell'
import { LyricsScrollColumn } from './LyricsScrollColumn'

interface IgboHymnDetailProps {
  hymn: IgboHymn
  isOnline: boolean
  displayPreferences: DisplayPreferences
  selectedVideoId: string
  onSelectedVideoIdChange: (videoId: string) => void
  onAccompanimentStart: (videoId?: string) => void
  onBack: () => void
}

export function IgboHymnDetail({
  hymn,
  isOnline,
  displayPreferences,
  selectedVideoId,
  onSelectedVideoIdChange,
  onAccompanimentStart,
  onBack,
}: IgboHymnDetailProps) {
  const bandSession = useMemo(
    () => buildMediaSession(hymn, `${hymn.id}. ${hymn.title}`),
    [hymn],
  )

  const hasAccompaniment = Boolean(bandSession)
  const layout = useHymnDetailLayout(hasAccompaniment)
  const fixedAccompanimentPanel = isDesktopLayoutMode(layout.mode)

  const bandState = resolveAccompanimentBandState({
    isOnline,
    hasVideo: Boolean(bandSession?.videoId),
    hasInstrumental: false,
    instrumentalOffline: false,
  })

  return (
    <HymnDetailShell
      layout={layout}
      backButton={
        <button
          onClick={onBack}
          className="mb-3 flex items-center gap-2 text-sm font-medium text-navy-900 dark:text-gold-400"
        >
          <ChevronLeft size={16} /> Back to Igbo Hymns
        </button>
      }
      header={
        <>
          <p className="text-xs font-semibold uppercase tracking-wide text-gold-500">{hymn.category}</p>
          <h1 className="mt-1 font-display text-xl font-bold text-navy-900 dark:text-white md:text-2xl">
            {hymn.title}
          </h1>
          {hymn.subtitle ? (
            <p className="mt-2 text-sm italic text-slate-600 dark:text-slate-300">{hymn.subtitle}</p>
          ) : null}
          {hymn.english_hint ? (
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{hymn.english_hint}</p>
          ) : null}
        </>
      }
      accompaniment={
        <AccompanimentBand state={bandState} layout={layout}>
          {bandSession && bandState === 'online' ? (
            <DetailAccompanimentPlayer
              session={bandSession}
              selectedVideoId={selectedVideoId}
              onSelectedVideoIdChange={onSelectedVideoIdChange}
              instrumentalUrl={null}
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
              <p className="mt-1">{hymn.text_source}</p>
              <a
                href={hymn.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1 font-medium text-gold-600 hover:underline dark:text-gold-400"
              >
                View on GitHub (Abu) <ExternalLink size={12} />
              </a>
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
