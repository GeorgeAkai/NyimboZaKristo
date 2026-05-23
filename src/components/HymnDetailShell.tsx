import { isDesktopLayoutMode, type LayoutSpec } from '../lib/hymnDetailLayout'

interface HymnDetailShellProps {
  layout: LayoutSpec
  backButton: React.ReactNode
  header: React.ReactNode
  accompaniment: React.ReactNode
  lyrics: React.ReactNode
  footer?: React.ReactNode
}

export function HymnDetailShell({
  layout,
  backButton,
  header,
  accompaniment,
  lyrics,
  footer,
}: HymnDetailShellProps) {
  const desktopLayout = isDesktopLayoutMode(layout.mode)

  return (
    <section
      className={
        desktopLayout
          ? 'flex h-[calc(100dvh-3.5rem)] max-h-[calc(100dvh-3.5rem)] flex-col overflow-hidden'
          : 'flex min-h-[calc(100dvh-3.5rem)] flex-col max-md:min-h-0'
      }
    >
      {backButton}

      <div className="shrink-0 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm dark:border-navy-800 dark:bg-navy-900 md:px-5">
        {header}
      </div>

      <div
        className={`mt-3 min-h-0 flex-1 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-navy-800 dark:bg-navy-900 ${layout.containerClass}`}
      >
        {layout.lyricsBeforeBand ? (
          <>
            {lyrics}
            {accompaniment}
          </>
        ) : (
          <>
            {accompaniment}
            {lyrics}
          </>
        )}
      </div>

      {footer ? <div className="mt-3 shrink-0">{footer}</div> : null}
    </section>
  )
}
