export async function before(m, { conn, isAdmin, isBotAdmin, isOwner, isSam }) {
  if (!m.isGroup) return false

  const chat = global.db.data.chats[m.chat]
  if (!chat?.antisondaggi) return false
  if (m.fromMe || isAdmin || isOwner || isSam) return false
  const isPollCreation =
    !!m.message?.pollCreationMessage ||
    !!m.message?.pollCreationMessageV3 ||
    !!m.message?.pollCreationMessageV3Extension

  if (!isPollCreation) return false

  if (isBotAdmin) {
    await conn
      .sendMessage(m.chat, {
        delete: {
          remoteJid: m.chat,
          fromMe: false,
          id: m.key.id,
          participant: m.key.participant,
        },
      })
      .catch(() => {})
  }

  await conn
    .sendMessage(m.chat, {
      text: isBotAdmin
        ? `> 『 🚫 』 Sondaggi non consentiti in questo gruppo.`
        : `> 『 🚫 』 Sondaggi non consentiti in questo gruppo (non sono admin, non posso eliminarlo).`,
      mentions: [m.sender],
      quoted: m
    })
    .catch(() => {})

  return true
}

export { before as handler }