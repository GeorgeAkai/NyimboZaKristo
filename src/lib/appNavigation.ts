import type { EnglishHymn, Hymn, IgboHymn } from '../types/hymn'
import type { AppHistoryState } from './appHistory'
import {
  normalizeAppHistoryState,
  pushAppHistory,
  readAppHistoryState,
  replaceAppHistory,
} from './appHistory'
import type { HymnCatalog } from '../data/hymnCatalog'
import { LIST_SCROLL_KEYS, type AppView } from './navigation'
import { restoreListScroll } from './scrollRestore'
import type { HymnRef } from './mediaPlaybackController'

export type NavigationSelection = {
  nzkHymn: Hymn | null
  englishHymn: EnglishHymn | null
  igboHymn: IgboHymn | null
}

export type NavigationState = NavigationSelection & {
  view: AppView
  returnView: AppView
}

export function resolveBootNavigation(catalog: HymnCatalog): NavigationState {
  const history = readAppHistoryState()
  if (history) {
    return resolveNavigationFromHistory(history, catalog)
  }

  return {
    view: 'home',
    returnView: 'home',
    nzkHymn: null,
    englishHymn: null,
    igboHymn: null,
  }
}

export function resolveNavigationFromHistory(
  state: AppHistoryState,
  catalog: HymnCatalog,
): NavigationState {
  return {
    view: state.view,
    returnView: state.returnView ?? 'home',
    nzkHymn: state.nzkHymnId ? catalog.nzk.find((hymn) => hymn.id === state.nzkHymnId) ?? null : null,
    englishHymn: state.englishHymnId
      ? catalog.english.find((hymn) => hymn.id === state.englishHymnId) ?? null
      : null,
    igboHymn: state.igboHymnId ? catalog.igbo.find((hymn) => hymn.id === state.igboHymnId) ?? null : null,
  }
}

export function navigationToHistory(
  nav: Pick<NavigationState, 'view' | 'returnView'> & NavigationSelection,
): AppHistoryState {
  return {
    view: nav.view,
    returnView: nav.returnView,
    nzkHymnId: nav.nzkHymn?.id,
    englishHymnId: nav.englishHymn?.id,
    igboHymnId: nav.igboHymn?.id,
  }
}

export function getDisplayedHymnRef(selection: NavigationSelection): HymnRef | null {
  if (selection.nzkHymn) return { collection: 'nzk', id: selection.nzkHymn.id }
  if (selection.englishHymn) return { collection: 'gccsatx', id: selection.englishHymn.id }
  if (selection.igboHymn) return { collection: 'abu', id: selection.igboHymn.id }
  return null
}

export function getDisplayedHymn(selection: NavigationSelection): Hymn | EnglishHymn | IgboHymn | null {
  return selection.nzkHymn ?? selection.englishHymn ?? selection.igboHymn ?? null
}

export function applyScrollRestore(state: AppHistoryState) {
  if (state.view === 'nzk' && !state.nzkHymnId) {
    restoreListScroll(LIST_SCROLL_KEYS.nzk)
  }
  if (state.view === 'gccsatx' && !state.englishHymnId) {
    restoreListScroll(LIST_SCROLL_KEYS.gccsatx)
  }
  if (state.view === 'abu' && !state.igboHymnId) {
    restoreListScroll(LIST_SCROLL_KEYS.abu)
  }
}

export function creditsBackView(returnView: AppView): AppView {
  return returnView === 'credits' ? 'home' : returnView
}

export function navbarSubtitle(view: AppView): string {
  switch (view) {
    case 'gccsatx':
      return 'English Hymns'
    case 'abu':
      return 'Igbo Hymns (Abu)'
    case 'nzk':
      return 'Nyimbo za Kristo'
    case 'settings':
      return 'Settings'
    default:
      return 'SDA Hymnal PWA'
  }
}

export {
  normalizeAppHistoryState,
  pushAppHistory,
  readAppHistoryState,
  replaceAppHistory,
  type AppHistoryState,
}
