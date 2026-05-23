import {
  getOfflineInstrumentalUrl,
  type OfflineInstrumentalManifest,
} from './offlineInstrumentals'

export type InstrumentalPlaybackSource = 'offline' | 'remote' | 'unavailable'

export type InstrumentalPlayback = {
  url: string | null
  source: InstrumentalPlaybackSource
}

export function resolveInstrumentalPlayback(input: {
  hymnId: number
  remoteUrl: string
  isOnline: boolean
  manifest: OfflineInstrumentalManifest | null
}): InstrumentalPlayback {
  const offlineUrl = getOfflineInstrumentalUrl(input.manifest, input.hymnId)
  if (offlineUrl) {
    return { url: offlineUrl, source: 'offline' }
  }

  if (input.remoteUrl.trim()) {
    if (input.isOnline) {
      return { url: input.remoteUrl.trim(), source: 'remote' }
    }
    return { url: null, source: 'unavailable' }
  }

  return { url: null, source: 'unavailable' }
}
