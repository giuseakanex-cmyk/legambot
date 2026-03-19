let mutedUsers = new Map();
let spamWarnings = new Map();

function formatTimeLeft(timestamp) {
    if (!timestamp) return '∞ Permanente'
    const diff = timestamp - Date.now()
    if (diff <= 0) return '✅ Scaduto'
    const minutes = Math.ceil(diff / 60000)
    if (minutes === 0) return '< 1 min'
    return `${minutes} min`
}

function normalizeId(id) {
    if (!id) return '';
    let normalizedId = id.replace('@s.whatsapp.net', '').replace('@lid', '').split('@')[0]
    if (normalizedId.startsWith('39')) {
        normalizedId = normalizedId.substring(2)
    }
    return normalizedId
}

global.gpMutaSmuta = global.gpMutaSmuta || {}
global.gpMutaSmuta.mutedUsers = mutedUsers
global.gpMutaSmuta.normalizeId = normalizeId

function getUserName(userId, participants) {
    const normalizedUserId = normalizeId(userId)
    let participant = participants.find(p => normalizeId(p.id) === normalizedUserId)
    if (!participant) participant = participants.find(p => p.jid && normalizeId(p.jid) === normalizedUserId)
    if (!participant) {
        const alternativeId = normalizedUserId.startsWith('39') ? normalizedUserId.substring(2) : '39' + normalizedUserId
        participant = participants.find(p => normalizeId(p.id) === alternativeId)
        if (!participant) participant = participants.find(p => p.jid && normalizeId(p.jid) === alternativeId)
    }
    return participant?.notify || participant?.name || normalizedUserId
}

// 🔥 Helper per creare l'estetica VIP infallibile
const legamContext = (title, mentions = []) => ({
    mentionedJid: mentions,
    isForwarded: true,
    forwardingScore: 999,
    forwardedNewsletterMessageInfo: {
        newsletterJid: '120363233544482011@newsletter',
        serverMessageId: 100,
        newsletterName: `🛡️ ${title}`
    }
});

