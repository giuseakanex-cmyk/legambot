import { performance } from 'perf_hooks'

let handler = async (m, { conn }) => {
    let start = performance.now()
    let end = performance.now()
    let latenza = (end - start).toFixed(4)

    let uptime = process.uptime()
    let h = Math.floor(uptime / 3600)
    let m_up = Math.floor((uptime % 3600) / 60)
    let s = Math.floor(uptime % 60)
    let uptimeStr = `${h}h ${m_up}m ${s}s`

    let ram = (process.memoryUsage().rss / 1024 / 1024).toFixed(2) + ' MB'
    
    // Controlla il database, se non esiste l'utente, gli assegna 1000€ fittizi per non crashare
    let user = global.db?.data?.users?.[m.sender] || { euro: 1000 }

    let pingMsg = `
┏━━━━━━ ≪ 🧶 ≫ ━━━━━━┓
      ⚡ *𝐋𝐄𝐆𝐀𝐌𝐁𝐎𝐓 𝐒𝐓𝐀𝐓𝐔𝐒* ⚡
┗━━━━━━ ≪ 🧶 ≫ ━━━━━━┛

🚀 *𝐋𝐀𝐓𝐄𝐍𝐙𝐀:* ${latenza} ms
⌛ *𝐔𝐏𝐓𝐈𝐌𝐄:* ${uptimeStr}
📟 *𝐑𝐀𝐌 𝐔𝐒𝐀𝐆𝐄:* ${ram}

👤 *𝐔𝐓𝐄𝐍𝐓𝐄:* @${m.sender.split('@')[0]}
💰 *𝐁𝐀𝐋𝐀𝐍𝐂𝐄:* ${user.euro.toLocaleString('it-IT')} €

🛡️ _Sistemi stabili e criptati_
✨ _Dev by Giuse & Legam Engine_`.trim()

    await conn.sendMessage(m.chat, { 
        text: pingMsg, 
        mentions: [m.sender],
        contextInfo: {
            externalAdReply: {
                title: "System Diagnostic: ACTIVE",
                body: `LegamBot V3 • Speed: ${latenza}ms`,
                thumbnailUrl: "https://files.catbox.moe/p9p6m9.jpg", // Immagine figa tech
                sourceUrl: "https://github.com/giuseakanex-cmyk/legambot",
                mediaType: 1,
                renderLargerThumbnail: true
            }
        }
    }, { quoted: m })
}

handler.command = ['ping'] 
export default handler
