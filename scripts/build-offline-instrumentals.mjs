#!/usr/bin/env node
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildGreedyOfflineManifest } from './lib/greedy-offline-bundle.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const MAX_BYTES = 52_428_800

/** ADR-029 seed order (gccsatx hymn ids). */
const SEED_HYMN_IDS = [
  621, 595, 856, 519, 768, 612, 1042, 1084, 1383, 838, 1389,
]

async function headContentLength(url) {
  const response = await fetch(url, { method: 'HEAD' })
  if (!response.ok) {
    throw new Error(`HEAD ${url} failed: ${response.status}`)
  }
  const length = Number(response.headers.get('content-length') ?? 0)
  if (!Number.isFinite(length) || length <= 0) {
    throw new Error(`HEAD ${url} missing content-length`)
  }
  return length
}

async function main() {
  const hymns = JSON.parse(readFileSync(join(root, 'src/data/gccsatx-hymns.json'), 'utf8'))
  const byId = new Map(hymns.map((hymn) => [hymn.id, hymn]))

  const seedHymns = SEED_HYMN_IDS.map((id) => byId.get(id)).filter(Boolean)
  const rest = hymns
    .filter((hymn) => hymn.instrumental_url && !SEED_HYMN_IDS.includes(hymn.id))
    .sort((a, b) => a.id - b.id)

  const ordered = [...seedHymns, ...rest]
  const candidates = []

  for (const hymn of ordered) {
    const bytes = await headContentLength(hymn.instrumental_url)
    candidates.push({
      hymnId: hymn.id,
      title: hymn.title,
      remoteUrl: hymn.instrumental_url,
      bytes,
    })
  }

  const manifest = buildGreedyOfflineManifest({
    version: new Date().toISOString().slice(0, 10),
    maxBytes: MAX_BYTES,
    candidates,
  })

  const outDir = join(root, 'public/instrumentals')
  mkdirSync(outDir, { recursive: true })
  writeFileSync(join(root, 'public/offline-manifest.json'), JSON.stringify(manifest, null, 2))

  console.log(
    `Wrote offline-manifest.json with ${manifest.entries.length} tracks (${manifest.totalBytes} bytes / ${MAX_BYTES} max).`,
  )
  console.log('Download MP3s into public/instrumentals/ in a follow-up step.')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
