import fs from 'fs'
import axios from 'axios'
import React from 'react'
import { renderToString } from 'react-dom/server'
import path from 'path'

const getBase64Image = (filePath, fallbackUrl) => {
    try {
        if (fs.existsSync(filePath)) {
            const fileData = fs.readFileSync(filePath);
            const ext = path.extname(filePath).substring(1);
            return `data:image/${ext === 'svg' ? 'svg+xml' : ext};base64,${fileData.toString('base64')}`;
        }
    } catch (e) {}
    return fallbackUrl;
}

const getLovePhrases = (p) => {
    if (p <= 10) return [
        `Vi odiate. Si vede da Marte.`,
        `Meglio se uno dei due cambia pianeta.`,
        `C'è più amore tra un vegano e una fiorentina.`,
        `Buttatevi nell'umido, separatamente.`
    ];
    if (p <= 30) return [
        `La noia mortale.`,
        `Arido come il deserto. Lasciate perdere.`,
        `Siete una barzelletta che non fa ridere.`,
        `Friendzone livello: "Sei come un fratello".`
    ];
    if (p <= 55) return [
        `Forse da ubriachi... ma molto ubriachi.`,
        `Ci sono margini di miglioramento (forse).`,
        `Una notte e via, e poi blocco su WhatsApp.`,
        `Vi mancano un po' di pezzi per funzionare.`
    ];
    if (p <= 80) return [
        `C'è tensione sessuale nell'aria!`,
        `Si prospetta un "Netflix & Chill" interessante.`,
        `L'attrazione fisica c'è tutta. Dateci dentro!`,
        `Una cena a lume di candela e poi... chissà.`
    ];
    if (p < 95) return [
        `Chiamate i pompieri! Qui si brucia!`,
        `Siete fatti l'uno per l'altra. Che invidia.`,
        `Un legame spaziale! Verso l'infinito e oltre!`,
        `Esplosivi! Letto, cuore e anima connessi.`
    ];
    return [
        `PREPARATE IL MATRIMONIO. ORA.`,
        `La perfezione esiste. Siete voi due.`,
        `Compatibilità assoluta: Sesso Divino e Amore Eterno!`
    ];
}

const getRandomPhrase = (percentage) => {
    const list = getLovePhrases(percentage);
    return list[Math.floor(Math.random() * list.length)];
}

