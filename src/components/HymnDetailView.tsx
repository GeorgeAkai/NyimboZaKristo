import { ChevronLeft, ExternalLink, Languages } from 'lucide-react'
import type { DisplayPreferences } from '../lib/displayPreferences'
import type { HymnDetailModel } from '../lib/hymnDetailModel'
import { useHymnDetailLayout } from '../hooks/useHymnDetailLayout'
import { isDesktopLayoutMode } from '../lib/hymnDetailLayout'
import { AccompanimentBand } from './AccompanimentBand'
import { DetailAccompanimentPlayer } from './DetailAccompanimentPlayer'
import { FormattedLyrics } from './FormattedLyrics'
import { HymnDetailShell } from './HymnDetailShell'
import { LyricsScrollColumn } from './LyricsScrollColumn'

interface HymnDetailViewProps {
  model: HymnDetailModel
  displayPreferences: DisplayPreferences
  selectedVideoId: string
  onSelectedVideoIdChange: (videoId: string) => void
  onAccompanimentStart: (videoId?: string) => void
  onBack: () => void
}

export function HymnDetailView({
  model,
  displayPreferences,
  selectedVideoId,
  onSelectedVideoIdChange,
  onAccompanimentStart,
  onBack,
}: HymnDetailViewProps) {
  const hasAccompaniment =
    Boolean(model.band.session) ||
    Boolean(model.band.instrumentalUrl) ||
    model.band.offlineInstrumental

  const layout = useHymnDetailLayout(hasAccompaniment)
  const fixedAccompanimentPanel = isDesktopLayoutMode(layout.mode)

  return (
    <HymnDetailShell
      layout={layout}
      backButton={
        <button
          onClick={onBack}
          className="mb-3 flex items-center gap-2 text-sm font-medium text-navy-900 dark:text-gold-400"
        >
          <ChevronLeft size={16} /> {model.backLabel}
        </button>
      }
      header={
        <>
          <p className="text-xs font-semibold uppercase tracking-wide text-gold-500">{model.category}</p>
          <h1 className="mt-1 font-display text-xl font-bold text-navy-900 dark:text-white md:text-2xl">
            {model.title}
          </h1>
          {model.subtitle ? (
            <p className="mt-2 text-sm italic text-slate-600 dark:text-slate-300">{model.subtitle}</p>
          ) : null}
          {model.englishHint ? (
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{model.englishHint}</p>
          ) : null}
          {model.languageToggle ? (
            <div className="mt-3 flex items-center justify-between rounded-xl bg-slate-50 p-2.5 dark:bg-navy-950">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                {model.languageToggle.currentLabel}
              </p>
              <button
                onClick={model.languageToggle.onToggle}
                className="inline-flex items-center gap-1 rounded-lg border border-gold-500 px-2 py-1 text-xs font-semibold text-gold-500 md:px-3"
              >
                <Languages size={14} />
                {model.languageToggle.buttonLabel}
              </button>
            </div>
          ) : null}
        </>
      }
      accompaniment={
        <AccompanimentBand
          state={model.band.bandState}
          layout={layout}
          offlineInstrumental={model.band.offlineInstrumental}
        >
          {model.band.showPlayer && model.band.session ? (
            <DetailAccompanimentPlayer
              session={model.band.session}
              selectedVideoId={selectedVideoId}
              onSelectedVideoIdChange={onSelectedVideoIdChange}
              instrumentalUrl={model.band.instrumentalUrl}
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
              <p className="font-semibold text-navy-900 dark:text-gold-400">{model.lyricsFooter.heading}</p>
              {model.lyricsFooter.lines.map((line) => (
                <p key={line} className="mt-1">
                  {line}
                </p>
              ))}
              {model.lyricsFooter.link ? (
                <a
                  href={model.lyricsFooter.link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-1 font-medium text-gold-600 hover:underline dark:text-gold-400"
                >
                  {model.lyricsFooter.link.label} <ExternalLink size={12} />
                </a>
              ) : null}
            </div>
          }
        >
          <FormattedLyrics
            lyrics={model.lyrics}
            hymnTitle={model.title}
            displayPreferences={displayPreferences}
            numberVerses={model.numberVerses}
          />
        </LyricsScrollColumn>
      }
    />
  )
}
