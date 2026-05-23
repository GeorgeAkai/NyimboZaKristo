/** @typedef {{ hymnId: number; title: string; remoteUrl: string; bytes: number }} CandidateTrack */

/** @typedef {{ hymnId: number; title: string; assetPath: string; bytes: number }} OfflineInstrumentalEntry */

/** @typedef {{ version: string; maxBytes: number; totalBytes: number; entries: OfflineInstrumentalEntry[] }} OfflineInstrumentalManifest */

/**
 * Greedily pack tracks in priority order without exceeding maxBytes (ADR-016, ADR-029).
 * @param {object} input
 * @param {CandidateTrack[]} input.candidates priority-ordered
 * @param {number} input.maxBytes
 * @param {string} input.version
 * @returns {OfflineInstrumentalManifest}
 */
export function buildGreedyOfflineManifest({ candidates, maxBytes, version }) {
  /** @type {OfflineInstrumentalEntry[]} */
  const entries = []
  let totalBytes = 0

  for (const track of candidates) {
    if (totalBytes + track.bytes > maxBytes) {
      continue
    }

    entries.push({
      hymnId: track.hymnId,
      title: track.title,
      assetPath: `/instrumentals/${track.hymnId}.mp3`,
      bytes: track.bytes,
    })
    totalBytes += track.bytes
  }

  return {
    version,
    maxBytes,
    totalBytes,
    entries,
  }
}
