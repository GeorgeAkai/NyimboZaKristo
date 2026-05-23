import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Fuse from 'fuse.js'
import hymnsData from './data/hymns.json'
import gccsatxHymnsData from './data/gccsatx-hymns.json'
import { Navbar } from './components/Navbar'
import { HomeScreen } from './components/HomeScreen'
import { HymnList } from './components/HymnList'
import { HymnDetail } from './components/HymnDetail'
import { EnglishHymnList } from './components/EnglishHymnList'
import { EnglishHymnDetail } from './components/EnglishHymnDetail'
import { CreditsPanel } from './components/CreditsPanel'
import { FloatingMediaPlayer } from './components/FloatingMediaPlayer'
import { ScrollNavButtons } from './components/ScrollNavButtons'
import { buildMediaSession, type MediaSession } from './lib/hymnMedia'
import type { AppHistoryState } from './lib/appHistory'
import { pushAppHistory, readAppHistoryState, replaceAppHistory } from './lib/appHistory'
import { LIST_SCROLL_KEYS, type AppView } from './lib/navigation'
import { clearListScroll, restoreListScroll, saveListScroll } from './lib/scrollRestore'
import type { EnglishHymn, Hymn, HymnalCollection } from './types/hymn'

const hymns = hymnsData as Hymn[]
const englishHymns = (gccsatxHymnsData as EnglishHymn[]).map((hymn) => ({
  ...hymn,
  collection: 'gccsatx' as const,
}))

const THEME_KEY = 'nzk-theme'
const LANGUAGE_KEY = 'nzk-language'
const COLLECTION_KEY = 'nzk-collection'
const LAST_NZK_HYMN_KEY = 'nzk-last-hymn-id'
const LAST_ENGLISH_HYMN_KEY = 'nzk-last-english-hymn-id'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

