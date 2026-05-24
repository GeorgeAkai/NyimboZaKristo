import { useCallback, useEffect, useRef, useState } from 'react'
import { hymnCatalog } from '../data/hymnCatalog'
import type { EnglishHymn, Hymn, HymnalCollection, IgboHymn } from '../types/hymn'
import {
  applyScrollRestore,
  creditsBackView,
  navigationToHistory,
  pushAppHistory,
  readAppHistoryState,
  replaceAppHistory,
  resolveBootNavigation,
  resolveNavigationFromHistory,
  type NavigationState,
} from '../lib/appNavigation'
import { LIST_SCROLL_KEYS, type AppView } from '../lib/navigation'
import { clearListScroll, saveListScroll } from '../lib/scrollRestore'

const bootNavigation = resolveBootNavigation(hymnCatalog)

export function useAppNavigation() {
  const [navigation, setNavigation] = useState<NavigationState>(() => bootNavigation)
  const isHistoryNavigation = useRef(false)

  const applyHistory = useCallback((state: NavigationState, restoreScroll = false) => {
    setNavigation(state)
    if (restoreScroll) {
      applyScrollRestore(navigationToHistory(state))
    }
  }, [])

  const applyHistoryRef = useRef(applyHistory)
  useEffect(() => {
    applyHistoryRef.current = applyHistory
  }, [applyHistory])

  useEffect(() => {
    replaceAppHistory(navigationToHistory(bootNavigation))

    const handlePopState = () => {
      const state = readAppHistoryState()
      isHistoryNavigation.current = true
      if (!state) {
        applyHistoryRef.current(
          {
            view: 'home',
            returnView: 'home',
            nzkHymn: null,
            englishHymn: null,
            igboHymn: null,
          },
          true,
        )
        return
      }
      applyHistoryRef.current(resolveNavigationFromHistory(state, hymnCatalog), true)
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const navigate = useCallback(
    (
      next: Partial<NavigationState> & { view: AppView },
      mode: 'push' | 'replace' = 'push',
    ) => {
      const state: NavigationState = {
        view: next.view,
        returnView: next.returnView ?? navigation.returnView,
        nzkHymn: next.nzkHymn !== undefined ? next.nzkHymn : navigation.nzkHymn,
        englishHymn: next.englishHymn !== undefined ? next.englishHymn : navigation.englishHymn,
        igboHymn: next.igboHymn !== undefined ? next.igboHymn : navigation.igboHymn,
      }

      const history = navigationToHistory(state)
      if (mode === 'replace') {
        replaceAppHistory(history)
      } else {
        pushAppHistory(history)
      }
      applyHistory(state)
    },
    [applyHistory, navigation],
  )

  const historyBack = useCallback(() => {
    isHistoryNavigation.current = true
    window.history.back()
  }, [])

  useEffect(() => {
    if (isHistoryNavigation.current) {
      isHistoryNavigation.current = false
      return
    }
    replaceAppHistory(navigationToHistory(navigation))
  }, [navigation])

  const goHome = useCallback(() => {
    clearListScroll(LIST_SCROLL_KEYS.nzk)
    clearListScroll(LIST_SCROLL_KEYS.gccsatx)
    clearListScroll(LIST_SCROLL_KEYS.abu)
    navigate(
      { view: 'home', nzkHymn: null, englishHymn: null, igboHymn: null, returnView: 'home' },
      'replace',
    )
    window.scrollTo(0, 0)
  }, [navigate])

  const openCollection = useCallback(
    (collection: HymnalCollection) => {
      clearListScroll(LIST_SCROLL_KEYS[collection])
      navigate({
        view: collection,
        nzkHymn: null,
        englishHymn: null,
        igboHymn: null,
      })
      window.scrollTo(0, 0)
    },
    [navigate],
  )

  const selectNzkHymn = useCallback(
    (hymn: Hymn) => {
      saveListScroll(LIST_SCROLL_KEYS.nzk)
      navigate({ view: 'nzk', nzkHymn: hymn, englishHymn: null, igboHymn: null })
      window.scrollTo(0, 0)
      return hymn
    },
    [navigate],
  )

  const selectEnglishHymn = useCallback(
    (hymn: EnglishHymn) => {
      saveListScroll(LIST_SCROLL_KEYS.gccsatx)
      navigate({ view: 'gccsatx', nzkHymn: null, englishHymn: hymn, igboHymn: null })
      window.scrollTo(0, 0)
      return hymn
    },
    [navigate],
  )

  const selectIgboHymn = useCallback(
    (hymn: IgboHymn) => {
      saveListScroll(LIST_SCROLL_KEYS.abu)
      navigate({ view: 'abu', nzkHymn: null, englishHymn: null, igboHymn: hymn })
      window.scrollTo(0, 0)
      return hymn
    },
    [navigate],
  )

  const openCredits = useCallback(() => {
    navigate({
      view: 'credits',
      returnView: navigation.view,
    })
  }, [navigate, navigation.view])

  const openSettings = useCallback(() => {
    navigate({
      view: 'settings',
      returnView: navigation.view,
    })
  }, [navigate, navigation.view])

  const creditsBack = useCallback(() => {
    if (window.history.length > 1) {
      historyBack()
      return
    }
    navigate(
      {
        view: creditsBackView(navigation.returnView),
        nzkHymn: null,
        englishHymn: null,
        igboHymn: null,
      },
      'replace',
    )
  }, [historyBack, navigate, navigation.returnView])

  return {
    navigation,
    navigate,
    historyBack,
    goHome,
    openCollection,
    selectNzkHymn,
    selectEnglishHymn,
    selectIgboHymn,
    openCredits,
    openSettings,
    creditsBack,
  }
}