let handler = async (m, { conn, command, args, participants, usedPrefix }) => {
    const isMute = command === 'muta'
    const isUnmute = command === 'smuta'
    const isList = command === 'listamutati'

    // ==========================================
    // COMANDO: LISTAMUTATI
    // ==========================================
    if (isList) {
        if (!mutedUsers.size) {
            let msg = `✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦\n· 📭 𝐋𝐈𝐒𝐓𝐀 𝐌𝐔𝐓𝐀𝐓𝐈 📭 ·\n✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦\n\n『 🛡️ 』 _Nessun utente è attualmente mutato._\n\n✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦`;
            return conn.sendMessage(m.chat, { text: msg, contextInfo: legamContext('Lista Pulita') }, { quoted: m });
        }
        
        let text = `✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦\n· 📭 𝐋𝐈𝐒𝐓𝐀 𝐌𝐔𝐓𝐀𝐓𝐈 📭 ·\n✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦\n\n`
        let mentions = []
        for (let [normalized, data] of mutedUsers.entries()) {
            let timeLeft = formatTimeLeft(data.timestamp)
            let userJid = data.displayNumber.startsWith('39') && data.displayNumber.length === 12 ? data.displayNumber + '@s.whatsapp.net' : data.displayNumber + '@lid'
            let currentName = getUserName(userJid, participants) || data.displayNumber
            
            text += `│ 🔇 @${currentName}\n`
            text += `│ ⏱️ 𝐒𝐜𝐚𝐝𝐞𝐧𝐳𝐚: ${timeLeft}\n`
            text += `│ 📝 𝐌𝐨𝐭𝐢𝐯𝐨: _${data.reason}_\n`
            text += `╰───────────────⬣\n`
            mentions.push(userJid)
        }
        text += `\n✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦`
        return conn.sendMessage(m.chat, { text, contextInfo: legamContext('Registro Punizioni', mentions) }, { quoted: m });
    }

    // Identificazione del bersaglio
    let users = []
    if (m.mentionedJid?.length) {
        users = m.mentionedJid
        args = args.filter(arg => !arg.startsWith('@'))
    } else if (m.quoted) {
        users = [m.quoted.sender]
    }

    if (!users.length) {
        let msg = `✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦\n· ⚠️ 𝐄𝐑𝐑𝐎𝐑𝐄 ⚠️ ·\n✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦\n\n『 ❌ 』 𝐅𝐨𝐫𝐦𝐚𝐭𝐨: *${usedPrefix}${command} @user [minuti] [motivo]*\n『 💡 』 𝐎𝐩𝐩𝐮𝐫𝐞: _Rispondi a un suo messaggio_\n\n✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦`;
        return conn.sendMessage(m.chat, { text: msg, contextInfo: legamContext('Errore Sintassi') }, { quoted: m });
    }

    const validUsers = []
    const userParticipantMap = new Map()
    for (const user of users) {
        const decodedId = conn.decodeJid(user)
        const normalizedUserId = normalizeId(decodedId)
        let isValid = false
        let matchedParticipant = participants.find(p => normalizeId(p.id) === normalizedUserId)
        
        if (!matchedParticipant) matchedParticipant = participants.find(p => p.jid && normalizeId(p.jid) === normalizedUserId)
        if (!matchedParticipant) {
            const alternativeId = normalizedUserId.startsWith('39') ? normalizedUserId.substring(2) : '39' + normalizedUserId
            matchedParticipant = participants.find(p => normalizeId(p.id) === alternativeId)
            if (!matchedParticipant) matchedParticipant = participants.find(p => p.jid && normalizeId(p.jid) === alternativeId)
        }
        if (!isValid && m.quoted && decodedId === conn.decodeJid(m.quoted.sender)) {
            isValid = true
            matchedParticipant = participants.find(p => p.jid && conn.decodeJid(p.jid) === decodedId)
        }
        if (matchedParticipant || isValid) {
            validUsers.push(decodedId)
            userParticipantMap.set(decodedId, matchedParticipant)
        }
    }
    users = validUsers

    if (!users.length) return m.reply(`『 ❌ 』 \`Utente non valido o non presente nel gruppo.\``);
    
    // Calcolo Tempo e Motivo
    let time = 0
    let reason = 'Violazione delle regole del gruppo'

    if (args.length) {
        let timeArg = args[0].toLowerCase()
        let timeMatch = timeArg.match(/^(\d+)(s|sec|m|min)?$/)

        if (timeMatch) {
            let value = parseInt(timeMatch[1])
            let unit = timeMatch[2] || 'm'
            time = unit.startsWith('s') ? value * 1000 : value * 60000
            reason = args.slice(1).join(' ') || reason
        } else {
            reason = args.join(' ')
        }
    }

    let results = []

    for (let i = 0; i < users.length; i++) {
        const user = users[i]
        const jid = conn.decodeJid(user)
        const matched = userParticipantMap.get(user)
        const preferredJid = matched && matched.jid ? conn.decodeJid(matched.jid) : jid
        const normalized = normalizeId(preferredJid)
        const displayNumber = preferredJid.split('@')[0]
        let isOwner = global.owner.map(([n]) => n + '@s.whatsapp.net').includes(jid)
        
        if (isOwner && isMute) {
            const normalizedPunish = normalizeId(conn.decodeJid(m.sender))
            mutedUsers.set(normalizedPunish, {
                timestamp: Date.now() + (2 * 60000),
                reason: 'Hai osato provare a mutare il Creatore.',
                lastNotification: 0,
                displayNumber: conn.decodeJid(m.sender).split('@')[0]
            })
            let punMsg = `✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦\n· ⚡ 𝐏𝐔𝐍𝐈𝐙𝐈𝐎𝐍𝐄 ⚡ ·\n✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦\n\n『 👑 』 𝐄𝐫𝐫𝐨𝐫𝐞: _Non puoi mutare un Owner._\n『 🔇 』 𝐂𝐨𝐧𝐬𝐞𝐠𝐮𝐞𝐧𝐳𝐚: *Sei mutato tu per 2 minuti!*\n\n✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦`;
            return conn.sendMessage(m.chat, { text: punMsg, contextInfo: legamContext('Punizione Divina', [m.sender]) }, { quoted: m });
        }

        if (isOwner && isUnmute) return m.reply(`『 💡 』 \`Un Owner non può mai essere mutato.\``);
        if (jid === conn.user.jid) return m.reply(`『 🤖 』 \`Non posso mutare me stesso!\``);

        if (isMute) {
            mutedUsers.set(normalized, { timestamp: time ? Date.now() + time : 0, reason, lastNotification: 0, displayNumber });
            results.push(`@${displayNumber}`);
        } else if (isUnmute) {
            let found = mutedUsers.delete(normalized);
            if (found) results.push(`@${displayNumber}`);
            else if (users.length === 1) return m.reply(`『 💡 』 \`L'utente @${displayNumber} non era mutato.\``, null, { mentions: [preferredJid] });
        }
    }

    // ==========================================
    // MESSAGGIO DI SUCCESSO MUTA/SMUTA
    // ==========================================
    let titleMute = isMute ? '🔇 𝐒𝐈𝐒𝐓𝐄𝐌𝐀 𝐌𝐔𝐓𝐄 🔇' : '🔊 𝐒𝐈𝐒𝐓𝐄𝐌𝐀 𝐒𝐌𝐔𝐓𝐄 🔊';
    let msg = `
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦
· ${titleMute} ·
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦

『 👤 』 𝐔𝐭𝐞𝐧𝐭𝐞: ${results.join(', ')}
『 ⚡ 』 𝐀𝐳𝐢𝐨𝐧𝐞: *${isMute ? 'Mutato' : 'Smutato'}*
${isMute ? `『 ⏱️ 』 𝐃𝐮𝐫𝐚𝐭𝐚: *${time ? time / 60000 + ' minuti' : '∞ Permanente'}*\n` : ''}『 📝 』 𝐌𝐨𝐭𝐢𝐯𝐨: _${reason}_

👑 _Azione eseguita dall'Amministrazione._
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦`.trim();

    await conn.sendMessage(m.chat, {
        text: msg,
        contextInfo: legamContext(`Legam OS Security`, users)
    }, { quoted: m });
}

