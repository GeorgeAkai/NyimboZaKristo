/**
 * Import Baptist Hymnal 2008 (BH2008) from Hymnary.org into src/data/english-hymns.json.
 *
 * Usage:
 *   node scripts/import-baptist-hymnal.mjs
 *   node scripts/import-baptist-hymnal.mjs --from 1 --to 50
 *   node scripts/import-baptist-hymnal.mjs --resume
 */
import { readFile, writeFile } from 'node:fs/promises'
import { load } from 'cheerio'
import {
  findGccsatxMatch,
  isLowQualityLyrics,
  loadGccsatxCatalog,
  lyricsFromGccsatx,
} from './lib/gccsatx-lyrics.mjs'

const HYMNAL_CODE = 'BH2008'
const BASE_URL = 'https://hymnary.org'
const OUTPUT_PATH = './src/data/english-hymns.json'
const SLEEP_MS = 350
const INDEX_PAGES = 7 // pages 0-6 cover hymns 1-674

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const decodeHtml = (value) =>
  value
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&hellip;/g, '…')

const pickCategory = (title, topics = '') => {
  const blob = `${title} ${topics}`.toLowerCase()
  if (blob.includes('sabbath') || blob.includes('rest') || blob.includes('lord\'s day')) {
    return 'Sabbath'
  }
  if (
    blob.includes('cross') ||
    blob.includes('jesus') ||
    blob.includes('christ') ||
    blob.includes('calvary') ||
    blob.includes('salvation') ||
    blob.includes('blood') ||
    blob.includes('lamb')
  ) {
    return 'Worship'
  }
  return 'Praise'
}

const htmlToLyrics = (html) => {
  const $ = load(`<div>${html}</div>`)
  const paragraphs = []
  $('p').each((_, el) => {
    const raw = $(el).html() ?? ''
    const lines = raw
      .split(/<br\s*\/?>/i)
      .map((line) => decodeHtml(load(`<span>${line}</span>`).text().replace(/\s+/g, ' ').trim()))
      .filter(Boolean)
    if (lines.length) paragraphs.push(lines.join('\n'))
  })

  const joined = paragraphs.join('\n\n').trim()
  return joined.replace(/^\d+\s+/gm, (match, offset, str) => {
    // Keep stanza numbers when they start a paragraph block
    const before = str.slice(0, offset)
    if (before.endsWith('\n\n') || offset === 0) return match
    return match
  })
}

const parseIndexPage = async (page) => {
  const response = await fetch(`${BASE_URL}/hymnal/${HYMNAL_CODE}?page=${page}`)
  if (!response.ok) throw new Error(`Failed hymnal index page ${page}`)
  const html = await response.text()
  const $ = load(html)
  const rows = []

  $('tr.result-row').each((_, row) => {
    const numberLink = $(row).find('td').first().find('a').first()
    const titleLink = $(row).find('td').eq(1).find('a').first()
    const tuneLink = $(row).find('td').eq(2).find('a').first()
    const id = Number(numberLink.text().trim())
    const title = titleLink.text().trim()
    const tune = tuneLink.text().trim()
    if (id && title) rows.push({ id, title, tune })
  })

  return rows
}

