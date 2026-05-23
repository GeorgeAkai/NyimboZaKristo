# PRD: Production Readiness — Lyrics-First UX & Offline Accompaniment (v1)

**Status:** Ready for agent  
**Source:** `CONTEXT.md` (grill-with-docs session, ADR-001–031)  
**Primary ship target:** Google Play (Capacitor Android)  
**Secondary:** Render web (feature parity, post-Play)

---

## Problem Statement

Nyimbo Za Kristo has been in active development for several weeks. Congregants need a dependable hymnal app for worship: **reading lyrics is the primary task**, with video and instrumental audio as optional **accompaniment**. Today the hymn detail experience does not consistently reflect that priority—layout, offline behavior, media handoff, and readability settings are incomplete or inconsistent between Swahili and English corpora. Users in low-connectivity settings must read lyrics offline, while understanding clearly when video or audio requires the internet. The product owner wants production readiness defined by **strong UX (Nielsen’s 10 heuristics)**, not merely a build that installs—first on the Play Store, then on Render with the same feature set.

---

## Solution

Deliver a **lyrics-first hymn detail screen** shared by Swahili (`HymnDetail`) and English (`EnglishHymnDetail`) with responsive **accompaniment bands** (portrait vertical split, phone-landscape horizontal split), explicit **empty-state** and **offline** messaging, a **minimized player** that persists across navigation, and **Settings** for lyric font (Inter / Montserrat / Merriweather), size (Small / Medium / Large), and theme (Light / Dark / System). Bundle **English instrumental MP3s** up to a **50 MB** ceiling for offline play on popular hymns; keep **all lyrics offline**, **YouTube online-only**, and **Swahili instrumentals online-only** in v1. Run a **structured QA pass** before Play release. Keep the existing **home hymnal picker** unchanged.

---

## User Stories

### Lyrics-first layout

1. As a worshipper, I want lyrics to occupy most of the screen when I open a hymn, so that I can read and sing without media dominating my view.
2. As a worshipper, I want the accompaniment area to stay visible at the top (portrait) or side (phone landscape) while I scroll lyrics, so that I can start or adjust media without losing my place in the text.
3. As a worshipper on a phone in portrait, I want the accompaniment band to use roughly 35–45% of the height when video or audio exists, so that media is usable without shrinking lyrics too much.
4. As a worshipper on a phone in portrait, I want a small empty-state card (10–20% height) when no video or audio exists, so that lyrics use nearly the full screen instead of a large blank area.
5. As a worshipper who rotated my phone to landscape, I want lyrics on the left (60%) and accompaniment on the right (40%), so that I can read and watch side by side.
6. As a worshipper in landscape with no accompaniment, I want a narrow empty-state column (10–20% width) on the right, so that lyrics use most of the width.
7. As a worshipper on a tablet or desktop, I want the same vertical split as phone portrait, so that the app behaves predictably across devices.
8. As a Swahili hymnal user, I want the same layout rules as the English hymnal, so that I do not relearn the UI per language.
9. As a worshipper, I want verse and chorus formatting preserved when lyric display settings change, so that hymn structure remains clear.

### Accompaniment & media

10. As a worshipper, I want to treat video and instrumental audio as accompaniment to reading, not as the main screen, so that the app matches how I use a physical hymnal with optional backing tracks.
11. As a worshipper, I want to see “No accompaniment” with clear copy when a hymn has no linked video or audio, so that I know the app is working and not broken.
12. As a worshipper offline, I want to read all hymn lyrics (Swahili and English), so that poor sanctuary Wi‑Fi does not block worship.
13. As a worshipper offline, I want a clear message that video requires internet instead of a broken YouTube embed, so that I understand why video will not play.
14. As a worshipper offline, I want bundled English instrumentals to play normally, so that I can practice familiar hymns without data.
15. As a worshipper offline, I want a clear message when an English instrumental is not in the offline bundle, so that I know I need connectivity for that track.
16. As a worshipper, I want to keep listening when I navigate back to the hymn list, so that I can find the next song without stopping the choir track.
17. As a worshipper, I want to tap the minimized player to return to the hymn that is playing, so that I can see lyrics again quickly.
18. As a worshipper, I want to tap X on the minimized player to stop playback completely, so that audio does not continue unintentionally.
19. As a worshipper browsing hymns while one is playing, I want the previous hymn to keep playing until I explicitly stop or tap play on a new hymn, so that I am not surprised by abrupt changes.
20. As a worshipper viewing hymn B while hymn A plays, I want a “Now playing” strip with a way to jump back to hymn A, so that I am not confused about what is playing.
21. As a worshipper, I want the minimized player to show the hymn title at the bottom with safe-area padding, so that it feels native on Android and does not cover list content awkwardly.
22. As an English hymnal user, I want to switch between up to five YouTube choir versions when online, so that I can pick a performance I prefer.
23. As a worshipper, I want instrumental and video controls grouped in the accompaniment band on the detail screen, so that all media actions are in one place.

