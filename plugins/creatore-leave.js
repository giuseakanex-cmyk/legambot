let handler = async (m, { conn, text, command }) => {
  const isOwner = [...global.owner.map(([number]) => number), ...global.mods].map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender)
  if (!isOwner) {
    if (!m.isAdmin) {
      await m.reply('⚠️ Questo comando può essere usato solo da admin e owner del gruppo')
      return
    }
  }

  let id = text ? text : m.chat  
  let chat = global.db.data.chats[m.chat]
  
  await conn.reply(id, `𝐦𝐢 𝐬𝐨𝐧𝐨 𝐫𝐨𝐭𝐭𝐨 𝐞𝐫 𝐜𝐚𝐳𝐳𝐨 𝐝𝐢 𝐬𝐭𝐨 𝐠𝐫𝐮𝐩𝐩𝐨, 𝐜𝐢𝐚𝐨👋`) 
  await conn.groupLeave(id)
  
  try {
  } catch (e) {
    console.error('Errore durante l\'uscita:', e)
    await m.reply('Si è verificato un errore durante l\'uscita dal gruppo')
  }
}

// CORREZIONE APPLICATA: rimosso il doppio pipe || che causava il bug
handler.command = /^(esci|out|leavegc|leave|voltati)$/i
handler.group = true
handler.owner = true

export default handler