function App() {
  const [view, setView] = useState<AppView>(() => {
    const saved = localStorage.getItem(COLLECTION_KEY)
    if (saved === 'baptist') return 'gccsatx'
    return saved === 'nzk' || saved === 'gccsatx' ? saved : 'home'
  })
  const [selectedNzkHymn, setSelectedNzkHymn] = useState<Hymn | null>(() => {
    const savedId = Number(localStorage.getItem(LAST_NZK_HYMN_KEY))
    if (!savedId) return null
    return hymns.find((hymn) => hymn.id === savedId) ?? null
  })
  const [selectedEnglishHymn, setSelectedEnglishHymn] = useState<EnglishHymn | null>(() => {
    const savedId = Number(localStorage.getItem(LAST_ENGLISH_HYMN_KEY))
    if (!savedId) return null
    return englishHymns.find((hymn) => hymn.id === savedId) ?? null
  })
  const [search, setSearch] = useState('')
  const [language, setLanguage] = useState<'sw' | 'en'>(() => {
    const saved = localStorage.getItem(LANGUAGE_KEY)
    return saved === 'en' ? 'en' : 'sw'
  })
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem(THEME_KEY) === 'dark')
  const [activeCategory, setActiveCategory] = useState<Hymn['category'] | 'All'>('All')
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [installToast, setInstallToast] = useState<string | null>(null)
  const [returnView, setReturnView] = useState<AppView>('home')
  const [mediaSession, setMediaSession] = useState<MediaSession | null>(null)
  const [selectedVideoId, setSelectedVideoId] = useState('')
  const isHistoryNavigation = useRef(false)

  const buildHistoryState = useCallback(
    (next: {
      view: AppView
      returnView?: AppView
      nzkHymn?: Hymn | null
      englishHymn?: EnglishHymn | null
    }): AppHistoryState => ({
      view: next.view,
      returnView: next.returnView,
      nzkHymnId: next.nzkHymn?.id,
      englishHymnId: next.englishHymn?.id,
    }),
    [],
  )

  const applyHistoryState = useCallback((state: AppHistoryState, restoreScroll = false) => {
    setView(state.view)
    setReturnView(state.returnView ?? 'home')
    setSelectedNzkHymn(state.nzkHymnId ? hymns.find((h) => h.id === state.nzkHymnId) ?? null : null)
    setSelectedEnglishHymn(
      state.englishHymnId ? englishHymns.find((h) => h.id === state.englishHymnId) ?? null : null,
    )

    if (!restoreScroll) return

    if (state.view === 'nzk' && !state.nzkHymnId) {
      restoreListScroll(LIST_SCROLL_KEYS.nzk)
    }
    if (state.view === 'gccsatx' && !state.englishHymnId) {
      restoreListScroll(LIST_SCROLL_KEYS.gccsatx)
    }
  }, [])

  const applyHistoryStateRef = useRef(applyHistoryState)
  useEffect(() => {
    applyHistoryStateRef.current = applyHistoryState
  }, [applyHistoryState])

  useEffect(() => {
    replaceAppHistory(
      buildHistoryState({
        view,
        returnView,
        nzkHymn: selectedNzkHymn,
        englishHymn: selectedEnglishHymn,
      }),
    )

    const handlePopState = () => {
      const state = readAppHistoryState()
      isHistoryNavigation.current = true
      if (!state) {
        applyHistoryStateRef.current({ view: 'home' }, true)
        return
      }
      applyHistoryStateRef.current(state, true)
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- register popstate once
  }, [])

  const navigate = useCallback(
    (
      next: {
        view: AppView
        returnView?: AppView
        nzkHymn?: Hymn | null
        englishHymn?: EnglishHymn | null
      },
      mode: 'push' | 'replace' = 'push',
    ) => {
      const state = buildHistoryState(next)
      if (mode === 'replace') {
        replaceAppHistory(state)
      } else {
        pushAppHistory(state)
      }
      applyHistoryState(state)
    },
    [applyHistoryState, buildHistoryState],
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
    replaceAppHistory(
      buildHistoryState({
        view,
        returnView,
        nzkHymn: selectedNzkHymn,
        englishHymn: selectedEnglishHymn,
      }),
    )
  }, [view, returnView, selectedNzkHymn, selectedEnglishHymn, buildHistoryState])

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', darkMode)
    localStorage.setItem(THEME_KEY, darkMode ? 'dark' : 'light')
  }, [darkMode])

  useEffect(() => {
    localStorage.setItem(LANGUAGE_KEY, language)
  }, [language])

  useEffect(() => {
    if (view === 'home' || view === 'credits') {
      localStorage.removeItem(COLLECTION_KEY)
      return
    }
    localStorage.setItem(COLLECTION_KEY, view)
  }, [view])

  useEffect(() => {
    if (selectedNzkHymn) {
      localStorage.setItem(LAST_NZK_HYMN_KEY, String(selectedNzkHymn.id))
      return
    }
    localStorage.removeItem(LAST_NZK_HYMN_KEY)
  }, [selectedNzkHymn])

  useEffect(() => {
    if (selectedEnglishHymn) {
      localStorage.setItem(LAST_ENGLISH_HYMN_KEY, String(selectedEnglishHymn.id))
      return
    }
    localStorage.removeItem(LAST_ENGLISH_HYMN_KEY)
  }, [selectedEnglishHymn])

  useEffect(() => {
    const hymn = selectedNzkHymn ?? selectedEnglishHymn
    if (!hymn) return

    const session = buildMediaSession(hymn)
    if (session) {
      setMediaSession(session)
      setSelectedVideoId(session.videoId)
    }
  }, [selectedNzkHymn, selectedEnglishHymn])

  const closeFloatingPlayer = () => {
    setMediaSession(null)
    setSelectedVideoId('')
  }

  const showFloatingPlayer = Boolean(mediaSession)

  useEffect(() => {
    if (!installToast) return
    const timeout = window.setTimeout(() => setInstallToast(null), 2800)
    return () => window.clearTimeout(timeout)
  }, [installToast])

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault()
      setInstallPrompt(event as BeforeInstallPromptEvent)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
  }, [])

  const nzkFuse = useMemo(
    () =>
      new Fuse(hymns, {
        includeScore: true,
        threshold: 0.4,
        keys: ['title', 'id'],
      }),
    [],
  )

  const englishFuse = useMemo(
    () =>
      new Fuse(englishHymns, {
        includeScore: true,
        threshold: 0.4,
        keys: ['title', 'first_line', 'tags'],
      }),
    [],
  )

  const filteredNzkHymns = useMemo(() => {
    const searched = search.trim() ? nzkFuse.search(search).map(({ item }) => item) : hymns
    return activeCategory === 'All'
      ? searched
      : searched.filter((hymn) => hymn.category === activeCategory)
  }, [activeCategory, nzkFuse, search])

  const filteredEnglishHymns = useMemo(() => {
    const searched = search.trim() ? englishFuse.search(search).map(({ item }) => item) : englishHymns
    return activeCategory === 'All'
      ? searched
      : searched.filter((hymn) => hymn.category === activeCategory)
  }, [activeCategory, englishFuse, search])

  const handleInstall = async () => {
    if (!installPrompt) return
    await installPrompt.prompt()
    const result = await installPrompt.userChoice
    setInstallToast(
      result.outcome === 'accepted'
        ? 'Nyimbo za Kristo installed successfully.'
        : 'Install dismissed. You can install later from the menu.',
    )
    setInstallPrompt(null)
  }

  const goHome = () => {
    clearListScroll(LIST_SCROLL_KEYS.nzk)
    clearListScroll(LIST_SCROLL_KEYS.gccsatx)
    closeFloatingPlayer()
    navigate({ view: 'home', nzkHymn: null, englishHymn: null }, 'replace')
    setSearch('')
    setActiveCategory('All')
    window.scrollTo(0, 0)
  }

  const openCollection = (collection: HymnalCollection) => {
    clearListScroll(LIST_SCROLL_KEYS[collection])
    closeFloatingPlayer()
    navigate({
      view: collection,
      nzkHymn: null,
      englishHymn: null,
    })
    setSearch('')
    setActiveCategory('All')
    window.scrollTo(0, 0)
  }

  const selectNzkHymn = (hymn: Hymn) => {
    saveListScroll(LIST_SCROLL_KEYS.nzk)
    navigate({ view: 'nzk', nzkHymn: hymn, englishHymn: null })
    window.scrollTo(0, 0)
  }

  const selectEnglishHymn = (hymn: EnglishHymn) => {
    saveListScroll(LIST_SCROLL_KEYS.gccsatx)
    navigate({ view: 'gccsatx', nzkHymn: null, englishHymn: hymn })
    window.scrollTo(0, 0)
  }

  const openCredits = () => {
    navigate({
      view: 'credits',
      returnView: view,
      nzkHymn: selectedNzkHymn,
      englishHymn: selectedEnglishHymn,
    })
  }

  const navbarSubtitle =
    view === 'gccsatx' ? 'English Hymns' : view === 'nzk' ? 'Nyimbo za Kristo' : 'SDA Hymnal PWA'

  const isDetailView = Boolean(selectedNzkHymn || selectedEnglishHymn)
  const mobileSplitLayout = isDetailView && showFloatingPlayer

  return (
    <div
      className={`min-h-screen bg-slate-50 font-body dark:bg-navy-950 ${mobileSplitLayout ? 'max-md:overflow-hidden' : ''}`}
    >
      <Navbar
        darkMode={darkMode}
        canInstall={Boolean(installPrompt)}
        subtitle={navbarSubtitle}
        onToggleDarkMode={() => setDarkMode((prev) => !prev)}
        onInstall={handleInstall}
        onGoHome={goHome}
        onShowCredits={openCredits}
      />

      <main
        className={`mx-auto max-w-5xl px-4 py-5 ${
          mobileSplitLayout
            ? 'max-md:fixed max-md:inset-x-0 max-md:top-[calc(3.5rem+40dvh)] max-md:bottom-0 max-md:z-10 max-md:overflow-y-auto max-md:py-3 md:pb-36 md:pr-[25rem]'
            : showFloatingPlayer
              ? 'pb-64 md:pb-36 md:pr-[25rem]'
              : ''
        }`}
      >
        {view === 'credits' ? (
          <CreditsPanel
            onBack={() => {
              if (window.history.length > 1) {
                historyBack()
                return
              }
              navigate(
                {
                  view: returnView === 'credits' ? 'home' : returnView,
                  nzkHymn: null,
                  englishHymn: null,
                },
                'replace',
              )
            }}
          />
        ) : view === 'home' ? (
          <HomeScreen onSelectCollection={openCollection} />
        ) : view === 'nzk' ? (
          selectedNzkHymn ? (
            <HymnDetail
              hymn={selectedNzkHymn}
              language={language}
              onToggleLanguage={() => setLanguage((prev) => (prev === 'sw' ? 'en' : 'sw'))}
              onBack={historyBack}
            />
          ) : (
            <HymnList
              hymns={filteredNzkHymns}
              search={search}
              activeCategory={activeCategory}
              onSearchChange={setSearch}
              onCategoryChange={setActiveCategory}
              onSelectHymn={selectNzkHymn}
              heading="Nyimbo za Kristo"
              subheading="Swahili SDA hymnal with optional English lyrics. Search by number or title."
            />
          )
        ) : selectedEnglishHymn ? (
          <EnglishHymnDetail hymn={selectedEnglishHymn} onBack={historyBack} />
        ) : (
          <EnglishHymnList
            hymns={filteredEnglishHymns}
            search={search}
            activeCategory={activeCategory}
            onSearchChange={setSearch}
            onCategoryChange={setActiveCategory}
            onSelectHymn={selectEnglishHymn}
          />
        )}
      </main>

      {!mobileSplitLayout && <ScrollNavButtons />}

      {showFloatingPlayer && mediaSession && (
        <FloatingMediaPlayer
          session={mediaSession}
          selectedVideoId={selectedVideoId}
          onSelectedVideoIdChange={setSelectedVideoId}
          onClose={closeFloatingPlayer}
          pinnedTop={mobileSplitLayout}
        />
      )}

      {installToast && (
        <div className="fixed bottom-4 left-1/2 z-50 w-[92%] max-w-sm -translate-x-1/2 rounded-xl border border-gold-500/40 bg-navy-900 px-4 py-3 text-sm font-medium text-white shadow-reverent dark:bg-navy-950">
          {installToast}
        </div>
      )}
    </div>
  )
}

export default App
