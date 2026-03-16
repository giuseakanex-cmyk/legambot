import './config.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import chalk from 'chalk'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const pluginFolder = path.join(__dirname, 'plugin')

// Caricamento Dinamico Plugin
global.plugins = {}
let files = fs.readdirSync(pluginFolder).filter(f => f.endsWith('.js'))
for (let file of files) {
    try {
        let plugin = await import(`./plugin/${file}?u=${Date.now()}`)
        global.plugins[file] = plugin.default || plugin
    } catch (e) {
        console.error(`Errore caricamento ${file}:`, e)
    }
}

export async function handler(chatUpdate) {
    if (!chatUpdate.messages) return
    let m = chatUpdate.messages[0]
    if (!m.message || m.key.remoteJid === 'status@broadcast') return

    // SERIALIZZAZIONE MESSAGGIO (smsg)
    try {
        const type = Object.keys(m.message)[0]
        m.text = m.message.conversation || m.message[type]?.text || m.message[type]?.caption || ''
        m.sender = m.key.participant || m.key.remoteJid
        m.chat = m.key.remoteJid
        m.isGroup = m.chat.endsWith('@g.us')
        m.reply = (text) => this.sendMessage(m.chat, { text }, { quoted: m })

        // DATABASE CHECK
        if (!global.db.data) await global.loadDatabase()
        let user = global.db.data.users[m.sender]
        if (!user) user = global.db.data.users[m.sender] = { exp: 0, euro: 10, limit: 20, registered: false, banned: false }
        
        let chat = global.db.data.chats[m.chat]
        if (!chat) chat = global.db.data.chats[m.chat] = { isBanned: false, welcome: false, antilink: false }

        // PERMESSI
        let isOwner = global.owner.some(o => m.sender.includes(o[0])) || m.key.fromMe
        let isPrems = isOwner || global.prems.some(p => m.sender.includes(p))
        let isAdmin = false, isBotAdmin = false
        if (m.isGroup) {
            let metadata = await this.groupMetadata(m.chat).catch(() => null)
            if (metadata) {
                let botId = this.user.id.split(':')[0] + '@s.whatsapp.net'
                isAdmin = metadata.participants.some(p => p.id === m.sender && p.admin)
                isBotAdmin = metadata.participants.some(p => p.id === botId && p.admin)
            }
        }

        // COMANDI
        if (!global.prefix.test(m.text)) {
            // Logica per messaggi normali (guadagno exp)
            user.exp += 1
            return
        }

        let usedPrefix = m.text.match(global.prefix)[0]
        let noPrefix = m.text.replace(usedPrefix, '').trim()
        let args = noPrefix.split(/\s+/).slice(1)
        let command = noPrefix.split(/\s+/)[0].toLowerCase()

        for (let name in global.plugins) {
            let plugin = global.plugins[name]
            if (!plugin.command) continue
            let isMatch = Array.isArray(plugin.command) ? plugin.command.includes(command) : plugin.command === command
            
            if (isMatch) {
                // CONTROLLI DI SICUREZZA (DFAIL)
                if (plugin.owner && !isOwner) return global.dfail('owner', m, this)
                if (plugin.rowner && !isOwner) return global.dfail('rowner', m, this)
                if (plugin.group && !m.isGroup) return global.dfail('group', m, this)
                if (plugin.admin && !isAdmin && !isOwner) return global.dfail('admin', m, this)
                if (plugin.botAdmin && !isBotAdmin) return global.dfail('botAdmin', m, this)
                if (plugin.premium && !isPrems) return global.dfail('premium', m, this)

                try {
                    await plugin.call(this, m, {
                        conn: this,
                        args,
                        text: args.join(' '),
                        command,
                        usedPrefix,
                        isOwner,
                        isAdmin,
                        isBotAdmin
                    })
                } catch (e) {
                    console.error(e)
                    m.reply('『 ⚠️ 』 `Errore nell\'esecuzione del comando.`')
                }
                break
            }
        }

    } catch (e) {
        console.error(e)
    }
}

