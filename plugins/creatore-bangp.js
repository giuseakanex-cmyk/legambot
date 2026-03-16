// è un po outdated sto plugin (assieme al unbangp)
let handler = async (m, { conn, args, isOwner }) => {
    try {
        if (!isOwner) {
            let errorMsg = `*❌ ERRORE COMANDO*\n`
            errorMsg += `━━━━━━━━━━━━━━━━\n\n`
            errorMsg += `*⚠️ Motivo:*\n`
            errorMsg += `└─⭓ Comando riservato al proprietario\n\n`
            errorMsg += `> vare ✧ bot`
            return m.reply(errorMsg)
        }
        if (!m.isGroup) {
            let errorMsg = `*❌ ERRORE COMANDO*\n`
            errorMsg += `━━━━━━━━━━━━━━━━\n\n`
            errorMsg += `*⚠️ Motivo:*\n`
            errorMsg += `└─⭓ Utilizzabile solo nei gruppi\n\n`
            errorMsg += `> vare ✧ bot`
            return m.reply(errorMsg)
        }
        if (!global.db.data) {
            global.db.data = {
                users: {},
                chats: {},
                msgs: {},
                settings: {}
            }
        }
        if (!global.db.data.chats[m.chat]) {
            global.db.data.chats[m.chat] = {
                banned: false,
                welcome: false,
                detect: false,
                delete: true,
                antiLink: false,
                viewonce: false,
                antiToxic: false,
                expired: 0
            }
        }

        let chat = global.db.data.chats[m.chat]
        if (chat.banned) {
            let errorMsg = `*❌ ERRORE COMANDO*\n`
            errorMsg += `━━━━━━━━━━━━━━━━\n\n`
            errorMsg += `*⚠️ Motivo:*\n`
            errorMsg += `└─⭓ Questo gruppo è già bannato\n\n`
            errorMsg += `> vare ✧ bot`
            return m.reply(errorMsg)
        }

        chat.banned = true
        let groupInfo = await conn.groupMetadata(m.chat)
        let memberCount = groupInfo.participants.length
        let adminCount = groupInfo.participants.filter(p => p.admin).length

        m.reply(`*🚫 GRUPPO BANNATO*
━━━━━━━━━━━━━━━━

*📝 Stato:* Bannato
*👥 Gruppo:* ${await conn.getName(m.chat)}
*👤 Membri:* ${memberCount}
*👑 Admin:* ${adminCount}
*🔒 Azione:* Ban accesso bot
*📅 Data:* ${new Date().toLocaleString('it-IT')}

*⚠️ Effetti:*
┌─⭓ Bot non risponde ai comandi
├─⭓ Solo owner possono usare il bot
└─⭓ Ban attivo fino a revoca

> vare ✧ bot`)
    } catch (e) {
        console.error(e)
        return m.reply(`*❌ ERRORE*\n` +
                      `━━━━━━━━━━━━━━━━\n\n` +
                      `*⚠️ Si è verificato un errore*\n` +
                      `*📝 Tipo:* ${e.message}\n\n` +
                      `> vare ✧ bot`)
    }
}

handler.help = ['bangp']
handler.tags = ['creatore']
handler.command = /^bangp$/i
handler.owner = true
handler.group = true

export default handler