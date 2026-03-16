import fetch from 'node-fetch';

let handler = async (m, { conn, text, command, usedPrefix, participants, isOwner }) => {
    const isWarn = /^(warn|avverti|avvertimento)$/i.test(command)
    const isUnwarn = /^(unwarn|delwarn|togliwarn|togliavvertimento)$/i.test(command)
    const isList = /^(listawarn|warnlist|listavv|avvertimenti)$/i.test(command)
    if (isList) {
        const chatID = m.chat
        const users = global.db.data.users
        let warnedUsers = Object.entries(users).filter(([jid, user]) => 
            user.warns && user.warns[chatID] > 0
        )

        if (warnedUsers.length === 0) {
            return m.reply(`ㅤ⋆｡˚『 ╭ \`LISTA WARN\` ╯ 』˚｡⋆\n╭\n│ 『 ✅ 』 *Nessun utente avvertito in questo gruppo.*\n│ 『 🧹 』 *Siete tutti bravi... per ora.*\n*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`)
        }

        let textList = `ㅤ⋆｡˚『 ╭ \`UTENTI AVVERTITI\` ╯ 』˚｡⋆\n╭\n`
        textList += `│ 『 📋 』 \`Gruppo:\` *${await conn.getName(chatID)}*\n`
        textList += `│ 『 👥 』 \`Totale:\` *${warnedUsers.length}* utenti a rischio\n│\n`

        let mentions = []

        for (let i = 0; i < warnedUsers.length; i++) {
            const [jid, data] = warnedUsers[i]
            const count = data.warns[chatID]
            let userName = 'Utente Sconosciuto'
            const participant = participants.find(p => p.id === jid || p.jid === jid)
            if (participant && (participant.notify || participant.name)) {
                userName = participant.notify || participant.name
            } else if (data.name) {
                userName = data.name
            } else {
                userName = jid.split('@')[0]
            }

            textList += `│ 『 ⚠️ 』 \`${i + 1}.\` *${userName}*\n`
            textList += `│ 『 🔢 』 \`Warn:\` *${count}/3*\n`
            textList += `│ 『 📱 』 \`Tag:\` @${jid.split('@')[0]}\n`
            textList += `│\n`
            mentions.push(jid)
        }
        textList += `*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`

        return conn.sendMessage(m.chat, { 
            text: textList, 
            mentions: mentions,
            contextInfo: {
                mentionedJid: mentions,
                externalAdReply: {
                    title: "Registro Avvertimenti",
                    body: `Utenti sotto sorveglianza: ${warnedUsers.length}`,
                    thumbnailUrl: await conn.profilePictureUrl(m.chat, 'image').catch(_ => 'https://i.ibb.co/BKHtdBNp/default-avatar-profile-icon-1280x1280.jpg'),
                    mediaType: 1,
                    renderLargerThumbnail: false
                }
            }
        })
    }
    let targetUsers = []
    if (m.mentionedJid?.length) {
        targetUsers = m.mentionedJid
    } else if (m.quoted) {
        targetUsers = [m.quoted.sender]
    } else if (text) {
        let cleanText = text.replace(/[^0-9]/g, '')
        if (cleanText.length > 5) targetUsers = [cleanText + '@s.whatsapp.net']
    }

    if (!targetUsers.length) {
        return m.reply(createUsageMessage(usedPrefix, command, isWarn));
    }

    const targetRaw = targetUsers[0]
    const decodedId = conn.decodeJid(targetRaw)
    const normalizedUserId = normalizeId(decodedId)
    let matchedParticipant = participants.find(p => normalizeId(p.id) === normalizedUserId)
    if (!matchedParticipant) {
        matchedParticipant = participants.find(p => p.jid && normalizeId(p.jid) === normalizedUserId)
    }
    if (!matchedParticipant) {
        const alternativeId = normalizedUserId.startsWith('39') ? normalizedUserId.substring(2) : '39' + normalizedUserId
        matchedParticipant = participants.find(p => normalizeId(p.id) === alternativeId)
    }
    if (!matchedParticipant && isWarn) {
        return m.reply(`『 ❌ 』 *Utente non trovato nel gruppo.*`);
    }
    const target = matchedParticipant ? conn.decodeJid(matchedParticipant.id || matchedParticipant.jid) : decodedId
    if (!global.db.data.users[target]) global.db.data.users[target] = { warns: {} }
    const user = global.db.data.users[target]
    if (!user.warns) user.warns = {}
    if (typeof user.warns[m.chat] !== 'number') user.warns[m.chat] = 0
    if (isWarn) {
        if (target === conn.user.jid) return m.reply('『 ‼️ 』 *Non puoi warnare il bot!*')
        const targetIsOwner = global.owner.map(([n]) => n.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(target)
        if (targetIsOwner) return m.reply('🤨 *Non puoi warnare un owner.*')

        const reason = getReason(m, text, target)
        
        user.warns[m.chat] += 1
        const remainingWarns = user.warns[m.chat]

        if (remainingWarns >= 3) {
            user.warns[m.chat] = 0
            await handleRemoval(conn, m, target, participants)
        } else {
            await handleWarnMessage(conn, m, target, remainingWarns, reason, participants)
        }
    }
    else if (isUnwarn) {
        if (user.warns[m.chat] <= 0) {
            return m.reply(`『 ‼️ 』 *L'utente @${target.split('@')[0]} non ha avvertimenti in questo gruppo.*`, null, { mentions: [target] })
        }

        user.warns[m.chat] -= 1
        
        if (user.warns[m.chat] <= 0) {
            delete user.warns[m.chat]
            await handleCleanRecord(conn, m, target, participants)
        } else {
            const username = target.split('@')[0]
            let userName = username
            const userData = global.db.data.users[target]
            if (userData && userData.name) userName = userData.name
            const participant = participants.find(p => p.id === target || p.jid === target)
            if (participant && (participant.notify || participant.name)) userName = participant.notify || participant.name
            const fkontak = createUserFkontak(target, userName)
            await m.reply(`『 📉 』 @${username}\n- _*Un avvertimento rimosso*_\n- *\`Avvertimenti restanti: ${user.warns[m.chat]}/3\`*`, null, {
                mentions: [target],
                quoted: fkontak,
                contextInfo: {
                    ...global.fake.contextInfo,
                    externalAdReply: {
                        title: 'Avvertimento Rimosso',
                        body: `Gruppo: ${await conn.getName(m.chat)}`,
                        thumbnailUrl: await conn.profilePictureUrl(m.chat, 'image').catch(_ => 'https://i.ibb.co/BKHtdBNp/default-avatar-profile-icon-1280x1280.jpg'),
                        mediaType: 1,
                        renderLargerThumbnail: false
                    }
                }
            })
        }
    }
}

function normalizeId(id) {
    if (!id) return '';
    let normalizedId = id.replace('@s.whatsapp.net', '').replace('@lid', '').split('@')[0]
    if (normalizedId.startsWith('39') && normalizedId.length > 10) {
        normalizedId = normalizedId.substring(2)
    }
    return normalizedId
}

function getReason(m, text, target) {
    let reason = text || ''
    if (m.quoted && !text) reason = 'Messaggio quotato inappropriato'
    if (m.mentionedJid?.length) {
         reason = reason.replace(/@\d+/g, '').trim()
    }
    return reason || 'Non specificato ma meritato'
}

function createUsageMessage(usedPrefix, command, isWarn) {
    const title = isWarn ? 'WARN' : 'UNWARN'
    return `
    ㅤㅤ⋆｡˚『 ╭ \`${title}\` ╯ 』˚｡⋆\n╭
│  『 📋 』 _*METODI DISPONIBILI:*_
│•  *\`Menziona:\`* *${usedPrefix + command} @utente ${isWarn ? '[motivo]' : ''}*
│•  *\`Rispondi:\`* *Quota un messaggio e scrivi ${usedPrefix + command}*
│
*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`
}

async function handleWarnMessage(conn, m, target, remainingWarns, reason, participants) {
    const username = target.split('@')[0]
    let userName = username
    const userData = global.db.data.users[target]
    if (userData && userData.name) userName = userData.name
    const participant = participants.find(p => p.id === target || p.jid === target)
    if (participant && (participant.notify || participant.name)) userName = participant.notify || participant.name

    const emoji = remainingWarns === 1 ? '⚠️' : '🔔'

    const message = `『 ${emoji} 』 @${username}\n- _*Hai ricevuto un avvertimento*_
- *\`Motivo:\`* *${reason}*
- *\`Avvertimenti: ${remainingWarns}/3\`*`

    const fkontak = createUserFkontak(target, userName)

    await m.reply(message, null, {
        mentions: [target],
        quoted: fkontak,
        contextInfo: {
            ...global.fake.contextInfo,
            mentionedJid: [target],
            externalAdReply: {
                title: `Avvertimento ${remainingWarns}/3`,
                body: `Gruppo: ${await conn.getName(m.chat)}`,
                thumbnailUrl: await conn.profilePictureUrl(m.chat, 'image').catch(_ => 'https://i.ibb.co/BKHtdBNp/default-avatar-profile-icon-1280x1280.jpg'),
                mediaType: 1,
                renderLargerThumbnail: false
            }
        }
    })
}

async function handleRemoval(conn, m, target, participants) {
    const username = target.split('@')[0]
    let userName = username
    const userData = global.db.data.users[target]
    if (userData && userData.name) userName = userData.name
    const participant = participants.find(p => p.id === target || p.jid === target)
    if (participant && (participant.notify || participant.name)) userName = participant.notify || participant.name

    const message = `『 🫄🏿 』 \`Ti avevo avvertito, sei arrivato a tre warn. Addio\` @${username}`
    const fkontak = createUserFkontak(target, userName)

    await m.reply(message, null, {
        mentions: [target],
        quoted: fkontak,
        contextInfo: {
            ...global.fake.contextInfo
        }
    })
    await conn.groupParticipantsUpdate(m.chat, [target], 'remove')
}

async function handleCleanRecord(conn, m, target, participants) {
    const username = target.split('@')[0]
    let userName = username
    const userData = global.db.data.users[target]
    if (userData && userData.name) userName = userData.name
    const participant = participants.find(p => p.id === target || p.jid === target)
    if (participant && (participant.notify || participant.name)) userName = participant.notify || participant.name

    const cleanMessage = `『 ✅ 』 @${username} *ti sono stati tolti tutti gli avvertimenti in questo gruppo, sei un uomo pulito ora...*`
    const fkontak = createUserFkontak(target, userName)

    let msg = await m.reply(cleanMessage, null, {
        mentions: [target],
        quoted: fkontak,
        contextInfo: {
            ...global.fake.contextInfo,
            externalAdReply: {
                title: 'Record Pulito',
                body: `Gruppo: ${await conn.getName(m.chat)}`,
                thumbnailUrl: await conn.profilePictureUrl(m.chat, 'image').catch(_ => 'https://i.ibb.co/BKHtdBNp/default-avatar-profile-icon-1280x1280.jpg'),
                mediaType: 1,
                renderLargerThumbnail: false
            }
        }
    })
    await freeojebossetti(conn, msg)
}

function createUserFkontak(target, userName) {
    return {
        key: {
            participant: "0@s.whatsapp.net",
            remoteJid: "status@broadcast",
            fromMe: false,
            id: "Halo"
        },
        message: {
            contactMessage: {
                vcard: `BEGIN:VCARD\nVERSION:3.0\nN:;${userName};;;\nFN:${userName}\nTEL;waid=${target.split('@')[0]}@s.whatsapp.net:+${target.split('@')[0]}\nEND:VCARD`
            }
        },
        participant: "0@s.whatsapp.net"
    }
}

async function freeojebossetti(conn, quotedMsg) {
    const videos = [
        'https://www.tiktok.com/@doubs.prodz87/video/7482131335046335786',
        'https://www.tiktok.com/@koso1872/video/7438736407448931616',
        'https://www.tiktok.com/@tizendio/video/7357451196514225441',
        'https://www.tiktok.com/@bl00dfiend/video/7356671258332859678',
        'https://www.tiktok.com/@massimobossetti4/video/7448686967274933527',
        'https://www.tiktok.com/@massimobossetti1970/video/7552659005538192662'
    ]
    const randomVideo = videos[Math.floor(Math.random() * videos.length)]

    try {
        const videoData = await downloadTikTokVideo(randomVideo)
        if (videoData.success && videoData.videoUrl) {
            await conn.sendMessage(quotedMsg.chat, { video: { url: videoData.videoUrl }, caption: 'come oj' }, { quoted: quotedMsg })
        }
    } catch (e) { console.error(e) }
}

async function downloadTikTokVideo(url) {
    try {
        const response = await fetch(`https://www.tikwm.com/api/?url=${encodeURIComponent(url)}&hd=1`)
        if (!response.ok) throw new Error(`HTTP error!`)
        const data = await response.json()
        return { success: !!(data?.data?.play), videoUrl: data?.data?.play || null }
    } catch { return { success: false, videoUrl: null } }
}

handler.command = /^(warn|avverti|avvertimento|unwarn|delwarn|togliwarn|togliavvertimento|listawarn|warnlist|listavv|avvertimenti)$/i
handler.group = true
handler.admin = true
handler.botAdmin = true
handler.tags = ['gruppo']
handler.help = ['warn @user', 'unwarn @user', 'listawarn']

export default handler