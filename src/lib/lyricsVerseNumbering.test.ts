import { describe, expect, it } from 'vitest'
import { numberUnlabeledVerses } from './lyricsVerseNumbering'

describe('numberUnlabeledVerses', () => {
  it('numbers unlabeled Swahili stanzas', () => {
    const lyrics = `U Mtakatifu! Mungu Mwenyezi!
Alfajiri sifa zako tutaimba.

U Mtakatifu! Na malaika,
Wengi sana wanakuabudu wote.`

    expect(numberUnlabeledVerses(lyrics)).toBe(`1.
U Mtakatifu! Mungu Mwenyezi!
Alfajiri sifa zako tutaimba.

2.
U Mtakatifu! Na malaika,
Wengi sana wanakuabudu wote.`)
  })

  it('labels repeated stanzas as chorus instead of numbering them', () => {
    const lyrics = `Sauti zote ziimbe, jina la Yesu li heri!

Jina li heri, jina li heri, jina la Yesu li heri!

Hofu zote latuliza, jina la Yesu li heri!

Jina li heri, jina li heri, jina la Yesu li heri!`

    expect(numberUnlabeledVerses(lyrics)).toBe(`1.
Sauti zote ziimbe, jina la Yesu li heri!

Chorus
Jina li heri, jina li heri, jina la Yesu li heri!

2.
Hofu zote latuliza, jina la Yesu li heri!

Chorus
Jina li heri, jina li heri, jina la Yesu li heri!`)
  })

  it('continues numbering after an existing verse number', () => {
    const lyrics = `1.
First verse line

Second verse without a number`

    expect(numberUnlabeledVerses(lyrics)).toBe(`1.
First verse line

2.
Second verse without a number`)
  })

  it('preserves explicit chorus labels', () => {
    const lyrics = `First verse

Chorus
Refrain line one`

    expect(numberUnlabeledVerses(lyrics)).toBe(`1.
First verse

Chorus
Refrain line one`)
  })
})
