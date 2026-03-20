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

async function getUserProfilePic(conn, userId) {
    try {
        const pp = await conn.profilePictureUrl(userId, 'image')
        return pp
    } catch {
        return 'https://i.ibb.co/BKHtdBNp/default-avatar-profile-icon-1280x1280.jpg'
    }
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
    if (!participant) {
        participant = participants.find(p => p.jid && normalizeId(p.jid) === normalizedUserId)
    }
    if (!participant) {
        const alternativeId = normalizedUserId.startsWith('39') ?
            normalizedUserId.substring(2) :
            '39' + normalizedUserId
        participant = participants.find(p => normalizeId(p.id) === alternativeId)
        if (!participant) {
            participant = participants.find(p => p.jid && normalizeId(p.jid) === alternativeId)
        }
    }
    return participant?.notify || participant?.name || normalizedUserId
}

let handler = async (m, { conn, command, args, participants }) => {
    const isMute = command === 'muta'
    const isUnmute = command === 'smuta'
    const isList = command === 'listamutati'

    if (isList) {
        if (!mutedUsers.size) {
            return m.reply(`✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦\n· 📭 𝐋𝐈𝐒𝐓𝐀 𝐌𝐔𝐓𝐀𝐓𝐈 📭 ·\n✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦\n\n『 🛡️ 』 _Nessun utente è attualmente mutato._\n\n✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦`)
        }
        
        let text = `✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦\n· 📭 𝐋𝐈𝐒𝐓𝐀 𝐌𝐔𝐓𝐀𝐓𝐈 📭 ·\n✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦\n\n`
        let mentions = []
        for (let [normalized, data] of mutedUsers.entries()) {
            let timeLeft = formatTimeLeft(data.timestamp)
            let userJid = data.displayNumber.startsWith('39') && data.displayNumber.length === 12 ?
                data.displayNumber + '@s.whatsapp.net' :
                data.displayNumber + '@lid'
            let currentName = getUserName(userJid, participants) || data.displayNumber
            
            text += `│ 🔇 @${currentName}\n`
            text += `│ ⏱️ 𝐒𝐜𝐚𝐝𝐞𝐧𝐳𝐚: ${timeLeft}\n`
            text += `│ 📝 𝐌𝐨𝐭𝐢𝐯𝐨: _${data.reason}_\n`
            text += `╰───────────────⬣\n`
            mentions.push(userJid)
        }
        text += `\n✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦`
        return conn.sendMessage(m.chat, { 
            text, 
            mentions,
            contextInfo: { ...global.fake.contextInfo }
        })
    }

    let users = []

    if (m.mentionedJid?.length) {
        users = m.mentionedJid
        args = args.filter(arg => !arg.startsWith('@'))
    } else if (m.quoted) {
        users = [m.quoted.sender]
    }

    if (!users.length) {
        return m.reply(`✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦\n· ⚠️ 𝐄𝐑𝐑𝐎𝐑𝐄 ⚠️ ·\n✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦\n\n『 ❌ 』 𝐅𝐨𝐫𝐦𝐚𝐭𝐨: *${command} @user [minuti] [motivo]*\n『 💡 』 𝐎𝐩𝐩𝐮𝐫𝐞: _rispondi a un messaggio_\n\n✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦`)
    }

    const validUsers = []
    const userParticipantMap = new Map()
    for (const user of users) {
        const decodedId = conn.decodeJid(user)
        const normalizedUserId = normalizeId(decodedId)
        let isValid = false
        let matchedParticipant = null
        matchedParticipant = participants.find(p => normalizeId(p.id) === normalizedUserId)
        if (matchedParticipant) {
            isValid = true
        } else {
            matchedParticipant = participants.find(p => p.jid && normalizeId(p.jid) === normalizedUserId)
            if (matchedParticipant) {
                isValid = true
            } else {
                const alternativeId = normalizedUserId.startsWith('39') ?
                    normalizedUserId.substring(2) :
                    '39' + normalizedUserId

                matchedParticipant = participants.find(p => normalizeId(p.id) === alternativeId)
                if (matchedParticipant) {
                    isValid = true
                } else {
                    matchedParticipant = participants.find(p => p.jid && normalizeId(p.jid) === alternativeId)
                    if (matchedParticipant) {
                        isValid = true
                    }
                }
            }
        }

        if (!isValid && m.quoted && decodedId === conn.decodeJid(m.quoted.sender)) {
            isValid = true
            matchedParticipant = participants.find(p => p.jid && conn.decodeJid(p.jid) === decodedId)
        }

        if (isValid) {
            validUsers.push(decodedId)
            userParticipantMap.set(decodedId, matchedParticipant)
        }
    }
    users = validUsers

    if (!users.length) {
        return m.reply(`✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦\n· ⚠️ 𝐄𝐑𝐑𝐎𝐑𝐄 ⚠️ ·\n✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦\n\n『 ❌ 』 𝐒𝐭𝐚𝐭𝐨: _Utente non valido o non nel gruppo_\n\n✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦`)
    }
    
    let time = 0
    let reason = 'motivo non specificato ma meritato'

    if (args.length) {
        let timeArg = args[0].toLowerCase()
        let timeMatch = timeArg.match(/^(\d+)(s|sec|m|min)?$/)

        if (timeMatch) {
            let value = parseInt(timeMatch[1])
            let unit = timeMatch[2] || 'm'

            if (unit.startsWith('s')) {
                time = value * 1000
            } else {
                time = value * 60000
            }
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
                reason: 'Hai provato a mutare un owner 👀',
                lastNotification: 0,
                displayNumber: conn.decodeJid(m.sender).split('@')[0]
            })
            return m.reply(`✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦\n· ⚡ 𝐏𝐔𝐍𝐈𝐙𝐈𝐎𝐍𝐄 ⚡ ·\n✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦\n\n『 👑 』 𝐄𝐫𝐫𝐨𝐫𝐞: _Non puoi mutare un Owner_\n『 🔇 』 𝐂𝐨𝐧𝐬𝐞𝐠𝐮𝐞𝐧𝐳𝐚: *Sei mutato per 2 minuti!*\n\n✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦`)
        }

        if (isOwner && isUnmute) {
            return m.reply(`✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦\n· ⚠️ 𝐄𝐑𝐑𝐎𝐑𝐄 ⚠️ ·\n✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦\n\n『 ❌ 』 𝐒𝐭𝐚𝐭𝐨: _Un Owner non può essere mutato_\n\n✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦`)
        }

        if (jid === conn.user.jid) {
            return m.reply(`✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦\n· ⚠️ 𝐄𝐑𝐑𝐎𝐑𝐄 ⚠️ ·\n✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦\n\n『 🤖 』 𝐀𝐳𝐢𝐨𝐧𝐞: _Non puoi ${command}re il bot_\n\n✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦`)
        }

        if (isMute) {
            const muteData = {
                timestamp: time ? Date.now() + time : 0,
                reason,
                lastNotification: 0,
                displayNumber
            };
            
            mutedUsers.set(normalized, muteData);
            results.push(`@${displayNumber}`);
            
        } else if (isUnmute) {
            const normalizedTargetId = normalizeId(preferredJid);
            let found = mutedUsers.delete(normalizedTargetId);
            
            if (found) {
                results.push(`@${displayNumber}`);
            } else if (users.length === 1) {
                return m.reply(`✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦\n· 💡 𝐈𝐍𝐅𝐎 💡 ·\n✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦\n\n『 💡 』 𝐒𝐭𝐚𝐭𝐨: _@${displayNumber} non è mutato_\n\n✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦`);
            }
        }
    }

    const targetUser = users[0]
    const userName = getUserName(targetUser, participants)
    const userPp = await getUserProfilePic(conn, targetUser)

    let msg = `✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦\n· 🛡️ ${isMute ? '𝐒𝐈𝐒𝐓𝐄𝐌𝐀 𝐌𝐔𝐓𝐄' : '𝐒𝐈𝐒𝐓𝐄𝐌𝐀 𝐒𝐌𝐔𝐓𝐄'} 🛡️ ·\n✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦\n\n`
    msg += `『 👤 』 𝐔𝐭𝐞𝐧𝐭𝐢: *${results.join(', ')}*\n`
    msg += `『 ⚡ 』 𝐀𝐳𝐢𝐨𝐧𝐞: *${isMute ? 'Mutato' : 'Smutato'}*\n`
    if (isMute) {
        msg += time ? `『 ⏱️ 』 𝐃𝐮𝐫𝐚𝐭𝐚: *${time / 60000} minuti*\n` : `『 ⏱️ 』 𝐃𝐮𝐫𝐚𝐭𝐚: *∞ Permanente*\n`
    }
    msg += `『 📝 』 𝐌𝐨𝐭𝐢𝐯𝐨: _${reason}_\n\n👑 _Azione eseguita dall'Amministrazione._\n`
    msg += `✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦`

    await conn.sendMessage(m.chat, {
        text: msg,
        mentions: users,
        contextInfo: {
            ...global.fake.contextInfo,
            externalAdReply: {
                ...global.fake.contextInfo,
                title: `${userName} - ${isMute ? 'Mutato' : 'Smutato'}`,
                body: `${targetUser.split('@')[0]} - ${isMute ? (time ? `mutato per ${time / 60000} min` : 'mutato permanentemente') : 'smutato'}`,
                thumbnailUrl: userPp,
                mediaType: 1,
                renderLargerThumbnail: false
            }
        }
    })
}

