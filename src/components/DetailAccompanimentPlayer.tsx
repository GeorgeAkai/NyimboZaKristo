import type { MediaSession } from '../lib/hymnMedia'
import { resolveActiveVideoId } from '../lib/hymnMedia'
import { VideoAttribution } from './VideoAttribution'
import { YoutubePlayer } from './YoutubePlayer'

interface DetailAccompanimentPlayerProps {
  session: MediaSession
  selectedVideoId: string
  onSelectedVideoIdChange: (videoId: string) => void
  instrumentalUrl: string | null
  compact?: boolean
  /** Desktop right column: no inner scroll; show full video credits. */
  fixedPanel?: boolean
  onAccompanimentStart?: (videoId?: string) => void
}

export function DetailAccompanimentPlayer({
  session,
  selectedVideoId,
  onSelectedVideoIdChange,
  instrumentalUrl,
  compact = true,
  fixedPanel = false,
  onAccompanimentStart,
}: DetailAccompanimentPlayerProps) {
  const playerCompact = fixedPanel ? false : compact
  const creditsCompact = !fixedPanel && compact
  const activeVideoId = resolveActiveVideoId(session, selectedVideoId)
  const activeOption = session.youtubeOptions.find((option) => option.id === activeVideoId)
  const hasYoutube = Boolean(activeVideoId)
  const hasInstrumental = Boolean(instrumentalUrl)

  const choirSelect =
    session.youtubeOptions.length > 1 ? (
      <div className="space-y-0.5">
        <p className="text-[10px] font-semibold text-slate-600 dark:text-slate-300">Choir/version</p>
        <select
          value={activeVideoId}
          onChange={(event) => {
            const nextVideoId = event.target.value
            onSelectedVideoIdChange(nextVideoId)
            onAccompanimentStart?.(nextVideoId)
          }}
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

  return (
    <div
      className={`flex flex-col gap-2 ${fixedPanel ? 'shrink-0' : 'min-h-0 flex-1 overflow-hidden'}`}
    >
      {hasYoutube ? (
        <>
          {choirSelect}
          <div className="shrink-0" onPointerDown={() => onAccompanimentStart?.(activeVideoId)}>
            <YoutubePlayer videoId={activeVideoId} compact={playerCompact} />
          </div>
          <VideoAttribution
            videoId={activeVideoId}
            option={activeOption}
            compact={creditsCompact}
          />
          {hasInstrumental && instrumentalUrl ? (
            <audio
              controls
              className="h-8 w-full shrink-0"
              src={instrumentalUrl}
                onPlay={() => onAccompanimentStart?.(activeVideoId)}
              >
                <source src={instrumentalUrl} />
              </audio>
            ) : null}
        </>
      ) : hasInstrumental && instrumentalUrl ? (
        <audio
          controls
          className="w-full"
          src={instrumentalUrl}
          onPlay={() => onAccompanimentStart?.()}
        >
          <source src={instrumentalUrl} />
        </audio>
      ) : null}
    </div>
  )
}
