export type OfflineInstrumentalEntry = {
  hymnId: number
  title: string
  assetPath: string
  bytes: number
}

export type OfflineInstrumentalManifest = {
  version: string
  maxBytes: number
  totalBytes: number
  entries: OfflineInstrumentalEntry[]
}

export function isInstrumentalOffline(
  manifest: OfflineInstrumentalManifest | null | undefined,
  hymnId: number,
): boolean {
  return getOfflineInstrumentalEntry(manifest, hymnId) !== null
}

export function getOfflineInstrumentalUrl(
  manifest: OfflineInstrumentalManifest | null | undefined,
  hymnId: number,
): string | null {
  const entry = getOfflineInstrumentalEntry(manifest, hymnId)
  return entry?.assetPath ?? null
}

export function getOfflineInstrumentalEntry(
  manifest: OfflineInstrumentalManifest | null | undefined,
  hymnId: number,
): OfflineInstrumentalEntry | null {
  if (!manifest) return null
  return manifest.entries.find((entry) => entry.hymnId === hymnId) ?? null
}
