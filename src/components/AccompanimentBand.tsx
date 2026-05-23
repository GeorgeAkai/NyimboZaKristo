import { Music2, WifiOff } from 'lucide-react'
import type { AccompanimentBandState } from '../lib/accompanimentBandState'
import { isDesktopLayoutMode, type LayoutSpec } from '../lib/hymnDetailLayout'

interface AccompanimentBandProps {
  state: AccompanimentBandState
  layout: LayoutSpec
  children?: React.ReactNode
  offlineInstrumental?: boolean
}

export function AccompanimentBand({
  state,
  layout,
  children,
  offlineInstrumental = false,
}: AccompanimentBandProps) {
  const desktopPanel = isDesktopLayoutMode(layout.mode)

  return (
    <aside className={`${layout.bandClass} bg-slate-50 px-3 py-3 dark:bg-navy-950`}>
      {state === 'empty' && (
        <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
          <Music2 className="text-slate-400 dark:text-slate-500" size={28} aria-hidden />
          <p className="text-sm font-semibold text-navy-900 dark:text-gold-400">No accompaniment</p>
          <p className="text-xs text-slate-600 dark:text-slate-300">Lyrics only for this hymn.</p>
        </div>
      )}

      {state === 'offline-video' && (
        <div className="flex h-full flex-col justify-center gap-3">
          <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100">
            <WifiOff size={16} className="mt-0.5 shrink-0" aria-hidden />
            <p>Video requires an internet connection.</p>
          </div>
          {children}
        </div>
      )}

      {state === 'offline-audio' && (
        <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
          <WifiOff className="text-slate-400 dark:text-slate-500" size={24} aria-hidden />
          <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
            Instrumental requires an internet connection.
          </p>
        </div>
      )}

      {state === 'online' && (
        <div
          className={
            desktopPanel
              ? 'flex h-full shrink-0 flex-col gap-2'
              : 'flex h-full min-h-0 flex-col gap-2 overflow-hidden'
          }
        >
          {offlineInstrumental && (
            <p className="shrink-0 text-[10px] font-semibold uppercase tracking-wide text-gold-600 dark:text-gold-400">
              Offline instrumental available
            </p>
          )}
          {children}
        </div>
      )}
    </aside>
  )
}