// ==========================================
// INTERCETTATORE ATTIVO (CANCELLA MESSAGGI E KICKA)
// ==========================================
handler.before = async (m, { conn, isCommand }) => {
    if (!m.sender || m.sender === conn.user.jid) return

    const senderJid = conn.decodeJid(m.sender)
    let normalizedSender = normalizeId(senderJid)

    if (senderJid.endsWith('@lid')) {
        const gm = await conn.groupMetadata(m.chat).catch(()=>null)
        if(gm){
            const participant = gm.participants.find(p => conn.decodeJid(p.id) === senderJid)
            if (participant && participant.jid) normalizedSender = normalizeId(conn.decodeJid(participant.jid))
        }
    }
    
    const isMuted = mutedUsers.has(normalizedSender)
    if (!isMuted) return
    if (isCommand && m.isAdmin) return true

    const data = mutedUsers.get(normalizedSender)
    
    // Auto-Smute se il tempo è scaduto
    if (data.timestamp && Date.now() > data.timestamp) {
        mutedUsers.delete(normalizedSender)
        let unMsg = `✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦\n· 🔓 𝐌𝐔𝐓𝐄 𝐒𝐂𝐀𝐃𝐔𝐓𝐎 🔓 ·\n✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦\n\n『 ✅ 』 𝐔𝐭𝐞𝐧𝐭𝐞: @${m.sender.split('@')[0]}\n『 🔊 』 𝐒𝐭𝐚𝐭𝐨: _Smutato automaticamente. Ora puoi parlare._\n\n✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦`;
        await conn.sendMessage(m.chat, { text: unMsg, contextInfo: legamContext('Mute Scaduto', [m.sender]) })
        return
    }

    // Cancella il messaggio del mutato
    await new Promise(resolve => setTimeout(resolve, 500))
    try { await conn.sendMessage(m.chat, { delete: m.key }) } catch (e) {}

    const now = Date.now()
    const userWarnings = spamWarnings.get(m.sender) || { count: 0, lastMessage: 0, warned: false }
    
    if (now - userWarnings.lastMessage < 2000) userWarnings.count++
    else userWarnings.count = 1
    
    userWarnings.lastMessage = now
    spamWarnings.set(m.sender, userWarnings)
    
    // Avviso dopo 3 messaggi
    if (userWarnings.count >= 3 && !userWarnings.warned) {
        let warnMsg = `✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦\n· ⚠️ 𝐀𝐕𝐕𝐄𝐑𝐓𝐈𝐌𝐄𝐍𝐓𝐎 ⚠️ ·\n✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦\n\n『 👤 』 𝐔𝐭𝐞𝐧𝐭𝐞: @${m.sender.split('@')[0]}\n『 🚫 』 𝐕𝐢𝐨𝐥𝐚𝐳𝐢𝐨𝐧𝐞: _Stai spammando mentre sei mutato._\n『 📊 』 𝐌𝐞𝐬𝐬𝐚𝐠𝐠𝐢: *${userWarnings.count}/7*\n\nAl settimo messaggio verrai *Cacciato* dal gruppo.\n✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦`;
        await conn.sendMessage(m.chat, { text: warnMsg, contextInfo: legamContext('Rischio Ban', [m.sender]) })
        userWarnings.warned = true
        spamWarnings.set(m.sender, userWarnings)
    }
    
    // KICK DOPO 7 MESSAGGI
    if (userWarnings.count >= 7) {
        try {
            let kickMsg = `✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦\n· 🔨 𝐔𝐓𝐄𝐍𝐓𝐄 𝐑𝐈𝐌𝐎𝐒𝐒𝐎 🔨 ·\n✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦\n\n『 👤 』 𝐔𝐭𝐞𝐧𝐭𝐞: @${m.sender.split('@')[0]}\n『 ⚡ 』 𝐌𝐨𝐭𝐢𝐯𝐨: _Spam eccessivo mentre era mutato._\n\nIl Legam OS non perdona.\n✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦`;
            await conn.sendMessage(m.chat, { text: kickMsg, contextInfo: legamContext('KICK AUTOMATICO', [m.sender]) })
            await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')
            spamWarnings.delete(m.sender)
            mutedUsers.delete(normalizedSender)
        } catch (e) {
            // Se il bot non è admin per cacciarlo, prolunga il mute
            const currentData = mutedUsers.get(normalizedSender)
            mutedUsers.set(normalizedSender, { ...currentData, timestamp: Date.now() + (60 * 60000), reason: currentData.reason + ' + Spam eccessivo' })
        }
    }

    // Promemoria periodico che sei mutato (max 1 volta ogni 5 min)
    const shouldNotify = !data.lastNotification || (now - data.lastNotification) > 300000 
    if (shouldNotify) {
        let remaining = formatTimeLeft(data.timestamp)
        let nMsg = `✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦\n· 🤫 𝐒𝐈𝐋𝐄𝐍𝐙𝐈𝐎 🤫 ·\n✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦\n\n『 🚫 』 @${m.sender.split('@')[0]} ti ricordo che sei *MUTATO*.\n『 ⏱️ 』 𝐓𝐞𝐦𝐩𝐨 𝐫𝐢𝐦𝐚𝐬𝐭𝐨: ${remaining}\n\nI tuoi messaggi verranno eliminati istantaneamente.\n✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦`;
        try {
            await conn.sendMessage(m.chat, { text: nMsg, contextInfo: legamContext('Stato Mute', [m.sender]) })
            data.lastNotification = now
            mutedUsers.set(normalizedSender, data)
        } catch (e) {}
    }

    return false // Ferma l'esecuzione di altri comandi per questo utente
}

// Pulizia memoria periodica
setInterval(() => {
    const now = Date.now()
    for (let [user, data] of mutedUsers.entries()) {
        if (data.timestamp && now > data.timestamp) mutedUsers.delete(user)
    }
    for (let [user, warnings] of spamWarnings.entries()) {
        if (now - warnings.lastMessage > 300000) spamWarnings.delete(user)
    }
}, 60000)

handler.help = ['muta', 'smuta', 'listamutati']
handler.tags = ['gruppo']
handler.command = /^(muta|smuta|listamutati)$/i
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler

