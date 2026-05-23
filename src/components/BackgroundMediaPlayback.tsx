import type { MediaSession } from '../lib/hymnMedia'
import { DetailAccompanimentPlayer } from './DetailAccompanimentPlayer'

interface BackgroundMediaPlaybackProps {
  session: MediaSession
  selectedVideoId: string
  onSelectedVideoIdChange: (videoId: string) => void
}

/** Keeps media playing when the user leaves the active hymn detail screen. */
export function BackgroundMediaPlayback({
  session,
  selectedVideoId,
  onSelectedVideoIdChange,
}: BackgroundMediaPlaybackProps) {
  return (
    <div className="pointer-events-none fixed -left-[9999px] top-0 h-px w-px overflow-hidden opacity-0">
      <DetailAccompanimentPlayer
        session={session}
        selectedVideoId={selectedVideoId}
        onSelectedVideoIdChange={onSelectedVideoIdChange}
        instrumentalUrl={session.instrumentalUrl || null}
        compact
      />
    </div>
  )
}
