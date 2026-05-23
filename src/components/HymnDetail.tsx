import { ChevronLeft, Languages } from 'lucide-react'
import { useMemo } from 'react'
import type { Hymn } from '../types/hymn'
import { resolveAccompanimentBandState } from '../lib/accompanimentBandState'
import type { DisplayPreferences } from '../lib/displayPreferences'
import { lyricDisplayClasses } from '../lib/displayPreferences'
import { buildMediaSession } from '../lib/hymnMedia'
import { useHymnDetailLayout } from '../hooks/useHymnDetailLayout'
import { isDesktopLayoutMode } from '../lib/hymnDetailLayout'
import { AccompanimentBand } from './AccompanimentBand'
import { DetailAccompanimentPlayer } from './DetailAccompanimentPlayer'
import { HymnDetailShell } from './HymnDetailShell'

interface HymnDetailProps {
  hymn: Hymn
  language: 'sw' | 'en'
  isOnline: boolean
  displayPreferences: DisplayPreferences
  selectedVideoId: string
  onSelectedVideoIdChange: (videoId: string) => void
  onAccompanimentStart: (videoId?: string) => void
  onToggleLanguage: () => void
  onBack: () => void
}

export function HymnDetail({
  hymn,
  language,
  isOnline,
  displayPreferences,
  selectedVideoId,
  onSelectedVideoIdChange,
  onAccompanimentStart,
  onToggleLanguage,
  onBack,
}: HymnDetailProps) {
  const lyrics = language === 'sw' ? hymn.swahili_lyrics : hymn.english_lyrics
  const typography = lyricDisplayClasses(displayPreferences)

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
          <ChevronLeft size={16} /> Back to hymns
        </button>
      }
      header={
        <>
          <p className="text-xs font-semibold uppercase tracking-wide text-gold-500">{hymn.category}</p>
          <h1 className="mt-1 font-display text-xl font-bold text-navy-900 dark:text-white md:text-2xl">
            {hymn.id}. {hymn.title}
          </h1>
          <div className="mt-3 flex items-center justify-between rounded-xl bg-slate-50 p-2.5 dark:bg-navy-950">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
              {language === 'sw' ? 'Swahili Lyrics' : 'English Lyrics'}
            </p>
            <button
              onClick={onToggleLanguage}
              className="inline-flex items-center gap-1 rounded-lg border border-gold-500 px-2 py-1 text-xs font-semibold text-gold-500 md:px-3"
            >
              <Languages size={14} />
              {language === 'sw' ? 'Switch to English' : 'Badili kwa Kiswahili'}
            </button>
          </div>
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
        <article className={`whitespace-pre-line text-slate-800 dark:text-slate-100 ${typography}`}>
          {lyrics}
        </article>
      }
    />
  )
}
