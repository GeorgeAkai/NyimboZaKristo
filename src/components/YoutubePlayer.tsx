import ReactPlayer from 'react-player'

const YOUTUBE_EMBED = 'https://www.youtube-nocookie.com/watch?v='

interface YoutubePlayerProps {
  videoId: string
  /** Compact mobile pinned panel */
  compact?: boolean
}

export function YoutubePlayer({ videoId, compact = false }: YoutubePlayerProps) {
  return (
    <div
      className={`relative w-full shrink-0 touch-manipulation overflow-hidden rounded-lg bg-black ${
        compact ? 'aspect-video min-h-[9.5rem] max-h-[28dvh]' : 'aspect-video max-h-[12.5rem] sm:max-h-none sm:min-h-[10.625rem]'
      }`}
    >
      <ReactPlayer
        key={videoId}
        className="!absolute !inset-0 [&_iframe]:pointer-events-auto [&_iframe]:h-full [&_iframe]:w-full"
        src={`${YOUTUBE_EMBED}${videoId}`}
        controls
        playsInline
        width="100%"
        height="100%"
        config={{
          youtube: {
            rel: 0,
          },
        }}
      />
    </div>
  )
}
