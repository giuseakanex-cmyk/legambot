import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// CREAZIONE AUTOMATICA CARTELLA PLUGIN SE NON ESISTE
const pluginFolder = path.join(__dirname, 'plugin')
if (!fs.existsSync(pluginFolder)) {
    fs.mkdirSync(pluginFolder)
    console.log('📁 Cartella "plugin" creata automaticamente.')
}

global.plugins = {}

// CARICAMENTO PLUGIN
const files = fs.readdirSync(pluginFolder).filter(file => file.endsWith('.js'))
for (let file of files) {
    try {
        import(`./plugin/${file}?update=${Date.now()}`).then(plugin => {
            global.plugins[file] = plugin.default || plugin
        })
    } catch (e) {
        console.error(`[❌] Impossibile caricare plugin ${file}:`, e)
    }
}

export async function handler(conn, m) {
    if (!m || !m.messages) return
    let msg = m.messages[0]
    if (!msg.message || msg.key.remoteJid === 'status@broadcast') return

    try {
        const type = Object.keys(msg.message)[0]
        let text = msg.message.conversation || 
                   (msg.message.extendedTextMessage && msg.message.extendedTextMessage.text) || 
                   (msg.message.imageMessage && msg.message.imageMessage.caption) || 
                   (msg.message.videoMessage && msg.message.videoMessage.caption) || ''
                   
        let sender = msg.key.participant || msg.key.remoteJid
        let chat = msg.key.remoteJid
        let isGroup = chat.endsWith('@g.us')
        let fromMe = msg.key.fromMe

        let fakeM = {
            ...msg, text, sender, chat, isGroup, fromMe,
            reply: (testo) => conn.sendMessage(chat, { text: testo }, { quoted: msg })
        }

        let isOwner = global.owner && global.owner.some(o => sender.includes(o[0])) || fromMe
        let isBotAdmin = false, isAdmin = false
        
        if (isGroup) {
            let metadata = await conn.groupMetadata(chat).catch(() => null)
            if (metadata) {
                let botId = conn.user.id.split(':')[0] + '@s.whatsapp.net'
                isAdmin = metadata.participants.some(p => p.id === sender && p.admin)
                isBotAdmin = metadata.participants.some(p => p.id === botId && p.admin)
            }
        }

        // 1. Esecuzione Plugin Passivi (quelli senza punto)
        for (let name in global.plugins) {
            let plugin = global.plugins[name]
            if (plugin.before) await plugin.before.call(conn, fakeM, { conn, isOwner, isAdmin, isBotAdmin })
            if (plugin.all) await plugin.all.call(conn, fakeM, { conn, isOwner, isAdmin, isBotAdmin })
        }

        // 2. Controllo Prefisso (. o !)
        let isCommand = global.prefix.test(text)
        if (!isCommand) return

        let usedPrefix = text.match(global.prefix)[0]
        let command = text.slice(usedPrefix.length).trim().split(' ')[0].toLowerCase()
        let args = text.trim().split(' ').slice(1)
        let stringArgs = args.join(' ')

        // 3. Ricerca ed Esecuzione del Comando
        for (let name in global.plugins) {
            let plugin = global.plugins[name]
            if (!plugin.command) continue

            let isMatch = Array.isArray(plugin.command) ? plugin.command.includes(command) : plugin.command === command
            
            if (isMatch) {
                // Sistemi di Difesa Arroganti
                if (plugin.group && !isGroup) return fakeM.reply('『 ❌ 』 `Questo comando si usa solo nei gruppi.`')
                if (plugin.owner && !isOwner) return fakeM.reply('『 👑 』 `Zitto. Solo Giuse può usare questo comando.`')
                if (plugin.admin && !isAdmin && !isOwner) return fakeM.reply('『 🛑 』 `Solo gli Admin possono darmi ordini.`')
                if (plugin.botAdmin && !isBotAdmin) return fakeM.reply('『 🩼 』 `Devo essere Amministratore per farlo. Promuovimi.`')

                try {
                    await plugin.call(conn, fakeM, { conn, text: stringArgs, args, command, usedPrefix, isOwner, isAdmin, isBotAdmin })
                } catch (e) {
                    console.error(`Errore plugin ${name}:`, e)
                    fakeM.reply(`『 ⚠️ 』 \`Il sistema ha riscontrato un errore.\``)
                }
                break
            }
        }
    } catch (e) {
        console.error('Errore handler:', e)
    }
}


