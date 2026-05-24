import { stripDuplicateTitleFromLyrics } from './lyricsDisplay'
import { numberUnlabeledVerses } from './lyricsVerseNumbering'

const verseLinePattern = /^(\d{1,2})\.\s*(.*)$/
const gluedVersePattern = /^(\d{1,2})([A-Za-z"'(].+)$/
const chorusLabelPattern = /^(chorus|kwaya)$/i

export type PreparedStanza =
  | { kind: 'verse'; number: string; lines: string[] }
  | { kind: 'chorus'; lines: string[] }
  | { kind: 'plain'; lines: string[] }

export type PrepareLyricsOptions = {
  hymnTitle?: string
  numberVerses?: boolean
}

export function prepareLyrics(raw: string, options: PrepareLyricsOptions = {}): PreparedStanza[] {
  let text = options.hymnTitle ? stripDuplicateTitleFromLyrics(raw, options.hymnTitle) : raw.trim()
  if (options.numberVerses) {
    text = numberUnlabeledVerses(text)
  }

  return text
    .split(/\n\n+/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map(parseStanzaBlock)
}

function parseStanzaBlock(block: string): PreparedStanza {
  const lines = block.split('\n').map((line) => line.trim()).filter(Boolean)
  const firstLine = lines[0] ?? ''

  if (chorusLabelPattern.test(firstLine)) {
    return { kind: 'chorus', lines: lines.slice(1) }
  }

  const verseMatch = firstLine.match(verseLinePattern)
  if (verseMatch) {
    const restFirstLine = verseMatch[2].trim()
    const bodyLines = [...(restFirstLine ? [restFirstLine] : []), ...lines.slice(1)]
    return { kind: 'verse', number: verseMatch[1], lines: bodyLines }
  }

  const gluedMatch = firstLine.match(gluedVersePattern)
  if (gluedMatch) {
    return {
      kind: 'verse',
      number: gluedMatch[1],
      lines: [gluedMatch[2].trim(), ...lines.slice(1)].filter(Boolean),
    }
  }

  return { kind: 'plain', lines }
}
