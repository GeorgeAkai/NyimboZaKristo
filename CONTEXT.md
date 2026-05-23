# Nyimbo Za Kristo — Design Context

## Ubiquitous Language

| Term | Definition |
|------|------------|
| **Production readiness** | The app meets a high UX bar (Nielsen’s 10 usability heuristics), not merely “builds and ships.” |
| **Primary distribution** | **Google Play** installed Android app (`sda.nyimbozakristo.app` via Capacitor). |
| **Secondary distribution** | **Web app** hosted on **Render**, deployed once the web build is production-ready (not the first ship target). |
| **Offline lyrics** | Hymn lyrics (Swahili and English) must be readable **without internet** on Android. |
| **Online-only media** | **YouTube video** playback requires an active internet connection. |
| **Offline instrumentals (goal)** | Instrumental audio should play offline for the **most popular hymns** only, within a **50 MB** download budget; all other instrumentals stream online. |
| **Popular hymn set** | English gccsatx instrumentals ranked by research, packed to **50 MB** (ADR-016); not Swahili in v1. |
| **Lyric display settings** | **Default:** **Medium** + **Merriweather**. User can choose **Small / Medium / Large** and **Inter / Montserrat / Merriweather** on Settings. |
| **Settings** | Dedicated screen: lyric display, appearance (theme), about/credits. |
| **Offline indicator** | Clear, non-blocking status when video or non-bundled audio needs internet. |
| **Now playing strip** | When another hymn’s media is active, hymn detail shows a compact “Now playing …” affordance to return. |
| **Core experience** | A user primarily **reads** hymn lyrics; video and audio are **accompaniment** only. |
| **Accompaniment** | Optional video and/or audio that supports singing along; never the primary focus of the hymn screen. |
| **Hymn screen layout — with accompaniment (mobile)** | Accompaniment band **flexes between 35% and 45%** of the viewport (~40% target); lyrics fill the remainder and scroll. |
| **Hymn screen layout — without accompaniment (mobile)** | **Empty-state card** flexes within **10–20%** of the viewport; lyrics fill the remainder and scroll. |
| **Empty-state card** | UI shown when a hymn has no linked video and no linked audio; not a media player, only an informational placeholder in the accompaniment band. |
| **Minimized player** | Compact persistent UI (`FloatingMediaPlayer` mini mode) that keeps audio/video playing after the user leaves the hymn detail screen. **Tap** → navigate back to that hymn; **X** → dismiss player and **stop playback completely**. |
| **Accompaniment handoff** | Opening another hymn does **not** auto-switch playback; the user must **explicitly stop** or **tap play** on the new hymn’s video/audio to stop the old session and start the new one. |
| **Hymn detail screen** | The per-hymn view showing lyrics plus accompaniment; implemented as `HymnDetail` (Swahili) and `EnglishHymnDetail` (English) with **identical layout rules**. |
| **Hymn screen layout (portrait)** | Vertical split: accompaniment **top**, lyrics **bottom** (35–45% / 10–20% bands as defined above). |
| **Hymn screen layout (landscape, with accompaniment)** | **Side-by-side**: lyrics **left 60%**, video + accompaniment **right 40%**. |
| **Hymn screen layout (landscape, without accompaniment)** | Lyrics **left ~80–90%**; **empty-state card** on the right in a **10–20%** column band (flexible within that range). |
| **Hymn screen layout (tablet/desktop)** | Same **vertical** split as mobile portrait—no side-by-side at wider breakpoints except mobile landscape. |

## Architectural Decision Records

### ADR-001: Production success criterion is UX quality

**Status:** Accepted

**Context:** After several weeks of development, the goal is to harden the app for real use—not only fix bugs and polish visuals.

**Decision:** “Production ready” means **great UX aligned with the 10 usability heuristics**, with the hymn consumed via audio, video, or lyrics.

**Consequences:** Work should be prioritized by user-facing friction in those three modes; store/submission mechanics are secondary until UX goals are clear.

### ADR-002: Lyrics-first hymn screen with fixed accompaniment band

**Status:** Accepted

