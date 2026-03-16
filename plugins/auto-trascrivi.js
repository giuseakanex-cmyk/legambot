import axios from 'axios'
import { createWriteStream, unlinkSync, createReadStream } from 'fs'
import { join } from 'path'

const MAX_AUDIO_SIZE = 25 * 1024 * 1024
const POLL_INTERVAL_MS = 1000
const MAX_POLLING_MS = 600000
const OP_TIMEOUT_MS = 120000

const PRIMARY_LANGUAGE_CODE = 'it'
const LANGUAGE_FALLBACK_CONFIDENCE_THRESHOLD = 0.7

const requestCache = new Map()
const CACHE_TTL = 3600000

function getCachedResult(key) {
  const cached = requestCache.get(key)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) return cached.result
  return null
}

function setCachedResult(key, result) {
  requestCache.set(key, { result, timestamp: Date.now() })
}

setInterval(() => {
  const now = Date.now()
  for (const [key, value] of requestCache.entries()) {
    if (now - value.timestamp > CACHE_TTL) requestCache.delete(key)
  }
}, CACHE_TTL)

function createTimeoutPromise(ms, message = '『 ❌ 』- Timeout raggiunto, riprova più tardi..') {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error(message)), ms)
  })
}

function extractAudioMessage(m) {
  if (!m?.message) return null

  const viewOnce = m.message.viewOnceMessage?.message || m.message.viewOnceMessageV2?.message
  const msgObj = viewOnce || m.message

  const audio = msgObj.audioMessage
  return audio || null
}

function makeCacheKey(m) {
  const base = m?.key?.id || String(Date.now())
  return `${m.sender}_${base}`
}

async function downloadAudioBuffer(conn, m, audioMsg) {
  try {
    if (audioMsg?.url || audioMsg?.directPath) {
      const mediaWrapper = { ...audioMsg }
      return await conn.downloadM(mediaWrapper, 'audio')
    }
  } catch {
  }

  try {
    if (typeof m?.download === 'function') {
      return await m.download()
    }
  } catch {
  }

  return Buffer.alloc(0)
}

