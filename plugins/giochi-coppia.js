import fs from 'fs'
import axios from 'axios'
import React from 'react'
import { renderToString } from 'react-dom/server'
import path from 'path'

const varebot = './media/menu/varebot.jpeg'
const varebotpfp = './media/varebot-pfp.png'

const getBase64Image = (filePath, fallbackUrl) => {
    try {
        if (fs.existsSync(filePath)) {
            const fileData = fs.readFileSync(filePath);
            const ext = path.extname(filePath).substring(1);
            return `data:image/${ext === 'svg' ? 'svg+xml' : ext};base64,${fileData.toString('base64')}`;
        }
    } catch (e) {
        console.error(`Impossibile leggere file locale ${filePath}:`, e.message);
    }
    return fallbackUrl;
}

const getLovePhrases = (p, n1, n2) => {
    if (p <= 10) return [
        `*${p}%* - Vi odiate. Si vede da Marte.`,
        `*${p}%* - Meglio se uno dei due cambia pianeta.`,
        `*${p}%* - C'è più amore tra un vegano e una fiorentina.`,
        `*${p}%* - Buttatevi nell'umido, separatamente.`
    ];
    if (p <= 30) return [
        `*${p}%* - La noia mortale.`,
        `*${p}%* - Arido come il deserto. Lasciate perdere.`,
        `*${p}%* - Siete una barzelletta che non fa ridere.`,
        `*${p}%* - Friendzone livello: "Sei come un fratello".`
    ];
    if (p <= 55) return [
        `*${p}%* - Forse da ubriachi... ma molto ubriachi.`,
        `*${p}%* - Ci sono margini di miglioramento (forse).`,
        `*${p}%* - Una notte e via, e poi blocco su WhatsApp.`,
        `*${p}%* - Vi mancano un po' di pezzi per funzionare.`
    ];
    if (p <= 80) return [
        `*${p}%* - C'è tensione sessuale nell'aria!`,
        `*${p}%* - Si prospetta un "Netflix & Chill" interessante.`,
        `*${p}%* - L'attrazione fisica c'è tutta. Dateci dentro!`,
        `*${p}%* - Una cena a lume di candela e poi... chissà.`
    ];
    if (p < 95) return [
        `*${p}%* - Chiamate i pompieri! Qui si brucia!`,
        `*${p}%* - Siete fatti l'uno per l'altra. Che invidia.`,
        `*${p}%* - Un legame spaziale! Verso l'infinito e oltre!`,
        `*${p}%* - Esplosivi! Letto, cuore e anima connessi.`
    ];
    return [
        `*100%* - PREPARATE IL MATRIMONIO. ORA.`,
        `*100%* - La perfezione esiste. Siete voi due.`,
        `*100%* - Compatibilità assoluta: Sesso Divino e Amore Eterno!`
    ];
}

const getRandomPhrase = (percentage, n1, n2) => {
    const list = getLovePhrases(percentage, n1, n2);
    return list[Math.floor(Math.random() * list.length)];
}

