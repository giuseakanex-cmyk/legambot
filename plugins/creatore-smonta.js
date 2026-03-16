const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

var handler = async (m, { conn, participants }) => {
  try {
    const owners = new Set(
      (global.owner || [])
        .flatMap(v => {
          if (typeof v === 'string') return [v]
          if (Array.isArray(v)) return v.filter(x => typeof x === 'string')
          return []
        })
        .map(v => v.replace(/[^0-9]/g, ''))
    )

    const decodeJid = jid => conn.decodeJid(jid)
    const jidPhone = jid => (decodeJid(jid) || '').split('@')[0].replace(/[^0-9]/g, '')
    const botJid = decodeJid(conn.user?.jid || conn.user?.id)
    const botPhone = jidPhone(botJid)

    const groupUpdate = (conn.originalGroupParticipantsUpdate || conn.groupParticipantsUpdate).bind(conn)
    const chunk = (arr, size) => {
      const out = []
      for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size))
      return out
    }

    let metadata = null
    try {
      metadata = await conn.groupMetadata(m.chat)
    } catch {}
    const groupParticipants = metadata?.participants?.length ? metadata.participants : (participants || [])
    const groupOwnerPhones = new Set([
      jidPhone(metadata?.owner),
      ...groupParticipants
        .filter(p => p.admin === 'superadmin')
        .map(p => jidPhone(p.jid || p.id)),
    ].filter(Boolean))

    const protectedPhones = new Set([
      ...owners,
      botPhone,
      jidPhone(m.sender),
      ...groupOwnerPhones,
    ].filter(Boolean))
    if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {}
    const chat = global.db.data.chats[m.chat]
    chat.detect = false
    const toDemote = groupParticipants
      .filter(p => p.admin && !protectedPhones.has(jidPhone(p.jid || p.id)))
      .map(p => decodeJid(p.jid || p.id))
      .filter(Boolean)

    if (toDemote.length === 0) {
      return m.reply('✅ Nessun admin da smontare.')
    }
    for (const part of chunk(toDemote, 15)) {
      await groupUpdate(m.chat, part, 'demote').catch(e => console.error('[smonta] errore retrocessione:', e))
      await delay(800)
    }

    m.reply(`✅ Smontati ${toDemote.length} adminz.`)
    
  } catch (e) {
    console.error(e)
    m.reply('❌ Errore durante lo smontaggio degli admin.')
  }
}

handler.command = /^smonta$/i
handler.group = true
handler.owner = true
handler.botAdmin = true
export default handler