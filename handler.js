import { smsg } from './lib/simple.js'
import { format } from 'util'
import { fileURLToPath } from 'url'
import path, { join } from 'path'
import { unwatchFile, watchFile } from 'fs'
import chalk from 'chalk'
import NodeCache from 'node-cache'
import { getAggregateVotesInPollMessage, toJid } from '@whiskeysockets/baileys'

global.ignoredUsersGlobal = new Set()
global.ignoredUsersGroup = {}
global.groupSpam = {}

if (!global.groupCache) {
    global.groupCache = new NodeCache({ stdTTL: 5 * 60, useClones: false })
}
if (!global.jidCache) {
    global.jidCache = new NodeCache({ stdTTL: 600, useClones: false })
}
if (!global.nameCache) {
    global.nameCache = new NodeCache({ stdTTL: 600, useClones: false });
}

export const fetchMetadata = async (conn, chatId) => await conn.groupMetadata(chatId)

const fetchGroupMetadataWithRetry = async (conn, chatId, retries = 3, delay = 1000) => {
    for (let i = 0; i < retries; i++) {
        try {
            return await conn.groupMetadata(chatId);
        } catch (e) {
            if (i === retries - 1) throw e;
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
}

const isNumber = x => typeof x === 'number' && !isNaN(x)
const delay = ms => isNumber(ms) && new Promise(resolve => setTimeout(resolve, ms))

export async function handler(chatUpdate) {
    this.msgqueque = this.msgqueque || []
    this.uptime = this.uptime || Date.now()
    if (!chatUpdate) return
    
    let m = chatUpdate.messages[chatUpdate.messages.length - 1]
    if (!m) return
    
    // Gestione messaggi modificati
    if (m.message?.protocolMessage?.type === 'MESSAGE_EDIT') {
        const key = m.message.protocolMessage.key;
        const editedMessage = m.message.protocolMessage.editedMessage;
        m.key = key;
        m.message = editedMessage;
        m.text = editedMessage.conversation || editedMessage.extendedTextMessage?.text || '';
        m.mtype = Object.keys(editedMessage)[0];
    }

    // Serializzazione fondamentale (senza questa il bot muore)
    try {
        m = smsg(this, m, global.store)
    } catch (e) {
        return
    }

    if (!m || !m.key || !m.chat || !m.sender) return
    if (m.fromMe) return

    // DATABASE LOADING
    if (!global.db.data) await global.loadDatabase()
    
    // Inizializzazione Utente
    let user = global.db.data.users[m.sender]
    if (!user) {
        user = global.db.data.users[m.sender] = {
            exp: 0, euro: 10, muto: false, registered: false,
            name: m.pushName || 'Utente', banned: false, level: 0
        }
    }

    // Inizializzazione Chat
    let chat = global.db.data.chats[m.chat]
    if (!chat) {
        chat = global.db.data.chats[m.chat] = {
            isBanned: false, welcome: false, antilink: false, reaction: false
        }
    }

    // PERMESSI (Owner, Admin, ecc)
    let isOwner = global.owner.some(([num]) => num + '@s.whatsapp.net' === m.sender) || m.fromMe
    let isPrems = isOwner || (global.prems && global.prems.includes(m.sender))
    
    let isAdmin = false, isBotAdmin = false
    if (m.isGroup) {
        let metadata = global.groupCache.get(m.chat) || await fetchMetadata(this, m.chat).catch(() => null)
        if (metadata) {
            global.groupCache.set(m.chat, metadata)
            let participants = metadata.participants
            isAdmin = participants.some(p => p.id === m.sender && (p.admin === 'admin' || p.admin === 'superadmin'))
            isBotAdmin = participants.some(p => p.id === (this.user.id.split(':')[0] + '@s.whatsapp.net') && (p.admin === 'admin' || p.admin === 'superadmin'))
        }
    }

    // ESECUZIONE PLUGIN
    const ___dirname = join(path.dirname(fileURLToPath(import.meta.url)), './plugins')
    
    // Controllo Prefissi
    let usedPrefix
    let _prefix = global.prefix || /^[.!]/i
    let isCmd = _prefix.test(m.text)
    
    if (isCmd) {
        usedPrefix = m.text.match(_prefix)[0]
        let noPrefix = m.text.replace(usedPrefix, '').trim()
        let [command, ...args] = noPrefix.split(/\s+/).filter(v => v)
        command = command?.toLowerCase()

        for (let name in global.plugins) {
            let plugin = global.plugins[name]
            if (!plugin) continue
            
            let isAccept = Array.isArray(plugin.command) ? plugin.command.includes(command) : plugin.command === command
            
            if (isAccept) {
                // Check dei permessi Axion-style
                if (plugin.owner && !isOwner) return global.dfail('owner', m, this)
                if (plugin.group && !m.isGroup) return global.dfail('group', m, this)
                if (plugin.admin && !isAdmin && !isOwner) return global.dfail('admin', m, this)
                if (plugin.botAdmin && !isBotAdmin) return global.dfail('botAdmin', m, this)

                try {
                    await plugin.call(this, m, {
                        conn: this, args, text: args.join(' '), command, usedPrefix,
                        isOwner, isAdmin, isBotAdmin, isPrems
                    })
                } catch (e) {
                    console.error(e)
                }
                break
            }
        }
    }
}

global.dfail = async (type, m, conn) => {
    const msg = {
        rowner: '『 👑 』 *OWNER ONLY*\nComando riservato al creatore.',
        owner: '『 🛡️ 』 *ACCESS DENIED*\nSolo Giuse può farlo.',
        group: '『 👥 』 *GROUP ONLY*\nUsa questo comando nei gruppi.',
        admin: '『 🛠️ 』 *ADMIN ONLY*\nDevi essere amministratore.',
        botAdmin: '『 🤖 』 *BOT NOT ADMIN*\nFammi admin per favore.'
    }[type]
    if (msg) return m.reply(msg)
}

let file = fileURLToPath(import.meta.url)
watchFile(file, () => {
    unwatchFile(file)
    console.log(chalk.bgHex('#3b0d95')(chalk.white.bold("File: 'handler.js' Aggiornato")))
})

