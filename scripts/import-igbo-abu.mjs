/**
 * Import Igbo SDA hymns (Abu) from joelezeu/Abu assets/www HTML files.
 *
 *   node scripts/import-igbo-abu.mjs
 *
 * Source: https://github.com/joelezeu/Abu/tree/master/assets/www
 */
import { writeFile } from 'node:fs/promises'

const ABU_API = 'https://api.github.com/repos/joelezeu/Abu/contents/assets/www'
const OUTPUT_PATH = './src/data/igbo-hymns.json'
/** Abu HTML files use Windows-1252 bytes (e.g. 0x92 → ’), not UTF-8. */
const ABU_HTML_DECODER = new TextDecoder('windows-1252')

const decodeAbuHtml = async (response) => {
  const buffer = await response.arrayBuffer()
  return ABU_HTML_DECODER.decode(buffer)
}

const pickCategory = (title) => {
  const lower = title.toLowerCase()
  if (lower.includes('sabbath') || lower.includes('sabato')) return 'Sabbath'
  if (
    lower.includes('chineke') ||
    lower.includes('chuku') ||
    lower.includes('yesu') ||
    lower.includes('krist') ||
    lower.includes('jesus') ||
    lower.includes('nso, nso')
  ) {
    return 'Worship'
  }
  return 'Praise'
}

const decodeEntities = (text) =>
  text
    .replace(/&nbsp;?/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))

const htmlToPlain = (html) =>
  decodeEntities(
    html
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<[^>]+>/g, '')
      .replace(/\u00a0/g, ' '),
  ).trim()

const parseAlignBlock = (html) => {
  const alignMatch = html.match(/<div id="align">([\s\S]*?)<\/div>/i)
  const block = alignMatch?.[1] ?? ''
  const beforeHr = block.split(/<hr\s*\/?>/i)[0] ?? block
  const raw = htmlToPlain(beforeHr)
  const lines = raw
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)

  if (!lines.length) return { subtitle: '', english_hint: '' }

  const subtitle = lines[0].replace(/^["']|["']$/g, '').trim()
  const english_hint = lines.slice(1).join(' ').trim()
  return { subtitle, english_hint }
}

const parseAbuHtml = (html, id) => {
  const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)
  if (!h1Match) return null

  const title = htmlToPlain(h1Match[1].replace(/<div class="leftButton"[\s\S]*?<\/div>/i, ''))
  if (!title || title.toUpperCase() === 'PREFACE') return null

  const { subtitle, english_hint } = parseAlignBlock(html)

  const stanzas = []
  const liRegex = /<li>([\s\S]*?)<\/li>/gi
  let match = liRegex.exec(html)
  while (match) {
    const text = htmlToPlain(match[1])
    if (text) stanzas.push(`${stanzas.length + 1}.\n${text}`)
    match = liRegex.exec(html)
  }

  if (!stanzas.length) return null

  const lyrics = stanzas
    .map((stanza) => stanza.replace(/\n{3,}/g, '\n\n'))
    .join('\n\n')
    .replace(/&nbsp;/g, ' ')
  const firstLine =
    stanzas[0]
      ?.split('\n')
      .slice(1)
      .join(' ')
      .trim() || title

  return {
    id,
    title,
    first_line: firstLine,
    subtitle,
    english_hint,
    lyrics,
    category: pickCategory(`${title} ${subtitle} ${english_hint}`),
    text_source: 'Abu (Igbo SDA hymnal)',
    source_url: `https://github.com/joelezeu/Abu/blob/master/assets/www/abu${id}.html`,
    hymnal: 'Abu',
    collection: 'abu',
    youtube_id: '',
    youtube_options: [],
    instrumental_url: '',
  }
}

const listAbuHtmlFiles = async () => {
  const response = await fetch(ABU_API, {
    headers: { Accept: 'application/vnd.github+json', 'User-Agent': 'nyimbozakristo-import' },
  })
  if (!response.ok) throw new Error(`GitHub API ${response.status}: ${await response.text()}`)

  const entries = await response.json()
  return entries
    .map((entry) => entry.name)
    .filter((name) => /^abu\d+\.html$/i.test(name))
    .sort((a, b) => Number(a.match(/\d+/)[0]) - Number(b.match(/\d+/)[0]))
}

const run = async () => {
  const files = await listAbuHtmlFiles()
  console.log(`Found ${files.length} Abu hymn HTML files`)

  const hymns = []
  const skipped = []

  for (const file of files) {
    const id = Number(file.match(/\d+/)[0])
    const url = `https://raw.githubusercontent.com/joelezeu/Abu/master/assets/www/${file}`
    const response = await fetch(url)
    if (!response.ok) {
      skipped.push({ file, reason: `HTTP ${response.status}` })
      continue
    }

    const html = await decodeAbuHtml(response)
    const hymn = parseAbuHtml(html, id)
    if (!hymn) {
      skipped.push({ file, reason: 'no title or lyrics' })
      continue
    }

    if (/\uFFFD/.test(`${hymn.title}${hymn.lyrics}`)) {
      console.warn(`Warning: #${id} still contains replacement characters after CP1252 decode`)
    }

    hymns.push(hymn)
    console.log(`Imported #${id}: ${hymn.title}`)
  }

  hymns.sort((a, b) => a.id - b.id)
  await writeFile(OUTPUT_PATH, `${JSON.stringify(hymns, null, 2)}\n`, 'utf8')

  console.log(`\nWrote ${hymns.length} hymns to ${OUTPUT_PATH}`)
  if (skipped.length) console.log(`Skipped ${skipped.length}`)
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})
