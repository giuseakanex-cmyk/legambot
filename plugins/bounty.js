function formatNumber(num) {
    return new Intl.NumberFormat('it-IT').format(num)
}

let handler = async (m, { conn, args, usedPrefix, command }) => {
    let user = global.db.data.users[m.sender]
    let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : null

    // Inizializza i dati se non esistono
    if (!user.bounty) user.bounty = 0
    if (!user.nascosto) user.nascosto = 0 // Timestamp per nascondersi

    // ==========================================
    // COMANDO 1: .bounty @utente [importo]
    // ==========================================
    if (command === 'bounty' || command === 'caccia') {
        if (!who) return m.reply(`🎯 Devi taggare a chi vuoi mettere la taglia!\n_Es: ${usedPrefix}bounty @utente 5000_`)
        if (!args[1]) return m.reply(`💰 Inserisci l'importo della taglia!`)
        if (who === m.sender) return m.reply(`Non puoi metterti una taglia da solo, scemo!`)

        let importo = parseInt(args[1])
        if (isNaN(importo) || importo <= 0) return m.reply(`Inserisci un numero valido!`)
        if (user.euro < importo) return m.reply(`💸 Non hai abbastanza fondi! Hai solo *${formatNumber(user.euro)} €*.`)

        let target = global.db.data.users[who]
        if (!target) target = global.db.data.users[who] = { euro: 0, bounty: 0 }
        if (!target.bounty) target.bounty = 0

        user.euro -= importo
        target.bounty += importo // Si somma alle taglie precedenti!

        let msg = `
╭━━✧🏴‍☠️ WANTED 🏴‍☠️✧━━╮
🩸 È STATA MESSA UNA TAGLIA!
👤 Bersaglio: @${who.split('@')[0]}
💰 Ricompensa: *${formatNumber(target.bounty)} €*

🔫 Usa *${usedPrefix}spara @utente* per incassarla!
(Attenzione: un proiettile costa 50 €)
╰━━━━━━✧✦━━━━━━━╯`.trim()

        return conn.sendMessage(m.chat, { text: msg, mentions: [who] })
    }

    // ==========================================
    // COMANDO 2: .spara @utente
    // ==========================================
    if (command === 'spara') {
        if (!who) return m.reply(`🔫 A chi vuoi sparare? Tagga il bersaglio!`)
        let target = global.db.data.users[who]
        
        if (!target || !target.bounty || target.bounty === 0) return m.reply(`🤷‍♂️ Non c'è nessuna taglia su questa persona. Non sprecare proiettili!`)
        if (user.euro < 50) return m.reply(`💸 Un proiettile costa 50 €. Non te lo puoi permettere, pezzente!`)

        user.euro -= 50 // Toglie i soldi del proiettile

        // Calcola le probabilità
        let staNascosto = target.nascosto > Date.now()
        let probabilità = staNascosto ? 0.05 : 0.25 // 5% se nascosto, 25% normale
        let hit = Math.random() < probabilità

        if (hit) {
            let vincita = target.bounty
            user.euro += vincita
            target.bounty = 0 // Taglia azzerata
            target.nascosto = 0 

            let msg = `
💥 *BOOM! COLPO ALLA TESTA!* 💥
@${m.sender.split('@')[0]} ha ucciso @${who.split('@')[0]}!

💰 Ha incassato la taglia di *${formatNumber(vincita)} €*!
Banca attuale: *${formatNumber(user.euro)} €*`.trim()
            return conn.sendMessage(m.chat, { text: msg, mentions: [m.sender, who] })
        } else {
            return conn.sendMessage(m.chat, { text: `💨 *MANCATO!* \n@${m.sender.split('@')[0]} ha sparato a @${who.split('@')[0]} ma ha lisciato clamorosamente!\n\n💸 Hai sprecato 50 € per il proiettile. Riprova!`, mentions: [m.sender, who] })
        }
    }

    // ==========================================
    // COMANDO 3: .nasconditi
    // ==========================================
    if (command === 'nasconditi') {
        if (user.bounty === 0) return m.reply(`Nessuno ti sta cercando, perché ti nascondi?`)
        if (user.euro < 200) return m.reply(`Mazzettare le guardie per nasconderti costa 200 €! Torna quando avrai i soldi.`)
        
        if (user.nascosto > Date.now()) {
            let restanti = Math.ceil((user.nascosto - Date.now()) / 60000)
            return m.reply(`Sei già nascosto! Sei al sicuro per altri ${restanti} minuti.`)
        }

        user.euro -= 200
        user.nascosto = Date.now() + (10 * 60000) // Nascosto per 10 minuti

        return m.reply(`🥷 Hai pagato 200 € a un trafficante. \nPer i prossimi 10 minuti le probabilità che ti colpiscano scendono dal 25% al 5%!`)
    }
}

handler.command = ['bounty', 'caccia', 'spara', 'nasconditi']
handler.group = true
export default handler
