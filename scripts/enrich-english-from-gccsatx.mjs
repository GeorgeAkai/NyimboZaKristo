/**
 * Fix or fill english-hymns.json entries using gccsatx.com/hymns/hymns.json
 *
 * Usage: node scripts/enrich-english-from-gccsatx.mjs
 */
import { readFile, writeFile } from 'node:fs/promises'
import {
  findGccsatxMatch,
  isLowQualityLyrics,
  loadGccsatxCatalog,
  lyricsFromGccsatx,
} from './lib/gccsatx-lyrics.mjs'

const OUTPUT_PATH = './src/data/english-hymns.json'

const run = async () => {
  const hymns = JSON.parse(await readFile(OUTPUT_PATH, 'utf8'))
  const catalog = await loadGccsatxCatalog()
  let updated = 0

  for (const hymn of hymns) {
    if (hymn.lyrics && !isLowQualityLyrics(hymn.lyrics) && hymn.lyrics_source === 'gccsatx') {
      continue
    }
    if (hymn.lyrics && !isLowQualityLyrics(hymn.lyrics) && hymn.lyrics_source === 'hymnary') {
      continue
    }

    const match = findGccsatxMatch(hymn.title, hymn.first_line, catalog)
    if (!match?.hymn) continue

    const gcc = lyricsFromGccsatx(match.hymn)
    if (!gcc.lyrics || isLowQualityLyrics(gcc.lyrics)) continue

    hymn.lyrics = gcc.lyrics
    hymn.text_source = gcc.text_source
    hymn.text_copyright = gcc.text_copyright
    hymn.lyrics_source = gcc.lyrics_source
    if (!hymn.instrumental_url && gcc.instrumental_url) {
      hymn.instrumental_url = gcc.instrumental_url
    }
    updated += 1
    console.log(`Updated #${hymn.id}: ${hymn.title} <- ${match.hymn.title}`)
  }

  await writeFile(OUTPUT_PATH, JSON.stringify(hymns, null, 2) + '\n', 'utf8')
  console.log(`Enriched ${updated} hymns from gccsatx.com`)
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})
