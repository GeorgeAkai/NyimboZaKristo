import { load } from 'cheerio'

const GCC_HYMNS_URL = 'https://gccsatx.com/hymns/hymns.json'

const normalizeTitle = (value) =>
  value
    .toLowerCase()
    .replace(/[''']/g, "'")
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\b(the|a|an|of|to|and)\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

const plainLyricsText = (html) =>
  (html ?? '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

const titleTokens = (value) =>
  new Set(normalizeTitle(value).split(' ').filter((token) => token.length > 2))

const stripMetaLines = (lines) =>
  lines.filter(
    (line) =>
      !/^\[key:/i.test(line) &&
      !/^music:/i.test(line) &&
      !/^words:/i.test(line) &&
      !/^king james version$/i.test(line) &&
      !/^\d{4}$/.test(line) &&
      !/^\d{4},/.test(line) &&
      !/^[A-Z][a-z]+ [A-Z][a-z]+, \d{4}$/.test(line) &&
      !/^to meditate more on/i.test(line),
  )

const normalizeVerseNumberLine = (line) => {
  const withPeriod = line.match(/^(\d{1,2})\.\s*(.*)$/)
  if (withPeriod) {
    const rest = withPeriod[2].trim()
    return rest ? `${withPeriod[1]}. ${rest}` : `${withPeriod[1]}.`
  }

  const spaced = line.match(/^(\d{1,2})\s+(.+)$/)
  if (spaced) {
    return `${spaced[1]}. ${spaced[2].trim()}`
  }

  const glued = line.match(/^(\d{1,2})([A-Za-z"'(].+)$/)
  if (glued) {
    return `${glued[1]}. ${glued[2].trim()}`
  }

  return line
}

const stanzaLabel = (label, index) => {
  if (/^chorus$/i.test(label)) return 'Chorus'
  const fromVerse = label.match(/^verse\s*(\d+)/i)
  if (fromVerse) return `${fromVerse[1]}.`
  const fromNumber = label.match(/^(\d+)\.$/)
  if (fromNumber) return `${fromNumber[1]}.`
  return `${index}.`
}

export const parseGccLyricsHtml = (html, hymnTitle = '') => {
  const $ = load(`<div>${html}</div>`)
  $('strong').each((_, el) => {
    const label = $(el).text().trim()
    if (/^(verse|chorus)\s*\d*$/i.test(label)) {
      $(el).replaceWith(`\n[[${label}]]\n`)
    } else {
      $(el).replaceWith(`${label}\n`)
    }
  })
  $('br').replaceWith('\n')
  $('em').each((_, el) => {
    $(el).replaceWith($(el).text())
  })

  const rawLines = $.root()
    .text()
    .split('\n')
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .filter(Boolean)

  const lines = stripMetaLines(rawLines)
  const stanzas = []
  let currentLabel = null
  let currentLines = []

  const flush = () => {
    if (!currentLines.length && !currentLabel) return
    stanzas.push({
      label: currentLabel,
      body: currentLines.join('\n').trim(),
    })
    currentLabel = null
    currentLines = []
  }

  for (const line of lines) {
    const marker = line.match(/^\[\[(verse\s*\d+|chorus)\]\]$/i)
    if (marker) {
      flush()
      currentLabel = marker[1]
      continue
    }

    const verseOnly = line.match(/^verse\s*(\d+)\s*$/i)
    if (verseOnly) {
      flush()
      currentLabel = line
      continue
    }

    if (/^chorus$/i.test(line)) {
      flush()
      currentLabel = 'Chorus'
      continue
    }

    const numbered = line.match(/^(\d{1,2})[.)]?\s*(.*)$/)
    if (numbered && (numbered[2] || numbered[1])) {
      flush()
      currentLabel = `${numbered[1]}.`
      if (numbered[2]?.trim()) {
        currentLines.push(numbered[2].trim())
      }
      continue
    }

    currentLines.push(line)
  }

  flush()

  if (!stanzas.length) {
    return lines.map(normalizeVerseNumberLine).join('\n')
  }

  const normalizedTitle = normalizeTitle(hymnTitle)
  let verseIndex = 0

  return stanzas
    .map((stanza) => {
      let label = stanza.label
        ? stanzaLabel(stanza.label, ++verseIndex)
        : `${++verseIndex}.`

      let body = stanza.body
      if (!body && /^\d+\.$/.test(label)) {
        return null
      }

      if (body) {
        const firstLine = body.split('\n')[0]
        const normalizedFirst = normalizeTitle(firstLine)
        if (normalizedTitle && normalizedFirst === normalizedTitle) {
          body = body
            .split('\n')
            .slice(1)
            .join('\n')
            .trim()
        }
        const firstBodyLine = body.split('\n')[0]
        if (/^\d+\.\s/.test(firstBodyLine)) {
          return body
            .split('\n')
            .map((line) => normalizeVerseNumberLine(line))
            .join('\n')
        }
      }

      if (!body?.trim()) {
        return label.match(/^\d+\.$/) ? null : label
      }

      return `${label}\n${body}`
    })
    .filter(Boolean)
    .join('\n\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

export const isLowQualityLyrics = (lyrics) => {
  if (!lyrics?.trim()) return true
  const lower = lyrics.toLowerCase()
  if (lyrics.trim().length < 80) return true
  if (lower.includes('license agreement')) return true
  if (lower.includes('hope publishing company')) return true
  if (lower.includes('in order to use resources')) return true
  return false
}

const firstLyricLine = (html, hymnTitle) => {
  const text = parseGccLyricsHtml(html, hymnTitle)
  return (
    text
      .split('\n')
      .map((line) => line.replace(/^\d+\.\s*/, '').trim())
      .find(
        (line) =>
          line.length > 12 &&
          !/^verse\s*\d+$/i.test(line) &&
          !/^chorus$/i.test(line) &&
          !/^\d+\.$/.test(line),
      ) ?? ''
  )
}

export const loadGccsatxCatalog = async () => {
  const response = await fetch(GCC_HYMNS_URL)
  if (!response.ok) throw new Error(`Failed to fetch ${GCC_HYMNS_URL}`)
  const hymns = await response.json()
  if (!Array.isArray(hymns)) throw new Error('Unexpected gccsatx hymns.json format')

  const byNormalizedTitle = new Map()
  const byLyricsSnippet = new Map()

  for (const hymn of hymns) {
    const title = hymn.title?.trim()
    if (!title) continue
    const key = normalizeTitle(title)
    if (!byNormalizedTitle.has(key)) {
      byNormalizedTitle.set(key, hymn)
    }

    const snippet = normalizeTitle(firstLyricLine(hymn.lyrics_html ?? '', title))
    if (snippet.length >= 12 && !byLyricsSnippet.has(snippet)) {
      byLyricsSnippet.set(snippet, hymn)
    }

    hymn._plainLyrics = plainLyricsText(hymn.lyrics_html)
  }

  return { hymns, byNormalizedTitle, byLyricsSnippet }
}

export const findGccsatxMatch = (title, firstLine, catalog) => {
  const candidates = [
    title,
    title.replace(/\s*—.*$/, ''),
    title.replace(/,.*$/, ''),
    firstLine,
  ].filter(Boolean)

  for (const candidate of candidates) {
    const exact = catalog.byNormalizedTitle.get(normalizeTitle(candidate))
    if (exact) return { hymn: exact, score: 1 }

    const snippet = catalog.byLyricsSnippet.get(normalizeTitle(candidate))
    if (snippet) return { hymn: snippet, score: 0.95 }
  }

  const queryTokens = [...titleTokens(title)]
  if (queryTokens.length >= 4) {
    let bestPlain = null
    let bestPlainScore = 0
    for (const hymn of catalog.hymns) {
      const plain = hymn._plainLyrics ?? ''
      const matched = queryTokens.filter((token) => plain.includes(token)).length
      const score = matched / queryTokens.length
      if (score > bestPlainScore) {
        bestPlainScore = score
        bestPlain = hymn
      }
    }
    if (bestPlain && bestPlainScore >= 0.65) {
      return { hymn: bestPlain, score: bestPlainScore }
    }
  }

  let best = null
  let bestScore = 0

  for (const hymn of catalog.hymns) {
    const hymnTitle = hymn.title?.trim() ?? ''
    const queryTokens = titleTokens(title)
    const hymnTokens = titleTokens(hymnTitle)
    if (!queryTokens.size || !hymnTokens.size) continue

    const overlap = [...queryTokens].filter((token) => hymnTokens.has(token)).length
    const score = overlap / Math.max(queryTokens.size, hymnTokens.size)
    if (score > bestScore) {
      bestScore = score
      best = hymn
    }
  }

  if (best && bestScore >= 0.72) {
    return { hymn: best, score: bestScore }
  }

  return null
}

export const lyricsFromGccsatx = (gccHymn) => {
  const title = gccHymn.title?.trim() ?? ''
  const lyrics = parseGccLyricsHtml(gccHymn.lyrics_html ?? '', title)
  const instrumental =
    typeof gccHymn.piano_mp3 === 'string' && gccHymn.piano_mp3.startsWith('https://')
      ? gccHymn.piano_mp3
      : ''

  return {
    lyrics,
    text_source: gccHymn.link || `https://gccsatx.com/hymns/${gccHymn.slug}/`,
    text_copyright: 'Lyrics from GCCSATX Hymns (gccsatx.com). Verify copyright for your use.',
    lyrics_source: 'gccsatx',
    instrumental_url: instrumental,
  }
}
