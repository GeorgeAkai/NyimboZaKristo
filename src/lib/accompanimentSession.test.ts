import { describe, expect, it } from 'vitest'
import {
  initialAccompanimentSessionState,
  selectBandVideo,
  startAccompaniment,
  stopAccompaniment,
} from './accompanimentSession'
import type { MediaSession } from './hymnMedia'

const session: MediaSession = {
  label: '1. Test',
  youtubeOptions: [],
  videoId: 'abc12345678',
  instrumentalUrl: '',
}

const hymnRef = { collection: 'gccsatx' as const, id: 621 }

describe('accompanimentSession', () => {
  it('starts and stops accompaniment', () => {
    const playing = startAccompaniment(initialAccompanimentSessionState, hymnRef, session)
    expect(playing.playback.isPlaying).toBe(true)
    expect(playing.mediaSession?.videoId).toBe('abc12345678')

    const stopped = stopAccompaniment(playing)
    expect(stopped.playback.isPlaying).toBe(false)
    expect(stopped.mediaSession).toBeNull()
  })

  it('updates band video for the active hymn only when playing', () => {
    const playing = startAccompaniment(initialAccompanimentSessionState, hymnRef, session)
    const updated = selectBandVideo(playing, 'xyz98765432', hymnRef)

    expect(updated.detailBandVideoId).toBe('xyz98765432')
    expect(updated.playback.selectedVideoId).toBe('xyz98765432')
    expect(updated.mediaSession?.videoId).toBe('xyz98765432')

    const idle = selectBandVideo(initialAccompanimentSessionState, 'xyz98765432', hymnRef)
    expect(idle.detailBandVideoId).toBe('xyz98765432')
    expect(idle.playback.selectedVideoId).toBe('')
  })
})