**Context:** Listen, watch, and read were initially treated as peer modes; the product intent is reading-first.

**Decision:** **Reading lyrics is the primary mode.** Video and instrumental audio are accompaniment only. On **mobile**, the hymn detail UI splits viewport height between an accompaniment band and scrollable lyrics. When accompaniment is present, the band **flexes between 35% and 45%** of the viewport (~40% target) across screen sizes—not a single fixed percentage.

**Consequences:** UX reviews and layout work should judge the hymn detail screen by lyric readability first; media features must not dominate or displace the lyrics pane. Implementation must align existing components (`HymnDetail`, `EnglishHymnDetail`, `YoutubePlayer`, `FloatingMediaPlayer`) to responsive min/max constraints rather than a hardcoded 40/60 split.

### ADR-003: No-accompaniment hymns use a compact empty-state card

**Status:** Accepted

**Context:** Not every hymn has video or audio; the layout must not waste 40% of the screen on an empty accompaniment band.

**Decision:** When a hymn has **no video and no audio**, show an **empty-state card** in the accompaniment area. The card’s height is **flexible within a 10–20% viewport band** so it adapts across mobile screen sizes (not a single fixed percentage). Lyrics fill the remaining space.

**Consequences:** Lyrics gain more space when accompaniment is absent. The card is informational only—not a player. Layout uses min/max viewport constraints rather than one hardcoded height.

### ADR-004: Swahili and English hymn detail share one layout system

**Status:** Accepted

**Context:** The app has separate detail components for Swahili (`HymnDetail`) and English (`EnglishHymnDetail`) hymn corpora.

**Decision:** Both screens use the **same layout rules**: lyrics-first, accompaniment band 35–45% when media exists, empty-state card 10–20% when none.

**Consequences:** Layout logic should be shared or duplicated consistently; UX review applies once per rule set, not per language.

### ADR-005: Vertical hymn layout at all breakpoints

**Status:** Accepted

**Context:** Wider viewports could use a side-by-side accompaniment + lyrics layout.

**Decision:** **Tablet and desktop keep the same vertical split** as mobile portrait (top accompaniment band, bottom scrollable lyrics). Percent bands (35–45% with media, 10–20% empty-state) apply on portrait and on tablet/desktop.

**Consequences:** No separate wide-screen side-by-side layout for tablet/desktop; accompaniment may appear large on very wide screens—acceptable trade-off for consistency.

### ADR-006: Mobile landscape uses side-by-side 60/40 split

**Status:** Accepted

**Context:** Vertical split wastes horizontal space in landscape; users may rotate phones while singing.

**Decision:** On **mobile landscape only**, the hymn detail screen uses a **horizontal split**: **lyrics left (60%)**, **video + accompaniment right (40%)**. Portrait and tablet/desktop remain vertical per ADR-005.

**Consequences:** Layout system needs an orientation breakpoint distinct from width-only breakpoints.

### ADR-007: Landscape empty-state uses a narrow right column (10–20%)

**Status:** Accepted

**Context:** Landscape with media uses a 60/40 split; without media, 40% right column would waste space.

**Decision:** In **mobile landscape** with **no video and no audio**, the empty-state card sits in a **right column that flexes within 10–20%** of the viewport width (same band as portrait empty-state height). Lyrics occupy the remaining **~80–90%** on the left.

**Consequences:** Portrait and landscape share the same 10–20% empty-state band concept; only the axis changes (height vs width).

### ADR-008: Accompaniment continues in a minimized player after navigation

**Status:** Accepted

**Context:** Users may browse other hymns or screens while singing along to accompaniment.

**Decision:** If audio or video is playing on the hymn detail screen and the user **navigates away**, playback **continues** in a **minimized player** (existing `FloatingMediaPlayer` mini mode), not stopped automatically.

**Decision (interaction):** Tapping the minimized player **navigates back** to the hymn that is playing. **X** dismisses the minimized player and **stops playback completely** (no background audio/video).

**Consequences:** Navigation must not tear down the active `MediaSession` on ordinary route change; X must clear session state and release media resources.

### ADR-009: No auto-switch of accompaniment when changing hymns

**Status:** Accepted

