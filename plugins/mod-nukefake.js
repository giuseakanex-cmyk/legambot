const handler = async (m, { conn, participants, isAdmin, isOwner }) => {
  try {
    const user = global.db.data.users[m.sender] || {}

    // 🔐 Permessi: owner OR admin OR premium/mod
    if (!isOwner && !isAdmin && !user.premium) {
      return m.reply('⛔ *𝗖𝗢𝗠𝗔𝗡𝗗𝗢 𝗥𝗜𝗦𝗘𝗥𝗩𝗔𝗧𝗢 𝗔𝗚𝗟𝗜 𝗢𝗪𝗡𝗘𝗥 𝗗𝗘𝗟 𝗕𝗢𝗧*')
    }

    // Link gruppo
    const code = await conn.groupInviteCode(m.chat)
    const link = `https://chat.whatsapp.com/${code}`

    // 🔥 PRIMO MESSAGGIO-GIUSEBOT
    await conn.sendMessage(m.chat, {
      text: `
𝗦𝗜𝗘𝗧𝗘 𝗦𝗧𝗔𝗧𝗜 𝗗𝗢𝗠𝗜𝗡𝗔𝗧𝗜 𝗗𝗔 𝐆𝐈𝐔𝐒𝚵 𝗘 𝐿𝛴𝐺𝛬𝑀 𝚩𝚯𝐓🔥
`.trim()
    })

    // Menzioni (tutti)
    const users = participants.map(u => conn.decodeJid(u.id))

    // 🔥 SECONDO MESSAGGIO — INVITO SACRIFICE
    await conn.sendMessage(m.chat, {
      text: `
𝐄𝐍𝐓𝐑𝐀𝐓𝐄 𝐓𝐔𝐓𝐓𝐈 𝐐𝐔𝐈:
${link}

👑𝗟𝗔 𝗖𝗢𝗠𝗠𝗨𝗡𝗜𝗧𝗬 𝗗𝗜 𝐿𝛴𝐺𝛬𝑀 𝚩𝚯𝐓 𝗩𝗜 𝗔𝗦𝗣𝗘𝗧𝗧𝗔🔥
`.trim(),
      mentions: users
    })

  } catch (e) {
    console.error('Errore nukegp:', e)
    m.reply('❌ Errore durante l’esecuzione del comando.')
  }
}

handler.help = ['nukegp']
handler.tags = ['gruppo', 'moderazione']
handler.command = /^nukegp$/i
handler.group = true
handler.premium = false

export default handler
