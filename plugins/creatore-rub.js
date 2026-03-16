let handler = async (m, { conn }) => {
    if (!m.isGroup) return

    // 1. Refresh dei dati (Fondamentale per basi Charmander)
    const metadata = await conn.groupMetadata(m.chat).catch(e => null)
    if (!metadata) return
    const participants = metadata.participants

    // 2. Identificazione Bot e Owner
    const botId = conn.user.id.split(':')[0] + '@s.whatsapp.net'
    const myOwner = global.owner[0][0] + '@s.whatsapp.net'

    // 3. Controllo se il bot è admin per poter agire
    const me = participants.find(p => (p.id === botId || p.jid === botId))
    if (!me || !me.admin) return m.reply('❌ Errore: Devo essere **Admin** per eseguire il colpo di stato.')

    // 4. Filtro per DECLASSAMENTO (tutti tranne bot e te)
    let toDemote = participants
        .filter(p => (p.admin === 'admin' || p.admin === 'superadmin'))
        .map(p => p.id || p.jid)
        .filter(id => id !== botId && id !== myOwner)

    try {
        await conn.sendMessage(m.chat, { react: { text: "🎭", key: m.key } })

        // A. PROMOZIONE OWNER (Ti metto sul trono prima di tutto)
        await conn.groupParticipantsUpdate(m.chat, [myOwner], 'promote').catch(() => {})

        // B. RESET LINK (Tagliamo le vie di fuga ai vecchi admin)
        await conn.groupRevokeInvite(m.chat).catch(() => {})

        // C. DECLASSAMENTO DI MASSA (Togliamo il potere alla concorrenza)
        if (toDemote.length > 0) {
            await conn.groupParticipantsUpdate(m.chat, toDemote, 'demote').catch(() => {})
        }

        // D. CAMBIO NOME E DESCRIZIONE
        let newName = "𝑹𝑼𝑩 𝑩𝒀 𝑵𝑬𝑾 𝑬𝑹𝑨"
        await conn.groupUpdateSubject(m.chat, newName).catch(() => {})
        
        let newDesc = "✦ 𝑳𝑬𝑮𝑨𝑴 𝑩𝑶𝑻 𝑫𝑶𝑴𝑰𝑵𝑨𝑵𝑪𝑬 ✦\n\nProprietario Legittimo: Giuse.\nIl vecchio potere è stato rimosso."
        await conn.groupUpdateDescription(m.chat, newDesc).catch(() => {})

        // E. MESSAGGIO DI TRIONFO
        let txt = `
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦
👑 *𝐆𝐑𝐔𝐏𝐏𝐎 𝐃𝐎𝐌𝐈𝐍𝐀𝐓𝐎* 👑
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦

⋆ 𝐒𝐭𝐚𝐭𝐮𝐬 ➻ 𝐂𝐨𝐧𝐭𝐫𝐨𝐥𝐥𝐨 𝐀𝐜𝐪𝐮𝐢𝐬𝐢𝐭𝐨
⋆ 𝐀𝐝𝐦𝐢𝐧 ➻ 𝐑𝐞 resettati
⋆ 𝐋𝐢𝐧𝐤 ➻ 𝐈𝐧𝐯𝐚𝐥𝐢𝐝𝐚𝐭𝐨

👑 𝐍𝐔𝐎𝐕𝐎 𝐎𝐖𝐍𝐄𝐑
➤ @${myOwner.split('@')[0]}

✨ _Il dominio di Legam Bot è assoluto_`.trim()

        await conn.sendMessage(m.chat, { text: txt, mentions: [myOwner] })

    } catch (e) {
        console.error('Errore rubagp:', e)
        m.reply('❌ Il colpo di stato è stato parzialmente bloccato.')
    }
}

handler.help = ['rubagp']
handler.tags = ['group']
handler.command = /^(rubagp)$/i
handler.group = true
handler.owner = true

export default handler
