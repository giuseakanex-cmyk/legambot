let handler = async (m, { conn, command, isOwner, usedPrefix }) => {
    // Sicurezza: solo Giuse può usare on/off
    if (!isOwner) return m.reply('❌ Solo Giuse possiede il potere di evocare l\'ombra.')

    if (command === 'off' || command === 'ghost') {
        if (global.ghostMode) return m.reply('⟡ _Legam Bot è già in Modalità Ghost._')
        
        global.ghostMode = true 
        
        let txt = `
⊹ ࣪ ˖ ✦ ━━ 𝐆 𝐇 𝐎 𝐒 𝐓   𝐌 𝐎 𝐃 𝐄 ━━ ✦ ˖ ࣪ ⊹

⋆ 𝐒𝐭𝐚𝐭𝐨 ➻ 𝐀𝐭𝐭𝐢𝐯𝐚𝐭𝐨 🌙
⋆ 𝐄𝐟𝐟𝐞𝐭𝐭𝐨 ➻ 𝐈𝐥 𝐛𝐨𝐭 𝐨𝐫𝐚 𝐢𝐠𝐧𝐨𝐫𝐚 𝐭𝐮𝐭𝐭𝐢 𝐭𝐫𝐚𝐧𝐧𝐞 𝐆𝐢𝐮𝐬𝐞.

⟡ _Legam Bot scivola nell'ombra._
⟡ _(Scrivi ${usedPrefix}on per risvegliarlo)_

👑 𝐎𝐖𝐍𝐄𝐑 ➤ 𝐆𝐈𝐔𝐒𝚵
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦`.trim()

        await conn.sendMessage(m.chat, { text: txt }, { quoted: m })

    } else if (command === 'on') {
        if (!global.ghostMode) return m.reply('⟡ _Legam Bot è già sveglio e operativo._')
        
        global.ghostMode = false 
        
        let txt = `
⊹ ࣪ ˖ ✦ ━━━ 𝐎 𝐍 𝐋 𝐈 𝐍 𝐄 ━━━ ✦ ˖ ࣪ ⊹

⋆ 𝐒𝐭𝐚𝐭𝐨 ➻ 𝐀𝐭𝐭𝐢𝐯𝐨 ☀️
⋆ 𝐄𝐟𝐟𝐞𝐭𝐭𝐨 ➻ 𝐈𝐥 𝐛𝐨𝐭 𝐞̀ 𝐭𝐨𝐫𝐧𝐚𝐭𝐨 𝐨𝐩𝐞𝐫𝐚𝐭𝐢𝐯𝐨 𝐩𝐞𝐫 𝐭𝐮𝐭𝐭𝐢.

⟡ _L'ombra si dissolve. Legam Bot è di nuovo in ascolto._

👑 𝐎𝐖𝐍𝐄𝐑 ➤ 𝐆𝐈𝐔𝐒𝚵
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦`.trim()

        await conn.sendMessage(m.chat, { text: txt }, { quoted: m })
    }
}

// 🛑 INTERCETTORE DEFINITIVO: Solo l'Owner passa
handler.before = async function (m, { isOwner }) {
    // Se il Ghost Mode è attivo e CHI SCRIVE NON È L'OWNER
    if (global.ghostMode && !isOwner) {
        // 1. Svuota il testo del messaggio (così gli altri plugin non vedono comandi)
        m.text = ''
        m.body = ''
        
        // 2. Blocca l'esecuzione degli altri plugin per questo utente
        return true 
    }
}

handler.help = ['ghost', 'on', 'off']
handler.tags = ['owner']
handler.command = /^(ghost|off|on)$/i
handler.owner = true

export default handler
