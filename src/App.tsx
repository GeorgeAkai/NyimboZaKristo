import { useCallback, useEffect, useMemo, useState } from 'react'
import Fuse from 'fuse.js'
import { englishHymns, hymnCatalog, igboHymns, nzkHymns } from './data/hymnCatalog'
import { Navbar } from './components/Navbar'
import { HomeScreen } from './components/HomeScreen'
import { HymnList } from './components/HymnList'
import { EnglishHymnList } from './components/EnglishHymnList'
import { IgboHymnList } from './components/IgboHymnList'
import { HymnDetailView } from './components/HymnDetailView'
import { CreditsPanel } from './components/CreditsPanel'
import { SettingsScreen } from './components/SettingsScreen'
import { ScrollNavButtons } from './components/ScrollNavButtons'
import { NowPlayingStrip } from './components/NowPlayingStrip'
import { MinimizedMediaPlayer } from './components/MinimizedMediaPlayer'
import { BackgroundMediaPlayback } from './components/BackgroundMediaPlayback'
import {
  getDisplayPreferences,
  resolveEffectiveTheme,
  setDisplayPreferences,
  type DisplayPreferences,
} from './lib/displayPreferences'
import {
  buildAbuDetailModel,
  buildGccsatxDetailModel,
  buildNzkDetailModel,
} from './lib/hymnDetailModel'
import { getDisplayedHymn, navbarSubtitle } from './lib/appNavigation'
import { useAccompanimentSession } from './hooks/useAccompanimentSession'
import { useAppNavigation } from './hooks/useAppNavigation'
import { useConnectivity } from './hooks/useConnectivity'
import { useOfflineManifest } from './hooks/useOfflineManifest'
import type { EnglishHymn, Hymn, IgboHymn } from './types/hymn'
import packageJson from '../package.json'

const LANGUAGE_KEY = 'nzk-language'
const COLLECTION_KEY = 'nzk-collection'
const LAST_NZK_HYMN_KEY = 'nzk-last-hymn-id'
const LAST_ENGLISH_HYMN_KEY = 'nzk-last-english-hymn-id'
const LAST_IGBO_HYMN_KEY = 'nzk-last-igbo-hymn-id'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

