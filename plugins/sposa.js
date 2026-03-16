// Database temporaneo per le proposte
global.proposteMatrimonio = global.proposteMatrimonio || {}

function formatNumber(num) {
    return new Intl.NumberFormat('it-IT').format(num)
}

let handler = async (m, { conn, args, usedPrefix, command }) => {
    let user = global.db.data.users[m.sender]
    let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : null

    // Inizializza le variabili se non esistono
    if (!user.partner) user.partner = ''

    // ==========================================
    // COMANDO 1: .sposa @utente
    // ==========================================
    if (command === 'sposa') {
        if (!who) return m.reply(`💍 Tagga la persona che vuoi sposare!\n_Es: ${usedPrefix}sposa @utente_`)
        if (who === m.sender) return m.reply(`😅 Non puoi sposarti da solo, abbi un po' di dignità!`)
        
        let target = global.db.data.users[who]
        if (!target) return m.reply(`⚠️ L'utente non è registrato nel database.`)
        
        if (user.partner) return m.reply(`⛔ Sei già sposato/a! Usa prima *${usedPrefix}divorzia* se hai il coraggio.`)
        if (target.partner) return m.reply(`💔 Questa persona è già sposata! Giù le mani dai matrimoni altrui.`)

        global.proposteMatrimonio[who] = m.sender

        let msg = `
╭━━✧💍 PROPOSTA 💍✧━━╮
👤 @${m.sender.split('@')[0]} si è inginocchiato/a!
Vuole sposare @${who.split('@')[0]}!

Hai 60 secondi per rispondere.
👉 Scrivi *${usedPrefix}si* oppure *${usedPrefix}no*
╰━━━━━━✧✦━━━━━━━━╯`.trim()

        await conn.sendMessage(m.chat, { text: msg, mentions: [m.sender, who] })
        
        setTimeout(() => {
            if (global.proposteMatrimonio[who] === m.sender) {
                delete global.proposteMatrimonio[who]
            }
        }, 60000)
        return
    }

    // ==========================================
    // COMANDO 2: .si / .no
    // ==========================================
    if (command === 'si' || command === 'sì') {
        let spasimante = global.proposteMatrimonio[m.sender]
        if (!spasimante) return m.reply(`Nessuno ti ha fatto una proposta di recente... 🥲`)
        
        user.partner = spasimante
        global.db.data.users[spasimante].partner = m.sender
        delete global.proposteMatrimonio[m.sender]

        return conn.sendMessage(m.chat, { text: `🎉 *VIVA GLI SPOSI!* 🎉\n@${m.sender.split('@')[0]} e @${spasimante.split('@')[0]} ora sono ufficialmente sposati!\n\n_Che il lag non vi separi mai._`, mentions: [m.sender, spasimante] })
    }

    if (command === 'no' || command === 'rifiuta') {
        let spasimante = global.proposteMatrimonio[m.sender]
        if (!spasimante) return m.reply(`Nessuno ti ha fatto una proposta.`)
        
        delete global.proposteMatrimonio[m.sender]
        return conn.sendMessage(m.chat, { text: `🧊 *FRIENDZONE FATALE* 🧊\n@${m.sender.split('@')[0]} ha detto seccamente NO alla proposta di @${spasimante.split('@')[0]}!\nChe mazzata...`, mentions: [m.sender, spasimante] })
    }

    // ==========================================
    // COMANDO 3: .divorzia
    // ==========================================
    if (command === 'divorzia') {
        if (!user.partner) return m.reply(`Non sei nemmeno sposato/a!`)
        
        let exPartner = user.partner
        let exData = global.db.data.users[exPartner]
        
        // Calcola gli alimenti (30% del patrimonio di chi chiede il divorzio)
        let mantenimento = Math.floor(user.euro * 0.3)
        user.euro -= mantenimento
        if (exData) exData.euro += mantenimento

        user.partner = ''
        if (exData) exData.partner = ''

        let msg = `
╭━━✧📜 ATTO DI DIVORZIO 📜✧━━╮
💔 @${m.sender.split('@')[0]} ha chiesto il divorzio!

⚖️ *Sentenza del Giudice:*
Chi chiede il divorzio paga! 
@${m.sender.split('@')[0]} versa il 30% del suo patrimonio (*${formatNumber(mantenimento)} €*) come mantenimento a @${exPartner.split('@')[0]}.
╰━━━━━━✧✦━━━━━━━━━━━━╯`.trim()

        return conn.sendMessage(m.chat, { text: msg, mentions: [m.sender, exPartner] })
    }
}

handler.command = ['sposa', 'si', 'sì', 'no', 'rifiuta', 'divorzia']
handler.group = true
export default handler
