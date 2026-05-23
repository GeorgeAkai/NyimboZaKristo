import { useEffect, useState } from 'react'
import { ArrowDown, ArrowUp } from 'lucide-react'

const SCROLL_THRESHOLD = 120
const BOTTOM_OFFSET = 48

export function ScrollNavButtons() {
  const [showTop, setShowTop] = useState(false)
  const [showBottom, setShowBottom] = useState(false)

  useEffect(() => {
    const update = () => {
      const scrollY = window.scrollY
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight
      setShowTop(scrollY > SCROLL_THRESHOLD)
      setShowBottom(maxScroll - scrollY > BOTTOM_OFFSET)
    }

    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [])

  if (!showTop && !showBottom) return null

  return (
    <div
      className="fixed bottom-24 right-4 z-40 flex flex-col gap-2 md:bottom-6"
      aria-label="Page scroll shortcuts"
    >
      {showTop && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="grid h-11 w-11 place-content-center rounded-full border border-gold-500/50 bg-white/95 text-navy-900 shadow-reverent backdrop-blur transition hover:bg-gold-500 hover:text-navy-900 dark:bg-navy-900/95 dark:text-gold-400 dark:hover:bg-gold-500 dark:hover:text-navy-900"
          aria-label="Scroll to top"
        >
          <ArrowUp size={20} />
        </button>
      )}
      {showBottom && (
        <button
          type="button"
          onClick={() =>
            window.scrollTo({
              top: document.documentElement.scrollHeight,
              behavior: 'smooth',
            })
          }
          className="grid h-11 w-11 place-content-center rounded-full border border-gold-500/50 bg-white/95 text-navy-900 shadow-reverent backdrop-blur transition hover:bg-gold-500 hover:text-navy-900 dark:bg-navy-900/95 dark:text-gold-400 dark:hover:bg-gold-500 dark:hover:text-navy-900"
          aria-label="Scroll to bottom"
        >
          <ArrowDown size={20} />
        </button>
      )}
    </div>
  )
}
