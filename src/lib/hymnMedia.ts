import type { EnglishHymn, Hymn, IgboHymn, YouTubeOption } from '../types/hymn'

export interface MediaSession {
  label: string
  youtubeOptions: YouTubeOption[]
  videoId: string
  instrumentalUrl: string
}

export const MAX_YOUTUBE_OPTIONS = 3

export function isValidYouTubeId(value: string) {
  return /^[a-zA-Z0-9_-]{11}$/.test(value.trim())
}

function isSafeMediaUrl(value?: string) {
  if (!value?.trim()) return false
  try {
    const parsed = new URL(value)
    return parsed.protocol === 'https:'
  } catch {
    return false
  }
}

export function buildMediaSession(
  hymn:
    | Pick<Hymn, 'id' | 'title' | 'youtube_id' | 'youtube_options' | 'instrumental_url'>
    | EnglishHymn
    | IgboHymn,
  label?: string,
): MediaSession | null {
  const youtubeOptions = (hymn.youtube_options ?? [])
    .filter((option) => isValidYouTubeId(option.id))
    .slice(0, MAX_YOUTUBE_OPTIONS)
  const videoId =
    youtubeOptions[0]?.id || (isValidYouTubeId(hymn.youtube_id) ? hymn.youtube_id.trim() : '')
  const instrumentalUrl = isSafeMediaUrl(hymn.instrumental_url) ? hymn.instrumental_url.trim() : ''

  if (!videoId && !instrumentalUrl) return null

  const hymnLabel =
    label ?? ('id' in hymn && hymn.id ? `${hymn.id}. ${hymn.title}` : hymn.title)

  return {
    label: hymnLabel,
    youtubeOptions,
    videoId,
    instrumentalUrl,
  }
}

export function resolveActiveVideoId(session: MediaSession, selectedVideoId: string) {
  const selectedInOptions = session.youtubeOptions.some((option) => option.id === selectedVideoId)
  return selectedInOptions ? selectedVideoId : session.videoId
}
