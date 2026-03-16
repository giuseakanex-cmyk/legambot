import fs from 'fs'
import path from 'path'

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

let handler = async (m, { conn }) => {
    // 1. Inizializzazione
    let sessionPath = './session/' // Assicurati che corrisponda alla cartella della sessione
    let tempPath = './temp/'
    let deletedFiles = 0

    await m.react('⚙️')

    // 2. Funzione per generare il testo della barra
    const generateMessage = (bar, percent, status) => {
        return `
⊹ ࣪ ˖ ✦ ━━ 𝐒 𝐈 𝐒 𝐓 𝐄 𝐌 𝐀 ━━ ✦ ˖ ࣪ ⊹

⚙️ \`𝐏𝐮𝐥𝐢𝐳𝐢𝐚 𝐢𝐧 𝐜𝐨𝐫𝐬𝐨...\`
${bar} *${percent}%*
⟡ _${status}_

✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦`.trim()
    }

    // 3. Invio del primo messaggio e salvataggio della chiave per modificarlo
    let { key } = await conn.sendMessage(m.chat, { 
        text: generateMessage('[■□□□□□□□□□]', '10', 'Scansione file corrotti...') 
    }, { quoted: m })

    try {
        // --- INIZIO ANIMAZIONE ---
        await delay(1000) // Aspetta 1 secondo (1000ms)
        await conn.sendMessage(m.chat, { 
            text: generateMessage('[■■■□□□□□□□]', '30', 'Isolamento processi fantasma...'), edit: key 
        })

        await delay(1000)
        await conn.sendMessage(m.chat, { 
            text: generateMessage('[■■■■■□□□□□]', '50', 'Eliminazione log spazzatura...'), edit: key 
        })

        // --- ESECUZIONE PULIZIA REALE ---
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
        // --------------------------------

        await delay(1000)
        await conn.sendMessage(m.chat, { 
            text: generateMessage('[■■■■■■■■□□]', '80', 'Compressione database in corso...'), edit: key 
        })

        await delay(1000)
        await conn.sendMessage(m.chat, { 
            text: generateMessage('[■■■■■■■■■■]', '100', 'Ottimizzazione completata.'), edit: key 
        })

        // 4. MESSAGGIO FINALE DI SUCCESSO
        await delay(1000)
        let finalMsg = `
⊹ ࣪ ˖ ✦ ━━ 𝐒 𝐈 𝐒 𝐓 𝐄 𝐌 𝐀 ━━ ✦ ˖ ࣪ ⊹

✅ \`𝐏𝐮𝐥𝐢𝐳𝐢𝐚 𝐂𝐚𝐜𝐡𝐞 𝐂𝐨𝐦𝐩𝐥𝐞𝐭𝐚𝐭𝐚.\`
⟡ _File temporanei eliminati:_ ${deletedFiles}
⟡ _Il Legam Core è ora stabilizzato._

✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦`.trim()

        await conn.sendMessage(m.chat, { text: finalMsg, edit: key })
        await m.react('✅')
        
    } catch (err) {
        // GESTIONE ERRORI
        let errorMsg = `
⊹ ࣪ ˖ ✦ ━━ 𝐄 𝐑 𝐑 𝐎 𝐑 𝐄 ━━ ✦ ˖ ࣪ ⊹

❌ \`𝐅𝐚𝐥𝐥𝐢𝐦𝐞𝐧𝐭𝐨 𝐝𝐮𝐫𝐚𝐧𝐭𝐞 𝐥𝐚 𝐩𝐮𝐥𝐢𝐳𝐢𝐚.\`
⟡ _${err.message}_

✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦`.trim()
        await conn.sendMessage(m.chat, { text: errorMsg, edit: key })
        await m.react('❌')
    }
}

handler.help = ['ds', 'clearcache']
handler.tags = ['creatore']
handler.command = /^(ds|clearcache|clearsession)$/i
handler.owner = true // Solo il creatore può toccare i file di sistema

export default handler


