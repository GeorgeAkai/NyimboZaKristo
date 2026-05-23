import type { HymnalCollection } from '../types/hymn'

export type AppView = 'home' | 'credits' | HymnalCollection

export const LIST_SCROLL_KEYS: Record<HymnalCollection, string> = {
  nzk: 'nzk-list',
  gccsatx: 'gccsatx-list',
}
