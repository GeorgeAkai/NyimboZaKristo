import { writeFile } from 'node:fs/promises'
import { load } from 'cheerio'

const BASE_URL = 'https://www.nyimbozakristo.com'
const MAX_ID = 220

const pickCategory = (title) => {
  const lower = title.toLowerCase()
  if (lower.includes('sabato')) return 'Sabbath'
  if (
    lower.includes('yesu') ||
    lower.includes('msalaba') ||
    lower.includes('mwokozi') ||
    lower.includes('roho') ||
    lower.includes('bwana')
  ) {
    return 'Worship'
  }
  return 'Praise'
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const translateToEnglish = async (text) => {
  const url =
    'https://translate.googleapis.com/translate_a/single?client=gtx&sl=sw&tl=en&dt=t&q=' +
    encodeURIComponent(text)
  const response = await fetch(url)
  if (!response.ok) return text

  const data = await response.json()
  if (!Array.isArray(data?.[0])) return text

  return data[0].map((chunk) => chunk[0]).join('').trim() || text
}

const parseSong = async (id) => {
  const response = await fetch(`${BASE_URL}/song/${id}`)
  if (!response.ok) throw new Error(`Failed to fetch song ${id}`)

  const html = await response.text()
  const $ = load(html)

  const titleText = $('h1').first().text().trim()
  const title = titleText
    .replace(/^\d+[\.\s]*/, '')
    .replace(/\s+—\s+Nyimbo Za Kristo$/, '')
    .trim()

  const lyricParts = []
  $('main p, article p, p').each((_, element) => {
    const line = $(element).text().trim()
    if (!line || /^\d+$/.test(line)) return
    if (line.includes('Nyimbo Za Kristo')) return
    lyricParts.push(line)
  })

  const swahiliLyrics = lyricParts.join('\n\n').trim()
  const englishLyrics = await translateToEnglish(swahiliLyrics)

  return {
    id,
    title: title || `Wimbo ${id}`,
    swahili_lyrics: swahiliLyrics,
    english_lyrics: englishLyrics,
    category: pickCategory(title),
    youtube_id: '',
    instrumental_url: '',
  }
}

const run = async () => {
  const hymns = []

  for (let id = 1; id <= MAX_ID; id += 1) {
    try {
      const hymn = await parseSong(id)
      hymns.push(hymn)
      console.log(`Imported hymn ${id}`)
    } catch (error) {
      console.warn(`Skipped hymn ${id}:`, error.message)
    }
    await sleep(200)
  }

  await writeFile('./src/data/hymns.json', JSON.stringify(hymns, null, 2) + '\n', 'utf8')
  console.log(`Wrote ${hymns.length} hymns to src/data/hymns.json`)
}

run()
