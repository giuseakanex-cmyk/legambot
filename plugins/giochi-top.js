import fetch from 'node-fetch'

let user = a => '@' + a.split('@')[0]

async function handler(m, { groupMetadata, command, conn, text, usedPrefix }) {
  if (!text) return conn.reply(m.chat, `❀ \`Scrivi qualcosa!\`\n\n\`Esempio:\`\n- ${usedPrefix + command} *ratti*`, m)

  let ps = groupMetadata.participants.map(v => v.id)
  let shuffled = ps.sort(() => Math.random() - 0.5)
  let top10 = shuffled.slice(0, 10)

  const emoji = await getEmojiFromGemini(text)

  let title = `\`Top 10 ${text}\` 『 ${emoji} 』\n\n` +
    top10.map((u, i) => `*${i + 1}. ${user(u)}*`).join('\n')

  m.reply(title, null, { mentions: top10 })
}

handler.help = ['topgioco <testo>']
handler.command = ['topgioco']
handler.tags = ['giochi']
handler.group = true
handler.admin = true
export default handler

async function getEmojiFromGemini(topic) {
  const apiKey = global.APIKeys?.google
  if (!apiKey || apiKey === 'REGISTRATISUGOOGLECLOUDNEGRO') {
    console.log('⚠️ Nessuna chiave Google configurata. Usando emoji casuali.')
    return pickRandom(['✨', '🔥', '🌟', '🎯', '🌈', '💥', '🥇', '⚡'])
  }

  try {
    const prompt = `Sei un esperto di emoji. Per una classifica su "${topic}", rispondi solo e unicamente con una o al massimo due emoji appropriate. Non includere testo, spiegazioni o punteggiatura. Se non trovi un'emoji adatta, usa "‼️".`
    
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            topP: 1,
            topK: 40,
            maxOutputTokens: 10
          }
        })
      }
    )

    const data = await response.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim()
    if (text) {
      const emojiOnly = text.replace(/[^\p{Emoji}\s]/gu, '').trim();
      if (emojiOnly && emojiOnly.length <= 5) return emojiOnly;
    }
    
    console.log('[Gemini] Fallback: risposta non valida. Risposta ricevuta:', text);
    return '‼️';

  } catch (e) {
    console.error('[Gemini] Errore nella richiesta:', e)
    return pickRandom(['✨', '🔥', '🌟', '🎯', '🌈', '💥', '🥇', '⚡'])
  }
}

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)]
}