async function transcribeBufferWithAssemblyAI(buffer, mime, apiKey) {
  let tempPath
  const operationStartTime = Date.now()

  try {
    const extension = mime?.includes('ogg') || mime?.includes('opus') ? 'ogg' : 'mp3'
    tempPath = join(process.cwd(), 'temp', `autotrascrizione_${Date.now()}.${extension}`)

    const writeStream = createWriteStream(tempPath)
    writeStream.write(buffer)
    writeStream.end()

    let uploadResponse
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        uploadResponse = await axios.post(
          'https://api.assemblyai.com/v2/upload',
          createReadStream(tempPath),
          {
            headers: {
              authorization: apiKey,
              'content-type': 'application/octet-stream',
              'transfer-encoding': 'chunked'
            },
            maxContentLength: Infinity,
            maxBodyLength: Infinity,
            timeout: Math.max(5000, OP_TIMEOUT_MS - (Date.now() - operationStartTime))
          }
        )
        break
      } catch (e) {
        if (attempt === 2) throw new Error("Errore durante l'upload del file")
        await new Promise(r => setTimeout(r, 1000))
      }
    }

    const createTranscript = async (forceItalian) => {
      const payload = {
        audio_url: uploadResponse.data.upload_url,
        speed_boost: false,
        punctuate: true,
        format_text: true
      }

      if (forceItalian) {
        payload.language_detection = false
        payload.language_code = PRIMARY_LANGUAGE_CODE
      } else {
        payload.language_detection = true
      }

      return await axios.post(
        'https://api.assemblyai.com/v2/transcript',
        payload,
        {
          headers: {
            authorization: apiKey,
            'content-type': 'application/json'
          },
          timeout: Math.max(5000, OP_TIMEOUT_MS - (Date.now() - operationStartTime))
        }
      )
    }

    const pollTranscript = async (id) => {
      let transcriptResult
      const startTime = Date.now()

      while (Date.now() - startTime < MAX_POLLING_MS) {
        if (Date.now() - operationStartTime >= OP_TIMEOUT_MS - 2000) {
          throw new Error('Timeout: operazione troppo lunga')
        }

        transcriptResult = await axios.get(
          `https://api.assemblyai.com/v2/transcript/${id}`,
          {
            headers: { authorization: apiKey },
            timeout: Math.max(3000, OP_TIMEOUT_MS - (Date.now() - operationStartTime))
          }
        )

        if (transcriptResult.data.status === 'completed') return transcriptResult.data

        if (transcriptResult.data.status === 'error') {
          throw new Error(transcriptResult.data.error || 'Errore durante la trascrizione')
        }

        await new Promise(r => setTimeout(r, POLL_INTERVAL_MS))
      }

      throw new Error('Timeout: trascrizione troppo lunga')
    }

    const firstTranscript = await createTranscript(false)
    let data = await pollTranscript(firstTranscript.data.id)

    const detectedLang = String(data.language_code || '').trim().toLowerCase()
    const confidence = Number(data.confidence || 0)
    const isLangUnknown = !detectedLang || detectedLang === 'und' || detectedLang === 'unknown'
    const shouldFallbackToItalian = isLangUnknown || confidence < LANGUAGE_FALLBACK_CONFIDENCE_THRESHOLD

    if (shouldFallbackToItalian) {
      const secondTranscript = await createTranscript(true)
      data = await pollTranscript(secondTranscript.data.id)
    }

    const finalConfidence = Number(data.confidence || 0)
    const text = String(data.text || '').trim()
    if (!text) throw new Error('Trascrizione vuota')

    return {
      confidence: finalConfidence,
      text
    }
  } finally {
    if (tempPath) {
      try {
        unlinkSync(tempPath)
      } catch {}
    }
  }
}

let handler = m => m

handler.before = async function (m, { conn, isAdmin, isOwner, isSam }) {
  if (m.isBaileys && m.fromMe) return true
  if (!m.isGroup) return false
  if (!m.message) return true

  const chat = global.db.data.chats[m.chat]
  if (!chat?.autotrascrizione) return true

  const audioMsg = extractAudioMessage(m)
  if (!audioMsg) return true

  const apiKey = global.APIKeys?.assemblyai
  if (!apiKey) return true

  const key = makeCacheKey(m)
  const cached = getCachedResult(key)
  if (cached) {
    await conn.sendMessage(m.chat, { text: cached }, { quoted: m }).catch(() => {})
    return true
  }

  await conn.sendPresenceUpdate('composing', m.chat).catch(() => {})
  const composingInterval = setInterval(() => {
    conn.sendPresenceUpdate('composing', m.chat).catch(() => {})
  }, 5000)

  try {
    const operationPromise = (async () => {
      const buffer = await downloadAudioBuffer(conn, m, audioMsg)
      if (!buffer || buffer.length === 0) throw new Error('Download audio fallito')
      if (buffer.length > MAX_AUDIO_SIZE) throw new Error('Audio troppo grande. Max 25MB')

      const mime = audioMsg.mimetype || 'audio/ogg'
      const result = await transcribeBufferWithAssemblyAI(buffer, mime, apiKey)

      const response = `『 📝 』 \`Trascrizione automatica:\`\n- ${result.text}`
      setCachedResult(key, response)

      await conn.sendMessage(m.chat, { text: response }, { quoted: m }).catch(() => {})
    })()

    await Promise.race([operationPromise, createTimeoutPromise(OP_TIMEOUT_MS)])
  } catch (e) {
    const msg = (e && e.message) ? e.message : 'Errore durante la trascrizione'
    await conn.sendMessage(m.chat, { text: msg }, { quoted: m }).catch(() => {})
  } finally {
    clearInterval(composingInterval)
  }
  return true
}

export default handler