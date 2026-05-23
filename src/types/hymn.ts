export type HymnCategory = 'Sabbath' | 'Praise' | 'Worship'

export interface YouTubeOption {
  id: string
  title: string
  channel: string
  channel_url?: string
  video_url?: string
}

export interface EnglishHymn {
  id: number
  title: string
  first_line: string
  tune: string
  lyrics: string
  slug?: string
  tags?: string[]
  authors?: string
  category: HymnCategory
  text_source: string
  text_copyright: string
  lyrics_source?: 'gccsatx'
  hymnal: string
  collection?: 'gccsatx'
  youtube_id: string
  youtube_options?: YouTubeOption[]
  instrumental_url: string
}

export interface IgboHymn {
  id: number
  title: string
  first_line: string
  subtitle: string
  english_hint: string
  lyrics: string
  category: HymnCategory
  text_source: string
  source_url: string
  hymnal: string
  collection: 'abu'
  youtube_id: string
  youtube_options?: YouTubeOption[]
  instrumental_url: string
}

export type HymnalCollection = 'nzk' | 'gccsatx' | 'abu'

export interface Hymn {
  id: number
  title: string
  swahili_lyrics: string
  english_lyrics: string
  category: HymnCategory
  youtube_id: string
  youtube_options?: YouTubeOption[]
  instrumental_url: string
}
