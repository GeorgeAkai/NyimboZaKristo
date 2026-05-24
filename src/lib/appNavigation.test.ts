import { describe, expect, it } from 'vitest'
import {
  creditsBackView,
  getDisplayedHymnRef,
  navigationToHistory,
  navbarSubtitle,
  resolveNavigationFromHistory,
} from './appNavigation'
import type { HymnCatalog } from '../data/hymnCatalog'

const catalog: HymnCatalog = {
  nzk: [{ id: 1, title: 'A', swahili_lyrics: '', english_lyrics: '', category: 'Praise', youtube_id: '', instrumental_url: '' }],
  english: [],
  igbo: [],
}

describe('appNavigation', () => {
  it('resolves hymn selection from history ids', () => {
    const nav = resolveNavigationFromHistory(
      { view: 'nzk', nzkHymnId: 1 },
      catalog,
    )

    expect(nav.nzkHymn?.title).toBe('A')
    expect(getDisplayedHymnRef(nav)).toEqual({ collection: 'nzk', id: 1 })
  })

  it('serializes navigation to history state', () => {
    const history = navigationToHistory({
      view: 'nzk',
      returnView: 'home',
      nzkHymn: catalog.nzk[0],
      englishHymn: null,
      igboHymn: null,
    })

    expect(history).toEqual({ view: 'nzk', returnView: 'home', nzkHymnId: 1 })
  })

  it('maps navbar subtitles and credits back view', () => {
    expect(navbarSubtitle('gccsatx')).toBe('English Hymns')
    expect(creditsBackView('credits')).toBe('home')
    expect(creditsBackView('nzk')).toBe('nzk')
  })
})