### Settings & readability

24. As a worshipper with low vision, I want Small / Medium / Large lyric sizes, so that I can read comfortably at arm’s length.
25. As a worshipper, I want to choose Inter, Montserrat, or Merriweather for lyrics, so that I can match my reading preference.
26. As a new user, I want Medium size and Merriweather by default, so that the app looks polished without configuration.
27. As a worshipper, I want lyric display options on a Settings screen, so that hymn reading stays uncluttered.
28. As a worshipper, I want a live preview stanza on Settings when I change font or size, so that I know what I am choosing.
29. As a worshipper, I want Light, Dark, and System theme options in Settings, so that the app respects my device or preference.
30. As a worshipper, I want the navbar theme toggle to stay available as a shortcut, so that I can switch theme quickly without opening Settings.
31. As a worshipper using Large lyrics, I want the layout to remain usable in portrait and landscape splits, so that text does not break the accompaniment band.

### Discovery & navigation (unchanged home)

32. As a first-time user, I want to choose between Nyimbo za Kristo and English Hymns on the home screen, so that I pick the right corpus.
33. As a Swahili user, I want to search and filter hymns by category in the list, so that I can find songs by number or title.
34. As an English user, I want to search English hymns by title, first line, and tags, so that I can find songs I partially remember.
35. As a Swahili user on a hymn with English translation, I want to toggle Swahili/English lyrics, so that I can sing in my preferred language.
36. As a user, I want list scroll position restored when I return from a hymn, so that I do not lose my place in long lists.
37. As a user, I want browser back / Android back to follow in-app history, so that navigation feels natural.

### Offline bundle (English)

38. As a product owner, I want the offline instrumental bundle to stay within 50 MB, so that Play download size stays reasonable.
39. As a product owner, I want popular English hymns prioritized (SDA top-10 seed list, then greedy fill), so that the bundle maximizes real-world value.
40. As an English user, I want a visible indicator when an instrumental is available offline, so that I know before tapping play in airplane mode.
41. As a maintainer, I want a build step that generates a versioned offline manifest and assets, so that each release documents exactly which tracks ship offline.

### Production & QA

42. As a product owner, I want a structured QA checklist covering layout, offline, media handoff, and Settings, so that Play release is blocked on P0/P1 defects only.
43. As a product owner, I want QA repeated before declaring Render web ready, so that web matches Android behavior (ADR-011).
44. As a worshipper installing from Play, I want the release build to work in airplane mode for lyrics and bundled instrumentals, so that the app is trustworthy in church.
45. As a worshipper, I want Credits and attribution reachable from Settings About, so that gccsatx and YouTube sources are transparent.

### Explicit non-goals (v1)

46. As a product owner, I accept that Swahili instrumentals remain online-only in v1, so that we ship without sourcing NZK MP3s.
47. As a product owner, I accept no favorites/recents on home in v1, so that scope stays focused on hymn detail quality.
48. As a product owner, I accept no hymn-to-hymn swipe navigation in v1, so that we avoid gesture conflicts with lyrics scrolling.

---

## Implementation Decisions

### Architectural alignment

All decisions below mirror **`CONTEXT.md` ADR-001–031**. Domain terms: **accompaniment**, **accompaniment band**, **empty-state card**, **minimized player**, **media session**, **accompaniment handoff**, **offline indicator**, **popular hymn set**, **lyric display settings**.

### Deep modules (new or extracted)

