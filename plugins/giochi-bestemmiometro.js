let handler = m => m

handler.before = async function (m, { conn }) {
    if (!m.isGroup) return
    
    let chat = global.db.data.chats[m.chat] || {}
    let user = global.db.data.users[m.sender] || {}

    // Se l'admin non ha acceso il bestemmiometro, il bot ignora
    if (!chat.bestemmiometro) return

    // Il dizionario dei peccati
    const regex = /(porco dio|porcodio|dio bastardo|dio cane|porcamadonna|madonnaporca|porca madonna|madonna porca|dio cristo|diocristo|dio maiale|diomaiale|jesucristo|jesu cristo|cristo madonna|madonna impanata|dio cristo|cristo dio|dio frocio|dio gay|dio madonna|dio infuocato|dio crocifissato|madonna puttana|madonna vacca|madonna inculata|maremma maiala|padre pio|jesu impanato|jesu porco|diocane|dio capra|capra dio|padre pio ti spio)/i

    if (regex.test(m.text)) {
        user.blasphemy = (user.blasphemy || 0) + 1

        // Scatta la notifica ogni 10 bestemmie esatte
        if (user.blasphemy % 10 === 0) {
            
            let msg = `
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦
· 🤬 𝐁𝐄𝐒𝐓𝐄𝐌𝐌𝐈𝐎𝐌𝐄𝐓𝐑𝐎 🤬 ·
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦

『 👤 』 𝐏𝐞𝐜𝐜𝐚𝐭𝐨𝐫𝐞: @${m.sender.split('@')[0]}
『 📊 』 𝐂𝐨𝐧𝐭𝐨 𝐓𝐨𝐭𝐚𝐥𝐞: *${user.blasphemy}* bestemmie!

⚠️ _Datti una calmata o ti scaglio un fulmine dal Legam OS._
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦`.trim()

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
                        address: global.db.data.nomedelbot || `𝐿𝛴𝐺𝛬𝑀 𝛩𝑆 𝚩𝚯𝐓`, 
                    }
                }
            };

            try {
                await conn.sendMessage(m.chat, { text: msg, mentions: [m.sender] }, { quoted: fakeVerifiedQuote })
            } catch (e) {
                await conn.sendMessage(m.chat, { text: msg, mentions: [m.sender] }, { quoted: m })
            }
        }
    }
}

export default handler

