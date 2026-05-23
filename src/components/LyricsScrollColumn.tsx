import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'

interface LyricsScrollColumnProps {
  children: ReactNode
  /** Applied to the element that scrolls (should include layout flex/overflow classes). */
  className?: string
  /** Shown after the user scrolls to the final verse. */
  footer?: ReactNode
}

export function LyricsScrollColumn({ children, className, footer }: LyricsScrollColumnProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const sentinelRef = useRef<HTMLDivElement>(null)
  const [showFooter, setShowFooter] = useState(false)

  const updateFooterVisibility = useCallback(() => {
    const root = scrollRef.current
    const sentinel = sentinelRef.current
    if (!root || !sentinel) return

    const rootRect = root.getBoundingClientRect()
    const sentinelRect = sentinel.getBoundingClientRect()
    const nearBottom = sentinelRect.top <= rootRect.bottom + 64
    setShowFooter(nearBottom)
  }, [])

  useEffect(() => {
    const root = scrollRef.current
    const sentinel = sentinelRef.current
    if (!root || !sentinel) return

    const observer = new IntersectionObserver(
      ([entry]) => setShowFooter(entry.isIntersecting),
      { root, threshold: 0, rootMargin: '0px 0px 64px 0px' },
    )

    observer.observe(sentinel)
    root.addEventListener('scroll', updateFooterVisibility, { passive: true })
    updateFooterVisibility()

    const resizeObserver = new ResizeObserver(updateFooterVisibility)
    resizeObserver.observe(root)

    return () => {
      observer.disconnect()
      root.removeEventListener('scroll', updateFooterVisibility)
      resizeObserver.disconnect()
    }
  }, [children, footer, updateFooterVisibility])

  return (
    <div
      ref={scrollRef}
      className={
        className ??
        'flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain'
      }
    >
      {children}
      <div ref={sentinelRef} className="h-1 w-full shrink-0" aria-hidden />
      {footer && showFooter ? <div className="mt-6 shrink-0 pb-1">{footer}</div> : null}
    </div>
  )
}
