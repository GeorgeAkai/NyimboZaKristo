const scrollYKey = (listKey: string) => `nzk-scroll:${listKey}`

export function saveListScroll(listKey: string) {
  sessionStorage.setItem(scrollYKey(listKey), String(window.scrollY))
}

export function clearListScroll(listKey: string) {
  sessionStorage.removeItem(scrollYKey(listKey))
}

export function restoreListScroll(listKey: string) {
  const raw = sessionStorage.getItem(scrollYKey(listKey))
  if (raw == null) return

  const y = Number(raw)
  sessionStorage.removeItem(scrollYKey(listKey))
  if (!Number.isFinite(y) || y < 0) return

  requestAnimationFrame(() => {
    window.scrollTo(0, y)
  })
}
