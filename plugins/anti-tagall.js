let handler = m => m

async function addWarn(conn, m, target, reason, isBotAdmin) {
  if (!global.db.data.users[target]) global.db.data.users[target] = {}
  const user = global.db.data.users[target]
  if (!user.warns) user.warns = {}
  if (typeof user.warns[m.chat] !== 'number') user.warns[m.chat] = 0

  user.warns[m.chat] += 1
  const warns = user.warns[m.chat]
  const tag = target.split('@')[0]

  if (warns >= 3) {
    user.warns[m.chat] = 0
    await conn.sendMessage(m.chat, {
      text: `*@${tag}* 🚫 Hai raggiunto *3 warn* per tag-all/mass mention.`,
      mentions: [target]
    }).catch(() => {})

    if (isBotAdmin) {
      await conn.groupParticipantsUpdate(m.chat, [target], 'remove').catch(() => {})
    }
    return
  }

  await conn.sendMessage(m.chat, {
    text: `*@${tag}* 🚫 ${reason}\n\n⚠️ Avvertimento *${warns}/3*`,
    mentions: [target]
  }).catch(() => {})
}

handler.before = async function (m, { conn, participants, isAdmin, isOwner, isSam, isBotAdmin }) {
  if (m.isBaileys && m.fromMe) return true
  if (!m.isGroup) return false
  if (!m.message) return true

  const chat = global.db.data.chats[m.chat]
  if (!chat?.antitagall) return true

  const sender = m.sender
  if (!sender) return true

  const botJid = conn.decodeJid(conn.user?.jid || conn.user?.id)
  if (sender === botJid) return true
  if (isAdmin || isOwner || isSam) return true
  const contextMentioned =
    m.msg?.contextInfo?.mentionedJid ||
    m.message?.extendedTextMessage?.contextInfo?.mentionedJid ||
    m.message?.imageMessage?.contextInfo?.mentionedJid ||
    m.message?.videoMessage?.contextInfo?.mentionedJid ||
    m.message?.documentMessage?.contextInfo?.mentionedJid ||
    m.message?.audioMessage?.contextInfo?.mentionedJid ||
    m.message?.stickerMessage?.contextInfo?.mentionedJid ||
    []
  const mentionedRaw = [...(m.mentionedJid || []), ...(contextMentioned || [])]
  const mentioned = ( mentionedRaw).map(j => conn.decodeJid(j))
  if (!mentioned.length) return true
  const uniqueMentioned = [...new Set(mentioned)].filter(j => j && j !== botJid)
  const groupSize = Array.isArray(participants) && participants.length ? participants.length : 0
  if (!groupSize) return true
  const ratio = uniqueMentioned.length / groupSize
  if (ratio <= 0.7) return true
  await conn.sendMessage(m.chat, { delete: m.key }).catch(() => {})
  await addWarn(conn, m, sender, `Hai menzionato troppi membri (${uniqueMentioned.length}/${groupSize}).`, !!isBotAdmin)

  return false
}

export default handler