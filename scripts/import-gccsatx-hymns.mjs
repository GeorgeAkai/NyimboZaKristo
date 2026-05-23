/**
 * Import all hymns from https://gccsatx.com/hymns/hymns.json
 *
 * Usage:
 *   node scripts/import-gccsatx-hymns.mjs
 *   node scripts/import-gccsatx-hymns.mjs --merge   # also append to english-hymns.json
 */
import { readFile, writeFile } from 'node:fs/promises'
import {
  isLowQualityLyrics,
  loadGccsatxCatalog,
  lyricsFromGccsatx,
  parseGccLyricsHtml,
} from './lib/gccsatx-lyrics.mjs'

const OUTPUT_PATH = './src/data/gccsatx-hymns.json'
const MERGE_PATH = './src/data/english-hymns.json'

const pickCategory = (title, tags = []) => {
  const blob = `${title} ${tags.join(' ')}`.toLowerCase()
  if (blob.includes('sabbath') || blob.includes('rest')) return 'Sabbath'
  if (
    blob.includes('cross') ||
    blob.includes('jesus') ||
    blob.includes('christ') ||
    blob.includes('calvary') ||
    blob.includes('salvation') ||
    blob.includes('scripture')
  ) {
    return 'Worship'
  }
  return 'Praise'
}

const firstLineFromLyrics = (lyrics) =>
  lyrics
    .split('\n')
    .map((line) => line.replace(/^\d+\s+/, '').trim())
    .find((line) => line.length > 8 && !/^verse\s*\d+$/i.test(line) && !/^chorus$/i.test(line)) ?? ''

const run = async () => {
  const merge = process.argv.includes('--merge')
  const catalog = await loadGccsatxCatalog()
  const hymns = []
  let skipped = 0

  for (const entry of catalog.hymns) {
    const title = entry.title?.trim()
    if (!title) {
      skipped += 1
      continue
    }

    const gcc = lyricsFromGccsatx(entry)
    const lyrics = gcc.lyrics?.trim() ?? ''

    if (!lyrics || isLowQualityLyrics(lyrics)) {
      skipped += 1
      continue
    }

    const firstLine = firstLineFromLyrics(lyrics) || title

    hymns.push({
      id: entry.id,
      slug: entry.slug,
      title,
      first_line: firstLine,
      tune: '',
      lyrics,
      category: pickCategory(title, entry.tags ?? []),
      tags: entry.tags ?? [],
      text_source: gcc.text_source,
      text_copyright: gcc.text_copyright,
      lyrics_source: 'gccsatx',
      hymnal: 'GCCSATX Hymns',
      collection: 'gccsatx',
      youtube_id: '',
      youtube_options: [],
      instrumental_url: gcc.instrumental_url,
    })
  }

  hymns.sort((a, b) => a.title.localeCompare(b.title))

  await writeFile(OUTPUT_PATH, JSON.stringify(hymns, null, 2) + '\n', 'utf8')
  console.log(`Wrote ${hymns.length} hymns to ${OUTPUT_PATH} (skipped ${skipped})`)

  if (merge) {
    let existing = []
    try {
      existing = JSON.parse(await readFile(MERGE_PATH, 'utf8'))
    } catch {
      existing = []
    }
    const baptistOnly = existing.filter((h) => h.collection !== 'gccsatx')
    const merged = [...baptistOnly, ...hymns]
    await writeFile(MERGE_PATH, JSON.stringify(merged, null, 2) + '\n', 'utf8')
    console.log(`Merged into ${MERGE_PATH}: ${merged.length} total`)
  }
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})