const createCoupleCard = (props) => {
  const { name1, name2, percentage, avatar1, avatar2, backgroundData } = props
  let barColorStart, barColorEnd;
  if (percentage < 30) { barColorStart = '#ef4444'; barColorEnd = '#991b1b'; }
  else if (percentage < 70) { barColorStart = '#f59e0b'; barColorEnd = '#d97706'; }
  else { barColorStart = '#ec4899'; barColorEnd = '#be185d'; }

  return React.createElement('div', {
    style: {
      fontFamily: 'Inter, Arial, sans-serif',
      width: '600px',
      height: '400px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
      backgroundColor: '#1a1a1a'
    }
  },
    React.createElement('div', {
        style: {
            position: 'absolute', top: '-20px', left: '-20px', right: '-20px', bottom: '-20px',
            backgroundImage: `url('${backgroundData}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(7px)',
            opacity: 0.8,
            zIndex: 1
        }
    }),
    React.createElement('div', {
        style: {
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: 2
        }
    }),
    React.createElement('div', {
      style: {
        width: '85%',
        height: '67%',
        borderRadius: '20px',
        padding: '20px',
        background: 'rgba(255, 255, 255, 0.08)',
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 3
      }
    },
      React.createElement('div', {
        style: { flex: '0 0 130px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }
      },
        React.createElement('div', {
          style: {
            width: '100px', height: '100px', borderRadius: '50%',
            border: '3px solid rgba(255,255,255,0.9)',
            boxShadow: '0 0 15px rgba(255,255,255,0.2)',
            overflow: 'hidden', background: '#000'
          }
        },
            React.createElement('img', { src: avatar1, style: { width: '100%', height: '100%', objectFit: 'cover' } })
        ),
        React.createElement('div', { 
            style: { 
                fontSize: '16px', fontWeight: 'bold', color: '#fff', textAlign: 'center', 
                textShadow: '0 2px 2px rgba(0,0,0,0.8)', maxWidth: '130px', 
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
            } 
        }, name1)
      ),
      React.createElement('div', {
        style: { flex: '1', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 15px' }
      },
        React.createElement('div', {
          style: {
            fontSize: '42px', fontWeight: '900',
            background: `linear-gradient(to bottom, #fff, ${barColorStart})`,
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.3))',
            marginBottom: '5px'
          }
        }, `${percentage}%`),
        React.createElement('div', {
          style: {
            width: '100%', height: '24px', background: 'rgba(0,0,0,0.6)',
            borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)',
            overflow: 'hidden', position: 'relative'
          }
        },
          React.createElement('div', {
            style: {
              width: `${percentage}%`, height: '100%',
              background: `linear-gradient(90deg, ${barColorStart}, ${barColorEnd})`,
              boxShadow: `0 0 15px ${barColorStart}`,
              borderRadius: '12px'
            }
          })
        ),
      ),
      React.createElement('div', {
        style: { flex: '0 0 130px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }
      },
        React.createElement('div', {
          style: {
            width: '100px', height: '100px', borderRadius: '50%',
            border: '3px solid rgba(255,255,255,0.9)',
            boxShadow: '0 0 15px rgba(255,255,255,0.2)',
            overflow: 'hidden', background: '#000'
          }
        },
            React.createElement('img', { src: avatar2, style: { width: '100%', height: '100%', objectFit: 'cover' } })
        ),
        React.createElement('div', { 
            style: { 
                fontSize: '16px', fontWeight: 'bold', color: '#fff', textAlign: 'center', 
                textShadow: '0 2px 2px rgba(0,0,0,0.8)', maxWidth: '130px', 
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
            } 
        }, name2)
      )
    )
  )
}

export const generateCoupleImage = async ({ name1, name2, percentage, avatar1, avatar2 }) => {
  const browserlessKey = global.APIKeys?.browserless
  if (!browserlessKey) {
    console.warn('Browserless API key mancante.')
    throw new Error('API key Browserless non configurata.')
  }
  const backgroundData = getBase64Image(varebot);
  try {
    const reactElement = createCoupleCard({ name1, name2, percentage, avatar1, avatar2, backgroundData })
    const htmlContent = renderToString(reactElement)
    const fullHtml = `<!DOCTYPE html><html><head><meta charset="utf-8">
      <style>body{margin:0;padding:0;width:600px;height:400px;overflow:hidden;background:transparent;}</style>
      </head><body>${htmlContent}</body></html>`

    const url = `https://chrome.browserless.io/screenshot?token=${encodeURIComponent(browserlessKey)}`

    const response = await axios.post(url, {
      html: fullHtml,
      options: {
        type: 'jpeg',
        quality: 85,
        fullPage: false
      },
      viewport: {
        width: 600,
        height: 400
      }
    }, {
      responseType: 'arraybuffer',
      timeout: 25000
    })

    return response.data
  } catch (error) {
    console.error('Errore generateCoupleImage:', error.message)
    throw new Error(`Errore generazione immagine`)
  }
}

