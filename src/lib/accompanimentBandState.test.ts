import { describe, expect, it } from 'vitest'
import { resolveAccompanimentBandState } from './accompanimentBandState'

describe('resolveAccompanimentBandState', () => {
  it('shows empty when a hymn has no linked media', () => {
    expect(
      resolveAccompanimentBandState({
        isOnline: true,
        hasVideo: false,
        hasInstrumental: false,
        instrumentalOffline: false,
      }),
    ).toBe('empty')
  })

  it('blocks video when offline', () => {
    expect(
      resolveAccompanimentBandState({
        isOnline: false,
        hasVideo: true,
        hasInstrumental: true,
        instrumentalOffline: true,
      }),
    ).toBe('offline-video')
  })

  it('blocks non-bundled instrumentals when offline', () => {
    expect(
      resolveAccompanimentBandState({
        isOnline: false,
        hasVideo: false,
        hasInstrumental: true,
        instrumentalOffline: false,
      }),
    ).toBe('offline-audio')
  })

  it('allows bundled instrumentals offline even without video', () => {
    expect(
      resolveAccompanimentBandState({
        isOnline: false,
        hasVideo: false,
        hasInstrumental: true,
        instrumentalOffline: true,
      }),
    ).toBe('online')
  })
})
