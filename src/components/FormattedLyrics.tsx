import { useMemo } from 'react'
import { lyricDisplayClasses, type DisplayPreferences } from '../lib/displayPreferences'
import { prepareLyrics } from '../lib/lyricsPipeline'

interface FormattedLyricsProps {
  lyrics: string
  hymnTitle?: string
  displayPreferences?: DisplayPreferences
  numberVerses?: boolean
}

function VerseNumber({ number }: { number: string }) {
  return (
    <span className="font-semibold tabular-nums text-gold-600 dark:text-gold-400">{number}. </span>
  )
}

export function FormattedLyrics({
  lyrics,
  hymnTitle,
  displayPreferences,
  numberVerses = false,
}: FormattedLyricsProps) {
  const typography = displayPreferences ? lyricDisplayClasses(displayPreferences) : 'text-lg leading-8 font-serif'
  const bodyClass = `whitespace-pre-line text-slate-800 dark:text-slate-100 ${typography}`

  const stanzas = useMemo(
    () => prepareLyrics(lyrics, { hymnTitle, numberVerses }),
    [hymnTitle, lyrics, numberVerses],
  )

  return (
    <div className="space-y-6">
      {stanzas.map((stanza, index) => {
        if (stanza.kind === 'chorus') {
          return (
            <div key={index}>
              <p className="mb-2 font-semibold text-gold-600 dark:text-gold-400">Chorus</p>
              {stanza.lines.length > 0 ? <p className={bodyClass}>{stanza.lines.join('\n')}</p> : null}
            </div>
          )
        }

        if (stanza.kind === 'verse') {
          if (stanza.lines.length === 0) {
            return (
              <p key={index} className="mb-2 font-semibold tabular-nums text-gold-600 dark:text-gold-400">
                {stanza.number}.
              </p>
            )
          }

          const [firstLine, ...rest] = stanza.lines
          return (
            <div key={index}>
              <p className={bodyClass}>
                <VerseNumber number={stanza.number} />
                {firstLine}
              </p>
              {rest.length > 0 ? <p className={bodyClass}>{rest.join('\n')}</p> : null}
            </div>
          )
        }

        return (
          <p key={index} className={bodyClass}>
            {stanza.lines.join('\n')}
          </p>
        )
      })}
    </div>
  )
}
