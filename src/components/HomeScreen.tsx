import { motion } from 'framer-motion'
import { BookOpen, Music } from 'lucide-react'
import type { HymnalCollection } from '../types/hymn'

interface HomeScreenProps {
  onSelectCollection: (collection: HymnalCollection) => void
}

export function HomeScreen({ onSelectCollection }: HomeScreenProps) {
  return (
    <section className="space-y-6">
      <div className="rounded-2xl bg-navy-900 p-5 text-white shadow-reverent dark:bg-navy-950">
        <h1 className="font-display text-2xl font-bold">Choose a hymnal</h1>
        <p className="mt-2 text-sm text-slate-200">
          Swahili Nyimbo za Kristo and English hymns from gccsatx.com — each with lyrics and choir
          videos.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelectCollection('nzk')}
          className="rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-gold-500 dark:border-navy-800 dark:bg-navy-900"
        >
          <div className="mb-3 inline-flex rounded-full bg-gold-500/15 p-2 text-gold-500">
            <Music size={20} />
          </div>
          <h2 className="font-display text-xl font-bold text-navy-900 dark:text-white">
            Nyimbo za Kristo
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            SDA Swahili hymnal with English translations. Worship songs from the East-Central Africa
            Division tradition.
          </p>
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelectCollection('gccsatx')}
          className="rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-gold-500 dark:border-navy-800 dark:bg-navy-900"
        >
          <div className="mb-3 inline-flex rounded-full bg-gold-500/15 p-2 text-gold-500">
            <BookOpen size={20} />
          </div>
          <h2 className="font-display text-xl font-bold text-navy-900 dark:text-white">
            English Hymns
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            350+ hymns with lyrics from{' '}
            <span className="font-medium">gccsatx.com</span>. Up to five performances of the same
            song — Daniel Baptist, Classic Hymns, Kaleb Brasee, and other choirs.
          </p>
        </motion.button>
      </div>
    </section>
  )
}
