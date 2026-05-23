import { useState } from 'react'
import { Maximize2, Minimize2, Music2, X } from 'lucide-react'
import type { MediaSession } from '../lib/hymnMedia'
import { resolveActiveVideoId } from '../lib/hymnMedia'
import { VideoAttribution } from './VideoAttribution'
import { YoutubePlayer } from './YoutubePlayer'

interface FloatingMediaPlayerProps {
  session: MediaSession
  selectedVideoId: string
  onSelectedVideoIdChange: (videoId: string) => void
  onClose: () => void
  /** Mobile hymn detail: pin media to top 40% of viewport */
  pinnedTop?: boolean
}

export function FloatingMediaPlayer({
  session,
  selectedVideoId,
  onSelectedVideoIdChange,
  onClose,
  pinnedTop = false,
}: FloatingMediaPlayerProps) {
  const [isMiniPlayer, setIsMiniPlayer] = useState(false)
  const activeVideoId = resolveActiveVideoId(session, selectedVideoId)
  const activeOption = session.youtubeOptions.find((option) => option.id === activeVideoId)
  const hasYoutube = Boolean(activeVideoId)
  const hasInstrumental = Boolean(session.instrumentalUrl)

  const choirSelect =
    session.youtubeOptions.length > 1 ? (
      <div className="space-y-0.5">
        <p className="text-[10px] font-semibold text-slate-600 dark:text-slate-300 md:text-xs">
          Choir/version
        </p>
        <select
          value={activeVideoId}
          onChange={(event) => onSelectedVideoIdChange(event.target.value)}
          className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-700 outline-none dark:border-navy-700 dark:bg-navy-950 dark:text-slate-100"
        >
          {session.youtubeOptions.map((option, index) => (
            <option key={option.id} value={option.id}>
              {index + 1}. {option.channel || 'Unknown channel'}
            </option>
          ))}
        </select>
      </div>
    ) : null

  const mediaContent = (compact: boolean) => {
    if (compact) {
      return (
        <div className="flex min-h-0 flex-1 flex-col gap-1.5">
          {hasYoutube ? (
            <>
              {choirSelect}
              <YoutubePlayer videoId={activeVideoId} compact />
              <div className="min-h-0 flex-1 space-y-1.5 overflow-y-auto overscroll-contain">
                <VideoAttribution videoId={activeVideoId} option={activeOption} compact />
                {hasInstrumental ? (
                  <audio controls className="h-8 w-full shrink-0" src={session.instrumentalUrl}>
                    <source src={session.instrumentalUrl} />
                  </audio>
                ) : null}
              </div>
            </>
          ) : (
            <div className="rounded-lg border border-dashed border-slate-300 px-2 py-2 text-center text-xs text-slate-600 dark:border-navy-700 dark:text-slate-300">
              No YouTube video for this hymn.
            </div>
          )}
        </div>
      )
    }

    return (
      <div className="space-y-2">
        {hasYoutube ? (
          <>
            {choirSelect}
            <YoutubePlayer videoId={activeVideoId} />
            <VideoAttribution videoId={activeVideoId} option={activeOption} />
          </>
        ) : (
          <div className="rounded-lg border border-dashed border-slate-300 px-2 py-2 text-center text-xs text-slate-600 dark:border-navy-700 dark:text-slate-300">
            No YouTube video for this hymn.
          </div>
        )}
        {hasInstrumental ? (
          <audio controls className="w-full" src={session.instrumentalUrl}>
            <source src={session.instrumentalUrl} />
          </audio>
        ) : null}
      </div>
    )
  }

  const floatingChrome = (compact: boolean) => (
    <>
      <div className={`flex items-center justify-between gap-2 ${compact ? 'mb-1 shrink-0' : 'mb-2'}`}>
        <div className="flex min-w-0 flex-1 items-center gap-1.5">
          <Music2 size={compact ? 14 : 15} className="shrink-0 text-gold-500" />
          <div className="min-w-0">
            {!compact && (
              <p className="text-sm font-semibold text-navy-900 dark:text-gold-400">Now playing</p>
            )}
            <p className="truncate text-xs text-slate-600 dark:text-slate-300">{session.label}</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {!compact && (
            <button
              type="button"
              onClick={() => setIsMiniPlayer((prev) => !prev)}
              className="rounded-md p-1 text-slate-600 dark:text-slate-300"
              aria-label={isMiniPlayer ? 'Expand player' : 'Minimize player'}
            >
              {isMiniPlayer ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-slate-600 hover:bg-slate-100 hover:text-navy-900 dark:text-slate-300 dark:hover:bg-navy-800 dark:hover:text-white"
            aria-label="Close player"
          >
            <X size={16} />
          </button>
        </div>
      </div>
      {(!isMiniPlayer || compact) && mediaContent(compact)}
    </>
  )

  if (pinnedTop) {
    return (
      <>
        <div
          className="fixed inset-x-0 top-14 z-40 flex h-[40dvh] max-h-[40dvh] flex-col border-b border-slate-200 bg-white px-3 py-2 shadow-md dark:border-navy-800 dark:bg-navy-900 md:hidden"
          aria-label="Media player"
        >
          {floatingChrome(true)}
        </div>

        <div
          className={`fixed bottom-4 left-1/2 z-30 hidden w-[92%] max-w-md -translate-x-1/2 rounded-2xl border border-slate-200 bg-white p-3 shadow-reverent md:left-auto md:block md:right-6 md:w-full md:max-w-sm md:translate-x-0 dark:border-navy-800 dark:bg-navy-900 ${
            isMiniPlayer ? 'md:h-[82px] md:overflow-hidden' : ''
          }`}
        >
          {floatingChrome(false)}
        </div>
      </>
    )
  }

  return (
    <div
      className={`fixed bottom-4 left-1/2 z-30 w-[92%] max-w-md -translate-x-1/2 rounded-2xl border border-slate-200 bg-white p-3 shadow-reverent transition-all md:left-auto md:right-6 md:w-full md:max-w-sm md:translate-x-0 dark:border-navy-800 dark:bg-navy-900 ${
        isMiniPlayer ? 'h-[82px] overflow-hidden' : ''
      }`}
    >
      {floatingChrome(false)}
    </div>
  )
}
