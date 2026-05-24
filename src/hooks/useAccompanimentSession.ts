import { useCallback, useState } from 'react'
import type { EnglishHymn, Hymn, HymnalCollection, IgboHymn } from '../types/hymn'
import {
  activeVideoId,
  buildResolvedMediaSession,
  initialAccompanimentSessionState,
  onActiveHymnDetail,
  selectBandVideo,
  startAccompaniment,
  stopAccompaniment,
  syncDetailHymn,
  shouldShowNowPlayingStrip,
  type AccompanimentSessionState,
  type MediaSessionContext,
} from '../lib/accompanimentSession'
import type { HymnRef } from '../lib/mediaPlaybackController'
import { getDisplayedHymnRef, type NavigationSelection } from '../lib/appNavigation'

export function useAccompanimentSession(context: MediaSessionContext, initialHymn: Hymn | EnglishHymn | IgboHymn | null) {
  const [state, setState] = useState<AccompanimentSessionState>(() =>
    syncDetailHymn(initialAccompanimentSessionState, initialHymn),
  )

  const syncDetail = useCallback((hymn: Hymn | EnglishHymn | IgboHymn | null) => {
    setState((prev) => syncDetailHymn(prev, hymn))
  }, [])

  const stop = useCallback(() => {
    setState((prev) => stopAccompaniment(prev))
  }, [])

  const selectVideo = useCallback((videoId: string, selection: NavigationSelection) => {
    const displayedRef = getDisplayedHymnRef(selection)
    setState((prev) => selectBandVideo(prev, videoId, displayedRef))
  }, [])

  const start = useCallback(
    (
      hymn: Hymn | EnglishHymn | IgboHymn,
      collection: HymnalCollection,
      videoIdOverride?: string,
    ) => {
      const session = buildResolvedMediaSession(hymn, collection, context)
      if (!session) return

      const hymnRef: HymnRef = { collection, id: hymn.id }
      setState((prev) => startAccompaniment(prev, hymnRef, session, videoIdOverride))
    },
    [context],
  )

  const startFromSelection = useCallback(
    (selection: NavigationSelection, videoIdOverride?: string) => {
      const hymn = selection.nzkHymn ?? selection.englishHymn ?? selection.igboHymn
      if (!hymn) return

      const collection: HymnalCollection = selection.nzkHymn
        ? 'nzk'
        : selection.englishHymn
          ? 'gccsatx'
          : 'abu'

      start(hymn, collection, videoIdOverride)
    },
    [start],
  )

  const isOnActiveDetail = useCallback(
    (selection: NavigationSelection, isDetailView: boolean) => {
      return onActiveHymnDetail(state, getDisplayedHymnRef(selection), isDetailView)
    },
    [state],
  )

  const showNowPlaying = useCallback(
    (selection: NavigationSelection) => {
      return (
        state.playback.isPlaying &&
        shouldShowNowPlayingStrip(state.playback.activeHymnRef, getDisplayedHymnRef(selection))
      )
    },
    [state],
  )

  return {
    state,
    detailBandVideoId: state.detailBandVideoId,
    mediaSession: state.mediaSession,
    playback: state.playback,
    activeVideoId: activeVideoId(state),
    syncDetail,
    stop,
    selectVideo,
    start,
    startFromSelection,
    isOnActiveDetail,
    showNowPlaying,
  }
}
