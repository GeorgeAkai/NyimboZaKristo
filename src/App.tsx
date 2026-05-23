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
import { SettingsScreen } from './components/SettingsScreen'
import { ScrollNavButtons } from './components/ScrollNavButtons'
import { NowPlayingStrip } from './components/NowPlayingStrip'
import { MinimizedMediaPlayer } from './components/MinimizedMediaPlayer'
import { BackgroundMediaPlayback } from './components/BackgroundMediaPlayback'
import { buildMediaSession, type MediaSession } from './lib/hymnMedia'
import {
  getDisplayPreferences,
  resolveEffectiveTheme,
  setDisplayPreferences,
  type DisplayPreferences,
} from './lib/displayPreferences'
import { resolveInstrumentalPlayback } from './lib/instrumentalSource'
import {
  hymnRefsEqual,
  initialMediaPlaybackState,
  reduceMediaPlayback,
  shouldShowNowPlayingStrip,
  type HymnRef,
} from './lib/mediaPlaybackController'
import type { AppHistoryState } from './lib/appHistory'
import { pushAppHistory, readAppHistoryState, replaceAppHistory } from './lib/appHistory'
import { LIST_SCROLL_KEYS, type AppView } from './lib/navigation'
import { clearListScroll, restoreListScroll, saveListScroll } from './lib/scrollRestore'
import { useConnectivity } from './hooks/useConnectivity'
import { useOfflineManifest } from './hooks/useOfflineManifest'
import type { EnglishHymn, Hymn, HymnalCollection } from './types/hymn'
import packageJson from '../package.json'

const hymns = hymnsData as Hymn[]
const englishHymns = (gccsatxHymnsData as EnglishHymn[]).map((hymn) => ({
  ...hymn,
  collection: 'gccsatx' as const,
}))

const LANGUAGE_KEY = 'nzk-language'
const COLLECTION_KEY = 'nzk-collection'
const LAST_NZK_HYMN_KEY = 'nzk-last-hymn-id'
const LAST_ENGLISH_HYMN_KEY = 'nzk-last-english-hymn-id'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

function getDisplayedHymnRef(
  nzkHymn: Hymn | null,
  englishHymn: EnglishHymn | null,
): HymnRef | null {
  if (nzkHymn) return { collection: 'nzk', id: nzkHymn.id }
  if (englishHymn) return { collection: 'gccsatx', id: englishHymn.id }
  return null
}