const createCoupleCard = (props) => {
  const { name1, name2, percentage, avatar1, avatar2, backgroundData } = props
  let barColorStart, barColorEnd;
  if (percentage < 30) { barColorStart = '#ef4444'; barColorEnd = '#991b1b'; }
  else if (percentage < 70) { barColorStart = '#f59e0b'; barColorEnd = '#d97706'; }
  else { barColorStart = '#ec4899'; barColorEnd = '#be185d'; }

  return React.createElement('div', {
    style: { fontFamily: 'Inter, Arial, sans-serif', width: '600px', height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', backgroundColor: '#1a1a1a' }
  },
    React.createElement('div', { style: { position: 'absolute', top: '-20px', left: '-20px', right: '-20px', bottom: '-20px', backgroundImage: `url('${backgroundData}')`, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'blur(7px)', opacity: 0.8, zIndex: 1 } }),
    React.createElement('div', { style: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.5)', zIndex: 2 } }),
    React.createElement('div', { style: { width: '85%', height: '67%', borderRadius: '20px', padding: '20px', background: 'rgba(255, 255, 255, 0.08)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255, 255, 255, 0.15)', boxShadow: '0 20px 40px rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 3 } },
      React.createElement('div', { style: { flex: '0 0 130px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' } },
        React.createElement('div', { style: { width: '100px', height: '100px', borderRadius: '50%', border: '3px solid rgba(255,255,255,0.9)', boxShadow: '0 0 15px rgba(255,255,255,0.2)', overflow: 'hidden', background: '#000' } },
            React.createElement('img', { src: avatar1, style: { width: '100%', height: '100%', objectFit: 'cover' } })
        ),
        React.createElement('div', { style: { fontSize: '16px', fontWeight: 'bold', color: '#fff', textAlign: 'center', textShadow: '0 2px 2px rgba(0,0,0,0.8)', maxWidth: '130px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' } }, name1)
      ),
      React.createElement('div', { style: { flex: '1', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 15px' } },
        React.createElement('div', { style: { fontSize: '42px', fontWeight: '900', background: `linear-gradient(to bottom, #fff, ${barColorStart})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.3))', marginBottom: '5px' } }, `${percentage}%`),
        React.createElement('div', { style: { width: '100%', height: '24px', background: 'rgba(0,0,0,0.6)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden', position: 'relative' } },
          React.createElement('div', { style: { width: `${percentage}%`, height: '100%', background: `linear-gradient(90deg, ${barColorStart}, ${barColorEnd})`, boxShadow: `0 0 15px ${barColorStart}`, borderRadius: '12px' } })
        ),
      ),
      React.createElement('div', { style: { flex: '0 0 130px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' } },
        React.createElement('div', { style: { width: '100px', height: '100px', borderRadius: '50%', border: '3px solid rgba(255,255,255,0.9)', boxShadow: '0 0 15px rgba(255,255,255,0.2)', overflow: 'hidden', background: '#000' } },
            React.createElement('img', { src: avatar2, style: { width: '100%', height: '100%', objectFit: 'cover' } })
        ),
        React.createElement('div', { style: { fontSize: '16px', fontWeight: 'bold', color: '#fff', textAlign: 'center', textShadow: '0 2px 2px rgba(0,0,0,0.8)', maxWidth: '130px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' } }, name2)
      )
    )
  )
}

export const generateCoupleImage = async ({ name1, name2, percentage, avatar1, avatar2 }) => {
  const browserlessKey = global.APIKeys?.browserless
  if (!browserlessKey) {
    throw new Error('BROWSERLESS_MISSING') // Lancerà il fallback testuale
  }
  
  // 🔥 FIX VARIABILI MANCANTI 🔥
  const backgroundData = getBase64Image('./media/bg.jpg', 'https://files.catbox.moe/pyp87f.jpg');

  try {
    const reactElement = createCoupleCard({ name1, name2, percentage, avatar1, avatar2, backgroundData })
    const htmlContent = renderToString(reactElement)
    const fullHtml = `<!DOCTYPE html><html><head><meta charset="utf-8">
      <style>body{margin:0;padding:0;width:600px;height:400px;overflow:hidden;background:transparent;}</style>
      </head><body>${htmlContent}</body></html>`

    const url = `https://chrome.browserless.io/screenshot?token=${encodeURIComponent(browserlessKey)}`

    const response = await axios.post(url, {
      html: fullHtml,
      options: { type: 'jpeg', quality: 85, fullPage: false },
      viewport: { width: 600, height: 400 }
    }, {
      responseType: 'arraybuffer',
      timeout: 25000
    })

    return response.data
  } catch (error) {
    throw new Error('BROWSERLESS_ERROR')
  }
}

let handler = async (m, { conn, text, usedPrefix }) => {
  try {
    let name1 = ''
    let name2 = ''
    let jid1 = m.sender
    let jid2 = null

    const safeName = async (jid) => {
        try { return await conn.getName(jid) } catch { return jid.split('@')[0] }
    }

    if (m.quoted) {
        jid2 = m.quoted.sender
        name1 = await safeName(jid1)
        name2 = await safeName(jid2)
    } else if (m.mentionedJid && m.mentionedJid.length >= 2) {
        jid1 = m.mentionedJid[0]
        jid2 = m.mentionedJid[1]
        name1 = await safeName(jid1)
        name2 = await safeName(jid2)
    } else if (m.mentionedJid && m.mentionedJid.length === 1) {
        jid2 = m.mentionedJid[0]
        name1 = await safeName(jid1)
        name2 = await safeName(jid2)
    } else if (text) {
        const parts = text.trim().split(/\s+/)
        if (parts.length >= 2) {
            name1 = parts[0]
            name2 = parts.slice(1).join(' ')
            jid1 = null
            jid2 = null
        } else {
            name1 = await safeName(jid1)
            name2 = text.trim()
            jid2 = null
        }
    } else {
        return m.reply(`『 ⚠️ 』 \`Menziona qualcuno o scrivi due nomi!\`\n_Es: ${usedPrefix}coppia @utente_`)
    }

    const getAvatar = async (jid) => {
        if (!jid) return 'https://files.catbox.moe/57bmbv.jpg'; // 🔥 FIX FALLBACK AVATAR 🔥
        try { return await conn.profilePictureUrl(jid, 'image'); } 
        catch { return 'https://files.catbox.moe/57bmbv.jpg'; }
    }

    const avatar1 = await getAvatar(jid1)
    const avatar2 = await getAvatar(jid2)

    let percentage = Math.floor(Math.random() * 101)
    let phrase = getRandomPhrase(percentage)

    // 🔥 PREPARAZIONE GRAFICA VIP LEGAM OS 🔥
    let channelContext = {
        mentionedJid: [jid1, jid2].filter(v => v),
        isForwarded: true,
        forwardingScore: 999,
        forwardedNewsletterMessageInfo: {
            newsletterJid: '120363233544482011@newsletter',
            serverMessageId: 100,
            newsletterName: `💘 Affinità di Coppia`
        }
    };

    let textMsg = `
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦
· 💘 𝐓𝐄𝐒𝐓 𝐀𝐅𝐅𝐈𝐍𝐈𝐓𝐀' 💘 ·
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦

『 👩‍❤️‍👨 』 𝐂𝐨𝐩𝐩𝐢𝐚:
· ${name1}
· ${name2}

『 📊 』 𝐂𝐨𝐦𝐩𝐚𝐭𝐢𝐛𝐢𝐥𝐢𝐭𝐚': *${percentage}%*
╰ ⌕ _"${phrase}"_
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦`.trim()

    try {
        // Tenta di generare l'immagine con Browserless
        m.reply('🔮 _Consultando gli astri..._')
        const imageBuffer = await generateCoupleImage({ name1, name2, percentage, avatar1, avatar2 })
        
        // Se ha l'API e funziona, manda l'immagine
        await conn.sendMessage(m.chat, { image: imageBuffer, caption: textMsg, contextInfo: channelContext }, { quoted: m })

    } catch (err) {
        // 🔥 FALLBACK TESTUALE VIP SE MANCA L'API (o se c'è un errore dell'immagine) 🔥
        await conn.sendMessage(m.chat, { text: textMsg, contextInfo: channelContext }, { quoted: m })
    }

  } catch (e) {
    console.error(e)
    m.reply(`❌ \`Errore:\`\n${e.message}`)
  }
}

handler.help = ['coppia']
handler.tags = ['giochi']
handler.command = /^(ship|love|amore|coppia)$/i
handler.group = true

export default handler

