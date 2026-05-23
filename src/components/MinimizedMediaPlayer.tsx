import { Music2, X } from 'lucide-react'
import type { MediaSession } from '../lib/hymnMedia'

interface MinimizedMediaPlayerProps {
  session: MediaSession
  onReturnToHymn: () => void
  onStop: () => void
}

export function MinimizedMediaPlayer({ session, onReturnToHymn, onStop }: MinimizedMediaPlayerProps) {
  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-4 py-2 shadow-reverent backdrop-blur dark:border-navy-800 dark:bg-navy-950/95"
      style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}
    >
      <div className="mx-auto flex max-w-5xl items-center gap-3">
        <button
          type="button"
          onClick={onReturnToHymn}
          className="flex min-w-0 flex-1 items-center gap-2 text-left"
          aria-label={`Return to ${session.label}`}
        >
          <Music2 size={18} className="shrink-0 text-gold-500" aria-hidden />
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Now playing
            </p>
            <p className="truncate text-sm font-medium text-navy-900 dark:text-gold-400">
              {session.label}
            </p>
          </div>
        </button>
        <button
          type="button"
          onClick={onStop}
          className="rounded-full p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-navy-800"
          aria-label="Stop playback"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  )
}
