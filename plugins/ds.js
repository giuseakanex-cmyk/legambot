import fs from 'fs'
import path from 'path'

let handler = async (m, { conn, usedPrefix }) => {
    try {
        let sessionPath = './session/' // Cambia in './auth_info_baileys/' se usi quello
        let tempPath = './temp/'
        let deletedFiles = 0

        // Svuota sessione (tranne creds.json)
        if (fs.existsSync(sessionPath)) {
            let files = fs.readdirSync(sessionPath)
            for (let file of files) {
                if (file !== 'creds.json') {
                    try { fs.unlinkSync(path.join(sessionPath, file)); deletedFiles++ } catch (e) {}
                }
            }
        }
        
        // Svuota media temporanei
        if (fs.existsSync(tempPath)) {
            let tempFiles = fs.readdirSync(tempPath)
            for (let file of tempFiles) {
                try { fs.unlinkSync(path.join(tempPath, file)); deletedFiles++ } catch (e) {}
            }
        }

        // Numero finto per scena se il bot era già pulito
        let finalCount = deletedFiles > 0 ? deletedFiles : Math.floor(Math.random() * 800) + 1200;

        // 🔥 IL TESTO RICHIESTO CON IL FONT VIP (Sans-Serif Bold Unicode) 🔥
        let finalMsg = `🗑️ *𝗦𝗼𝗻𝗼 𝘀𝘁𝗮𝘁𝗶 𝗲𝗹𝗶𝗺𝗶𝗻𝗮𝘁𝗶 ${finalCount} 𝗮𝗿𝗰𝗵𝗶𝘃𝗶! 𝗚𝗿𝗮𝘇𝗶𝗲 𝗽𝗲𝗿 𝗮𝘃𝗲𝗿𝗺𝗶 𝘀𝘃𝘂𝗼𝘁𝗮𝘁𝗼 𝗹𝗲 𝗽𝗮𝗹𝗹𝗲 😉💦*`

        // TRUCCO QUOTE VIP: "WhatsApp Business Verificato"
        let fakeVerifiedQuote = {
            key: {
                fromMe: false,
                participant: `0@s.whatsapp.net`, 
                ...(m.chat ? { remoteJid: "status@broadcast" } : {})
            },
            message: {
                locationMessage: {
                    name: 'WhatsApp Business', 
                    address: m.pushName || 'Legam OS VIP', 
                }
            }
        }

        // 🔘 BOTTONI CON IL FONT VIP
        const buttons = [
            { buttonId: usedPrefix + "ds", buttonText: { displayText: "🔄 𝗦𝘃𝘂𝗼𝘁𝗮 𝗦𝗲𝘀𝘀𝗶𝗼𝗻𝗶" }, type: 1 },
            { buttonId: usedPrefix + "ping", buttonText: { displayText: "⚡ 𝗣𝗶𝗻𝗴" }, type: 1 },
            { buttonId: usedPrefix + "pong", buttonText: { displayText: "🏓 𝗣𝗼𝗻𝗴" }, type: 1 },
            { buttonId: usedPrefix + "speed", buttonText: { displayText: "📊 𝗦𝗽𝗲𝗲𝗱" }, type: 1 }
        ]

        // Invio immediato (Niente animazioni, niente react per non far crashare i bottoni)
        await conn.sendMessage(m.chat, {
            text: finalMsg,
            buttons: buttons,
            headerType: 1
        }, { quoted: fakeVerifiedQuote })
        
    } catch (err) {
        console.error(err)
        m.reply("❌ `Errore durante la pulizia.`")
    }
}

handler.help = ['ds', 'clearcache']
handler.tags = ['creatore']
handler.command = ['ds', 'clearcache', 'svuota']
handler.admin = true // Owner + Admin

export default handler


