let handler = async (m, { conn, text, usedPrefix, command }) => {
    let isOwner = false
    try {
        const sender = m.sender.split('@')[0]
        isOwner = global.owner
            .map(entry => Array.isArray(entry) ? entry[0] : entry)
            .map(v => v.toString())
            .includes(sender)
    } catch (e) {
        console.error('Errore nel controllo owner:', e)
    }

    if (!isOwner) {
        await m.reply('*⚠️ Solo il proprietario può usare questo comando*')
        return
    }

    if (!text) return m.reply(`⚠️ Formato: ${usedPrefix + command} tempo|comando\n\n*Esempio:*\n${usedPrefix + command} 1h|.broadcast Ciao a tutti!\n\n*Unità di tempo:*\n- s (secondi)\n- m (minuti)\n- h (ore)\n- d (giorni)`)

    let [delay, cmd] = text.split('|')
    if (!delay || !cmd) return m.reply('⚠️ Formato non valido. Usa: tempo|comando')
    let timeMs = 0
    const timeMatch = delay.match(/^(\d+)([smhd])$/)
    if (!timeMatch) return m.reply('⚠️ Formato tempo non valido. Usa: numero + s/m/h/d')

    const [_, num, unit] = timeMatch
    switch (unit) {
        case 's': timeMs = parseInt(num) * 1000; break
        case 'm': timeMs = parseInt(num) * 60 * 1000; break
        case 'h': timeMs = parseInt(num) * 60 * 60 * 1000; break
        case 'd': timeMs = parseInt(num) * 24 * 60 * 60 * 1000; break
        default: return m.reply('⚠️ Unità tempo non valida')
    }
    if (timeMs > 7 * 24 * 60 * 60 * 1000) {
        return m.reply('⚠️ Il tempo massimo è 7 giorni')
    }
    const scheduleInfo = {
        chat: m.chat,
        command: cmd.trim(),
        sender: m.sender,
        scheduledTime: Date.now() + timeMs
    }
    setTimeout(async () => {
        try {
            const fakeMsg = {
                ...m,
                text: cmd.trim(),
                body: cmd.trim()
            }
            await conn.commandExecute(fakeMsg)
            
        } catch (e) {
            console.error('Errore esecuzione comando programmato:', e)
            conn.reply(m.chat, '❌ Errore nell\'esecuzione del comando programmato', m)
        }
    }, timeMs)
    let timeStr = ''
    if (timeMs >= 24 * 60 * 60 * 1000) timeStr = Math.floor(timeMs / (24 * 60 * 60 * 1000)) + ' giorni'
    else if (timeMs >= 60 * 60 * 1000) timeStr = Math.floor(timeMs / (60 * 60 * 1000)) + ' ore'
    else if (timeMs >= 60 * 1000) timeStr = Math.floor(timeMs / (60 * 1000)) + ' minuti'
    else timeStr = Math.floor(timeMs / 1000) + ' secondi'

    m.reply(`✅ Comando programmato:\n\n*⏰ Tempo:* ${timeStr}\n*📝 Comando:* ${cmd.trim()}\n\n_Il comando verrà eseguito automaticamente dopo ${timeStr}._`)
}

handler.help = ['programma <tempo|comando>']
handler.tags = ['creatore']
handler.command = /^(programma|schedule)$/i
handler.owner = true // Aggiunto flag owner
handler.owner = true // Manteniamo anche Sam per sicurezza

export default handler