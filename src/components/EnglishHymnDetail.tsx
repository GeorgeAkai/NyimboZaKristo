import { ChevronLeft, ExternalLink } from 'lucide-react'
import type { EnglishHymn } from '../types/hymn'
import { FormattedLyrics } from './FormattedLyrics'

interface EnglishHymnDetailProps {
  hymn: EnglishHymn
  onBack: () => void
}

export function EnglishHymnDetail({ hymn, onBack }: EnglishHymnDetailProps) {
  return (
    <section className="max-md:min-h-0">
      <button
        onClick={onBack}
        className="mb-3 flex items-center gap-2 text-sm font-medium text-navy-900 dark:text-gold-400"
      >
        <ChevronLeft size={16} /> Back to English Hymns
      </button>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-navy-800 dark:bg-navy-900 md:p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-gold-500">{hymn.category}</p>
        <h1 className="mt-1 font-display text-xl font-bold text-navy-900 dark:text-white md:mt-2 md:text-2xl">
          {hymn.title}
        </h1>

        <div className="mt-3 md:mt-4">
          <FormattedLyrics lyrics={hymn.lyrics} />
        </div>

        <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600 dark:border-navy-700 dark:bg-navy-950 dark:text-slate-300 md:mt-4">
          <p className="font-semibold text-navy-900 dark:text-gold-400">Lyrics source</p>
          <p className="mt-1">{hymn.hymnal}</p>
          <p className="mt-1">
            Lyrics from{' '}
            <a
              href="https://gccsatx.com/hymns/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-gold-600 underline dark:text-gold-400"
            >
              GCCSATX Hymns
            </a>
          </p>
          {hymn.text_copyright && <p className="mt-1">{hymn.text_copyright}</p>}
          {hymn.text_source && (
            <a
              href={hymn.text_source}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-1 font-medium text-gold-600 hover:underline dark:text-gold-400"
            >
              View on gccsatx.com <ExternalLink size={12} />
            </a>
          )}
        </div>
      </div>
    </section>
  )
}
