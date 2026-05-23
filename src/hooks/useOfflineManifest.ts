import { useEffect, useState } from 'react'
import type { OfflineInstrumentalManifest } from '../lib/offlineInstrumentals'

export function useOfflineManifest() {
  const [manifest, setManifest] = useState<OfflineInstrumentalManifest | null>(null)

  useEffect(() => {
    let cancelled = false

    fetch('/offline-manifest.json')
      .then((response) => (response.ok ? response.json() : null))
      .then((data: OfflineInstrumentalManifest | null) => {
        if (!cancelled && data?.entries) {
          setManifest(data)
        }
      })
      .catch(() => {
        /* manifest is optional until build step runs */
      })

    return () => {
      cancelled = true
    }
  }, [])

  return manifest
}
