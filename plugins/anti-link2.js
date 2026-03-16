import fetch from 'node-fetch'
import { FormData } from 'formdata-node'
import { downloadContentFromMessage } from '@realvare/based'
import Jimp from 'jimp'
import jsQR from 'jsqr'

const sonoilgattoperquestitopi = /(?:https?:\/\/)?(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&=]*)/gi;
const doms = {
    tiktok: ['tiktok.com', 'vm.tiktok.com', 'tiktok.it', 'tiktok.fr', 'tiktok.de', 'tiktok.es', 'tiktok.co.uk'],
    youtube: ['youtube.com', 'youtu.be', 'm.youtube.com', 'youtube.it', 'youtube.fr', 'youtube.de', 'youtube.es', 'youtube.co.uk'],
    telegram: ['telegram.me', 'telegram.org', 't.me', 'telegram.it', 'telegram.fr', 'telegram.de', 'telegram.es', 'telegram.co.uk'],
    facebook: ['facebook.com', 'fb.com', 'm.facebook.com', 'facebook.it', 'facebook.fr', 'facebook.de', 'facebook.es', 'facebook.co.uk'],
    instagram: ['instagram.com', 'instagr.am', 'instagram.it', 'instagram.fr', 'instagram.de', 'instagram.es', 'instagram.co.uk'],
    twitter: ['twitter.com', 'x.com', 'twitter.it', 'twitter.fr', 'twitter.de', 'twitter.es', 'twitter.co.uk'],
    discord: ['discord.gg', 'discord.com', 'discordapp.com', 'discord.it', 'discord.fr', 'discord.de', 'discord.es', 'discord.co.uk'],
    snapchat: ['snapchat.com', 't.snapchat.com', 'snapchat.it', 'snapchat.fr', 'snapchat.de', 'snapchat.es', 'snapchat.co.uk'],
    linkedin: ['linkedin.com', 'lnkd.in', 'linkedin.it', 'linkedin.fr', 'linkedin.de', 'linkedin.es', 'linkedin.co.uk'],
    twitch: ['twitch.tv', 'm.twitch.tv', 'twitch.it', 'twitch.fr', 'twitch.de', 'twitch.es', 'twitch.co.uk'],
    reddit: ['reddit.com', 'redd.it', 'reddit.it', 'reddit.fr', 'reddit.de', 'reddit.es', 'reddit.co.uk'],
    onlyfans: ['onlyfans.com', 'onlyfans.it', 'onlyfans.fr', 'onlyfans.de', 'onlyfans.es', 'onlyfans.co.uk'],
    github: ['github.com', 'git.io', 'github.it', 'github.fr', 'github.de', 'github.es', 'github.co.uk'],
    bitly: ['bit.ly', 'bitly.com'], 
    tinyurl: ['tinyurl.com']
};

const MESSAGES = {
    detected: {
        'link': (platform, user) => `> 『 🛑 』 \`Link ${platform} rilevato.\` *Ciao ciao* @${user}`,
        'poll': (platform, user) => `> 『 ⚠ 』 \`Sondaggio con link ${platform} rilevato.\` *Ciao ciao* @${user}`,
        'video': (platform, user) => `> 『 🎬 』 \`Video con link ${platform} rilevato.\` *Ciao ciao* @${user}`,
        'image': (platform, user) => `> 『 🖼️ 』 \`Immagine con link ${platform} rilevato.\` *Ciao ciao* @${user}`,
        'qr': (platform, user) => `> 『 🚫 』 \`QR con link ${platform} rilevato.\` *Ciao ciao* @${user}`
    },
    error: '❌ Errore durante il controllo dei link.'
};

async function getMediaBuffer(message) {
    try {
        const found = findFirstMediaMessage(message, { excludeQuoted: false })
        if (!found) return null

        const { node, typeKey } = found
        const type = typeKey === 'videoMessage' ? 'video' : typeKey === 'stickerMessage' ? 'sticker' : 'image'
        const stream = await downloadContentFromMessage(node, type)

        let buffer = Buffer.from([])
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk])
        }

        return buffer
    } catch (e) {
        console.error('Errore nel download media:', e)
        return null
    }
}

function unwrapMessageContent(message) {
    let content = message?.message || message
    for (let i = 0; i < 10; i++) {
        if (content?.ephemeralMessage?.message) {
            content = content.ephemeralMessage.message
            continue
        }
        if (content?.viewOnceMessage?.message) {
            content = content.viewOnceMessage.message
            continue
        }
        if (content?.viewOnceMessageV2?.message) {
            content = content.viewOnceMessageV2.message
            continue
        }
        if (content?.viewOnceMessageV2Extension?.message) {
            content = content.viewOnceMessageV2Extension.message
            continue
        }
        if (content?.documentWithCaptionMessage?.message) {
            content = content.documentWithCaptionMessage.message
            continue
        }
        if (content?.editedMessage?.message) {
            content = content.editedMessage.message
            continue
        }
        break
    }
    return content
}

