const verseLinePattern = /^(\d{1,2})\.\s*(.*)$/
const gluedVersePattern = /^(\d{1,2})([A-Za-z"'(].+)$/
const chorusLabelPattern = /^(chorus|kwaya)$/i

function normalizeStanza(value: string): string {
  return value
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
}

function stanzaHasVerseNumber(stanza: string): boolean {
  return parseVerseNumber(stanza) !== null
}

function parseVerseNumber(stanza: string): number | null {
  const firstLine = stanza.split('\n').find((line) => line.trim())?.trim() ?? ''
  const match = firstLine.match(verseLinePattern) ?? firstLine.match(gluedVersePattern)
  return match ? Number.parseInt(match[1], 10) : null
}

function stanzaIsChorusLabel(stanza: string): boolean {
  const firstLine = stanza.split('\n').find((line) => line.trim())?.trim() ?? ''
  return chorusLabelPattern.test(firstLine)
}

function stanzaBody(stanza: string): string {
  const lines = stanza.split('\n').map((line) => line.trim()).filter(Boolean)
  if (stanzaIsChorusLabel(stanza)) {
    return lines.slice(1).join('\n').trim()
  }
  return lines.join('\n').trim()
}

/**
 * Prefix unnumbered stanzas with sequential verse numbers for hymnals whose
 * source text omits them (e.g. Nyimbo za Kristo Swahili). Repeated stanzas
 * are treated as chorus refrains and labeled "Chorus" instead of numbered.
 */
export function numberUnlabeledVerses(lyrics: string): string {
  const stanzas = lyrics
    .trim()
    .split(/\n\n+/)
    .map((block) => block.trim())
    .filter(Boolean)

  if (!stanzas.length) return lyrics.trim()

  const duplicateCounts = new Map<string, number>()
  for (const stanza of stanzas) {
    if (stanzaIsChorusLabel(stanza)) continue
    const key = normalizeStanza(stanzaBody(stanza))
    if (!key) continue
    duplicateCounts.set(key, (duplicateCounts.get(key) ?? 0) + 1)
  }

  let verseNumber = 0

  return stanzas
    .map((stanza) => {
      if (stanzaIsChorusLabel(stanza)) {
        return stanza
      }

      const body = stanzaBody(stanza)
      const key = normalizeStanza(body)
      if (key && (duplicateCounts.get(key) ?? 0) >= 2) {
        return `Chorus\n${body}`
      }

      if (stanzaHasVerseNumber(stanza)) {
        const existingNumber = parseVerseNumber(stanza)
        if (existingNumber !== null) {
          verseNumber = Math.max(verseNumber, existingNumber)
        }
        return stanza
      }

      verseNumber += 1
      return `${verseNumber}.\n${body}`
    })
    .join('\n\n')
}
