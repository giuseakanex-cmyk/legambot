import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const pluginFolder = path.join(__dirname, 'plugin')

// Caricamento plugin istantaneo
global.plugins = {}
if (fs.existsSync(pluginFolder)) {
    const files = fs.readdirSync(pluginFolder).filter(f => f.endsWith('.js'))
    for (let f of files) {
        import(`./plugin/${f}?u=${Date.now()}`).then(p => {
            global.plugins[f] = p.default || p
        })
    }
}

export async function handler(conn, m) {
    if (!m.messages) return
    let msg = m.messages[0]
    if (!msg.message || msg.key.remoteJid === 'status@broadcast') return

    const type = Object.keys(msg.message)[0]
    let text = msg.message.conversation || msg.message[type]?.text || msg.message[type]?.caption || ''
    let sender = msg.key.participant || msg.key.remoteJid
    let chat = msg.key.remoteJid
    let isGroup = chat.endsWith('@g.us')
    
    let isOwner = global.owner.some(o => sender.includes(o[0])) || msg.key.fromMe
    let isBotAdmin = false, isAdmin = false
    if (isGroup) {
        let metadata = await conn.groupMetadata(chat).catch(() => null)
        if (metadata) {
            let botId = conn.user.id.split(':')[0] + '@s.whatsapp.net'
            isAdmin = metadata.participants.some(p => p.id === sender && p.admin)
            isBotAdmin = metadata.participants.some(p => p.id === botId && p.admin)
        }
    }

    let fakeM = {
        ...msg, text, sender, chat, isGroup,
        reply: (t) => conn.sendMessage(chat, { text: t }, { quoted: msg })
    }

    // Esecuzione plugin passivi
    for (let name in global.plugins) {
        let p = global.plugins[name]
        if (p.all) await p.all.call(conn, fakeM, { isOwner, isAdmin, isBotAdmin })
    }

    // Controllo Comandi
    if (!global.prefix.test(text)) return
    let usedPrefix = text.match(global.prefix)[0]
    let command = text.slice(usedPrefix.length).trim().split(' ')[0].toLowerCase()
    let args = text.trim().split(' ').slice(1)

    for (let name in global.plugins) {
        let p = global.plugins[name]
        if (!p.command) continue
        let match = Array.isArray(p.command) ? p.command.includes(command) : p.command === command
        
        if (match) {
            if (p.owner && !isOwner) return fakeM.reply(global.mess.owner)
            if (p.group && !isGroup) return fakeM.reply(global.mess.group)
            if (p.admin && !isAdmin && !isOwner) return fakeM.reply(global.mess.admin)
            if (p.botAdmin && !isBotAdmin) return fakeM.reply(global.mess.botAdmin)

            try {
                await p.call(conn, fakeM, { conn, text: args.join(' '), args, command, isOwner, isAdmin })
            } catch (e) {
                console.error(e)
                fakeM.reply(global.mess.error)
            }
            break
        }
    }
}

