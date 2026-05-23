export type AccompanimentBandState = 'empty' | 'offline-video' | 'offline-audio' | 'online'

export type AccompanimentBandInput = {
  isOnline: boolean
  hasVideo: boolean
  hasInstrumental: boolean
  instrumentalOffline: boolean
}

export function resolveAccompanimentBandState(
  input: AccompanimentBandInput,
): AccompanimentBandState {
  const { isOnline, hasVideo, hasInstrumental, instrumentalOffline } = input

  if (!hasVideo && !hasInstrumental) {
    return 'empty'
  }

  if (!isOnline && hasVideo) {
    return 'offline-video'
  }

  if (!isOnline && hasInstrumental && !instrumentalOffline) {
    return 'offline-audio'
  }

  return 'online'
}
