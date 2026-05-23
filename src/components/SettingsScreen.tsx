import { ChevronLeft } from 'lucide-react'
import {
  DEFAULT_DISPLAY_PREFERENCES,
  LYRIC_FONT_CLASSES,
  lyricDisplayClasses,
  type DisplayPreferences,
  type LyricFontFamily,
  type LyricSize,
  type ThemePreference,
} from '../lib/displayPreferences'

const SAMPLE_STANZA = `1. Mungu wetu, twakusifu,
Twakutukuza kwa shangwe;
Ulimwengu wote ujae,
Uwe wa kututawala.`

const FONT_OPTIONS: { id: LyricFontFamily; label: string }[] = [
  { id: 'inter', label: 'Inter' },
  { id: 'montserrat', label: 'Montserrat' },
  { id: 'merriweather', label: 'Merriweather' },
]

const SIZE_OPTIONS: { id: LyricSize; label: string }[] = [
  { id: 'small', label: 'Small' },
  { id: 'medium', label: 'Medium' },
  { id: 'large', label: 'Large' },
]

interface SettingsScreenProps {
  preferences: DisplayPreferences
  appVersion: string
  onChange: (partial: Partial<DisplayPreferences>) => void
  onBack: () => void
  onOpenCredits: () => void
}

export function SettingsScreen({
  preferences,
  appVersion,
  onChange,
  onBack,
  onOpenCredits,
}: SettingsScreenProps) {
  const previewClasses = lyricDisplayClasses(preferences)

  return (
    <section>
      <button
        onClick={onBack}
        className="mb-4 flex items-center gap-2 text-sm font-medium text-navy-900 dark:text-gold-400"
      >
        <ChevronLeft size={16} /> Back
      </button>

      <h1 className="font-display text-2xl font-bold text-navy-900 dark:text-white">Settings</h1>

      <div className="mt-6 space-y-8">
        <section className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-navy-800 dark:bg-navy-900">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gold-500">Lyrics</h2>

          <p className="mt-4 text-xs font-semibold text-slate-600 dark:text-slate-300">Font family</p>
          <div className="mt-2 grid gap-2 sm:grid-cols-3">
            {FONT_OPTIONS.map((option) => (
              <label
                key={option.id}
                className={`cursor-pointer rounded-xl border px-3 py-2 ${
                  preferences.lyricFontFamily === option.id
                    ? 'border-gold-500 bg-gold-500/10'
                    : 'border-slate-200 dark:border-navy-700'
                }`}
              >
                <input
                  type="radio"
                  name="lyric-font"
                  className="sr-only"
                  checked={preferences.lyricFontFamily === option.id}
                  onChange={() => onChange({ lyricFontFamily: option.id })}
                />
                <span className={`block text-sm font-semibold ${LYRIC_FONT_CLASSES[option.id]}`}>
                  {option.label}
                </span>
                <span className={`mt-1 block text-xs text-slate-600 dark:text-slate-300 ${LYRIC_FONT_CLASSES[option.id]}`}>
                  Mungu wetu
                </span>
              </label>
            ))}
          </div>

          <p className="mt-5 text-xs font-semibold text-slate-600 dark:text-slate-300">Size</p>
          <div className="mt-2 flex rounded-xl border border-slate-200 p-1 dark:border-navy-700">
            {SIZE_OPTIONS.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => onChange({ lyricSize: option.id })}
                className={`flex-1 rounded-lg px-2 py-2 text-sm font-semibold ${
                  preferences.lyricSize === option.id
                    ? 'bg-navy-900 text-gold-400 dark:bg-navy-800'
                    : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          <p className="mt-5 text-xs font-semibold text-slate-600 dark:text-slate-300">Preview</p>
          <div
            className={`mt-2 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-navy-700 dark:bg-navy-950 ${previewClasses}`}
          >
            <p className="whitespace-pre-line text-slate-800 dark:text-slate-100">{SAMPLE_STANZA}</p>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-navy-800 dark:bg-navy-900">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gold-500">Appearance</h2>
          <p className="mt-4 text-xs font-semibold text-slate-600 dark:text-slate-300">Theme</p>
          <div className="mt-2 flex rounded-xl border border-slate-200 p-1 dark:border-navy-700">
            {(['light', 'dark', 'system'] as ThemePreference[]).map((theme) => (
              <button
                key={theme}
                type="button"
                onClick={() => onChange({ theme })}
                className={`flex-1 rounded-lg px-2 py-2 text-sm font-semibold capitalize ${
                  preferences.theme === theme
                    ? 'bg-navy-900 text-gold-400 dark:bg-navy-800'
                    : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                {theme}
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-navy-800 dark:bg-navy-900">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gold-500">About</h2>
          <p className="mt-3 text-sm text-slate-700 dark:text-slate-200">Version {appVersion}</p>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            English lyrics and instrumentals courtesy of GCCSATX. YouTube performances are attributed
            per hymn.
          </p>
          <button
            type="button"
            onClick={onOpenCredits}
            className="mt-4 text-sm font-semibold text-gold-600 underline dark:text-gold-400"
          >
            View credits
          </button>
          <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">
            Defaults: {DEFAULT_DISPLAY_PREFERENCES.lyricSize} size,{' '}
            {DEFAULT_DISPLAY_PREFERENCES.lyricFontFamily} font.
          </p>
        </section>
      </div>
    </section>
  )
}
