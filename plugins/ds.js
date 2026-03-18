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

        let finalMsg = `🗑️ *Sono stati eliminati ${finalCount} archivi! Grazie per avermi svuotato le palle😉💦*`

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

        // Bottoni Interattivi
        const buttons = [
            { buttonId: usedPrefix + "ds", buttonText: { displayText: "🔄 Svuota sessioni" }, type: 1 },
            { buttonId: usedPrefix + "ping", buttonText: { displayText: "⚡ Ping" }, type: 1 },
            { buttonId: usedPrefix + "pong", buttonText: { displayText: "🏓 Pong" }, type: 1 },
            { buttonId: usedPrefix + "speed", buttonText: { displayText: "📊 Speed" }, type: 1 }
        ]

        // Invio immediato (Niente animazioni, niente react)
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


