import { motion } from 'framer-motion'
import { Search } from 'lucide-react'
import type { IgboHymn } from '../types/hymn'

interface IgboHymnListProps {
  hymns: IgboHymn[]
  search: string
  activeCategory: IgboHymn['category'] | 'All'
  onSearchChange: (value: string) => void
  onCategoryChange: (category: IgboHymn['category'] | 'All') => void
  onSelectHymn: (hymn: IgboHymn) => void
}

const suggestedCategories = ['All', 'Sabbath', 'Praise', 'Worship'] as const

export function IgboHymnList({
  hymns,
  search,
  activeCategory,
  onSearchChange,
  onCategoryChange,
  onSelectHymn,
}: IgboHymnListProps) {
  return (
    <section className="space-y-6">
      <div className="rounded-2xl bg-navy-900 p-5 text-white shadow-reverent dark:bg-navy-950">
        <h1 className="font-display text-2xl font-bold">Igbo Hymns (Abu)</h1>
        <p className="mt-2 text-sm text-slate-200">
          SDA Igbo hymnal lyrics from the open-source Abu project. Search by number or title. Up to
          three YouTube performances per hymn when matched.
        </p>

        <label className="mt-4 flex items-center gap-2 rounded-xl border border-navy-700 bg-white/10 px-3 py-2">
          <Search size={16} className="text-gold-400" />
          <input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search hymn title or first line"
            className="w-full bg-transparent text-sm outline-none placeholder:text-slate-300"
          />
        </label>
      </div>

      <div>
        <h2 className="mb-3 font-display text-lg font-bold text-navy-900 dark:text-gold-400">Topics</h2>
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
            <p className="text-xs font-medium uppercase tracking-wide text-gold-500">
              {hymn.category} · #{hymn.id}
            </p>
            <h3 className="mt-1 font-display text-lg font-bold text-navy-900 dark:text-white">
              {hymn.title}
            </h3>
            {hymn.first_line ? (
              <p className="mt-1 line-clamp-1 text-sm text-slate-600 dark:text-slate-300">
                {hymn.first_line}
              </p>
            ) : null}
          </motion.button>
        ))}

        {hymns.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500 dark:border-navy-700 dark:text-slate-400">
            No hymns match your search.
          </p>
        ) : null}
      </div>
    </section>
  )
}
