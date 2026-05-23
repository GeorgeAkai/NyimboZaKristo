import { ChevronLeft } from 'lucide-react'

interface CreditsPanelProps {
  onBack: () => void
}

export function CreditsPanel({ onBack }: CreditsPanelProps) {
  return (
    <section className="space-y-4">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm font-medium text-navy-900 dark:text-gold-400"
      >
        <ChevronLeft size={16} /> Back
      </button>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-navy-800 dark:bg-navy-900">
        <h1 className="font-display text-2xl font-bold text-navy-900 dark:text-white">
          Credits & legal
        </h1>

        <div className="mt-4 space-y-4 text-sm leading-relaxed text-slate-700 dark:text-slate-200">
          <div>
            <h2 className="font-semibold text-navy-900 dark:text-gold-400">Nyimbo za Kristo</h2>
            <p className="mt-1">
              Swahili lyrics are sourced from the public Nyimbo za Kristo website. English
              translations in that section are machine-assisted references, not official
              publications.
            </p>
          </div>

          <div>
            <h2 className="font-semibold text-navy-900 dark:text-gold-400">English Hymns</h2>
            <p className="mt-1">
              Lyrics and optional piano audio are imported from{' '}
              <a
                href="https://gccsatx.com/hymns/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gold-600 underline dark:text-gold-400"
              >
                gccsatx.com/hymns
              </a>
              . Piano MP3s stream from their media host and are not stored in this app.
            </p>
          </div>

          <div>
            <h2 className="font-semibold text-navy-900 dark:text-gold-400">Igbo Hymns (Abu)</h2>
            <p className="mt-1">
              Igbo lyrics are imported from the open-source{' '}
              <a
                href="https://github.com/joelezeu/Abu/tree/master/assets/www"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gold-600 underline dark:text-gold-400"
              >
                Abu
              </a>{' '}
              project (joelezeu). English hints and scripture references in the source files are
              shown when present. Re-import with{' '}
              <code className="text-xs">npm run import:igbo-abu</code>.
            </p>
          </div>

          <div>
            <h2 className="font-semibold text-navy-900 dark:text-gold-400">YouTube performances</h2>
            <ul className="mt-1 list-disc space-y-1 pl-5">
              <li>Videos are embedded using YouTube&apos;s official player (not downloaded or re-hosted).</li>
              <li>
                Giving in-app credit does not transfer copyright; rights remain with each uploader
                and YouTube.
              </li>
              <li>
                Each hymn offers up to three videos of the <strong>same song</strong>, matched by
                title. Preferred sources include{' '}
                <a
                  href="https://www.youtube.com/@danielbaptist1611"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gold-600 underline dark:text-gold-400"
                >
                  Daniel Baptist
                </a>
                ,{' '}
                <a
                  href="https://www.youtube.com/@classichymns8110"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gold-600 underline dark:text-gold-400"
                >
                  Classic Hymns
                </a>
                ,{' '}
                <a
                  href="https://www.youtube.com/@kbrasee"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gold-600 underline dark:text-gold-400"
                >
                  Kaleb Brasee
                </a>
                , and choirs such as{' '}
                <a
                  href="https://www.youtube.com/@thetabernaclechoir"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gold-600 underline dark:text-gold-400"
                >
                  The Tabernacle Choir at Temple Square
                </a>
                , plus other matching performances.
              </li>
              <li>
                Per{' '}
                <a
                  href="https://developers.google.com/youtube/terms/required-minimum-functionality"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gold-600 underline dark:text-gold-400"
                >
                  YouTube embed policies
                </a>
                , attribution links to the video and channel appear beside the player.
              </li>
            </ul>
          </div>

          <div>
            <h2 className="font-semibold text-navy-900 dark:text-gold-400">Your responsibility</h2>
            <p className="mt-1">
              This app is for personal and congregational worship reference. For commercial
              distribution, live streaming, or printing hymnals, obtain permissions from lyric
              copyright owners and video creators separately.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