function findFirstMediaMessage(message, { excludeQuoted = false } = {}) {
    const root = unwrapMessageContent(message)
    const seen = new Set()
    const MEDIA_KEYS = new Set(['imageMessage', 'videoMessage', 'stickerMessage'])

    function visit(obj) {
        if (!obj || typeof obj !== 'object') return null
        if (seen.has(obj)) return null
        seen.add(obj)
        if (Buffer.isBuffer(obj)) return null

        for (const key of Object.keys(obj)) {
            if (excludeQuoted && key === 'quotedMessage') continue
            const value = obj[key]
            if (MEDIA_KEYS.has(key) && value && typeof value === 'object') {
                return { node: value, typeKey: key }
            }
            if (value && typeof value === 'object') {
                const hit = visit(value)
                if (hit) return hit
            }
        }
        return null
    }

    return visit(root)
}

async function readQRCodeLocal(imageBuffer) {
    try {
        const img = await Jimp.read(imageBuffer)
        const { data, width, height } = img.bitmap
        const clamped = new Uint8ClampedArray(data.buffer, data.byteOffset, data.byteLength)
        const code = jsQR(clamped, width, height)
        return code?.data || null
    } catch {
        return null
    }
}

async function readQRCode(imageBuffer) {
    const local = await readQRCodeLocal(imageBuffer)
    if (local && typeof local === 'string' && local.trim()) return local.trim()

    const apis = [
        {
            name: 'qr-server',
            func: async (buffer) => {
                const controller = new AbortController()
                const timeout = setTimeout(() => controller.abort(), 8000)

                const formData = new FormData()
                const blob = new Blob([buffer], { type: 'image/jpeg' })
                formData.append('file', blob, 'image.jpg')

                const response = await fetch('https://api.qrserver.com/v1/read-qr-code/', {
                    method: 'POST',
                    body: formData,
                    signal: controller.signal
                })

                clearTimeout(timeout)
                
                if (!response.ok) throw new Error(`HTTP ${response.status}`)

                const data = await response.json()
                return data && data[0] && data[0].symbol && data[0].symbol[0] && data[0].symbol[0].data || null
            }
        }
    ];

    for (const api of apis) {
        try {
            console.log(`[QR] Tentativo con API: ${api.name}`)
            
            const result = await api.func(imageBuffer)
            
            if (result && typeof result === 'string' && result.trim()) {
                console.log(`[QR] Successo con ${api.name}: ${result.substring(0, 50)}...`)
                return result.trim()
            }
        } catch (error) {
            console.log(`[QR] Errore con ${api.name}: ${error.message}`)
            continue
        }
    }
    
    console.log('[QR] Tutte le API hanno fallito')
    return null
}

function extractTextFromMessage(m, excludeQuoted = false) {
    const texts = []
    const seen = new Set()
    const IGNORED_KEYS = [
        'fileSha256', 'mediaKey', 'fileEncSha256', 'jpegThumbnail',
        'participant', 'stanzaId', 'remoteJid', 'id'
    ]

    function recursiveExtract(obj) {
        if (!obj || typeof obj !== 'object') return
        if (seen.has(obj)) return
        seen.add(obj)
        if (Buffer.isBuffer(obj)) return

        for (const key in obj) {
            if (excludeQuoted && key === 'quotedMessage') continue
            if (IGNORED_KEYS.includes(key)) continue
            const value = obj[key]
            if (typeof value === 'string' && value.length > 0) {
                texts.push(value)
            } else if (typeof value === 'object') {
                recursiveExtract(value)
            }
        }
    }

    if (m?.text) texts.push(m.text)
    if (m?.caption) texts.push(m.caption)
    recursiveExtract(unwrapMessageContent(m))

    return texts.join(' ').replace(/[\s\u200b\u200c\u200d\uFEFF\u2060\u00A0]+/g, ' ').trim()
}

function detectSocialLink(url) {
    if (!url) return null

    const lowerUrl = url.toLowerCase()

    for (const [platform, domains] of Object.entries(doms)) {
        if (domains.some(domain => lowerUrl.includes(domain))) {
            return platform
        }
    }
    return null
}

