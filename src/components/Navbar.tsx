import { Download, Moon, Settings, Sun } from 'lucide-react'

interface NavbarProps {
  darkMode: boolean
  canInstall: boolean
  subtitle?: string
  onToggleDarkMode: () => void
  onInstall: () => void
  onGoHome: () => void
  onShowCredits?: () => void
  onOpenSettings?: () => void
}

export function Navbar({
  darkMode,
  canInstall,
  subtitle = 'SDA Hymnal PWA',
  onToggleDarkMode,
  onInstall,
  onGoHome,
  onShowCredits,
  onOpenSettings,
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur dark:border-navy-900 dark:bg-navy-950/95">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <button
          onClick={onGoHome}
          className="flex items-center gap-3 text-left"
          aria-label="Go to home screen"
        >
          <div className="grid h-10 w-10 place-content-center rounded-full border-2 border-gold-500 bg-navy-900 text-xs font-semibold text-gold-500">
            SDA
          </div>
          <div>
            <p className="font-display text-lg font-bold text-navy-900 dark:text-gold-400">
              Nyimbo za Kristo
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-300">{subtitle}</p>
          </div>
        </button>

        <div className="flex items-center gap-2">
          {onOpenSettings && (
            <button
              onClick={onOpenSettings}
              className="rounded-full border border-slate-300 p-2 text-slate-700 transition hover:border-gold-500 hover:text-gold-500 dark:border-navy-700 dark:text-slate-200"
              aria-label="Open settings"
            >
              <Settings size={18} />
            </button>
          )}

          {onShowCredits && (
            <button
              onClick={onShowCredits}
              className="rounded-full border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-gold-500 hover:text-gold-500 dark:border-navy-700 dark:text-slate-200"
            >
              Credits
            </button>
          )}

          {canInstall && (
            <button
              onClick={onInstall}
              className="inline-flex items-center gap-1 rounded-full border border-gold-500 px-3 py-2 text-xs font-semibold text-gold-500 transition hover:bg-gold-500 hover:text-navy-900"
              aria-label="Install Nyimbo za Kristo"
            >
              <Download size={14} />
              Install
            </button>
          )}

          <button
            onClick={onToggleDarkMode}
            className="rounded-full border border-slate-300 p-2 text-slate-700 transition hover:border-gold-500 hover:text-gold-500 dark:border-navy-700 dark:text-slate-200"
            aria-label="Toggle theme"
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </nav>
    </header>
  )
}
