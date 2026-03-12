import { format } from 'util'

export async function handler(chatUpdate, conn) {
    if (!chatUpdate.messages) return
    let m = chatUpdate.messages[chatUpdate.messages.length - 1]
    if (!m.message) return

    // Semplifica la lettura del messaggio
    m.text = m.message.conversation || m.message.extendedTextMessage?.text || m.message.imageMessage?.caption || ''
    m.chat = m.key.remoteJid
    m.sender = m.key.participant || m.key.remoteJid
    m.isGroup = m.chat.endsWith('@g.us')
    m.fromMe = m.key.fromMe

    // Crea l'utente nel database se è nuovo
    if (!global.db.data.users[m.sender]) {
        global.db.data.users[m.sender] = { euro: 1000, name: m.pushName || 'Utente' }
    }

    // Controlla se inizia con il prefisso (es. il punto ".")
    const isCommand = global.prefix.test(m.text)
    if (!isCommand) return

    const usedPrefix = m.text.match(global.prefix)[0]
    const command = m.text.replace(global.prefix, '').trim().split(' ')[0].toLowerCase()
    const args = m.text.trim().split(' ').slice(1)

    // Cerca il comando nella cartella plugins
    let plugin = Object.values(global.plugins).find(p => p.command && p.command.includes(command))

    if (plugin) {
        try {
            await plugin.call(conn, m, { conn, args, usedPrefix, command })
        } catch (e) {
            console.error(e)
            conn.sendMessage(m.chat, { text: `❌ Errore nel plugin:\n${format(e)}` })
        }
    }
}
