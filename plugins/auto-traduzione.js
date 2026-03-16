import fetch from 'node-fetch'

const massimoboss = 5000
const minorixepsteinsmh = 3
const pastamafiamandolino = 'it'
const lingueNote = [
  'en', 'es', 'fr', 'de', 'pt', 'ru', 'ja', 'zh-CN', 'zh', 'ko', 
  'ar', 'hi', 'tr', 'pl', 'nl', 'id', 'sv'
]

const seen = new Map()
const ttl = 2 * 60 * 1000

function giovanemarmotta(key) {
  seen.set(key, Date.now())
}

function isSeen(key) {
  const t = seen.get(key)
  if (!t) return false
  if (Date.now() - t > ttl) {
    seen.delete(key)
    return false
  }
  return true
}

setInterval(() => {
  const now = Date.now()
  for (const [k, t] of seen.entries()) {
    if (now - t > ttl) seen.delete(k)
  }
}, ttl)

function getText(m) {
  return (
    m.text ||
    m.message?.conversation ||
    m.message?.extendedTextMessage?.text ||
    ''
  )
}

function normalize(str) {
  return String(str)
    .toLowerCase()
    .replace(/[^a-z0-9]/gi, '')
    .trim()
}

async function translateText(text) {
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${pastamafiamandolino}&dt=t&q=${encodeURIComponent(text)}`
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })
    const json = await res.json()
    const translated = Array.isArray(json?.[0]) ? json[0].map(item => item?.[0] || '').join('') : ''
    const detected = json?.[2] || 'auto'

    return { translated: String(translated || '').trim(), detected }
  } catch (e) {
    return { translated: '', detected: 'auto' }
  }
}

let handler = m => m

handler.before = async function (m, { conn }) {
  if (m.fromMe) return true
  if (!m.isGroup) return false
  if (!m.message) return true
  if (m.isCommand) return true

  const chat = global.db.data.chats[m.chat]
  if (!chat?.autotraduzione) return true

  const text = getText(m).trim()
  if (!text || text.length < minorixepsteinsmh) return true
  if (text.length > massimoboss) return true

  const key = `${m.chat}:${m.key?.id || ''}`
  if (isSeen(key)) return true
  giovanemarmotta(key)

  try {
    const { translated, detected } = await translateText(text)
    if (!translated) return true
    if ((detected || '').toLowerCase() === pastamafiamandolino) return true
    if (!lingueNote.includes(detected)) return true
    if (normalize(translated) === normalize(text)) return true

    await conn.sendPresenceUpdate('composing', m.chat).catch(() => {})

    await conn.sendMessage(
      m.chat,
      { text: `『 🌍 』 Traduzione (${detected || 'auto'} → it):\n- ${translated}` },
      { quoted: m }
    ).catch(() => {})
  } catch (e) {
    console.error('Errore autotraduzione:', e)
  }

  return true
}

export default handler