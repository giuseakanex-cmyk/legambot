const handler = async (m, { conn, usedPrefix, command, isOwner, isAdmin }) => {

  const user = global.db.data.users[m.sender] || {}

  // 🔐 CONTROLLO PERMESSI (MOD / PREMIUM)
  if (!isOwner && !isAdmin && !user.premium) {
    return m.reply('⛔ *Questo comando è riservato ai MOD / PREMIUM*')
  }

  if (!m.quoted) return

  try {
    let key = {}

    try {
      key.remoteJid = m.quoted?.fakeObj?.key?.remoteJid || m.key.remoteJid
      key.fromMe = m.quoted?.fakeObj?.key?.fromMe || m.key.fromMe
      key.id = m.quoted?.fakeObj?.key?.id || m.key.id
      key.participant = m.quoted?.fakeObj?.participant || m.key.participant
    } catch (e) {
      console.error(e)
    }

    // Elimina messaggio citato
    await conn.sendMessage(m.chat, { delete: key })

    // Elimina messaggio comando
    await conn.sendMessage(m.chat, { delete: m.key })

  } catch (e) {
    console.error('Errore del:', e)

    // Fallback
    if (m.quoted?.vM?.key) {
      await conn.sendMessage(m.chat, { delete: m.quoted.vM.key })
    }
    await conn.sendMessage(m.chat, { delete: m.key })
  }
}

handler.help = ['delete']
handler.tags = ['group']
handler.command = /^delm?$/i
handler.group = false
handler.botAdmin = true
handler.premium = false

export default handler
