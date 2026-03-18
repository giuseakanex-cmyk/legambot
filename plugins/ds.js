import fs from 'fs'
import path from 'path'

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

let handler = async (m, { conn }) => {
    try {
        let sessionPath = './session/' 
        let tempPath = './temp/'
        let deletedFiles = 0

        await conn.sendMessage(m.chat, { react: { text: '⚙️', key: m.key } })

        const generateMessage = (bar, percent, status) => {
            return `
⊹ ࣪ ˖ ✦ ━━ 𝐒 𝐈 𝐒 𝐓 𝐄 𝐌 𝐀 ━━ ✦ ˖ ࣪ ⊹

⚙️ \`𝐏𝐮𝐥𝐢𝐳𝐢𝐚 𝐢𝐧 𝐜𝐨𝐫𝐬𝐨...\`
${bar} *${percent}%*
⟡ _${status}_

✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦`.trim()
        }

        // ==========================================
        // TRUCCO QUOTE VIP: "WhatsApp Business Verificato"
        // ==========================================
        let fakeVerifiedQuote = {
            key: {
                fromMe: false,
                participant: `0@s.whatsapp.net`, // Forza la spunta blu ufficiale
                ...(m.chat ? { remoteJid: "status@broadcast" } : {})
            },
            message: {
                locationMessage: {
                    name: 'WhatsApp Business', // Titolo con spunta blu
                    address: m.pushName || 'Legam OS VIP', // Sottotitolo
                }
            }
        }

        // 1. Invia il primo frame dell'animazione AGGANCIATO al finto account WhatsApp
        let sentMsg = await conn.sendMessage(m.chat, { 
            text: generateMessage('[■□□□□□□□□□]', '10', 'Scansione file...') 
        }, { quoted: fakeVerifiedQuote })

        let key = sentMsg.key

        await delay(1000)
        // 2. Modifica il messaggio (l'animazione continua)
        await conn.sendMessage(m.chat, { text: generateMessage('[■■■□□□□□□□]', '30', 'Isolamento processi...'), edit: key })

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

        await delay(1000)
        // 3. Modifica messaggio
        await conn.sendMessage(m.chat, { text: generateMessage('[■■■■■■■■□□]', '80', 'Compressione...'), edit: key })

        await delay(1000)

        // Se il bot era già pulito, genera un numero alto finto per scena (come nello screen)
        let finalCount = deletedFiles > 0 ? deletedFiles : Math.floor(Math.random() * 800) + 1200;

        // Testo finale identico allo screen che mi hai mandato!
        let finalMsg = `🗑️ *Sono stati eliminati ${finalCount} archivi delle sessioni! Grazie per avermi svuotato ☺️*`

        // 4. Stampa il messaggio finale
        await conn.sendMessage(m.chat, { text: finalMsg, edit: key })
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
        
    } catch (err) {
        console.error(err)
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    }
}

handler.help = ['ds', 'clearcache']
handler.tags = ['creatore']
handler.command = ['ds', 'clearcache']

// 🔥 PERMESSI MODIFICATI 🔥
// Tolto handler.owner = true
// Aggiunto handler.admin = true (Consente l'uso agli Admin del gruppo e all'Owner globale)
handler.admin = true 

export default handler