var handler = async (m, { conn, text, usedPrefix }) => {
  
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
    }
    else if (m.mentionedJid && m.mentionedJid.length >= 2) {
        jid1 = m.mentionedJid[0]
        jid2 = m.mentionedJid[1]
        name1 = await safeName(jid1)
        name2 = await safeName(jid2)
    }
    else if (m.mentionedJid && m.mentionedJid.length === 1) {
        jid2 = m.mentionedJid[0]
        name1 = await safeName(jid1)
        name2 = await safeName(jid2)
    }
    else if (text) {
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
    }
    else {
        return m.reply(`✨ *Menziona qualcuno o scrivi due nomi!*\nEsempio: *${usedPrefix}coppia @utente*`)
    }
    const getAvatar = async (jid) => {
        if (!jid) return getBase64Image(varebotpfp);
        try {
            return await conn.profilePictureUrl(jid, 'image');
        } catch {
            return getBase64Image(varebotpfp);
        }
    }

    const avatar1 = await getAvatar(jid1)
    const avatar2 = await getAvatar(jid2)

    // 3. Calcoli
    let percentage = Math.floor(Math.random() * 101)
    let captionText = getRandomPhrase(percentage, name1, name2)

    m.reply('🔮 *Consultando gli astri...*')
    const imageBuffer = await generateCoupleImage({ 
        name1, name2, percentage, avatar1, avatar2 
    })
    let ricalcolaCmd = ''
    if (jid1 && jid2 && jid1 !== m.sender) {
        ricalcolaCmd = `${usedPrefix}coppia @${jid1.split('@')[0]} @${jid2.split('@')[0]}`
    } else if (jid2) {
        ricalcolaCmd = `${usedPrefix}coppia @${jid1.split('@')[0]} @${jid2.split('@')[0]}`
    } else {
        ricalcolaCmd = `${usedPrefix}coppia ${name1} ${name2}`
    }

    const buttons = [
      { buttonId: ricalcolaCmd, buttonText: { displayText: 'Ricalcola 🎲' }, type: 1 }
    ]

    await conn.sendMessage(m.chat, {
      image: imageBuffer,
      caption: captionText,
      footer: 'vare ✧ bot',
      buttons,
      mentions: conn.parseMention(captionText + ricalcolaCmd)
    }, { quoted: m })
    if (percentage === 100 && jid2) {
       m.reply(`💍 *DESTINO COMPIUTO!* Volete sposarvi? (Scrivete "sì")`, null, { mentions: [jid1, jid2] })
       
       let filter = msg => (msg.text?.toLowerCase() === 'si' || msg.text?.toLowerCase() === 'sì') && (msg.sender == jid1 || msg.sender == jid2)
       let collected = []
       
       try {
           let timeout = Date.now() + 60000
           while (collected.length < 2 && Date.now() < timeout) {
               let res = await conn.awaitMessage(m.chat, filter, 60000).catch(() => null)
               if(res && !collected.includes(res.sender)) collected.push(res.sender)
           }
           
           if (collected.length === 2) {
                let file = './sposi.json'
                let sposi = []
                if (fs.existsSync(file)) try { sposi = JSON.parse(fs.readFileSync(file)) } catch {}
                sposi.push({ partner1: name1, partner2: name2, date: new Date().toISOString() })
                fs.writeFileSync(file, JSON.stringify(sposi, null, 2))
                conn.reply(m.chat, `💞 *VI DICHIARO MARITO E MOGLIE (o quello che siete)!* 🎉`, m)
           }
       } catch(e) {
       }
    }

  } catch (e) {
    console.error(e)
    m.reply(`❌ Errore: ${e.message}`)
  }
}

handler.help = ['coppia']
handler.tags = ['giochi']
handler.command = /^(ship|love|amore|coppia)$/i
handler.register = true

export default handler