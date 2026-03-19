let handler = async (m, { conn, usedPrefix }) => {
    // Recupera i dati del gruppo in tempo reale
    let chat = global.db.data.chats[m.chat] || {}
    let nomeDelBot = global.db.data.nomedelbot || `𝐿𝛴𝐺𝛬𝑀 𝛩𝑆 𝚩𝚯𝐓`

    // Se non è un gruppo, avvisa
    if (!m.isGroup) return m.reply(`『 ⚠️ 』 \`Questo menu funziona solo nei gruppi!\``)

    // 🔥 LISTA FUNZIONI ALLINEATA AL TUO DATABASE 🔥
    const securityFeatures = [
        { id: 'welcome', name: '👋 Benvenuto' },
        { id: 'goodbye', name: '🚪 Addio' },
        { id: 'antiLink', name: '🔗 Anti-Link WA' },
        { id: 'antiLinkUni', name: '🌍 Anti-Link Uni' },
        { id: 'antiLink2', name: '🌐 Anti-Link Social' },
        { id: 'antispam', name: '🛑 Anti-Spam' },
        { id: 'antiparolacce', name: '🧼 Filtro Parolacce' },
        { id: 'bestemmiometro', name: '🤬 Bestemmiometro' },
        { id: 'antiporno', name: '🔞 Anti-Porno' },
        { id: 'antigore', name: '🚫 Anti-Gore' },
        { id: 'antiBot', name: '🤖 Anti-Bot' },
        { id: 'antiBot2', name: '🤖 Anti-Subbots' },
        { id: 'antitrava', name: '🧨 Anti-Trava' },
        { id: 'antimedia', name: '🖼️ Anti-Media' },
        { id: 'antioneview', name: '👁️‍🗨️ Anti-ViewOnce' },
        { id: 'antitagall', name: '🏷️ Anti-TagAll' },
        { id: 'antisondaggi', name: '📊 Anti-Sondaggi' },
        { id: 'antivoip', name: '📞 Anti-Voip' },
        { id: 'autotrascrizione', name: '📝 Auto-Trascrizione' },
        { id: 'autotraduzione', name: '🌍 Auto-Traduzione' },
        { id: 'modoadmin', name: '🛡️ Solo Admin' },
        { id: 'rileva', name: '📡 Rileva Eventi' },
        { id: 'ai', name: '🧠 Intelligenza Artif.' },
        { id: 'vocali', name: '🎤 Risposte Vocali' },
        { id: 'reaction', name: '😎 Auto-Reazioni' },
        { id: 'autolevelup', name: '⬆️ Auto-LevelUp' }
    ];

    // Creazione dinamica della lista con i pallini
    let statusList = securityFeatures.map(f => {
        let isAttivo = chat[f.id] ? '🟢' : '🔴'
        let nomeComando = f.id.toLowerCase()
        return `┃ ${isAttivo} ✦ *${f.name}* \n┃ ╰ ⌕ _(usa: ${usedPrefix}attiva ${nomeComando})_`
    }).join('\n┃\n')

    // Estetica Legam OS (Testo ultra-pulito e completo)
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

    // 🔥 CONTESTO CANALE VIP (INFALLIBILE, ANTI-CRASH) 🔥
    let channelContext = {
        mentionedJid: [m.sender],
        isForwarded: true,
        forwardingScore: 999,
        forwardedNewsletterMessageInfo: {
            newsletterJid: '120363233544482011@newsletter', 
            serverMessageId: 100,
            newsletterName: nomeDelBot
        }
    };

    // Invio del messaggio istantaneo quotando chi lo ha richiesto
    await conn.sendMessage(m.chat, {
        text: menuText,
        contextInfo: channelContext
    }, { quoted: m })
}

handler.help = ['menusicurezza']
handler.tags = ['admin']
handler.command = /^(menusicurezza|sicurezza|adminmenu)$/i

handler.admin = true // Solo gli admin possono aprirlo
handler.group = true

export default handler


