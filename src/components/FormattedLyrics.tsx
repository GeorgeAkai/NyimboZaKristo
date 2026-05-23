interface FormattedLyricsProps {
  lyrics: string
}

const verseLinePattern = /^(\d{1,2})\.\s*(.*)$/
const chorusPattern = /^chorus$/i

export function FormattedLyrics({ lyrics }: FormattedLyricsProps) {
  const stanzas = lyrics.split(/\n\n+/).filter((block) => block.trim())

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
              {chorusBody && (
                <p className="whitespace-pre-line leading-8 text-slate-800 dark:text-slate-100">
                  {chorusBody}
                </p>
              )}
            </div>
          )
        }

        const verseMatch = firstLine.match(verseLinePattern)
        if (verseMatch) {
          const verseNumber = verseMatch[1]
          const restFirstLine = verseMatch[2].trim()
          const bodyLines = [...(restFirstLine ? [restFirstLine] : []), ...lines.slice(1)]
          const body = bodyLines.join('\n').trim()

          return (
            <div key={index}>
              <p className="mb-2 font-semibold tabular-nums text-gold-600 dark:text-gold-400">
                {verseNumber}.
              </p>
              {body ? (
                <p className="whitespace-pre-line leading-8 text-slate-800 dark:text-slate-100">
                  {body}
                </p>
              ) : null}
            </div>
          )
        }

        const gluedMatch = firstLine.match(/^(\d{1,2})([A-Za-z"'(].+)$/)
        if (gluedMatch) {
          const body = [gluedMatch[2].trim(), ...lines.slice(1)].join('\n').trim()
          return (
            <div key={index}>
              <p className="mb-2 font-semibold tabular-nums text-gold-600 dark:text-gold-400">
                {gluedMatch[1]}.
              </p>
              <p className="whitespace-pre-line leading-8 text-slate-800 dark:text-slate-100">
                {body}
              </p>
            </div>
          )
        }

        return (
          <p
            key={index}
            className="whitespace-pre-line leading-8 text-slate-800 dark:text-slate-100"
          >
            {stanza}
          </p>
        )
      })}
    </div>
  )
}
