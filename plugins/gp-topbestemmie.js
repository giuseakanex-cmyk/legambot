let handler = async (m, { conn }) => {
    // Controllo gruppo
    if (!m.isGroup) return m.reply(`『 ⚠️ 』 \`Questo comando funziona solo nei gruppi!\``)
    
    // Recupera la lista dei partecipanti in modo sicuro
    let groupMetadata = await conn.groupMetadata(m.chat).catch(_ => null)
    if (!groupMetadata) return m.reply(`『 ❌ 』 \`Errore nel recuperare i dati del gruppo.\``)
    
    // Filtra, ordina e prende i primi 10
    let groupUsers = groupMetadata.participants
        .map(p => ({ id: p.id, bestemmie: global.db.data.users[p.id]?.blasphemy || 0 }))
        .filter(u => u.bestemmie > 0)
        .sort((a, b) => b.bestemmie - a.bestemmie)
        .slice(0, 10)
    
    let text = ''
    
    // Se nessuno ha mai bestemmiato
    if (groupUsers.length === 0) {
        text = `
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦
· 😇 𝐆𝐑𝐔𝐏𝐏𝐎 𝐏𝐔𝐋𝐈𝐓𝐎 😇 ·
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦

Non ci sono peccatori in questo gruppo. 
Il Legam OS è fiero di voi!
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦`.trim()
    } else {
        // Se ci sono peccatori, crea la classifica con le medaglie
        let list = groupUsers.map((user, i) => {
            let medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '▪️'
            return `│ ${medal} ${i + 1}. @${user.id.split('@')[0]} ➭ *${user.bestemmie}*`
        }).join('\n')

        text = `
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦
· 🔥 𝐓𝐎𝐏 𝟏𝟎 𝐏𝐄𝐂𝐂𝐀𝐓𝐎𝐑𝐈 🔥 ·
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦

╭── 🏆 𝐂𝐋𝐀𝐒𝐒𝐈𝐅𝐈𝐂𝐀 ──⬣
${list}
╰───────────────⬣

⚠️ _Che il Legam OS abbia pietà di voi._
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦`.trim()
    }

    // 🔥 CONTESTO CANALE VIP (INFALLIBILE E ANTI-CRASH) 🔥
    let channelContext = {
        mentionedJid: groupUsers.map(u => u.id), // Tagga i peccatori
        isForwarded: true,
        forwardingScore: 999,
        forwardedNewsletterMessageInfo: {
            newsletterJid: '120363233544482011@newsletter',
            serverMessageId: 100,
            newsletterName: global.db.data.nomedelbot || `𝐿𝛴𝐺𝛬𝑀 𝛩𝑆 𝚩𝚯𝐓`
        }
    };

    // Invia la classifica in modo sicuro
    await conn.sendMessage(m.chat, { text, contextInfo: channelContext }, { quoted: m })
}

handler.help = ['topbestemmie', 'bestemmietop']
handler.tags = ['gruppo']
handler.command = ['topbestemmie', 'bestemmietop', 'peccatori']
handler.group = true

export default handler