function App() {
  const { isOnline } = useConnectivity()
  const offlineManifest = useOfflineManifest()
  const {
    navigation,
    historyBack,
    goHome,
    openCollection,
    selectNzkHymn,
    selectEnglishHymn,
    selectIgboHymn,
    openCredits,
    openSettings,
    creditsBack,
  } = useAppNavigation()

  const { view, nzkHymn, englishHymn, igboHymn } = navigation
  const displayedHymn = getDisplayedHymn(navigation)
  const bootHymn = nzkHymn ?? englishHymn ?? igboHymn

  const mediaContext = useMemo(
    () => ({ isOnline, offlineManifest }),
    [isOnline, offlineManifest],
  )

  const {
    syncDetail,
    stop: stopAccompaniment,
    selectVideo,
    startFromSelection,
    isOnActiveDetail,
    showNowPlaying,
    detailBandVideoId,
    mediaSession,
    playback,
    activeVideoId,
  } = useAccompanimentSession(mediaContext, bootHymn)

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

  const updateDisplayPreferences = useCallback((partial: Partial<DisplayPreferences>) => {
    setDisplayPreferencesState(setDisplayPreferences(localStorage, partial))
  }, [])

  const effectiveDark =
    resolveEffectiveTheme(displayPreferences.theme, systemPrefersDark) === 'dark'

  useEffect(() => {
    syncDetail(displayedHymn)
  }, [displayedHymn, syncDetail])

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
    if (nzkHymn) {
      localStorage.setItem(LAST_NZK_HYMN_KEY, String(nzkHymn.id))
      return
    }
    localStorage.removeItem(LAST_NZK_HYMN_KEY)
  }, [nzkHymn])

  useEffect(() => {
    if (englishHymn) {
      localStorage.setItem(LAST_ENGLISH_HYMN_KEY, String(englishHymn.id))
      return
    }
    localStorage.removeItem(LAST_ENGLISH_HYMN_KEY)
  }, [englishHymn])

  useEffect(() => {
    if (igboHymn) {
      localStorage.setItem(LAST_IGBO_HYMN_KEY, String(igboHymn.id))
      return
    }
    localStorage.removeItem(LAST_IGBO_HYMN_KEY)
  }, [igboHymn])

  const goToActiveHymn = useCallback(() => {
    const ref = playback.activeHymnRef
    if (!ref) return

    if (ref.collection === 'nzk') {
      const hymn = hymnCatalog.nzk.find((item) => item.id === ref.id)
      if (hymn) {
        selectNzkHymn(hymn)
        syncDetail(hymn)
      }
      return
    }

    if (ref.collection === 'gccsatx') {
      const hymn = hymnCatalog.english.find((item) => item.id === ref.id)
      if (hymn) {
        selectEnglishHymn(hymn)
        syncDetail(hymn)
      }
      return
    }

    const hymn = hymnCatalog.igbo.find((item) => item.id === ref.id)
    if (hymn) {
      selectIgboHymn(hymn)
      syncDetail(hymn)
    }
  }, [playback.activeHymnRef, selectEnglishHymn, selectIgboHymn, selectNzkHymn, syncDetail])

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
      new Fuse(nzkHymns, {
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

  const igboFuse = useMemo(
    () =>
      new Fuse(igboHymns, {
        includeScore: true,
        threshold: 0.4,
        keys: ['title', 'first_line', 'subtitle', 'english_hint', 'id'],
      }),
    [],
  )

  const filteredNzkHymns = useMemo(() => {
    const searched = search.trim() ? nzkFuse.search(search).map(({ item }) => item) : nzkHymns
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

  const filteredIgboHymns = useMemo(() => {
    const searched = search.trim() ? igboFuse.search(search).map(({ item }) => item) : igboHymns
    return activeCategory === 'All'
      ? searched
      : searched.filter((hymn) => hymn.category === activeCategory)
  }, [activeCategory, igboFuse, search])

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

  const handleGoHome = () => {
    goHome()
    setSearch('')
    setActiveCategory('All')
  }

  const handleOpenCollection = (collection: Parameters<typeof openCollection>[0]) => {
    openCollection(collection)
    setSearch('')
    setActiveCategory('All')
  }

  const handleSelectNzkHymn = (hymn: (typeof nzkHymns)[number]) => {
    selectNzkHymn(hymn)
    syncDetail(hymn)
  }

  const handleSelectEnglishHymn = (hymn: EnglishHymn) => {
    selectEnglishHymn(hymn)
    syncDetail(hymn)
  }

  const handleSelectIgboHymn = (hymn: IgboHymn) => {
    selectIgboHymn(hymn)
    syncDetail(hymn)
  }

  const isDetailView = Boolean(displayedHymn)
  const onActiveHymnDetail = isOnActiveDetail(navigation, isDetailView)
  const showNowPlayingStrip = showNowPlaying(navigation)
  const showMinimizedPlayer = playback.isPlaying && mediaSession !== null && !onActiveHymnDetail
  const showBackgroundPlayer = playback.isPlaying && mediaSession !== null && !onActiveHymnDetail

  const detailModel = useMemo(() => {
    if (nzkHymn) {
      return buildNzkDetailModel(nzkHymn, language, isOnline, () =>
        setLanguage((prev) => (prev === 'sw' ? 'en' : 'sw')),
      )
    }
    if (englishHymn) {
      return buildGccsatxDetailModel(englishHymn, isOnline, offlineManifest)
    }
    if (igboHymn) {
      return buildAbuDetailModel(igboHymn, isOnline)
    }
    return null
  }, [englishHymn, igboHymn, isOnline, language, nzkHymn, offlineManifest])

  const mainBottomPadding = showMinimizedPlayer ? 'pb-24' : ''

  return (
    <div className="min-h-screen bg-slate-50 font-body dark:bg-navy-950">
      <Navbar
        darkMode={effectiveDark}
        canInstall={Boolean(installPrompt)}
        subtitle={navbarSubtitle(view)}
        onToggleDarkMode={() => {
          updateDisplayPreferences({ theme: effectiveDark ? 'light' : 'dark' })
        }}
        onInstall={handleInstall}
        onGoHome={handleGoHome}
        onShowCredits={openCredits}
        onOpenSettings={openSettings}
      />

      {showNowPlayingStrip && mediaSession && (
        <NowPlayingStrip title={mediaSession.label} onGoToHymn={goToActiveHymn} />
      )}

      <main className={`mx-auto max-w-5xl px-4 py-5 ${mainBottomPadding}`}>
        {view === 'credits' ? (
          <CreditsPanel onBack={creditsBack} />
        ) : view === 'settings' ? (
          <SettingsScreen
            preferences={displayPreferences}
            appVersion={packageJson.version}
            onChange={updateDisplayPreferences}
            onBack={historyBack}
            onOpenCredits={openCredits}
          />
        ) : view === 'home' ? (
          <HomeScreen onSelectCollection={handleOpenCollection} />
        ) : view === 'nzk' ? (
          detailModel && nzkHymn ? (
            <HymnDetailView
              model={detailModel}
              displayPreferences={displayPreferences}
              selectedVideoId={detailBandVideoId}
              onSelectedVideoIdChange={(videoId) => selectVideo(videoId, navigation)}
              onAccompanimentStart={(videoId) => startFromSelection(navigation, videoId)}
              onBack={historyBack}
            />
          ) : (
            <HymnList
              hymns={filteredNzkHymns}
              search={search}
              activeCategory={activeCategory}
              onSearchChange={setSearch}
              onCategoryChange={setActiveCategory}
              onSelectHymn={handleSelectNzkHymn}
              heading="Nyimbo za Kristo"
              subheading="Swahili SDA hymnal with optional English lyrics. Search by number or title."
            />
          )
        ) : view === 'gccsatx' ? (
          detailModel && englishHymn ? (
            <HymnDetailView
              model={detailModel}
              displayPreferences={displayPreferences}
              selectedVideoId={detailBandVideoId}
              onSelectedVideoIdChange={(videoId) => selectVideo(videoId, navigation)}
              onAccompanimentStart={(videoId) => startFromSelection(navigation, videoId)}
              onBack={historyBack}
            />
          ) : (
            <EnglishHymnList
              hymns={filteredEnglishHymns}
              search={search}
              activeCategory={activeCategory}
              onSearchChange={setSearch}
              onCategoryChange={setActiveCategory}
              onSelectHymn={handleSelectEnglishHymn}
            />
          )
        ) : view === 'abu' ? (
          detailModel && igboHymn ? (
            <HymnDetailView
              model={detailModel}
              displayPreferences={displayPreferences}
              selectedVideoId={detailBandVideoId}
              onSelectedVideoIdChange={(videoId) => selectVideo(videoId, navigation)}
              onAccompanimentStart={(videoId) => startFromSelection(navigation, videoId)}
              onBack={historyBack}
            />
          ) : (
            <IgboHymnList
              hymns={filteredIgboHymns}
              search={search}
              activeCategory={activeCategory}
              onSearchChange={setSearch}
              onCategoryChange={setActiveCategory}
              onSelectHymn={handleSelectIgboHymn}
            />
          )
        ) : null}
      </main>

      <ScrollNavButtons />

      {showBackgroundPlayer && mediaSession && (
        <BackgroundMediaPlayback
          session={mediaSession}
          selectedVideoId={activeVideoId}
          onSelectedVideoIdChange={(videoId) => selectVideo(videoId, navigation)}
        />
      )}

      {showMinimizedPlayer && mediaSession && (
        <MinimizedMediaPlayer
          session={mediaSession}
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
