import hymnsData from './hymns.json'
import gccsatxHymnsData from './gccsatx-hymns.json'
import igboHymnsData from './igbo-hymns.json'
import type { EnglishHymn, Hymn, IgboHymn } from '../types/hymn'

export const nzkHymns = hymnsData as Hymn[]

export const englishHymns = (gccsatxHymnsData as EnglishHymn[]).map((hymn) => ({
  ...hymn,
  collection: 'gccsatx' as const,
}))

export const igboHymns = igboHymnsData as IgboHymn[]

export type HymnCatalog = {
  nzk: Hymn[]
  english: EnglishHymn[]
  igbo: IgboHymn[]
}

export const hymnCatalog: HymnCatalog = {
  nzk: nzkHymns,
  english: englishHymns,
  igbo: igboHymns,
}
