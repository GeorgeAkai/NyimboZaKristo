import { useEffect, useMemo, useState } from 'react'
import { resolveHymnDetailLayout, type LayoutSpec } from '../lib/hymnDetailLayout'

export const PHONE_LANDSCAPE_QUERY = '(orientation: landscape) and (max-height: 500px)'
export const DESKTOP_LAYOUT_QUERY = '(min-width: 1024px)'

export function isPhoneLandscapeViewport() {
  if (typeof window === 'undefined') return false
  return window.matchMedia(PHONE_LANDSCAPE_QUERY).matches
}

export function isDesktopViewport() {
  if (typeof window === 'undefined') return false
  return window.matchMedia(DESKTOP_LAYOUT_QUERY).matches
}

export function useHymnDetailLayout(hasAccompaniment: boolean): LayoutSpec {
  const [isPhoneLandscape, setIsPhoneLandscape] = useState(isPhoneLandscapeViewport)
  const [isDesktop, setIsDesktop] = useState(isDesktopViewport)

  useEffect(() => {
    const phoneMedia = window.matchMedia(PHONE_LANDSCAPE_QUERY)
    const desktopMedia = window.matchMedia(DESKTOP_LAYOUT_QUERY)

    const update = () => {
      setIsPhoneLandscape(phoneMedia.matches)
      setIsDesktop(desktopMedia.matches)
    }

    update()
    phoneMedia.addEventListener('change', update)
    desktopMedia.addEventListener('change', update)
    return () => {
      phoneMedia.removeEventListener('change', update)
      desktopMedia.removeEventListener('change', update)
    }
  }, [])

  return useMemo(
    () => resolveHymnDetailLayout({ isPhoneLandscape, isDesktop, hasAccompaniment }),
    [hasAccompaniment, isDesktop, isPhoneLandscape],
  )
}
