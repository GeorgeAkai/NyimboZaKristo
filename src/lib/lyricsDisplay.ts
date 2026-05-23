/** Normalize for comparing hymn titles to lyric lines. */
export function normalizeLyricText(value: string): string {
  return value
    .toLowerCase()
    .replace(/[''']/g, "'")
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Remove a leading stanza or first-verse line that repeats the hymn title
 * (header already shows the title).
 */
export function stripDuplicateTitleFromLyrics(lyrics: string, hymnTitle: string): string {
  const titleNorm = normalizeLyricText(hymnTitle)
  if (!titleNorm) return lyrics.trim()

  let stanzas = lyrics
    .trim()
    .split(/\n\n+/)
    .map((block) => block.trim())
    .filter(Boolean)

  if (!stanzas.length) return lyrics.trim()

  const firstNorm = normalizeLyricText(stanzas[0].replace(/\n/g, ' '))
  if (firstNorm === titleNorm) {
    stanzas = stanzas.slice(1)
  }

  if (!stanzas.length) return lyrics.trim()

  const lines = stanzas[0].split('\n').map((line) => line.trim())
  const verseOnly = lines[0]?.match(/^(\d{1,2})\.\s*$/)
  if (verseOnly && lines[1] && normalizeLyricText(lines[1]) === titleNorm) {
    lines.splice(1, 1)
    stanzas[0] = lines.join('\n')
  }

  const glued = lines[0]?.match(/^(\d{1,2})\.\s+(.+)$/)
  if (glued && normalizeLyricText(glued[2]) === titleNorm) {
    lines.shift()
    stanzas[0] = lines.join('\n')
  }

  return stanzas.join('\n\n').trim()
}
