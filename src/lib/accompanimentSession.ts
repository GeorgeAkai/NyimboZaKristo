import type { EnglishHymn, Hymn, HymnalCollection, IgboHymn } from '../types/hymn'
import { buildMediaSession, resolveActiveVideoId, type MediaSession } from './hymnMedia'
import { resolveInstrumentalPlayback } from './instrumentalSource'
import type { OfflineInstrumentalManifest } from './offlineInstrumentals'
import {
  hymnRefsEqual,
  initialMediaPlaybackState,
  reduceMediaPlayback,
  shouldShowNowPlayingStrip,
  type HymnRef,
  type MediaPlaybackState,
} from './mediaPlaybackController'

export type AccompanimentSessionState = {
  playback: MediaPlaybackState
  mediaSession: MediaSession | null
  detailBandVideoId: string
}

export const initialAccompanimentSessionState: AccompanimentSessionState = {
  playback: initialMediaPlaybackState,
  mediaSession: null,
  detailBandVideoId: '',
}

export type MediaSessionContext = {
  isOnline: boolean
  offlineManifest: OfflineInstrumentalManifest | null
}

export function buildResolvedMediaSession(
  hymn: Hymn | EnglishHymn | IgboHymn,
  collection: HymnalCollection,
  context: MediaSessionContext,
): MediaSession | null {
  const baseSession = buildMediaSession(hymn, `${hymn.id}. ${hymn.title}`)

  if (collection !== 'gccsatx' || !('instrumental_url' in hymn)) {
    return baseSession
  }

  const instrumental = resolveInstrumentalPlayback({
    hymnId: hymn.id,
    remoteUrl: hymn.instrumental_url,
    isOnline: context.isOnline,
    manifest: context.offlineManifest,
  })

  if (baseSession) {
    return { ...baseSession, instrumentalUrl: instrumental.url ?? '' }
  }

  if (!instrumental.url) {
    return null
  }

  return {
    label: `${hymn.id}. ${hymn.title}`,
    youtubeOptions: [],
    videoId: '',
    instrumentalUrl: instrumental.url,
  }
}

export function defaultBandVideoId(hymn: Hymn | EnglishHymn | IgboHymn | null): string {
  if (!hymn) return ''
  return buildMediaSession(hymn)?.videoId ?? ''
}

export function syncDetailHymn(
  state: AccompanimentSessionState,
  hymn: Hymn | EnglishHymn | IgboHymn | null,
): AccompanimentSessionState {
  return {
    ...state,
    detailBandVideoId: defaultBandVideoId(hymn),
  }
}

export function startAccompaniment(
  state: AccompanimentSessionState,
  hymnRef: HymnRef,
  mediaSession: MediaSession,
  videoIdOverride?: string,
): AccompanimentSessionState {
  const videoId = videoIdOverride || state.detailBandVideoId || mediaSession.videoId

  return {
    ...state,
    playback: reduceMediaPlayback(state.playback, {
      type: 'START_ACCOMPANIMENT',
      hymnRef,
      videoId,
    }),
    mediaSession: { ...mediaSession, videoId },
    detailBandVideoId: videoId,
  }
}

export function selectBandVideo(
  state: AccompanimentSessionState,
  videoId: string,
  displayedHymnRef: HymnRef | null,
): AccompanimentSessionState {
  const updatesPlayback =
    state.playback.isPlaying &&
    displayedHymnRef !== null &&
    state.playback.activeHymnRef !== null &&
    hymnRefsEqual(state.playback.activeHymnRef, displayedHymnRef)

  const playback = updatesPlayback
    ? reduceMediaPlayback(state.playback, { type: 'SET_VIDEO_ID', videoId })
    : state.playback

  const mediaSession =
    updatesPlayback && state.mediaSession
      ? { ...state.mediaSession, videoId }
      : state.mediaSession

  return {
    ...state,
    detailBandVideoId: videoId,
    playback,
    mediaSession,
  }
}

export function stopAccompaniment(state: AccompanimentSessionState): AccompanimentSessionState {
  return {
    ...state,
    playback: reduceMediaPlayback(state.playback, { type: 'STOP_ACCOMPANIMENT' }),
    mediaSession: null,
    detailBandVideoId: '',
  }
}

export function activeVideoId(state: AccompanimentSessionState): string {
  if (!state.mediaSession) {
    return state.playback.selectedVideoId
  }

  return resolveActiveVideoId(state.mediaSession, state.playback.selectedVideoId)
}

export function onActiveHymnDetail(
  state: AccompanimentSessionState,
  displayedHymnRef: HymnRef | null,
  isDetailView: boolean,
): boolean {
  return (
    isDetailView &&
    state.playback.activeHymnRef !== null &&
    hymnRefsEqual(state.playback.activeHymnRef, displayedHymnRef)
  )
}

export { hymnRefsEqual, shouldShowNowPlayingStrip, type HymnRef }