**Context:** User may browse hymns while one hymn’s accompaniment is still playing (including via minimized player).

**Decision:** Opening a **different hymn** does **not** automatically replace the active accompaniment. Playback **continues** for the previous hymn until the user **explicitly stops** (e.g. mini player X) **or taps play** on the new hymn’s video or audio—in which case the previous session **stops** and the **new** accompaniment starts.

**Consequences:** Hymn detail for a non-playing hymn may show empty or stale mini-player state until user initiates new media; UI must make “tap to switch” obvious and avoid implying the new hymn is already playing.

### ADR-010: Play Store Android is primary; Render web is secondary

**Status:** Accepted

**Context:** The codebase supports Capacitor Android and a Vite PWA/web build; production effort must be prioritized.

**Decision:** **Primary production target** is users installing the app from the **Google Play Store** (Capacitor Android). **Secondary**: deploy the **web app on Render** after the web build is ready—not a blocker for the first Play release.

**Consequences:** UX and QA should optimize for Android first; web/Render deployment can follow. Shared React UI should not assume Play-only APIs without web fallbacks where both matter long-term.

### ADR-011: Web (Render) has feature parity with Android

**Status:** Accepted

**Context:** Secondary Render deployment could have been a reduced “lyrics-only” experience to ship faster.

**Decision:** The **Render-hosted web app must offer the same features** as the Play Store Android app (lyrics, search, video, instrumental audio, bilingual corpora, minimized player behavior, etc.)—not a stripped subset.

**Consequences:** No Android-only feature branches without a planned web equivalent; QA checklist applies to both targets before calling web “ready.”

### ADR-012: Lyrics work offline; video requires internet

**Status:** Accepted

**Context:** Church use often has poor connectivity; lyrics are the primary mode (ADR-002).

**Decision:** On Android, users can **read hymn lyrics offline**. **YouTube video** accompaniment requires internet.

**Consequences:** Hymn text and search index must be bundled or cached in the app shell; video UI should degrade clearly when offline; PWA/service-worker strategy should align with this for web parity long-term.

### ADR-013: Offline instrumentals within a 50 MB download budget

**Status:** Accepted

**Context:** Instrumentals are currently remote HTTPS URLs (`media.gccsatx.com`); offline playback requires caching or bundling. Full corpus likely exceeds 50 MB.

**Decision:** **Pursue offline instrumental playback** for Android, but only if the approach does **not increase the app download size by more than 50 MB** (bundled assets and/or documented initial offline package—exact accounting TBD). If the full instrumental library exceeds the budget, **bundle offline instrumentals only for the most popular hymns**; remaining hymns stream instrumentals when online.

**Consequences:** Implementation must measure total instrumental payload before bundling; if the full set exceeds 50 MB, need a fallback strategy (on-demand cache with cap, subset, or online-only for overflow). Technical spike required before build.

### ADR-014: Offline instrumentals for popular hymns only

**Status:** Accepted

**Context:** Full offline corpus likely exceeds the 50 MB cap (ADR-013); users still want offline accompaniment for hymns they sing most.

**Decision:** Identify the **most popular hymns** and ship/cache **only their instrumentals** for offline play. All other instrumentals remain **online-only**. Total offline instrumental payload must stay within the **50 MB** download budget.

**Consequences:** Requires a maintained **popular hymn list** and build-step to bundle matching MP3s; UI should indicate when a hymn’s instrumental is available offline vs stream-only.

**Research (2026-05):** “Most popular” derived from public sources, not in-app analytics yet:

