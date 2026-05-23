import { motion } from 'framer-motion'
import { Search } from 'lucide-react'
import type { Hymn } from '../types/hymn'

interface HymnListProps {
  hymns: Hymn[]
  search: string
  activeCategory: Hymn['category'] | 'All'
  onSearchChange: (value: string) => void
  onCategoryChange: (category: Hymn['category'] | 'All') => void
  onSelectHymn: (hymn: Hymn) => void
  heading?: string
  subheading?: string
}

const suggestedCategories = ['All', 'Sabbath', 'Praise', 'Worship'] as const

export function HymnList({
  hymns,
  search,
  activeCategory,
  onSearchChange,
  onCategoryChange,
  onSelectHymn,
  heading = 'SDA Hymnals, anytime offline',
  subheading = 'Search by hymn number or title and worship without interruption.',
}: HymnListProps) {
  return (
    <section className="space-y-6">
      <div className="rounded-2xl bg-navy-900 p-5 text-white shadow-reverent dark:bg-navy-950">
        <h1 className="font-display text-2xl font-bold">{heading}</h1>
        <p className="mt-2 text-sm text-slate-200">{subheading}</p>

        <label className="mt-4 flex items-center gap-2 rounded-xl border border-navy-700 bg-white/10 px-3 py-2">
          <Search size={16} className="text-gold-400" />
          <input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search hymn number or title"
            className="w-full bg-transparent text-sm outline-none placeholder:text-slate-300"
          />
        </label>
      </div>

      <div>
        <h2 className="mb-3 font-display text-lg font-bold text-navy-900 dark:text-gold-400">
          Suggested Hymnals
        </h2>
        <div className="grid grid-cols-3 gap-2">
          {suggestedCategories.map((category) => (
            <button
              key={category}
              onClick={() => onCategoryChange(category)}
              className={`rounded-xl border px-3 py-2 text-center text-xs font-semibold transition ${
                activeCategory === category
                  ? 'border-gold-500 bg-gold-500 text-navy-900'
                  : 'border-gold-400/40 bg-gold-500/10 text-navy-900 dark:text-gold-400'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {hymns.map((hymn) => (
          <motion.button
            whileTap={{ scale: 0.98 }}
            key={hymn.id}
            onClick={() => onSelectHymn(hymn)}
            className="w-full rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-gold-500 dark:border-navy-800 dark:bg-navy-900"
          >
            <p className="text-xs font-medium uppercase tracking-wide text-gold-500">{hymn.category}</p>
            <h3 className="mt-1 font-display text-lg font-bold text-navy-900 dark:text-white">
              {hymn.id}. {hymn.title}
            </h3>
          </motion.button>
        ))}

        {hymns.length === 0 && (
          <p className="rounded-xl border border-dashed border-slate-300 p-4 text-center text-sm text-slate-500 dark:border-navy-800 dark:text-slate-300">
            No hymn matched your search.
          </p>
        )}
      </div>
    </section>
  )
}
