import type { AppView } from './navigation'

export interface AppHistoryState {
  view: AppView
  returnView?: AppView
  nzkHymnId?: number
  englishHymnId?: number
  igboHymnId?: number
}

const APP_VIEWS: AppView[] = ['home', 'credits', 'settings', 'nzk', 'gccsatx', 'abu']

export function isAppView(value: unknown): value is AppView {
  return typeof value === 'string' && APP_VIEWS.includes(value as AppView)
}

export function normalizeAppHistoryState(state: unknown): AppHistoryState | null {
  if (!state || typeof state !== 'object' || !('view' in state)) {
    return null
  }

  const candidate = state as AppHistoryState
  if (!isAppView(candidate.view)) {
    return null
  }

  return {
    view: candidate.view,
    returnView: isAppView(candidate.returnView) ? candidate.returnView : undefined,
    nzkHymnId: typeof candidate.nzkHymnId === 'number' ? candidate.nzkHymnId : undefined,
    englishHymnId: typeof candidate.englishHymnId === 'number' ? candidate.englishHymnId : undefined,
    igboHymnId: typeof candidate.igboHymnId === 'number' ? candidate.igboHymnId : undefined,
  }
}

export function pushAppHistory(state: AppHistoryState) {
  window.history.pushState(state, '', window.location.pathname + window.location.search)
}

export function replaceAppHistory(state: AppHistoryState) {
  window.history.replaceState(state, '', window.location.pathname + window.location.search)
}

export function readAppHistoryState(): AppHistoryState | null {
  return normalizeAppHistoryState(window.history.state)
}
