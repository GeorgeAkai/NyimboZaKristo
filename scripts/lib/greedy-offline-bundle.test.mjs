import { describe, expect, it } from 'vitest'
import { buildGreedyOfflineManifest } from './greedy-offline-bundle.mjs'

const MAX_BYTES = 50

describe('buildGreedyOfflineManifest', () => {
  it('packs tracks in priority order up to the byte ceiling', () => {
    const manifest = buildGreedyOfflineManifest({
      version: 'test',
      maxBytes: MAX_BYTES,
      candidates: [
        { hymnId: 621, title: 'How Great Thou Art', remoteUrl: 'https://a/621.mp3', bytes: 20 },
        { hymnId: 595, title: 'Great Is Thy Faithfulness', remoteUrl: 'https://a/595.mp3', bytes: 20 },
        { hymnId: 856, title: 'What a Friend', remoteUrl: 'https://a/856.mp3', bytes: 20 },
      ],
    })

    expect(manifest.entries.map((e) => e.hymnId)).toEqual([621, 595])
    expect(manifest.totalBytes).toBe(40)
    expect(manifest.entries[0].assetPath).toBe('/instrumentals/621.mp3')
  })

  it('skips a track that would exceed the remaining budget', () => {
    const manifest = buildGreedyOfflineManifest({
      version: 'test',
      maxBytes: MAX_BYTES,
      candidates: [
        { hymnId: 1, title: 'A', remoteUrl: 'https://a/1.mp3', bytes: 45 },
        { hymnId: 2, title: 'B', remoteUrl: 'https://a/2.mp3', bytes: 10 },
        { hymnId: 3, title: 'C', remoteUrl: 'https://a/3.mp3', bytes: 5 },
      ],
    })

    expect(manifest.entries.map((e) => e.hymnId)).toEqual([1, 3])
    expect(manifest.totalBytes).toBe(50)
  })
})
