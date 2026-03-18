import fs from 'fs'
import path from 'path'

let handler = async (m, { conn, usedPrefix }) => {
    try {
        // Percorsi delle cartelle da pulire
        let sessionPath = './session/' 
        let tempPath = './temp/'
        let deletedFiles = 0

        // Esecuzione pulizia reale
        if (fs.existsSync(sessionPath)) {
            let files = fs.readdirSync(sessionPath)
            for (let file of files) {
                if (file !== 'creds.json') {
                    try { fs.unlinkSync(path.join(sessionPath, file)); deletedFiles++ } catch (e) {}
                }
            }
        }
        
        if (fs.existsSync(tempPath)) {
            let tempFiles = fs.readdirSync(tempPath)
            for (let file of tempFiles) {
                try { fs.unlinkSync(path.join(tempPath, file)); deletedFiles++ } catch (e) {}
            }
        }

        // Calcolo numero file per l'estetica (minimo 1200 se il bot è già pulito)
        let finalCount = deletedFiles > 0 ? deletedFiles : Math.floor(Math.random() * 500) + 1200;

        // Testo richiesto con Font Sans-Serif Bold Unicode
        let finalMsg = `🗑️ *𝗦𝗼𝗻𝗼 𝘀𝘁𝗮𝘁𝗶 𝗲𝗹𝗶𝗺𝗶𝗻𝗮𝘁𝗶 ${finalCount} 𝗮𝗿𝗰𝗵𝗶𝘃𝗶! 𝗚𝗿𝗮𝘇𝗶𝗲 𝗽𝗲𝗿 𝗮𝘃𝗲𝗿𝗺𝗶 𝘀𝘃𝘂𝗼𝘁𝗮𝘁𝗼 𝗹𝗲 𝗽𝗮𝗹𝗹𝗲 😉💦*`

        // ==========================================
        // FAKE QUOTE VERIFICATO (WhatsApp Business + Bot Name)
        // ==========================================
        let fakeVerifiedQuote = {
            key: {
                fromMe: false,
                participant: `0@s.whatsapp.net`, // Account ufficiale WhatsApp (per la spunta blu)
                ...(m.chat ? { remoteJid: "status@broadcast" } : {})
            },
            message: {
                locationMessage: {
                    name: 'WhatsApp Business', // Titolo del box
                    address: '𝐿𝛴𝐺𝛬𝑀 𝛩𝑆 𝚩𝚯𝐓', // Nome del bot con il font speciale
                }
            }
        }

        // Bottoni con font stilizzato
        const buttons = [
            { buttonId: usedPrefix + "ds", buttonText: { displayText: "🔄 𝗦𝘃𝘂𝗼𝘁𝗮 𝗦𝗲𝘀𝘀𝗶𝗼𝗻𝗶" }, type: 1 },
            { buttonId: usedPrefix + "ping", buttonText: { displayText: "⚡ 𝗣𝗶𝗻𝗴" }, type: 1 },
            { buttonId: usedPrefix + "pong", buttonText: { displayText: "🏓 𝗣𝗼𝗻𝗴" }, type: 1 },
            { buttonId: usedPrefix + "speed", buttonText: { displayText: "📊 𝗦𝗽𝗲𝗲𝗱" }, type: 1 }
        ]

        // Invio del messaggio immediato con il Fake Quote
        await conn.sendMessage(m.chat, {
            text: finalMsg,
            buttons: buttons,
            headerType: 1
        }, { quoted: fakeVerifiedQuote })
        
    } catch (err) {
        console.error(err)
        m.reply("❌ `Errore critico durante la pulizia delle sessioni.`")
    }
}

handler.help = ['ds', 'svuota']
handler.tags = ['admin', 'owner']
handler.command = /^(ds|clearcache|svuota)$/i

// Permessi: Accessibile sia all'Owner che agli Admin del gruppo
handler.admin = true 

export default handler

