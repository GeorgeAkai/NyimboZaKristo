import { describe, expect, it } from 'vitest'
import { prepareLyrics } from './lyricsPipeline'

describe('prepareLyrics', () => {
  it('parses numbered verses and chorus labels', () => {
    const stanzas = prepareLyrics(`1.
First line

Chorus
Refrain line`, { numberVerses: false })

    expect(stanzas).toEqual([
      { kind: 'verse', number: '1', lines: ['First line'] },
      { kind: 'chorus', lines: ['Refrain line'] },
    ])
  })

  it('numbers unlabeled verses when requested', () => {
    const stanzas = prepareLyrics(`Line one

Line two`, { numberVerses: true })

    expect(stanzas[0]).toEqual({ kind: 'verse', number: '1', lines: ['Line one'] })
    expect(stanzas[1]).toEqual({ kind: 'verse', number: '2', lines: ['Line two'] })
  })
})
