let handler = async (m, { conn, participants }) => {
  try {

    if (!m.isGroup) return m.reply("❌ Solo nei gruppi.")
    
    const users = participants.map(u => conn.decodeJid(u.id))
    const senderTag = `@${m.sender.split("@")[0]}`
    const testo = m.text.replace(/^\S+\s?/, '').trim()

    if (!testo) {
      return m.reply("❌ Scrivi qualcosa dopo il comando.\nEsempio: .troiatag ciao")
    }

    const messaggio = `
🚨✧𝐓𝐑𝐎𝐈𝐀 𝐀𝐋𝐄𝐑𝐓✧🚨

𝗟𝗮 𝘁𝗿𝗼𝗶𝗮 𝘀𝘂𝗽𝗲𝗿 𝗽𝘂𝘁𝘁𝗮𝗻𝗮:${senderTag},𝗵𝗮 𝘀𝗺𝗲𝘀𝘀𝗼 𝗱𝗶 𝗽𝗿𝗲𝗻𝗱𝗲𝗿𝗹𝗼 𝗶𝗻 𝗰𝘂𝗹𝗼 𝘀𝗼𝗹𝗼 𝗽𝗲𝗿 𝗱𝗶𝗿𝗲:

⤷ ${testo}
`.trim()

    await conn.sendMessage(m.chat, {
      text: messaggio,
      mentions: users
    }, { quoted: m })

  } catch (e) {
    console.error("Errore troiatag:", e)
    m.reply("❌ Errore durante l'esecuzione del comando.")
  }
}

handler.help = ['troiatag <testo>']
handler.tags = ['gruppo']
handler.command = /^(troiatag)$/i
handler.group = true
handler.admin = true

export default handler
