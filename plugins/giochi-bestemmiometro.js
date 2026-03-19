let handler = async (m, { conn }) => {
    let chat = global.db.data.chats[m.chat] || {}
    let user = global.db.data.users[m.sender] || {}

    // Se l'admin non ha acceso il bestemmiometro nel gruppo, il bot ignora
    if (!chat.bestemmiometro) return

    // Aggiunge 1 al contatore delle bestemmie dell'utente, in silenzio
    user.blasphemy = (user.blasphemy || 0) + 1

    // 🔥 ORA SCATTA SOLO OGNI 10 BESTEMMIE ESATTE 🔥
    if (user.blasphemy % 10 === 0) {
        
        let msg = `
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦
· 🤬 𝐁𝐄𝐒𝐓𝐄𝐌𝐌𝐈𝐎𝐌𝐄𝐓𝐑𝐎 🤬 ·
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦

『 👤 』 𝐏𝐞𝐜𝐜𝐚𝐭𝐨𝐫𝐞: @${m.sender.split('@')[0]}
『 📊 』 𝐂𝐨𝐧𝐭𝐨 𝐓𝐨𝐭𝐚𝐥𝐞: *${user.blasphemy}* bestemmie!

⚠️ _Datti una calmata o ti scaglio un fulmine dal Legam OS._
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦`.trim()

        // 🔥 CONTESTO CANALE VIP (INFALLIBILE E ANTI-CRASH) 🔥
        let channelContext = {
            mentionedJid: [m.sender],
            isForwarded: true,
            forwardingScore: 999,
            forwardedNewsletterMessageInfo: {
                newsletterJid: '120363233544482011@newsletter',
                serverMessageId: 100,
                newsletterName: global.db.data.nomedelbot || `𝐿𝛴𝐺𝛬𝑀 𝛩𝑆 𝚩𝚯𝐓`
            }
        };

        // Invia il messaggio punitivo
        await conn.sendMessage(m.chat, { text: msg, contextInfo: channelContext }, { quoted: m })
    }
}

// 🔥 INTERCETTATORE ATTIVO: Dà priorità assoluta a queste parole 🔥
handler.customPrefix = /(porco dio|porcodio|dio bastardo|dio cane|porcamadonna|madonnaporca|porca madonna|madonna porca|dio cristo|diocristo|dio maiale|diomaiale|jesucristo|jesu cristo|cristo madonna|madonna impanata|dio cristo|cristo dio|dio frocio|dio gay|dio madonna|dio infuocato|dio crocifissato|madonna puttana|madonna vacca|madonna inculata|maremma maiala|padre pio|jesu impanato|jesu porco|diocane|dio capra|capra dio|padre pio ti spio)/i
handler.command = new RegExp
handler.group = true

export default handler


