import { ChevronLeft, Languages } from 'lucide-react'
import type { Hymn } from '../types/hymn'

interface HymnDetailProps {
  hymn: Hymn
  language: 'sw' | 'en'
  onToggleLanguage: () => void
  onBack: () => void
}

export function HymnDetail({ hymn, language, onToggleLanguage, onBack }: HymnDetailProps) {
  const lyrics = language === 'sw' ? hymn.swahili_lyrics : hymn.english_lyrics

  return (
    <section className="max-md:min-h-0">
      <button
        onClick={onBack}
        className="mb-3 flex items-center gap-2 text-sm font-medium text-navy-900 dark:text-gold-400"
      >
        <ChevronLeft size={16} /> Back to hymns
      </button>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-navy-800 dark:bg-navy-900 md:p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-gold-500">{hymn.category}</p>
        <h1 className="mt-1 font-display text-xl font-bold text-navy-900 dark:text-white md:mt-2 md:text-2xl">
          {hymn.id}. {hymn.title}
        </h1>

        <div className="mt-3 flex items-center justify-between rounded-xl bg-slate-50 p-2.5 dark:bg-navy-950 md:mt-4 md:p-3">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
            {language === 'sw' ? 'Swahili Lyrics' : 'English Lyrics'}
          </p>
          <button
            onClick={onToggleLanguage}
            className="inline-flex items-center gap-1 rounded-lg border border-gold-500 px-2 py-1 text-xs font-semibold text-gold-500 md:px-3"
          >
            <Languages size={14} />
            {language === 'sw' ? 'Switch to English' : 'Badili kwa Kiswahili'}
          </button>
        </div>

        <article className="mt-3 whitespace-pre-line font-display text-base leading-7 text-slate-800 dark:text-slate-100 md:mt-4 md:text-lg md:leading-8">
          {lyrics}
        </article>
      </div>
    </section>
  )
}
