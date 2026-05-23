import { describe, expect, it } from 'vitest'
import {
  initialMediaPlaybackState,
  reduceMediaPlayback,
  shouldShowNowPlayingStrip,
} from './mediaPlaybackController'

const hymnA = { collection: 'gccsatx' as const, id: 621 }
const hymnB = { collection: 'gccsatx' as const, id: 595 }

describe('media playback controller', () => {
  it('keeps active accompaniment when the user views another hymn', () => {
    const playing = reduceMediaPlayback(initialMediaPlaybackState, {
      type: 'START_ACCOMPANIMENT',
      hymnRef: hymnA,
      videoId: 'abc12345678',
    })

    const afterNavigate = reduceMediaPlayback(playing, { type: 'VIEW_HYMN' })

    expect(afterNavigate.activeHymnRef).toEqual(hymnA)
    expect(afterNavigate.isPlaying).toBe(true)
  })

  it('hands off to a new hymn when the user starts accompaniment there', () => {
    const playingA = reduceMediaPlayback(initialMediaPlaybackState, {
      type: 'START_ACCOMPANIMENT',
      hymnRef: hymnA,
      videoId: 'abc12345678',
    })

    const playingB = reduceMediaPlayback(playingA, {
      type: 'START_ACCOMPANIMENT',
      hymnRef: hymnB,
      videoId: 'xyz98765432',
    })

    expect(playingB.activeHymnRef).toEqual(hymnB)
    expect(playingB.selectedVideoId).toBe('xyz98765432')
    expect(playingB.isPlaying).toBe(true)
  })

  it('stops playback completely when the user dismisses the minimized player', () => {
    const playing = reduceMediaPlayback(initialMediaPlaybackState, {
      type: 'START_ACCOMPANIMENT',
      hymnRef: hymnA,
    })

    const stopped = reduceMediaPlayback(playing, { type: 'STOP_ACCOMPANIMENT' })

    expect(stopped).toEqual(initialMediaPlaybackState)
  })

  it('shows a now-playing strip when the displayed hymn differs from the active hymn', () => {
    expect(shouldShowNowPlayingStrip(hymnA, hymnB)).toBe(true)
    expect(shouldShowNowPlayingStrip(hymnA, hymnA)).toBe(false)
    expect(shouldShowNowPlayingStrip(null, hymnB)).toBe(false)
  })
})
