function formatNumber(num) {
    return new Intl.NumberFormat('it-IT').format(num)
}

let handler = async (m, { conn, args, usedPrefix, command }) => {
    let user = global.db.data.users[m.sender]
    let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : null

    // Inizializza i dati di default per il mittente se mancano
    if (!user.bounty) user.bounty = 0
    if (!user.nascosto) user.nascosto = 0 
    if (!user.euro) user.euro = 0

    let nomeDelBot = global.db.data.nomedelbot || `𝐿𝛴𝐺𝛬𝑀 𝛩𝑆 𝚩𝚯𝐓`;

    // 🔥 CONTESTO CANALE VIP (INFALLIBILE, ANTI-CRASH) 🔥
    let channelContext = {
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
            newsletterJid: '120363233544482011@newsletter', 
            serverMessageId: 100,
            newsletterName: nomeDelBot
        }
    };

    // ==========================================
    // COMANDO 1: .taglia @utente [importo]
    // ==========================================
    if (command === 'bounty' || command === 'taglia' || command === 'caccia') {
        if (!who) return m.reply(`『 ⚠️ 』 \`Devi taggare a chi vuoi mettere la taglia!\`\n_Es: ${usedPrefix}taglia @utente 5000_`)
        if (who === m.sender) return m.reply(`『 🛑 』 \`Non puoi metterti una taglia da solo, furbo!\``)

        // Trova il numero nell'array degli argomenti (ignorando il tag)
        let importoStr = args.find(a => !a.includes('@'))
        let importo = parseInt(importoStr)

        if (!importo || isNaN(importo) || importo <= 0) return m.reply(`『 💰 』 \`Inserisci l'importo della taglia!\``)
        if (user.euro < importo) return m.reply(`『 💸 』 \`Fondi insufficienti! Hai solo ${formatNumber(user.euro)} €.\``)

        // Inizializza il target in modo sicuro
        let target = global.db.data.users[who]
        if (!target) {
            global.db.data.users[who] = { exp: 0, euro: 10, muto: false, bounty: 0, nascosto: 0 }
            target = global.db.data.users[who]
        }
        if (!target.bounty) target.bounty = 0
        if (!target.nascosto) target.nascosto = 0

        // Esegue la transazione
        user.euro -= importo
        target.bounty += importo 

        let msg = `
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦
· ☠️ 𝐖 𝐀 𝐍 𝐓 𝐄 𝐃 ☠️ ·
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦

『 🎯 』 𝐁 𝐞 𝐫 𝐬 𝐚 𝐠 𝐥 𝐢 𝐨
· @${who.split('@')[0]}

『 💰 』 𝐓 𝐚 𝐠 𝐥 𝐢 𝐚
· *${formatNumber(target.bounty)} €*

│ 🔫 Usa: *${usedPrefix}spara @utente*
│ 𝐂𝐨𝐬𝐭𝐨 𝐏𝐫𝐨𝐢𝐞𝐭𝐭𝐢𝐥𝐞: 50 €
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦`.trim()

        channelContext.mentionedJid = [who];
        return await conn.sendMessage(m.chat, { text: msg, contextInfo: channelContext })
    }

    // ==========================================
    // COMANDO 2: .spara @utente
    // ==========================================
    if (command === 'spara') {
        if (!who) return m.reply(`『 🔫 』 \`A chi vuoi sparare? Tagga il bersaglio!\``)
        let target = global.db.data.users[who]
        
        if (!target || !target.bounty || target.bounty === 0) return m.reply(`『 🤷‍♂️ 』 \`Nessuna taglia su questa persona. Non sprecare colpi!\``)
        if (user.euro < 50) return m.reply(`『 💸 』 \`Un proiettile costa 50 €. Non te lo puoi permettere!\``)

        user.euro -= 50 

        // Calcola le probabilità
        let staNascosto = target.nascosto > Date.now()
        let probabilita = staNascosto ? 0.05 : 0.25 
        let hit = Math.random() < probabilita

        channelContext.mentionedJid = [m.sender, who];

        if (hit) {
            let vincita = target.bounty
            user.euro += vincita
            target.bounty = 0 
            target.nascosto = 0 

            let msgHit = `
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦
· 💥 𝐇 𝐄 𝐀 𝐃 𝐒 𝐇 𝐎 𝐓 💥 ·
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦

@${m.sender.split('@')[0]} 𝐡𝐚 𝐟𝐚𝐭𝐭𝐨 𝐟𝐮𝐨𝐫𝐢 @${who.split('@')[0]}!

💰 𝐈𝐧𝐜𝐚𝐬𝐬𝐨: *+${formatNumber(vincita)} €*
🏦 𝐁𝐚𝐧𝐜𝐚 𝐀𝐭𝐭𝐮𝐚𝐥𝐞: *${formatNumber(user.euro)} €*
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦`.trim()
            
            return await conn.sendMessage(m.chat, { text: msgHit, contextInfo: channelContext })
        } else {
            let msgMiss = `💨 *𝐌 𝐀 𝐍 𝐂 𝐀 𝐓 𝐎 !*\n\n@${m.sender.split('@')[0]} ha sparato a @${who.split('@')[0]} ma ha lisciato clamorosamente!\n\n💸 _Hai sprecato 50 € per il proiettile._`
            return await conn.sendMessage(m.chat, { text: msgMiss, contextInfo: channelContext })
        }
    }

    // ==========================================
    // COMANDO 3: .nasconditi
    // ==========================================
    if (command === 'nasconditi') {
        if (!user.bounty || user.bounty === 0) return m.reply(`『 😅 』 \`Nessuno ti sta cercando, perché ti nascondi?\``)
        if (user.euro < 200) return m.reply(`『 💸 』 \`Pagare le guardie costa 200 €! Torna quando avrai i soldi.\``)
        
        if (user.nascosto > Date.now()) {
            let restanti = Math.ceil((user.nascosto - Date.now()) / 60000)
            return m.reply(`『 🥷 』 \`Sei già nascosto! Sei al sicuro per altri ${restanti} minuti.\``)
        }

        user.euro -= 200
        user.nascosto = Date.now() + (10 * 60000) 

        let msgHide = `
🥷 *𝐌 𝐎 𝐃 𝐀 𝐋 𝐈 𝐓 𝐀'  𝐅 𝐔 𝐑 𝐓 𝐈 𝐕 𝐀*

Hai pagato *200 €* a un trafficante.
Per i prossimi *10 minuti* le probabilità che un cecchino ti colpisca crollano al *5%*!`.trim()

        channelContext.mentionedJid = [m.sender];
        return await conn.sendMessage(m.chat, { text: msgHide, contextInfo: channelContext })
    }
}

handler.help = ['taglia', 'spara', 'nasconditi']
handler.tags = ['giochi']
handler.command = ['bounty', 'taglia', 'caccia', 'spara', 'nasconditi']
handler.group = true
export default handler