function getMessageType(m) {
    if (m.message && (m.message.pollCreationMessageV3 || m.message.pollCreationMessage)) {
        return 'poll'
    }
    if (m.message && m.message.videoMessage) {
        return 'video'
    }
    if (m.message && m.message.imageMessage) {
        return 'image'
    }
    return 'link'
}

export async function before(m, { conn, isAdmin, isBotAdmin, isOwner, isSam }) {
    if (!m.isGroup) return false
    if (isAdmin || isOwner || isSam || m.fromMe) return false
    const chat = global.db.data.chats[m.chat]
    if (!chat) return false
    const hasMaster = !!chat.antiLink2
    const hasAnySocialToggle = !hasMaster && Object.keys(chat).some(k => k.startsWith('antiLink2_') && chat[k] === true)
    if (!hasMaster && !hasAnySocialToggle) return false
    try {
        const extractedText = extractTextFromMessage(m, true)

        if (extractedText) {
            const urls = extractedText.match(sonoilgattoperquestitopi) || []
            for (const url of urls) {
                const detectedPlatform = detectSocialLink(url)
                if (detectedPlatform) {
                    if (!hasMaster) {
                        const platformKey = `antiLink2_${detectedPlatform}`
                        if (chat[platformKey] !== true) continue
                    }
                    const user = global.db.data.chats[m.chat].users = global.db.data.chats[m.chat].users || {}
                    user[m.sender] = user[m.sender] || {}
                    user[m.sender].antiLink2Warns = (user[m.sender].antiLink2Warns || 0) + 1
                    await conn.sendMessage(m.chat, {
                        delete: {
                            remoteJid: m.chat,
                            fromMe: false,
                            id: m.key.id,
                            participant: m.key.participant
                        }
                    }).catch(() => {})

                    if (user[m.sender].antiLink2Warns < 3) {
                        await conn.sendMessage(m.chat, {
                            text: `> 『 ⚠️ 』 Avviso ${user[m.sender].antiLink2Warns}/3 per link ${detectedPlatform}. Al terzo avviso verrai rimosso.\n\n> \`vare ✧ bot\``,
                            mentions: [m.sender]
                        })
                    } else {
                        user[m.sender].antiLink2Warns = 0
                        await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove').catch(console.error)
                        const username = m.sender.split('@')[0]
                        await conn.sendMessage(m.chat, {
                            text: `> 『 🛑 』 \`Link ${detectedPlatform} rilevato.\` *Ciao ciao* @${username}\n\n> \`vare ✧ bot\``,
                            mentions: [m.sender]
                        })
                    }
                    return true
                }
            }
        }
        const media = await getMediaBuffer(m)
        if (media) {
            const qrData = await readQRCode(media)
            
            if (qrData) {
                console.log(`[ANTILINK] QR decodificato: ${qrData.substring(0, 100)}...`)
                const detectedPlatform = detectSocialLink(qrData)
                if (detectedPlatform) {
                    if (!hasMaster) {
                        const platformKey = `antiLink2_${detectedPlatform}`
                        if (chat[platformKey] !== true) return false
                    }
                    const user = global.db.data.chats[m.chat].users = global.db.data.chats[m.chat].users || {}
                    user[m.sender] = user[m.sender] || {}
                    user[m.sender].antiLink2Warns = (user[m.sender].antiLink2Warns || 0) + 1
                    await conn.sendMessage(m.chat, {
                        delete: {
                            remoteJid: m.chat,
                            fromMe: false,
                            id: m.key.id,
                            participant: m.key.participant
                        }
                    }).catch(() => {})

                    if (user[m.sender].antiLink2Warns < 3) {
                        await conn.sendMessage(m.chat, {
                            text: `> 『 ⚠️ 』 Avviso ${user[m.sender].antiLink2Warns}/3 per QR con link ${detectedPlatform}. Al terzo avviso verrai rimosso.\n\n> \`vare ✧ bot\``,
                            mentions: [m.sender]
                        })
                    } else {
                        user[m.sender].antiLink2Warns = 0
                        await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove').catch(console.error)
                        const username = m.sender.split('@')[0]
                        await conn.sendMessage(m.chat, {
                            text: `> 『 🚫 』 \`QR con link ${detectedPlatform} rilevato.\` *Ciao ciao* @${username}\n\n> \`vare ✧ bot\``,
                            mentions: [m.sender]
                        })
                    }
                    return true
                }
            }
        }

    } catch (error) {
        console.error('[ANTILINK] Errore generale:', error)
        await conn.sendMessage(m.chat, { text: MESSAGES.error }, { quoted: m }).catch(() => {})
    }

    return false
}

export { before as handler }
