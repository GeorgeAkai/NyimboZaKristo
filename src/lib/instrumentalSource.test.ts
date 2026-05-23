import { describe, expect, it } from 'vitest'
import { resolveInstrumentalPlayback } from './instrumentalSource'

const manifest = {
  version: '1',
  maxBytes: 1000,
  totalBytes: 100,
  entries: [{ hymnId: 621, title: 'A', assetPath: '/instrumentals/621.mp3', bytes: 100 }],
}

describe('resolveInstrumentalPlayback', () => {
  it('prefers bundled audio when available', () => {
    expect(
      resolveInstrumentalPlayback({
        hymnId: 621,
        remoteUrl: 'https://media.example/621.mp3',
        isOnline: false,
        manifest,
      }),
    ).toEqual({ url: '/instrumentals/621.mp3', source: 'offline' })
  })

  it('streams remotely when online and not bundled', () => {
    expect(
      resolveInstrumentalPlayback({
        hymnId: 999,
        remoteUrl: 'https://media.example/999.mp3',
        isOnline: true,
        manifest,
      }),
    ).toEqual({ url: 'https://media.example/999.mp3', source: 'remote' })
  })

  it('marks stream-only tracks unavailable offline', () => {
    expect(
      resolveInstrumentalPlayback({
        hymnId: 999,
        remoteUrl: 'https://media.example/999.mp3',
        isOnline: false,
        manifest,
      }),
    ).toEqual({ url: null, source: 'unavailable' })
  })
})
