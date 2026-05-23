import { describe, expect, it } from 'vitest'
import {
  getOfflineInstrumentalUrl,
  isInstrumentalOffline,
  type OfflineInstrumentalManifest,
} from './offlineInstrumentals'

const manifest: OfflineInstrumentalManifest = {
  version: '1',
  maxBytes: 52_428_800,
  totalBytes: 4_000_000,
  entries: [
    {
      hymnId: 621,
      title: 'How Great Thou Art',
      assetPath: '/instrumentals/621.mp3',
      bytes: 2_000_000,
    },
  ],
}

describe('offline instrumentals resolver', () => {
  it('returns a bundled asset path for hymns in the manifest', () => {
    expect(getOfflineInstrumentalUrl(manifest, 621)).toBe('/instrumentals/621.mp3')
    expect(isInstrumentalOffline(manifest, 621)).toBe(true)
  })

  it('returns null when the hymn is not bundled', () => {
    expect(getOfflineInstrumentalUrl(manifest, 999)).toBeNull()
    expect(isInstrumentalOffline(manifest, 999)).toBe(false)
  })

  it('treats a missing manifest as stream-only', () => {
    expect(getOfflineInstrumentalUrl(null, 621)).toBeNull()
    expect(isInstrumentalOffline(undefined, 621)).toBe(false)
  })
})
