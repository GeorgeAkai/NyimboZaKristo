import { useMemo } from 'react'
import { lyricDisplayClasses, type DisplayPreferences } from '../lib/displayPreferences'
import { stripDuplicateTitleFromLyrics } from '../lib/lyricsDisplay'
import { numberUnlabeledVerses } from '../lib/lyricsVerseNumbering'

interface FormattedLyricsProps {
  lyrics: string
  hymnTitle?: string
  displayPreferences?: DisplayPreferences
  numberVerses?: boolean
}

const verseLinePattern = /^(\d{1,2})\.\s*(.*)$/
const chorusPattern = /^chorus$/i

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

  const preparedLyrics = useMemo(() => {
    const trimmed = hymnTitle ? stripDuplicateTitleFromLyrics(lyrics, hymnTitle) : lyrics.trim()
    return numberVerses ? numberUnlabeledVerses(trimmed) : trimmed
  }, [hymnTitle, lyrics, numberVerses])

  const stanzas = preparedLyrics.split(/\n\n+/).filter((block) => block.trim())

  return (
    <div className="space-y-6">
      {stanzas.map((stanza, index) => {
        const lines = stanza.split('\n').filter((line) => line.trim())
        const firstLine = lines[0]?.trim() ?? ''

        if (chorusPattern.test(firstLine)) {
          const chorusBody = lines.slice(1).join('\n')
          return (
            <div key={index}>
              <p className="mb-2 font-semibold text-gold-600 dark:text-gold-400">Chorus</p>
              {chorusBody && <p className={bodyClass}>{chorusBody}</p>}
            </div>
          )
        }

        const verseMatch = firstLine.match(verseLinePattern)
        if (verseMatch) {
          const verseNumber = verseMatch[1]
          const restFirstLine = verseMatch[2].trim()
          const bodyLines = [...(restFirstLine ? [restFirstLine] : []), ...lines.slice(1)]
          const body = bodyLines.join('\n').trim()

          if (!body) {
            return (
              <p key={index} className="mb-2 font-semibold tabular-nums text-gold-600 dark:text-gold-400">
                {verseNumber}.
              </p>
            )
          }

          const [firstLineOfBody, ...restBody] = body.split('\n')
          return (
            <div key={index}>
              <p className={bodyClass}>
                <VerseNumber number={verseNumber} />
                {firstLineOfBody}
              </p>
              {restBody.length > 0 ? <p className={bodyClass}>{restBody.join('\n')}</p> : null}
            </div>
          )
        }

        const gluedMatch = firstLine.match(/^(\d{1,2})([A-Za-z"'(].+)$/)
        if (gluedMatch) {
          const body = [gluedMatch[2].trim(), ...lines.slice(1)].join('\n').trim()
          const [firstLineOfBody, ...restBody] = body.split('\n')
          return (
            <div key={index}>
              <p className={bodyClass}>
                <VerseNumber number={gluedMatch[1]} />
                {firstLineOfBody}
              </p>
              {restBody.length > 0 ? <p className={bodyClass}>{restBody.join('\n')}</p> : null}
            </div>
          )
        }

        return (
          <p key={index} className={bodyClass}>
            {stanza}
          </p>
        )
      })}
    </div>
  )
}