const parseHymnTextSlug = async (id) => {
  const response = await fetch(`${BASE_URL}/hymn/${HYMNAL_CODE}/${id}`)
  if (!response.ok) throw new Error(`Failed hymn page ${id}`)
  const html = await response.text()
  const $ = load(html)

  const textHref =
    $('a[href^="/text/"]').first().attr('href') ||
    $('td a[href^="/text/"]').first().attr('href') ||
    ''

  const author = $('th')
    .filter((_, el) => $(el).text().trim().toLowerCase() === 'author:')
    .first()
    .next('td')
    .text()
    .trim()

  const topics = $('th')
    .filter((_, el) => $(el).text().trim().toLowerCase() === 'topic:')
    .first()
    .next('td')
    .text()
    .trim()

  return {
    textSlug: textHref.replace(/^\/text\//, ''),
    author,
    topics,
  }
}

const parseTextPage = async (textSlug) => {
  const response = await fetch(`${BASE_URL}/text/${textSlug}`)
  if (!response.ok) throw new Error(`Failed text page ${textSlug}`)
  const html = await response.text()
  const $ = load(html)

  const lyricsBlock = $('#at_fulltext [property="text"]').first().html() ?? ''
  const lyrics = htmlToLyrics(lyricsBlock)

  let textCopyright = ''
  $('th').each((_, el) => {
    if ($(el).text().trim().toLowerCase() === 'copyright:') {
      textCopyright = $(el).next('td').text().trim()
    }
  })

  const displayTitle =
    $('h1').first().text().trim() ||
    $('td')
      .filter((_, cell) => $(cell).text().trim().toLowerCase() === 'title:')
      .first()
      .next('td')
      .text()
      .trim()

  const firstLine =
    $('td')
      .filter((_, cell) => $(cell).text().trim().toLowerCase() === 'first line:')
      .first()
      .next('td')
      .text()
      .trim() || lyrics.split('\n')[0]?.replace(/^\d+\s*/, '') || ''

  return {
    lyrics,
    textCopyright,
    displayTitle,
    firstLine,
    textUrl: `${BASE_URL}/text/${textSlug}`,
  }
}

const parseArgs = () => {
  const args = process.argv.slice(2)
  const getFlag = (name) => {
    const idx = args.indexOf(name)
    return idx >= 0 ? args[idx + 1] : undefined
  }
  return {
    from: Number(getFlag('--from') ?? 1),
    to: Number(getFlag('--to') ?? 674),
    resume: args.includes('--resume'),
    fresh: args.includes('--fresh'),
  }
}

const run = async () => {
  const { from, to, resume, fresh } = parseArgs()
  let existing = []

  if (!fresh) {
    try {
      existing = JSON.parse(await readFile(OUTPUT_PATH, 'utf8'))
    } catch {
      existing = []
    }
  }

  const existingIds = new Set(
    resume ? existing.map((h) => h.id) : [],
  )
  const indexRows = []

  for (let page = 0; page <= INDEX_PAGES; page += 1) {
    const rows = await parseIndexPage(page)
    indexRows.push(...rows)
    console.log(`Indexed page ${page + 1}/${INDEX_PAGES + 1} (${rows.length} hymns)`)
    await sleep(SLEEP_MS)
  }

  const targets = indexRows
    .filter((row) => row.id >= from && row.id <= to)
    .sort((a, b) => a.id - b.id)

  const hymns = fresh ? [] : [...existing]
  const gccCatalog = await loadGccsatxCatalog()
  console.log(`Loaded ${gccCatalog.hymns.length} hymns from gccsatx.com for fallback matching`)

  for (const row of targets) {
    if (resume && existingIds.has(row.id)) {
      continue
    }

    try {
      const { textSlug, author, topics } = await parseHymnTextSlug(row.id)
      let lyrics = ''
      let displayTitle = row.title
      let firstLine = row.title
      let textSource = ''
      let textCopyright = 'See Hymnary.org'
      let lyricsSource = 'hymnary'
      let instrumentalUrl = ''

      if (textSlug) {
        const text = await parseTextPage(textSlug)
        lyrics = text.lyrics
        displayTitle = text.displayTitle || row.title
        firstLine = text.firstLine || row.title
        textSource = text.textUrl
        textCopyright = text.textCopyright || textCopyright
      }

      if (!lyrics || isLowQualityLyrics(lyrics)) {
        const gccMatch = findGccsatxMatch(row.title, firstLine, gccCatalog)
        if (gccMatch?.hymn) {
          const gcc = lyricsFromGccsatx(gccMatch.hymn)
          if (gcc.lyrics && !isLowQualityLyrics(gcc.lyrics)) {
            lyrics = gcc.lyrics
            textSource = gcc.text_source
            textCopyright = gcc.text_copyright
            lyricsSource = gcc.lyrics_source
            instrumentalUrl = gcc.instrumental_url
            displayTitle = gccMatch.hymn.title || displayTitle
            console.log(
              `  gccsatx fallback for #${row.id} (${row.title}) -> ${gccMatch.hymn.title}`,
            )
          }
        }
      }

      if (!lyrics || isLowQualityLyrics(lyrics)) {
        throw new Error('missing lyrics (hymnary and gccsatx)')
      }

      const hymn = {
        id: row.id,
        title: displayTitle,
        first_line: firstLine,
        tune: row.tune,
        lyrics,
        authors: author || undefined,
        category: pickCategory(row.title, topics),
        text_source: textSource,
        text_copyright: textCopyright,
        lyrics_source: lyricsSource,
        hymnal: 'Baptist Hymnal 2008',
        youtube_id: '',
        youtube_options: [],
        instrumental_url: instrumentalUrl,
      }

      const idx = hymns.findIndex((h) => h.id === hymn.id)
      if (idx >= 0) hymns[idx] = hymn
      else hymns.push(hymn)

      console.log(`Imported #${hymn.id}: ${hymn.title} [${lyricsSource}]`)
    } catch (error) {
      console.warn(`Skipped #${row.id} (${row.title}):`, error.message)
    }

    await sleep(SLEEP_MS)
  }

  hymns.sort((a, b) => a.id - b.id)
  await writeFile(OUTPUT_PATH, JSON.stringify(hymns, null, 2) + '\n', 'utf8')
  console.log(`Wrote ${hymns.length} hymns to ${OUTPUT_PATH}`)
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})
