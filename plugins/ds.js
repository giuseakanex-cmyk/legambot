import fs from 'fs'
import path from 'path'

// Funzione per creare i ritardi (1 secondo) tra un caricamento e l'altro
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

let handler = async (m, { conn }) => {
    // --- 1. CONTROLLO ACCESSI ---
    let isBotOwner = global.owner.some(o => m.sender.includes(o[0])) || m.fromMe
    let isAdmin = false

    if (m.isGroup) {
        const groupMetadata = await conn.groupMetadata(m.chat)
        isAdmin = groupMetadata.participants.some(p => p.id === m.sender && (p.admin === 'admin' || p.admin === 'superadmin'))
    }

    if (!isBotOwner && !isAdmin) {
        return m.reply('🚫 *ACCESSO NEGATO:*\nComando riservato agli Admin o al Creatore del bot.')
    }

    // --- 2. IMPOSTAZIONE CARTELLA ESATTA ---
    const sessionFolder = './legamsession'
    
    if (!fs.existsSync(sessionFolder)) {
        return m.reply('⚠️ *Errore:* La cartella "varesession" non è stata trovata. Il bot è già pulito o il percorso è errato.')
    }

    // Reaction clessidra: il bot inizia
    await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } })

    // --- 3. INVIO DEL MESSAGGIO DI CARICAMENTO INIZIALE ---
    // Salviamo la chiave (key) del messaggio per poterlo modificare dopo!
    let { key } = await conn.sendMessage(m.chat, { text: "⚙️ *SYSTEM CLEANUP INITIATED*\n\n`[▒▒▒▒▒▒▒▒▒▒] 0%`\n_Preparazione protocollo di pulizia..._" }, { quoted: m })

    // Pulizia REALE in background
    let deletedFiles = 0
    let freedBytes = 0
    let files = fs.readdirSync(sessionFolder)
    const fileSalvavita = 'creds.json'

    for (let file of files) {
        if (file !== fileSalvavita) { 
            try {
                let filePath = path.join(sessionFolder, file)
                let stats = fs.statSync(filePath)
                if (stats.isFile()) {
                    freedBytes += stats.size 
                    fs.unlinkSync(filePath)
                    deletedFiles++
                }
            } catch (e) {
                console.error(`❌ Errore file ${file}:`, e)
            }
        }
    }

    let freedMB = (freedBytes / 1024 / 1024).toFixed(2)

    // --- 4. L'ANIMAZIONE DI CARICAMENTO (HACKER STYLE) ---
    // Il bot modificherà il messaggio precedente ogni secondo esatto
    const frames = [
        "⚙️ *SYSTEM CLEANUP INITIATED*\n\n`[█▒▒▒▒▒▒▒▒▒] 10%`\n_Avvio scansione directory varesession..._",
        "⚙️ *SYSTEM CLEANUP INITIATED*\n\n`[██▒▒▒▒▒▒▒▒] 20%`\n_Lettura file temporanei e log..._",
        "⚙️ *SYSTEM CLEANUP INITIATED*\n\n`[███▒▒▒▒▒▒▒] 30%`\n_Individuazione file spazzatura..._",
        "⚙️ *SYSTEM CLEANUP INITIATED*\n\n`[████▒▒▒▒▒▒] 40%`\n_Bypass dei file di sistema critici..._",
        "⚙️ *SYSTEM CLEANUP INITIATED*\n\n`[█████▒▒▒▒▒] 50%`\n_Salvataggio creds.json completato..._",
        "⚙️ *SYSTEM CLEANUP INITIATED*\n\n`[██████▒▒▒▒] 60%`\n_Eliminazione frammenti di cache..._",
        "⚙️ *SYSTEM CLEANUP INITIATED*\n\n`[███████▒▒▒] 70%`\n_Compressione memoria in corso..._",
        "⚙️ *SYSTEM CLEANUP INITIATED*\n\n`[████████▒▒] 80%`\n_Forzatura chiusura processi morti..._",
        "⚙️ *SYSTEM CLEANUP INITIATED*\n\n`[█████████▒] 90%`\n_Riavvio moduli di connessione..._",
        "⚙️ *SYSTEM CLEANUP INITIATED*\n\n`[██████████] 100%`\n_Ottimizzazione conclusa con successo!_"
    ]

    for (let i = 0; i < frames.length; i++) {
        await delay(1000) // Aspetta esattamente 1 secondo (1000 millisecondi)
        // Modifica il messaggio in chat
        await conn.sendMessage(m.chat, { text: frames[i], edit: key })
    }

    // Aspetta un altro mezzo secondo per far leggere il 100%
    await delay(500)

    // --- 5. GRAFICA LUSSO FINALE ---
    let txt = `
┏━━━━━━ ≪ 🧹 ≫ ━━━━━━┓
     *𝐒𝐘𝐒𝐓𝐄𝐌 𝐂𝐋𝐄𝐀𝐍𝐔𝐏*
┗━━━━━━ ≪ 🧹 ≫ ━━━━━━┛

✅ *𝐎𝐭𝐭𝐢𝐦𝐢𝐳𝐳𝐚𝐳𝐢𝐨𝐧𝐞 𝐂𝐨𝐦𝐩𝐥𝐞𝐭𝐚𝐭𝐚!*

🗑️ *𝐅𝐢𝐥𝐞 𝐞𝐥𝐢𝐦𝐢𝐧𝐚𝐭𝐢:* ${deletedFiles}
💾 *𝐒𝐩𝐚𝐳𝐢𝐨 𝐥𝐢𝐛𝐞𝐫𝐚𝐭𝐨:* ${freedMB} MB
🛡️ *𝐂𝐨𝐧𝐧𝐞𝐬𝐬𝐢𝐨𝐧𝐞:* Intatta (creds.json al sicuro)
⚡ *𝐄𝐬𝐞𝐠𝐮𝐢𝐭𝐨 𝐝𝐚:* @${m.sender.split('@')[0]}

✨ _LegamBot Cache Manager_`.trim()

    await conn.sendMessage(m.chat, { 
        text: txt,
        mentions: [m.sender],
        contextInfo: {
            externalAdReply: {
                title: "⚙️ CACHE CLEARED SUCCESSFULLY",
                body: `Liberati ${freedMB} MB dalla cartella varesession`,
                thumbnailUrl: "https://files.catbox.moe/k37h9r.jpg", 
                sourceUrl: "https://github.com/giuseakanex-cmyk/legambot",
                mediaType: 1,
                renderLargerThumbnail: true 
            }
        }
    }, { quoted: m }) // Risponde di nuovo al messaggio originale

    // Reaction spunta: operazione finita
    await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } })
}

handler.command = ['ds', 'clear', 'clean']

export default handler


