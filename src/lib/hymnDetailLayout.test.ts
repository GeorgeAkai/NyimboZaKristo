import { describe, expect, it } from 'vitest'
import { resolveHymnDetailLayout } from './hymnDetailLayout'

describe('resolveHymnDetailLayout', () => {
  it('uses a 35–45% accompaniment band in portrait when media exists', () => {
    const spec = resolveHymnDetailLayout({
      isPhoneLandscape: false,
      isDesktop: false,
      hasAccompaniment: true,
    })

    expect(spec.mode).toBe('portrait-with-media')
    expect(spec.bandClass).toContain('min-h-[35%]')
    expect(spec.bandClass).toContain('max-h-[45%]')
    expect(spec.lyricsClass).toContain('overflow-y-auto')
  })

  it('uses a 10–20% empty-state band in portrait when there is no accompaniment', () => {
    const spec = resolveHymnDetailLayout({
      isPhoneLandscape: false,
      isDesktop: false,
      hasAccompaniment: false,
    })

    expect(spec.mode).toBe('portrait-empty')
    expect(spec.bandClass).toContain('min-h-[10%]')
    expect(spec.bandClass).toContain('max-h-[20%]')
  })

  it('splits 60/40 in phone landscape when accompaniment exists', () => {
    const spec = resolveHymnDetailLayout({
      isPhoneLandscape: true,
      isDesktop: false,
      hasAccompaniment: true,
    })

    expect(spec.mode).toBe('landscape-with-media')
    expect(spec.lyricsClass).toContain('basis-[60%]')
    expect(spec.bandClass).toContain('basis-[40%]')
    expect(spec.lyricsBeforeBand).toBe(true)
  })

  it('uses a narrow right column in phone landscape when accompaniment is absent', () => {
    const spec = resolveHymnDetailLayout({
      isPhoneLandscape: true,
      isDesktop: false,
      hasAccompaniment: false,
    })

    expect(spec.mode).toBe('landscape-empty')
    expect(spec.lyricsClass).toContain('basis-[85%]')
    expect(spec.bandClass).toContain('basis-[15%]')
  })

  it('puts accompaniment on the right at desktop width', () => {
    const spec = resolveHymnDetailLayout({
      isPhoneLandscape: false,
      isDesktop: true,
      hasAccompaniment: true,
    })

    expect(spec.mode).toBe('desktop-with-media')
    expect(spec.containerClass).toContain('overflow-hidden')
    expect(spec.lyricsClass).toContain('overflow-y-auto')
    expect(spec.bandClass).toContain('sticky')
    expect(spec.bandClass).toContain('basis-[40%]')
    expect(spec.lyricsBeforeBand).toBe(true)
  })
})