handler.before = async (m, { conn, isCommand }) => {
    if (!m.sender || m.sender === conn.user.jid) return

    const senderJid = conn.decodeJid(m.sender)

    let normalizedSender = normalizeId(senderJid)

    if (senderJid.endsWith('@lid')) {
        const gm = await conn.groupMetadata(m.chat)
        const participant = gm.participants.find(p => conn.decodeJid(p.id) === senderJid)
        if (participant && participant.jid) {
            normalizedSender = normalizeId(conn.decodeJid(participant.jid))
        }
    }
    
    const isMuted = mutedUsers.has(normalizedSender)
    
    if (!isMuted) return
    
    if (isCommand && m.isAdmin) return true

    const data = mutedUsers.get(normalizedSender)
    
    if (data.timestamp && Date.now() > data.timestamp) {
        mutedUsers.delete(normalizedSender)
        const userName = getUserName(m.sender, await conn.groupMetadata(m.chat).then(gm => gm.participants))
        const userPp = await getUserProfilePic(conn, m.sender)
        
        await conn.sendMessage(m.chat, {
            text: `✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦\n· 🔓 𝐌𝐔𝐓𝐄 𝐒𝐂𝐀𝐃𝐔𝐓𝐎 🔓 ·\n✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦\n\n『 ✅ 』 𝐔𝐭𝐞𝐧𝐭𝐞: *@${m.sender.split('@')[0]}*\n『 🔊 』 𝐒𝐭𝐚𝐭𝐨: _Smutato automaticamente_\n\n✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦`,
            mentions: [m.sender],
            contextInfo: {
                ...global.fake.contextInfo,
                externalAdReply: {
                    title: userName,
                    body: 'Mute scaduto - Utente libero',
                    thumbnailUrl: userPp,
                    mediaType: 1,
                    renderLargerThumbnail: false
                }
            }
        })
        return
    }

    await new Promise(resolve => setTimeout(resolve, 1000))

    try {
        await conn.sendMessage(m.chat, { delete: m.key })
    } catch (e) {
        console.error('Errore cancellazione messaggio mutato:', e)
    }

    const now = Date.now()
    const userWarnings = spamWarnings.get(m.sender) || { count: 0, lastMessage: 0, warned: false }
    
    if (now - userWarnings.lastMessage < 2000) {
        userWarnings.count++
    } else {
        userWarnings.count = 1
    }
    
    userWarnings.lastMessage = now
    spamWarnings.set(m.sender, userWarnings)
    
    if (userWarnings.count >= 3 && !userWarnings.warned) {
        const userName = getUserName(m.sender, await conn.groupMetadata(m.chat).then(gm => gm.participants))
        const userPp = await getUserProfilePic(conn, m.sender)
        
        await conn.sendMessage(m.chat, {
            text: `✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦\n· ⚠️ 𝐀𝐕𝐕𝐄𝐑𝐓𝐈𝐌𝐄𝐍𝐓𝐎 ⚠️ ·\n✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦\n\n『 👤 』 𝐔𝐭𝐞𝐧𝐭𝐞: *@${m.sender.split('@')[0]}*\n『 🚫 』 𝐏𝐫𝐨𝐛𝐥𝐞𝐦𝐚: _Spam mentre mutato_\n『 ⚡ 』 𝐑𝐢𝐬𝐜𝐡𝐢𝐨: _Rimozione dal gruppo_\n『 📊 』 𝐌𝐞𝐬𝐬𝐚𝐠𝐠𝐢: *${userWarnings.count}/7*\n\n✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦`,
            mentions: [m.sender],
            contextInfo: {
                ...global.fake.contextInfo,
                externalAdReply: {
                    title: userName,
                    body: `Avvertimento spam - ${userWarnings.count}/7 messaggi`,
                    thumbnailUrl: userPp,
                    mediaType: 1,
                    renderLargerThumbnail: false
                }
            }
        })
        
        userWarnings.warned = true
        spamWarnings.set(m.sender, userWarnings)
    }
    
    if (userWarnings.count >= 7) {
        const userName = getUserName(m.sender, await conn.groupMetadata(m.chat).then(gm => gm.participants))
        const userPp = await getUserProfilePic(conn, m.sender)
        
        try {
            await conn.sendMessage(m.chat, {
                text: `✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦\n· 🔨 𝐔𝐓𝐄𝐍𝐓𝐄 𝐑𝐈𝐌𝐎𝐒𝐒𝐎 🔨 ·\n✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦\n\n『 👤 』 𝐔𝐭𝐞𝐧𝐭𝐞: *@${m.sender.split('@')[0]}*\n『 ⚡ 』 𝐌𝐨𝐭𝐢𝐯𝐨: _Spam eccessivo mentre mutato_\n『 📊 』 𝐌𝐞𝐬𝐬𝐚𝐠𝐠𝐢: *${userWarnings.count} in poco tempo*\n\n✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦`,
                mentions: [m.sender],
                contextInfo: {
                    ...global.fake.contextInfo,
                    externalAdReply: {
                        title: userName,
                        body: 'Rimosso per spam eccessivo',
                        thumbnailUrl: userPp,
                        mediaType: 1,
                        renderLargerThumbnail: false
                    }
                }
            })
            
            await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')
            spamWarnings.delete(m.sender)
            mutedUsers.delete(normalizedSender)
        } catch (e) {
            console.error('Errore rimozione utente:', e)
            const currentData = mutedUsers.get(normalizedSender)
            mutedUsers.set(normalizedSender, {
                ...currentData,
                timestamp: Date.now() + (60 * 60000),
                reason: currentData.reason + ' + spam eccessivo'
            })
        }
    }

    const shouldNotify = !data.lastNotification || (now - data.lastNotification) > 300000 
    
    if (shouldNotify) {
        const userName = getUserName(m.sender, await conn.groupMetadata(m.chat).then(gm => gm.participants))
        const userPp = await getUserProfilePic(conn, m.sender)
        let remaining = formatTimeLeft(data.timestamp)
        
        try {
            await conn.sendMessage(m.chat, {
                text: `✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦\n· 🤫 𝐒𝐈𝐋𝐄𝐍𝐙𝐈𝐎 🤫 ·\n✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦\n\n『 🚫 』 𝐔𝐭𝐞𝐧𝐭𝐞: *@${m.sender.split('@')[0]}*\n『 🔇 』 𝐒𝐭𝐚𝐭𝐨: _Non puoi parlare o usare comandi_\n『 📝 』 𝐌𝐨𝐭𝐢𝐯𝐨: _${data.reason}_\n『 ⏱️ 』 𝐓𝐞𝐦𝐩𝐨 𝐫𝐢𝐦𝐚𝐬𝐭𝐨: *${remaining}*\n\n✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦`,
                mentions: [m.sender],
                contextInfo: {
                    ...global.fake.contextInfo,
                    externalAdReply: {
                        title: userName,
                        body: `Utente mutato - ${remaining}`,
                        thumbnailUrl: userPp,
                        mediaType: 1,
                        renderLargerThumbnail: false
                    }
                }
            })
            data.lastNotification = now
            mutedUsers.set(normalizedSender, data)
        } catch (e) {
            console.error('Errore invio notifica mute:', e)
        }
    }

    return false
}

setInterval(() => {
    const now = Date.now()
    for (let [user, data] of mutedUsers.entries()) {
        if (data.timestamp && now > data.timestamp) {
            mutedUsers.delete(user)
        }
    }
    
    for (let [user, warnings] of spamWarnings.entries()) {
        if (now - warnings.lastMessage > 300000) {
            spamWarnings.delete(user)
        }
    }
}, 60000)

handler.help = ['muta', 'smuta', 'listamutati']
handler.tags = ['gruppo']
handler.command = /^(muta|smuta|listamutati)$/i
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler


