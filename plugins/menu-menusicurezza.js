let handler = async (m, { conn, usedPrefix }) => {
    // Recupera i dati del gruppo in tempo reale
    let chat = global.db.data.chats[m.chat] || {}
    let nomeDelBot = global.db.data.nomedelbot || `𝐿𝛴𝐺𝛬𝑀 𝛩𝑆 𝚩𝚯𝐓`

    // Se non è un gruppo, avvisa
    if (!m.isGroup) return m.reply(`『 ⚠️ 』 \`Questo menu funziona solo nei gruppi!\``)

    // 🔥 CATEGORIZZAZIONE FUNZIONI (Design Legam OS Compatto) 🔥
    const categories = {
        '🚨 𝐒𝐈𝐂𝐔𝐑𝐄𝐙𝐙𝐀 𝐄 𝐅𝐈𝐋𝐓𝐑𝐈': [
            { id: 'antiLink', name: 'Anti-Link WA' },
            { id: 'antiLinkUni', name: 'Anti-Link Uni' },
            { id: 'antiLink2', name: 'Anti-Social' },
            { id: 'antispam', name: 'Anti-Spam' },
            { id: 'antiBot', name: 'Anti-Bot' },
            { id: 'antiBot2', name: 'Anti-Subbots' },
            { id: 'antitrava', name: 'Anti-Trava' },
            { id: 'antimedia', name: 'Anti-Media' },
            { id: 'antioneview', name: 'Anti-ViewOnce' },
            { id: 'antitagall', name: 'Anti-TagAll' },
            { id: 'antisondaggi', name: 'Anti-Sondaggi' },
            { id: 'antivoip', name: 'Anti-Voip' },
            { id: 'antiporno', name: 'Anti-Porno' },
            { id: 'antigore', name: 'Anti-Gore' }
        ],
        '🗣️ 𝐌𝐎𝐃𝐄𝐑𝐀𝐙𝐈𝐎𝐍𝐄 & 𝐈𝐀': [
            { id: 'antiparolacce', name: 'Filtro Parolacce' },
            { id: 'bestemmiometro', name: 'Bestemmiometro' },
            { id: 'autotrascrizione', name: 'Trascrizione' },
            { id: 'autotraduzione', name: 'Traduzione' },
            { id: 'ai', name: 'Intelligenza Art.' },
            { id: 'vocali', name: 'Risposte Vocali' }
        ],
        '⚙️ 𝐒𝐈𝐒𝐓𝐄𝐌𝐀 𝐆𝐑𝐔𝐏𝐏𝐎': [
            { id: 'welcome', name: 'Benvenuto' },
            { id: 'goodbye', name: 'Addio' },
            { id: 'modoadmin', name: 'Solo Admin' },
            { id: 'rileva', name: 'Rileva Eventi' },
            { id: 'reaction', name: 'Auto-Reazioni' },
            { id: 'autolevelup', name: 'Auto-LevelUp' }
        ]
    };

    // Creazione del corpo del menu Categorizzato
    let menuContent = '';
    for (const [catName, features] of Object.entries(categories)) {
        menuContent += `╭── ${catName} ──⬣\n`;
        features.forEach(f => {
            let isAttivo = chat[f.id] ? '🟢' : '🔴';
            let cmd = f.id.toLowerCase();
            // Stampa su una sola riga: 🟢 ✦ Nome ➭ `comando`
            menuContent += `│ ${isAttivo} ✦ ${f.name} ➭ \`${cmd}\`\n`;
        });
        menuContent += `╰───────────────⬣\n\n`;
    }

    // Estetica Legam OS Finale
    let menuText = `
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦
· 🛡️ 𝐌𝐄𝐍𝐔 𝐒𝐈𝐂𝐔𝐑𝐄𝐙𝐙𝐀 🛡️ ·
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦

╭﹕ℹ️ *𝐂𝐎𝐌𝐄 𝐒𝐈 𝐔𝐒𝐀:*
│ 🟢 ${usedPrefix}attiva [comando]
│ 🔴 ${usedPrefix}disattiva [comando]
╰﹕₊˚ ★ ⁺˳ꕤ₊⁺・꒱

${menuContent}╰♡꒷ ๑ ⋆˚₊⋆───ʚ˚ɞ───⋆˚₊⋆ ๑ ⪩
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


