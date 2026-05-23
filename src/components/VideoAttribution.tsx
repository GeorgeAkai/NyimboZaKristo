import { ExternalLink } from 'lucide-react'
import type { YouTubeOption } from '../types/hymn'

interface VideoAttributionProps {
  videoId: string
  option?: YouTubeOption
  compact?: boolean
}

export function VideoAttribution({ videoId, option, compact = false }: VideoAttributionProps) {
  const videoUrl = option?.video_url || `https://www.youtube.com/watch?v=${videoId}`
  const channelUrl =
    option?.channel_url ||
    (option?.channel
      ? `https://www.youtube.com/results?search_query=${encodeURIComponent(option.channel)}`
      : '')

  if (compact) {
    return (
      <div className="shrink-0 rounded border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] leading-snug text-slate-600 dark:border-navy-700 dark:bg-navy-950 dark:text-slate-300">
        {option?.channel && (
          <p className="truncate">
            {channelUrl ? (
              <a
                href={channelUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-gold-600 underline dark:text-gold-400"
              >
                {option.channel}
              </a>
            ) : (
              option.channel
            )}
          </p>
        )}
        <a
          href={videoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-0.5 font-medium text-gold-600 dark:text-gold-400"
        >
          YouTube <ExternalLink size={10} />
        </a>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600 dark:border-navy-700 dark:bg-navy-950 dark:text-slate-300">
      <p className="font-semibold text-navy-900 dark:text-gold-400">Video credit</p>
      {option?.title && <p className="mt-1 line-clamp-2">{option.title}</p>}
      {option?.channel && (
        <p className="mt-1">
          Channel:{' '}
          {channelUrl ? (
            <a
              href={channelUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-gold-600 underline-offset-2 hover:underline dark:text-gold-400"
            >
              {option.channel}
            </a>
          ) : (
            option.channel
          )}
        </p>
      )}
      <a
        href={videoUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 inline-flex items-center gap-1 font-medium text-gold-600 hover:underline dark:text-gold-400"
      >
        Watch on YouTube <ExternalLink size={12} />
      </a>
      <p className="mt-2 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
        Embedded via YouTube. Audio/video rights belong to the uploader. This app does not host or
        claim ownership of third-party recordings.
      </p>
    </div>
  )
}
