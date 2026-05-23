import type { HymnalCollection } from '../types/hymn'

export type HymnRef = {
  collection: HymnalCollection
  id: number
}

export type MediaPlaybackState = {
  activeHymnRef: HymnRef | null
  selectedVideoId: string
  isPlaying: boolean
}

export const initialMediaPlaybackState: MediaPlaybackState = {
  activeHymnRef: null,
  selectedVideoId: '',
  isPlaying: false,
}

export type MediaPlaybackAction =
  | { type: 'VIEW_HYMN' }
  | { type: 'START_ACCOMPANIMENT'; hymnRef: HymnRef; videoId?: string }
  | { type: 'SET_VIDEO_ID'; videoId: string }
  | { type: 'STOP_ACCOMPANIMENT' }

export function reduceMediaPlayback(
  state: MediaPlaybackState,
  action: MediaPlaybackAction,
): MediaPlaybackState {
  switch (action.type) {
    case 'VIEW_HYMN':
      return state

    case 'START_ACCOMPANIMENT':
      return {
        activeHymnRef: action.hymnRef,
        selectedVideoId: action.videoId ?? '',
        isPlaying: true,
      }

    case 'SET_VIDEO_ID':
      if (!state.activeHymnRef) return state
      return { ...state, selectedVideoId: action.videoId }

    case 'STOP_ACCOMPANIMENT':
      return initialMediaPlaybackState

    default:
      return state
  }
}

export function shouldShowNowPlayingStrip(
  activeHymnRef: HymnRef | null,
  displayedHymnRef: HymnRef | null,
): boolean {
  if (!activeHymnRef || !displayedHymnRef) return false
  return (
    activeHymnRef.collection !== displayedHymnRef.collection ||
    activeHymnRef.id !== displayedHymnRef.id
  )
}

export function hymnRefsEqual(a: HymnRef | null, b: HymnRef | null): boolean {
  if (!a || !b) return false
  return a.collection === b.collection && a.id === b.id
}
