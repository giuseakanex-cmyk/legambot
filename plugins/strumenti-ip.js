import fetch from 'node-fetch'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) {
        return conn.reply(m.chat, `『 🔍 』 \`Inserisci un indirizzo IP.\`\n> Esempio: ${usedPrefix + command} 8.8.8.8`, m, global.rcanal)
    }

    // Reazione di attesa
    await conn.sendMessage(m.chat, { react: { text: '🌐', key: m.key } });

    const wait = await conn.reply(m.chat, `『 📡 』 *Interrogazione database in corso...*`, m)

    try {
        const response = await fetch(`http://ip-api.com/json/${text}?fields=status,message,country,countryCode,region,regionName,city,district,zip,lat,lon,timezone,isp,org,as,mobile,hosting,query`)
        const data = await response.json()

        if (data.status !== 'success') {
            throw new Error(data.message || 'IP non valido o non trovato')
        }

        const result = `
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦
·  𝐋 𝐄 𝐆 𝐀 𝐌  𝐈 𝐏  𝐒 𝐂 𝐀 𝐍  ·
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦

『 🔍 』 𝐈 𝐍 𝐅 𝐎  𝐑 𝐄 𝐓 𝐄
· 𝐈𝐏 ➻ ${data.query}
· 𝐏𝐚𝐞𝐬𝐞 ➻ ${data.country} (${data.countryCode})
· 𝐑𝐞𝐠𝐢𝐨𝐧𝐞 ➻ ${data.regionName}
· 𝐂𝐢𝐭𝐭𝐚̀ ➻ ${data.city}
· 𝐃𝐢𝐬𝐭𝐫𝐞𝐭𝐭𝐨 ➻ ${data.district || '?'}
· 𝐂𝐀𝐏 ➻ ${data.zip || '?'}

『 ⚙️ 』 𝐒 𝐏 𝐄 𝐂 𝐈 𝐅 𝐈 𝐂 𝐇 𝐄
· 𝐈𝐒𝐏 ➻ ${data.isp}
· 𝐎𝐫𝐠 ➻ ${data.org || '?'}
· 𝐅𝐮𝐬𝐨 ➻ ${data.timezone}
· 𝐌𝐨𝐛𝐢𝐥𝐞 ➻ ${data.mobile ? '『 ✅ 』' : '『 ❌ 』'}
· 𝐇𝐨𝐬𝐭𝐢𝐧𝐠 ➻ ${data.hosting ? '『 ✅ 』' : '『 ❌ 』'}

👑 𝐎𝐖𝐍𝐄𝐑
➤ 𝐆𝐈𝐔𝐒𝚵

✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦`.trim()

        // Modifica il messaggio di attesa con il risultato finale
        await conn.sendMessage(m.chat, {
            edit: wait.key,
            text: result,
            contextInfo: {
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363233544482011@newsletter',
                    newsletterName: "✨.✦★彡 𝐋𝐞𝐠𝐚𝐦 𝐎𝐒 𝐈𝐏 𝐈𝐧𝐟𝐨 Ξ★✦.•",
                    serverMessageId: 100
                }
            }
        })

        // Spunta di successo
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    } catch (error) {
        console.error(error)
        await conn.sendMessage(m.chat, {
            edit: wait.key,
            text: `『 ❌ 』 \`Errore:\` IP non valido o server irraggiungibile.`
        })
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
    }
}

handler.help = ['ip <indirizzo>']
handler.tags = ['strumenti']
handler.command = /^(ip|ipinfo)$/i
handler.register = true // Richiede registrazione dell'utente

export default handler

