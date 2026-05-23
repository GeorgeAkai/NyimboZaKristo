import type { AppView } from './navigation'

export interface AppHistoryState {
  view: AppView
  returnView?: AppView
  nzkHymnId?: number
  englishHymnId?: number
}

export function pushAppHistory(state: AppHistoryState) {
  window.history.pushState(state, '', window.location.pathname + window.location.search)
}

export function replaceAppHistory(state: AppHistoryState) {
  window.history.replaceState(state, '', window.location.pathname + window.location.search)
}

export function readAppHistoryState(): AppHistoryState | null {
  const state = window.history.state
  if (!state || typeof state !== 'object' || !('view' in state)) {
    return null
  }
  return state as AppHistoryState
}