| Module | Responsibility | Interface (conceptual) |
|--------|----------------|----------------------|
| **Hymn detail layout** | Given viewport (orientation, size), accompaniment availability (none / video / audio / both), return layout mode and CSS band sizes (35–45%, 10–20%, 60/40, etc.). | `resolveHymnDetailLayout(input) → LayoutSpec` |
| **Display preferences** | Persist and read lyric font family, lyric size step, theme (light \| dark \| system). Defaults: Merriweather, Medium, system or light per current app. | `getDisplayPreferences()`, `setDisplayPreferences(partial)` |
| **Connectivity** | Expose `isOnline` from `navigator.onLine` + window events; optional debounce. | `useConnectivity() → { isOnline }` |
| **Offline instrumentals** | Load build-time manifest; map gccsatx hymn id → bundled asset URL or null. | `getOfflineInstrumentalUrl(hymnId) → string \| null`, `isInstrumentalOffline(hymnId) → boolean` |
| **Media playback controller** | Own active `MediaSession`, playing hymn identity (collection + id), selected video id; rules for start/stop/handoff per ADR-008/009; decouple from “selected hymn in UI”. | `startSession(session, hymnRef)`, `stopSession()`, `handoffToNewHymn(session)`, `activeHymnRef` |
| **Offline bundle builder** (build script) | Greedy-download MP3s by priority list to ≤50 MB; emit manifest JSON. | CLI: `npm run build:offline-instrumentals` |
| **Accompaniment band** (UI) | Shell component: renders empty-state, offline message, or children (player). | Props: `state: 'empty' \| 'offline-video' \| 'offline-audio' \| 'online'`, `layoutSpec` |
| **Now playing strip** (UI) | Shows when `activeHymnRef` ≠ currently displayed hymn. | Props: `activeLabel`, `onGoToHymn` |

### Modules to modify

| Module | Changes |
|--------|---------|
| **App shell** | Wire Settings route; integrate media playback controller (fix: do not replace session on every hymn select—ADR-009); show now playing strip; bottom padding when minimized player visible; add `settings` to `AppView`. |
| **Hymn detail (Swahili)** | Refactor to split layout: sticky accompaniment band + scrollable lyrics; integrate `FormattedLyrics` with preferences; media session UI in band (NZK may lack instrumentals today—still show video/empty/offline). |
| **Hymn detail (English)** | Same layout shell as Swahili; instrumental source resolver (bundled vs remote); offline badge. |
| **Floating media player** | Minimized: bottom bar, title, X stops completely, tap navigates to active hymn; expanded/pinned: respect `LayoutSpec`; choir selector unchanged when online. |
| **Formatted lyrics** | Apply font family + size classes from display preferences. |
| **Navbar** | Link to Settings; theme toggle writes same preference store as Settings. |
| **Settings screen** (new) | Lyrics section (preview, font, size), Appearance (theme), About (version, credits link). |
| **Index / fonts** | Add Montserrat to Google Fonts link. |

### Media session lifecycle (ADR-008, ADR-009)

Current behavior rebuilds `MediaSession` whenever the selected hymn changes, which conflicts with “keep playing until explicit stop.”

```
type HymnRef = { collection: 'nzk' | 'gccsatx'; id: number }

state:
  activeSession: MediaSession | null
  activeHymnRef: HymnRef | null
  selectedVideoId: string
  isPlaying: boolean

on navigate to hymn B while A playing:
  → do NOT clear activeSession
  → show NowPlayingStrip on B’s detail

on user taps play on B:
  → stop A, build session for B, set activeHymnRef = B

on minimized player X:
  → stop playback, clear activeSession and activeHymnRef
```

### Layout spec (prototype)

```ts
type LayoutMode =
  | 'portrait-with-media'      // band min 35% max 45% height
  | 'portrait-empty'           // card min 10% max 20% height
  | 'landscape-with-media'     // 60% lyrics / 40% accompaniment width
  | 'landscape-empty'          // ~80–90% lyrics / 10–20% card width

type LayoutSpec = {
  mode: LayoutMode
  lyricsClass: string   // flex child, min-h-0, overflow-y-auto
  bandClass: string     // sticky/fixed band sizing
}
```

Portrait vs landscape detection: use `(orientation: landscape)` combined with max-height or pointer/coarse touch heuristic so tablets in landscape keep **portrait-vertical** per ADR-005 (not width alone).

### Offline instrumental manifest (build output)

```ts
type OfflineInstrumentalManifest = {
  version: string
  maxBytes: number
  totalBytes: number
  entries: Array<{
    hymnId: number
    title: string
    assetPath: string   // e.g. /instrumentals/621.mp3
    bytes: number
  }>
}
```