| Source | Rationale |
|--------|-----------|
| [Nyimbo za Kristo v4 hymnal index](https://adventhymnals.github.io/nyimbo-za-kristo-v4/) | Hymns **1–20** are the standard opening worship set (e.g. *Mtakatifu*, *Twamsifu Mungu*, *Msalabani pa Mwokozi*). |
| [SDA Hymnal “Top 10”](https://www.sdahymnal.org/Top-10-Hymns) | English SDA staples by play/usage ranking: *How Great Thou Art*, *Great Is Thy Faithfulness*, *What a Friend We Have in Jesus*, *’Tis So Sweet to Trust in Jesus*, *Praise to the Lord*, etc. |
| Cross-hymnal favorites | *Cha kutumaini sina* (NZK **69**), *Tabibu Mkuu* / Great Physician (NZK **111**), *Hakuna Rafiki Kama Yesu* (NZK **44**), *Msalabani pa Mwokozi* (NZK **19**). |

**Proposed v1 offline instrumental set (subject to 50 MB cap):**

- **English only** (`gccsatx-hymns.json`): rank by popularity research (SDA top-10 first), then **add more English hymns with `instrumental_url` until the bundled MP3 total is as close to 50 MB as possible** without exceeding it.
- **Swahili NZK:** lyrics remain offline; instrumentals stay **online-only** (no bundled Swahili MP3s in v1).

**Data gap:** `src/data/hymns.json` (Swahili) currently has **no** `instrumental_url` fields; instrumentals exist on `gccsatx-hymns.json` (~349 tracks). Offline Swahili instrumentals require sourcing URLs or MP3s and a build step.

**Budget note:** At ~2–4 MB per MP3, **50 MB ≈ 12–25 instrumentals**—the full candidate set must be trimmed by size after a manifest audit.

### ADR-015: Offline instrumentals are English-only in v1

**Status:** Accepted

**Context:** Swahili NZK popular hymns lack `instrumental_url` in `hymns.json`; English gccsatx already has ~349 streamed instrumentals; 50 MB budget forces a subset.

**Decision:** The **offline instrumental bundle contains English hymns only** (gccsatx corpus). Swahili hymns keep **offline lyrics** but **online-only** instrumentals until a future release adds Swahili sources.

**Consequences:** Build pipeline bundles MP3s from gccsatx `instrumental_url` list ranked by popularity research; `HymnDetail` / Swahili path unchanged for instrumentals; `EnglishHymnDetail` can show offline badge when a bundled track exists.

### ADR-016: Pack the English offline bundle to the 50 MB ceiling

**Status:** Accepted

**Context:** A minimal top-10-only bundle would leave download budget unused; more offline value fits under the cap.

**Decision:** After seeding from the researched popular English set, **keep adding English instrumentals in priority order until the total bundled size is as close to 50 MB as possible without going over**.

**Consequences:** Build script must fetch HEAD/content-length (or download and sum), greedily fill the manifest, and skip the next track if it would exceed 50 MB; manifest versioned per app release.

### ADR-017: Keep current home screen (hymnal picker)

**Status:** Accepted

**Context:** Production UX work could redesign entry into search, recents, or favorites.

**Decision:** **Leave home as-is:** `HomeScreen` shows “Choose a hymnal” with two cards—**Nyimbo za Kristo** (Swahili NZK) and **English Hymns** (gccsatx)—then the user enters that collection’s list/search flow.

**Consequences:** No v1 work on recents/favorites landing page; production polish focuses on hymn detail, media, and list/search within each collection.

### ADR-018: Bug discovery via structured QA pass

**Status:** Accepted

**Context:** Production readiness requires fixing defects; the owner may not have a pre-written bug list.

**Decision:** **No ad-hoc bug backlog required upfront.** Blockers and fixes will be identified during a **structured QA pass** before Play Store release (and again before Render web is declared ready).

**Consequences:** QA checklist should cover both hymnals, portrait/landscape layouts, offline lyrics, online/offline instrumentals (English bundle), minimized player, and Android-specific flows; findings triaged before build.

### ADR-019: User-adjustable lyric font size and font family

**Status:** Accepted

**Context:** Lyrics-first UX (ADR-002); readability matters for worship use (older users, dim sanctuary lighting).

**Decision:** Users choose lyric **font size** from **three fixed steps only: Small, Medium, Large** (no continuous slider—to avoid unforeseen layout breakage). Users select from **exactly 3 font families** (ADR-021). Settings persist across sessions.

**Consequences:** `FormattedLyrics` (and related detail views) must read display preferences; preset list should stay small for consistency; QA includes layout at largest size in 35–45% / 60–40% splits.

### ADR-020: Lyric display preferences live on a Settings screen

**Status:** Accepted

**Context:** Font size/family could be inline on hymn detail or centralized.

**Decision:** Font size and font family controls live on a **dedicated Settings screen**, reachable from the app header/menu—not inline-only on hymn detail.

**Consequences:** Add Settings route/screen and navigation entry; hymn detail reads persisted preferences only; Settings should preview lyric appearance at each size step; QA must verify portrait/landscape splits at **Large** without overflow regressions.

**Font count:** **3** preset families (ADR-020 supplement).

### ADR-021: Three lyric fonts — Inter, Montserrat, Merriweather

**Status:** Accepted

**Decision:** The **3** lyric font presets are:

1. **Inter** (default UI sans; already loaded)
2. **Montserrat** (sans; add to Google Fonts link)
3. **Merriweather** (serif; already loaded)

**Consequences:** Settings shows three labeled options with preview; add Montserrat to `index.html` font stylesheet.

### ADR-022: Default lyric display is Medium + Merriweather

**Status:** Accepted (product owner)

**Decision:** New installs default to **Medium** size and **Merriweather** font.

**Consequences:** `localStorage` keys default to these values when unset; Settings preview opens on Medium/Merriweather.

---

## UX lead decisions (remaining v1 scope)

*Resolved by UX review per product owner request—no further grill questions on these items.*

### ADR-023: Lyric size tokens (fixed steps)

**Status:** Accepted

| Step | Tailwind-scale intent | Use |
|------|----------------------|-----|
| **Small** | `text-base` / `leading-7` | Dense screens, experienced users |
| **Medium** | `text-lg` / `leading-8` | **Default**; matches current `FormattedLyrics` feel |
| **Large** | `text-xl` / `leading-9` | Low vision, arm’s-length phone use |

**Consequences:** Only these three classes; no `rem` slider. QA at **Large** on smallest supported phone (320px width).

### ADR-024: Settings screen structure

**Status:** Accepted

**Sections:**

1. **Lyrics** — font family (3 radio cards with preview line), size (Small / Medium / Large segmented control), live preview block using a fixed sample stanza.
2. **Appearance** — theme: **Light**, **Dark**, **System** (follow `prefers-color-scheme`). Navbar theme toggle remains as a shortcut; both write the same preference.
3. **About** — app version, link to existing **Credits** content, short note on gccsatx / YouTube attribution.

**Consequences:** Navbar gains a gear icon or menu item → Settings; no font controls on hymn detail.

### ADR-025: Accompaniment band is sticky; lyrics scroll independently

**Status:** Accepted

**Decision:** On hymn detail, the **accompaniment band does not scroll away** with lyrics. Only the **lyrics pane** scrolls (`overflow-y: auto`).

**Consequences:** Matches lyrics-first intent; video/player always reachable; implement via flex column with `min-h-0` on lyrics child.

### ADR-026: Empty-state and offline messaging in the accompaniment band

**Status:** Accepted

| State | Accompaniment band shows |
|-------|---------------------------|
| No video & no audio | **Empty-state card:** music-off icon, “No accompaniment”, subtext “Lyrics only for this hymn.” |
| Offline + video available | “Video requires an internet connection.” No broken embed. |
| Offline + instrumental not in bundle | “Instrumental requires an internet connection.” |
| Offline + instrumental bundled | Normal local `<audio>` controls. |
| Online | Current player UI (YouTube + instrumental). |

**Consequences:** Visibility of system status (Nielsen #1); no silent failures or infinite spinners.

### ADR-027: Minimized player placement and content

**Status:** Accepted

**Decision:** Fixed **bottom** bar above safe-area inset; shows **hymn title** (truncated), optional **choir/version** if video; **tap bar** → return to hymn; **X** → stop completely (ADR-008). Do not obscure list scroll permanently—add bottom padding to main content when mini player visible.

**Consequences:** Z-index above list, below modals; respects `env(safe-area-inset-bottom)` on Android.

### ADR-028: “Now playing” when viewing a different hymn

**Status:** Accepted

**Decision:** If user opens hymn B while hymn A is playing, show a **compact strip** under the navbar: “Playing: {A title}” + **Go to hymn** — not auto-switch (ADR-009). Strip hidden when no active session.

**Consequences:** Reduces confusion; avoids implying B is playing.

### ADR-029: English offline bundle priority order (greedy fill to 50 MB)

**Status:** Accepted

**Seed order** (gccsatx `id`, then continue down [hymnallibrary.org](https://www.hymnallibrary.org/blog/hymns-in-the-seventh-day-adventist-hymnal/) popular classics with `instrumental_url` until ~50 MB):

1. 621 How Great Thou Art  
2. 595 Great Is Thy Faithfulness  
3. 856 What a Friend We Have in Jesus  
4. 519 ’Tis So Sweet to Trust in Jesus  
5. 768 Praise to the Lord  
6. 612 Holy, Holy, Holy  
7. 1042 My Hope Is Built on Nothing Less  
8. 1084 I Surrender All  
9. 1383 Joyful, Joyful, We Adore Thee  
10. 838 Turn Your Eyes Upon Jesus  
11. 1389 Down at the Cross  
12. Then: 519-adjacent and other high-traffic SDA titles with shortest MP3 files first if tie-breaking needed.

**Consequences:** `scripts/build-offline-instrumentals.mjs` (or similar) outputs `offline-manifest.json` + `assets/instrumentals/`; English detail reads manifest for offline badge.

### ADR-030: Structured QA pass (v1 gate)

**Status:** Accepted

**Checklist (Play Store Android first):**

| Area | Cases |
|------|--------|
| **Heuristic: visibility** | Offline banners; empty-state card; loading states for YouTube |
| **Heuristic: match real world** | Swahili + English corpora; hymn numbers; choir selector |
| **Heuristic: user control** | Back stack; mini player X stops; no auto-switch (ADR-009) |
| **Layout** | Portrait 35–45% / 10–20%; landscape 60/40 and 80–90%; tablet vertical; Large lyrics |
| **Media** | Video online-only; bundled English MP3 offline; handoff tap-to-play new hymn |
| **Settings** | Defaults Medium/Merriweather; persistence; theme System/Light/Dark |
| **Regression** | Home picker; search; scroll restore; dark mode; Credits |
| **Android** | Back gesture, safe areas, release build, airplane mode |

**Consequences:** No Play upload until P0/P1 from this pass are closed; repeat for Render web before ADR-011 “ready.”

### ADR-031: Deferred to post-v1 (explicit non-goals)

**Status:** Accepted

- Swahili offline instrumentals  
- Favorites / recents on home  
- Continuous font-size slider  
- Side-by-side layout on tablet/desktop  
- In-app analytics-driven “popular” list  
- Prev/next hymn swipe gestures (consider v1.1)

---

## Nielsen heuristics → v1 focus map

| # | Heuristic | How v1 addresses it |
|---|-----------|---------------------|
| 1 | Visibility of system status | ADR-026 offline/empty states; mini player shows active hymn |
| 2 | Match real world | Hymnal numbers, bilingual labels, choir credits |
| 3 | User control & freedom | ADR-008/009; back navigation; explicit stop |
| 4 | Consistency | ADR-004/005 shared layouts; Settings apply globally |
| 5 | Error prevention | No auto-switch; fixed font steps (ADR-019) |
| 6 | Recognition over recall | Now playing strip (ADR-028); visible hymn title in mini player |
| 7 | Flexibility | Settings: 3 fonts × 3 sizes + theme |
| 8 | Aesthetic minimalism | Lyrics-first layout; compact empty-state |
| 9 | Help users recover | Clear offline copy, not blank embeds |
| 10 | Help & documentation | About + Credits in Settings |

---

## Implementation priority (when build starts)

1. Hymn detail layout system (ADR-002–007, ADR-025)  
2. Offline/empty accompaniment states (ADR-026)  
3. Mini player + now playing strip (ADR-027–028, ADR-008–009)  
4. Settings + lyric preferences (ADR-019–024)  
5. English offline bundle pipeline (ADR-029)  
6. QA pass (ADR-030)  
7. Play Store release → Render web (ADR-010–011)
