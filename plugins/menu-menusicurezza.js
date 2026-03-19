let handler = async (m, { conn, usedPrefix }) => {
    // Recupera i dati del gruppo in tempo reale
    let chat = global.db.data.chats[m.chat] || {}
    let nomeDelBot = global.db.data.nomedelbot || `𝐿𝛴𝐺𝛬𝑀 𝛩𝑆 𝚩𝚯𝐓`

    // Se non è un gruppo, avvisa
    if (!m.isGroup) return m.reply(`『 ⚠️ 』 \`Questo menu funziona solo nei gruppi!\``)

    // 🔥 LISTA FUNZIONI LEGATE AL TUO ATTIVA-DISATTIVA 🔥
    // (Aggiungi o togli qui quello che vuoi far apparire nel menu)
    const securityFeatures = [
        { id: 'welcome', name: '👋 Benvenuto/Addio' },
        { id: 'antiLink', name: '🔗 Anti-Link (WhatsApp)' },
        { id: 'antiLink2', name: '🌐 Anti-Link (Social)' },
        { id: 'antispam', name: '🛑 Anti-Spam' },
        { id: 'antiparolacce', name: '🧼 Filtro Parolacce' },
        { id: 'bestemmiometro', name: '🤬 Bestemmiometro' },
        { id: 'antiporno', name: '🔞 Anti-Porno' },
        { id: 'antiBot', name: '🤖 Anti-Bot' },
        { id: 'antimedia', name: '🖼️ Anti-Media' },
        { id: 'antioneview', name: '👁️‍🗨️ Anti-ViewOnce' },
        { id: 'modoadmin', name: '🛡️ Solo Admin' },
        { id: 'reaction', name: '😎 Auto-Reazioni' },
        { id: 'autolevelup', name: '⬆️ Auto-LevelUp' }
    ];

    // Creazione dinamica della lista con i pallini
    let statusList = securityFeatures.map(f => {
        let isAttivo = chat[f.id] ? '🟢' : '🔴'
        let nomeComando = f.id.toLowerCase()
        return `┃ ${isAttivo} ✦ *${f.name}* \n┃ ╰ ⌕ _(usa: ${usedPrefix}attiva ${nomeComando})_`
    }).join('\n┃\n')

    // Estetica Legam OS
    let menuText = `
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦
· 🛡️ 𝐌𝐄𝐍𝐔 𝐒𝐈𝐂𝐔𝐑𝐄𝐙𝐙𝐀 🛡️ ·
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦

╭﹕₊˚ ★ ⁺˳ꕤ₊⁺・꒱
│ ℹ️ *𝐂𝐎𝐌𝐄 𝐒𝐈 𝐔𝐒𝐀:*
│ 🟢 ${usedPrefix}attiva [nome]
│ 🔴 ${usedPrefix}disattiva [nome]
╰﹕₊˚ ★ ⁺˳ꕤ₊⁺・꒱

╭━━━━━━━━━━━━━━━━━━━━⬣
${statusList}
╰━━━━━━━━━━━━━━━━━━━━⬣

╰♡꒷ ๑ ⋆˚₊⋆───ʚ˚ɞ───⋆˚₊⋆ ๑ ⪩
 ୧・👑 *𝐒𝐲𝐬𝐭𝐞𝐦:* Legam OS
 ୧・💎 *𝐀𝐝𝐦𝐢𝐧:* @${m.sender.split('@')[0]}
╰♡꒷ ๑ ⋆˚₊⋆───ʚ˚ɞ───⋆˚₊⋆ ๑ ⪩`.trim()

    // 🔥 TRUCCO QUOTE VIP: "whatsapp business" Verificato 🔥
    let fakeVerifiedQuote = {
        key: {
            fromMe: false,
            participant: `0@s.whatsapp.net`, 
            ...(m.chat ? { remoteJid: "status@broadcast" } : {})
        },
        message: {
            locationMessage: {
                name: 'whatsapp business', 
                address: nomeDelBot, 
            }
        }
    };

    // Immagine di sicurezza (Fallback su Catbox per evitare crash se manca il file locale)
    let defaultImg = 'https://files.catbox.moe/pyp87f.jpg'

    await conn.sendMessage(m.chat, {
        image: { url: defaultImg },
        caption: menuText,
        mentions: [m.sender]
    }, { quoted: fakeVerifiedQuote })
}

handler.help = ['menusicurezza']
handler.tags = ['admin']
handler.command = /^(menusicurezza|sicurezza|adminmenu)$/i

handler.admin = true // Solo gli admin possono aprirlo
handler.group = true

export default handler

