import { describe, expect, it } from 'vitest'
import { stripDuplicateTitleFromLyrics } from './lyricsDisplay'

describe('stripDuplicateTitleFromLyrics', () => {
  it('removes a first verse line that repeats the hymn title', () => {
    const lyrics = `1.
How Great Thou Art
O Lord my God
When I in awesome wonder

Chorus
Then sings my soul`

    expect(stripDuplicateTitleFromLyrics(lyrics, 'How Great Thou Art')).toBe(`1.
O Lord my God
When I in awesome wonder

Chorus
Then sings my soul`)
  })

  it('removes a leading stanza that is only the title', () => {
    const lyrics = `Amazing Grace

1.
Amazing grace how sweet`

    expect(stripDuplicateTitleFromLyrics(lyrics, 'Amazing Grace')).toBe(`1.
Amazing grace how sweet`)
  })
})