Priority seed IDs: 621, 595, 856, 519, 768, 612, 1042, 1084, 1383, 838, 1389, then continue by popularity list until `totalBytes ≤ 52_428_800`.

### Lyric size tokens (ADR-023)

| Step | Classes |
|------|---------|
| Small | `text-base leading-7` |
| Medium | `text-lg leading-8` |
| Large | `text-xl leading-9` |

### Theme (ADR-024)

Replace boolean-only dark mode with `theme: 'light' | 'dark' | 'system'`. On system, listen to `prefers-color-scheme`. Navbar toggle cycles or mirrors Settings—both update the same store.

### Swahili detail gap

`HymnDetail` today shows lyrics only (no `FloatingMediaPlayer` pinned in component—player is global). NZK data in `hymns.json` lacks `instrumental_url`; video fields may exist on some hymns. Layout and empty/offline states still apply; instrumentals for NZK remain online-only until data exists.

### Implementation order

1. Hymn detail layout + accompaniment band + empty/offline states  
2. Media playback controller + minimized player + now playing strip  
3. Settings + display preferences + FormattedLyrics  
4. Offline bundle script + manifest + English instrumental resolver  
5. Structured QA → Play → Render  

---

## Testing Decisions

### What makes a good test

- Test **observable behavior** and module **contracts**, not CSS class names or React implementation details.
- Prefer **pure functions** in deep modules (layout resolver, preference defaults, manifest lookup, media handoff state machine).
- Do **not** require Playwright for v1 unless already adopted; no test files exist today.

### Modules to test (recommended)

| Module | Rationale |
|--------|-----------|
| **Hymn detail layout resolver** | Pure; many orientation/accompaniment combinations; high regression risk. |
| **Display preferences** | Defaults (Medium + Merriweather), persistence round-trip, invalid stored values fall back. |
| **Offline instrumentals resolver** | Given manifest + hymnId → correct URL or null. |
| **Media playback controller / handoff** | State machine: navigate without stop, explicit handoff, X clears session. |
| **Offline bundle builder** | Greedy fill respects 50 MB cap; deterministic with mocked file sizes. |

### Modules to skip unit tests (v1)

- Presentational components (Accompaniment band, Settings preview) — cover in QA checklist.
- YouTube player wrapper — flaky; manual QA only.
- Fuse search — stable; manual QA.

### Prior art

No existing unit tests in repo. Introduce **Vitest** (fits Vite stack) for pure modules only; add `npm test` script.

### QA pass (ADR-030)

Manual gate before Play: portrait/landscape layouts, offline lyrics, offline bundled English MP3, offline video message, mini player tap/X, no auto-switch, Settings persistence, Large font layout, Android back, release build airplane mode.

---

## Out of Scope

- Swahili offline instrumentals (ADR-031)
- Favorites, recents, or redesigned home
- Continuous font-size slider
- Side-by-side hymn layout on tablet/desktop (non–phone-landscape)
- In-app analytics for popularity ranking
- Prev/next hymn swipe navigation
- Render deployment automation (separate infra PRD)
- Play Console listing copy, screenshots, content rating workflow
- Rewriting hymn import pipelines
- Adding `instrumental_url` to full NZK corpus

---

## Further Notes

- **Issue tracker:** Publish this PRD as a GitHub issue with label `ready-for-agent` when the repo has a remote. Local copy: `docs/prd-production-readiness-v1.md`.
- **CONTEXT.md** remains the living ADR glossary; update if implementation diverges.
- **Current gap:** `App` sets `mediaSession` on every selected hymn change—implement media controller before QA sign-off on ADR-009.
- **Capacitor:** Offline MP3s ship in `public/` or `src/assets` and sync to Android via existing `android:sync` workflow.
- **PWA / Render:** Service worker strategy for offline lyrics + instrumentals should mirror Android for ADR-011; can follow Play release.

---

## Module confirmation (for product owner)

Planned deep modules: **layout resolver**, **display preferences**, **connectivity hook**, **offline instrumentals resolver**, **media playback controller**, **offline bundle builder**.

Recommended automated tests: **layout resolver**, **display preferences**, **offline resolver**, **media handoff state machine**, **bundle builder**.

Reply on the issue if you want fewer modules tested or additional UI tests.