function App() {
  const { isOnline } = useConnectivity()
  const offlineManifest = useOfflineManifest()

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
  const [displayPreferences, setDisplayPreferencesState] = useState<DisplayPreferences>(() =>
    getDisplayPreferences(localStorage),
  )
  const [systemPrefersDark, setSystemPrefersDark] = useState(
    () => window.matchMedia('(prefers-color-scheme: dark)').matches,
  )
  const [activeCategory, setActiveCategory] = useState<Hymn['category'] | 'All'>('All')
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [installToast, setInstallToast] = useState<string | null>(null)
  const [returnView, setReturnView] = useState<AppView>('home')
  const [playbackState, setPlaybackState] = useState(initialMediaPlaybackState)
  const [activeMediaSession, setActiveMediaSession] = useState<MediaSession | null>(null)
  const [bandVideoId, setBandVideoId] = useState(() => {
    const savedNzkId = Number(localStorage.getItem(LAST_NZK_HYMN_KEY))
    if (savedNzkId) {
      const hymn = hymns.find((item) => item.id === savedNzkId)
      return hymn ? buildMediaSession(hymn)?.videoId ?? '' : ''
    }
    const savedEnglishId = Number(localStorage.getItem(LAST_ENGLISH_HYMN_KEY))
    if (savedEnglishId) {
      const hymn = englishHymns.find((item) => item.id === savedEnglishId)
      return hymn ? buildMediaSession(hymn)?.videoId ?? '' : ''
    }
    return ''
  })
  const isHistoryNavigation = useRef(false)

  const updateDisplayPreferences = useCallback((partial: Partial<DisplayPreferences>) => {
    setDisplayPreferencesState(setDisplayPreferences(localStorage, partial))
  }, [])

  const effectiveDark =
    resolveEffectiveTheme(displayPreferences.theme, systemPrefersDark) === 'dark'

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
    const nzkHymn = state.nzkHymnId ? hymns.find((h) => h.id === state.nzkHymnId) ?? null : null
    const englishHymn = state.englishHymnId
      ? englishHymns.find((h) => h.id === state.englishHymnId) ?? null
      : null

    setView(state.view)
    setReturnView(state.returnView ?? 'home')
    setSelectedNzkHymn(nzkHymn)
    setSelectedEnglishHymn(englishHymn)

    const hymn = nzkHymn ?? englishHymn
    if (hymn) {
      setBandVideoId(buildMediaSession(hymn)?.videoId ?? '')
    } else {
      setBandVideoId('')
    }

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
    root.classList.toggle('dark', effectiveDark)
  }, [effectiveDark])

  useEffect(() => {
    if (displayPreferences.theme !== 'system') return
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const update = () => setSystemPrefersDark(media.matches)
    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [displayPreferences.theme])

  useEffect(() => {
    localStorage.setItem(LANGUAGE_KEY, language)
  }, [language])

  useEffect(() => {
    if (view === 'home' || view === 'credits' || view === 'settings') {
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

  const buildPlaybackSession = useCallback(
    (hymn: Hymn | EnglishHymn, collection: HymnalCollection): MediaSession | null => {
      const label =
        collection === 'nzk' && 'id' in hymn
          ? `${hymn.id}. ${hymn.title}`
          : `${hymn.id}. ${hymn.title}`
      const session = buildMediaSession(hymn, label)
      if (!session) return null

      if (collection === 'gccsatx' && 'instrumental_url' in hymn) {
        const instrumental = resolveInstrumentalPlayback({
          hymnId: hymn.id,
          remoteUrl: hymn.instrumental_url,
          isOnline,
          manifest: offlineManifest,
        })
        return { ...session, instrumentalUrl: instrumental.url ?? '' }
      }

      return session
    },
    [isOnline, offlineManifest],
  )

  const stopAccompaniment = useCallback(() => {
    setPlaybackState((prev) => reduceMediaPlayback(prev, { type: 'STOP_ACCOMPANIMENT' }))
    setActiveMediaSession(null)
    setBandVideoId('')
  }, [])

  const handleBandVideoChange = useCallback((videoId: string) => {
    setBandVideoId(videoId)
    setActiveMediaSession((prev) => (prev ? { ...prev, videoId } : null))
    setPlaybackState((prev) => {
      if (!prev.isPlaying) return prev
      return reduceMediaPlayback(prev, { type: 'SET_VIDEO_ID', videoId })
    })
  }, [])

  const startAccompaniment = useCallback(
    (videoIdOverride?: string) => {
      const hymn = selectedNzkHymn ?? selectedEnglishHymn
      if (!hymn) return
      const collection: HymnalCollection = selectedNzkHymn ? 'nzk' : 'gccsatx'
      const session = buildPlaybackSession(hymn, collection)
      if (!session) return

      const hymnRef: HymnRef = { collection, id: hymn.id }
      const videoId = videoIdOverride || bandVideoId || session.videoId

      setPlaybackState((prev) =>
        reduceMediaPlayback(prev, {
          type: 'START_ACCOMPANIMENT',
          hymnRef,
          videoId,
        }),
      )
      setActiveMediaSession({ ...session, videoId })
      setBandVideoId(videoId)
    },
    [bandVideoId, buildPlaybackSession, selectedEnglishHymn, selectedNzkHymn],
  )

  const goToActiveHymn = useCallback(() => {
    const ref = playbackState.activeHymnRef
    if (!ref) return

    if (ref.collection === 'nzk') {
      const hymn = hymns.find((item) => item.id === ref.id)
      if (hymn) {
        navigate({ view: 'nzk', nzkHymn: hymn, englishHymn: null })
        window.scrollTo(0, 0)
      }
      return
    }

    const hymn = englishHymns.find((item) => item.id === ref.id)
    if (hymn) {
      navigate({ view: 'gccsatx', nzkHymn: null, englishHymn: hymn })
      window.scrollTo(0, 0)
    }
  }, [navigate, playbackState.activeHymnRef])

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
    navigate({ view: 'home', nzkHymn: null, englishHymn: null }, 'replace')
    setSearch('')
    setActiveCategory('All')
    window.scrollTo(0, 0)
  }

  const openCollection = (collection: HymnalCollection) => {
    clearListScroll(LIST_SCROLL_KEYS[collection])
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
    setBandVideoId(buildMediaSession(hymn)?.videoId ?? '')
    navigate({ view: 'nzk', nzkHymn: hymn, englishHymn: null })
    window.scrollTo(0, 0)
  }

  const selectEnglishHymn = (hymn: EnglishHymn) => {
    saveListScroll(LIST_SCROLL_KEYS.gccsatx)
    setBandVideoId(buildMediaSession(hymn)?.videoId ?? '')
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

  const openSettings = () => {
    navigate({
      view: 'settings',
      returnView: view,
      nzkHymn: selectedNzkHymn,
      englishHymn: selectedEnglishHymn,
    })
  }

  const navbarSubtitle =
    view === 'gccsatx'
      ? 'English Hymns'
      : view === 'nzk'
        ? 'Nyimbo za Kristo'
        : view === 'settings'
          ? 'Settings'
          : 'SDA Hymnal PWA'

  const isDetailView = Boolean(selectedNzkHymn || selectedEnglishHymn)
  const displayedHymnRef = getDisplayedHymnRef(selectedNzkHymn, selectedEnglishHymn)
  const onActiveHymnDetail =
    isDetailView &&
    playbackState.activeHymnRef !== null &&
    hymnRefsEqual(playbackState.activeHymnRef, displayedHymnRef)

  const showNowPlaying =
    playbackState.isPlaying &&
    shouldShowNowPlayingStrip(playbackState.activeHymnRef, displayedHymnRef)

  const showMinimizedPlayer =
    playbackState.isPlaying && activeMediaSession !== null && !onActiveHymnDetail

  const showBackgroundPlayer =
    playbackState.isPlaying && activeMediaSession !== null && !onActiveHymnDetail

  const activeVideoId = playbackState.selectedVideoId || activeMediaSession?.videoId || ''

  const mainBottomPadding = showMinimizedPlayer ? 'pb-24' : ''

  return (
    <div className="min-h-screen bg-slate-50 font-body dark:bg-navy-950">
      <Navbar
        darkMode={effectiveDark}
        canInstall={Boolean(installPrompt)}
        subtitle={navbarSubtitle}
        onToggleDarkMode={() => {
          updateDisplayPreferences({ theme: effectiveDark ? 'light' : 'dark' })
        }}
        onInstall={handleInstall}
        onGoHome={goHome}
        onShowCredits={openCredits}
        onOpenSettings={openSettings}
      />

      {showNowPlaying && activeMediaSession && (
        <NowPlayingStrip title={activeMediaSession.label} onGoToHymn={goToActiveHymn} />
      )}

      <main className={`mx-auto max-w-5xl px-4 py-5 ${mainBottomPadding}`}>
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
        ) : view === 'settings' ? (
          <SettingsScreen
            preferences={displayPreferences}
            appVersion={packageJson.version}
            onChange={updateDisplayPreferences}
            onBack={historyBack}
            onOpenCredits={openCredits}
          />
        ) : view === 'home' ? (
          <HomeScreen onSelectCollection={openCollection} />
        ) : view === 'nzk' ? (
          selectedNzkHymn ? (
            <HymnDetail
              hymn={selectedNzkHymn}
              language={language}
              isOnline={isOnline}
              displayPreferences={displayPreferences}
              selectedVideoId={bandVideoId}
              onSelectedVideoIdChange={handleBandVideoChange}
              onAccompanimentStart={startAccompaniment}
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
          <EnglishHymnDetail
            hymn={selectedEnglishHymn}
            isOnline={isOnline}
            offlineManifest={offlineManifest}
            displayPreferences={displayPreferences}
            selectedVideoId={bandVideoId}
            onSelectedVideoIdChange={handleBandVideoChange}
            onAccompanimentStart={startAccompaniment}
            onBack={historyBack}
          />
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

      <ScrollNavButtons />

      {showBackgroundPlayer && activeMediaSession && (
        <BackgroundMediaPlayback
          session={activeMediaSession}
          selectedVideoId={activeVideoId}
          onSelectedVideoIdChange={handleBandVideoChange}
        />
      )}

      {showMinimizedPlayer && activeMediaSession && (
        <MinimizedMediaPlayer
          session={activeMediaSession}
          onReturnToHymn={goToActiveHymn}
          onStop={stopAccompaniment}
        />
      )}

      {installToast && (
        <div
          className={`fixed left-1/2 z-50 w-[92%] max-w-sm -translate-x-1/2 rounded-xl border border-gold-500/40 bg-navy-900 px-4 py-3 text-sm font-medium text-white shadow-reverent dark:bg-navy-950 ${
            showMinimizedPlayer ? 'bottom-20' : 'bottom-4'
          }`}
        >
          {installToast}
        </div>
      )}
    </div>
  )
}

export default App
