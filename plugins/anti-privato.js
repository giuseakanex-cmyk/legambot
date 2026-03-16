let handler = m => m

handler.before = async function (m, { conn, isOwner }) {
    // 1. Controlli di sicurezza fondamentali (salvano il bot dai crash)
    if (!m.chat || m.isGroup || m.fromMe || m.isBaileys) return

    // 2. Se a scriverti in privato sei tu (Owner), il bot ti lascia passare
    if (isOwner) return

    // Assicuriamoci che il database esista per non far crashare nulla
    let botJid = conn.decodeJid(conn.user.jid)
    global.db.data.settings[botJid] = global.db.data.settings[botJid] || {}
    let botSettings = global.db.data.settings[botJid]

    // 3. Se l'anti-privato è ATTIVO dal menù, blocca l'utente
    if (botSettings.antiprivato) {
        let txt = `
⊹ ࣪ ˖ ✦ ━━ 𝐀𝐍𝐓𝐈-𝐏𝐑𝐈𝐕𝐀𝐓𝐎 ━━ ✦ ˖ ࣪ ⊹

⚠️ \`𝐀𝐜𝐜𝐞𝐬𝐬𝐨 𝐍𝐞𝐠𝐚𝐭𝐨\`
Le chat private sono sigillate. 
Non sei autorizzato a parlarmi qui.

👑 𝐎𝐖𝐍𝐄𝐑 ➤ 𝐆𝐈𝐔𝐒𝚵
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦`.trim()

        // Manda il messaggio di avviso
        await conn.sendMessage(m.chat, { text: txt }, { quoted: m })
        
        // Blocca l'utente su WhatsApp
        await conn.updateBlockStatus(m.sender, 'block')
        
        return true // Ferma l'esecuzione di qualsiasi altro comando
    }
}

export default handler
