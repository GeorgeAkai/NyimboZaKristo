interface NowPlayingStripProps {
  title: string
  onGoToHymn: () => void
}

export function NowPlayingStrip({ title, onGoToHymn }: NowPlayingStripProps) {
  return (
    <div className="border-b border-gold-500/30 bg-gold-500/10 px-4 py-2 dark:bg-gold-500/5">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
        <p className="truncate text-sm text-slate-700 dark:text-slate-200">
          Playing: <span className="font-semibold text-navy-900 dark:text-gold-400">{title}</span>
        </p>
        <button
          type="button"
          onClick={onGoToHymn}
          className="shrink-0 rounded-lg border border-gold-500 px-3 py-1 text-xs font-semibold text-gold-600 dark:text-gold-400"
        >
          Go to hymn
        </button>
      </div>
    </div>
  )
}
