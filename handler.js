import { smsg } from './lib/simple.js'
import { format } from 'util'
import { fileURLToPath } from 'url'
import path, { join } from 'path'
import { watchFile } from 'fs'
import chalk from 'chalk'
import NodeCache from 'node-cache'
import { getAggregateVotesInPollMessage } from '@realvare/baileys'
import { canLevelUp } from './lib/levelling.js'

global.ignoredUsersGlobal = new Set()
global.ignoredUsersGroup = {}
global.groupSpam = {}

if (!global.groupCache) {
    global.groupCache = new NodeCache({ stdTTL: 5 * 60, useClones: false })
}
if (!global.jidCache) {
    global.jidCache = new NodeCache({ stdTTL: 900, useClones: false })
}
if (!global.nameCache) {
    global.nameCache = new NodeCache({ stdTTL: 900, useClones: false });
}

let PRINT_MODULE = null
let PRINT_MODULE_PROMISE = null
async function getPrintModule() {
    if (PRINT_MODULE) return PRINT_MODULE
    if (!PRINT_MODULE_PROMISE) {
        PRINT_MODULE_PROMISE = import('./lib/print.js')
            .then(m => (PRINT_MODULE = m))
            .finally(() => {
                PRINT_MODULE_PROMISE = null
            })
    }
    return PRINT_MODULE_PROMISE
}

const fetchGroupMetadataWithRetry = async (conn, chatId, retries = 3, delay = 1000, force = false) => {
    const cached = global.groupCache.get(chatId);
    if (!force && cached && Date.now() - (cached.fetchTime || 0) < 60000) return cached;
    for (let i = 0; i < retries; i++) {
        try {
            const metadata = await conn.groupMetadata(chatId);
            if (metadata) {
                metadata.fetchTime = Date.now();
                global.groupCache.set(chatId, metadata, { ttl: 300 });
                return metadata;
            }
        } catch (e) {
            if (i === retries - 1) throw e;
            await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
        }
    }
    return null;
}

if (!global.cacheListenersSet) {
    const conn = global.conn
    if (conn) {
        conn.ev.on('groups.update', async (updates) => {
            for (const update of updates) {
                if (!update || !update.id) continue;
                try {
                    const metadata = await fetchGroupMetadataWithRetry(conn, update.id)
                    if (!metadata) continue
                    global.groupCache.set(update.id, metadata, { ttl: 300 })
                } catch (e) {}
            }
        })
        global.cacheListenersSet = true
    }
}

const defchat = {
    isBanned: false, welcome: false, goodbye: false, ai: false,
    vocali: false, antiporno: false, antioneview: false, autolevelup: false,
    antivoip: false, rileva: false, modoadmin: false, antiLink: false,
    reaction: false, antispam: false, expired: 0, users: {}
}

const defuser = {
    exp: 0, euro: 10, muto: false, registered: false, name: '?',
    age: -1, banned: false, bank: 0, level: 0, messages: 0
}

function chatz(chatId) {
    if (!global.db?.data) return null
    if (!global.db.data.chats) global.db.data.chats = {}
    const existing = global.db.data.chats[chatId]
    global.db.data.chats[chatId] = Object.assign({}, defchat, existing || {})
    return global.db.data.chats[chatId]
}

const escapeRegex = (str) => String(str).replace(/[|\\{}()[\]^$+*?.\-\^]/g, '\\$&')

// --- FIX PREFISSI (Adesso legge . e !) ---
function applyPrefixFromSettings(settings) {
    try {
        const defaultPrefixChars = (global.prefisso || '.!') 
        const chars = (settings?.multiprefix === true && settings?.prefix) ? settings.prefix : defaultPrefixChars
        global.prefix = new RegExp('^[' + escapeRegex(chars) + ']')
    } catch {
        global.prefix = /^[.!]/
    }
}

export async function handler(chatUpdate) {
    this.msgqueque = this.msgqueque || []
    this.uptime = this.uptime || Date.now()
    if (!chatUpdate) return

    let m = chatUpdate.messages[chatUpdate.messages.length - 1]
    if (!m) return
    
    this.pushMessage(chatUpdate.messages).catch(console.error)
    m = smsg(this, m)
    
    // FIX BOTTONI E MESSAGGI INTERATTIVI
    let _text = ''
    try {
        _text = m.message?.conversation || 
                m.message?.extendedTextMessage?.text || 
                m.message?.buttonsResponseMessage?.selectedButtonId || 
                m.message?.listResponseMessage?.singleSelectReply?.selectedRowId || 
                m.message?.templateButtonReplyMessage?.selectedId || 
                (m.message?.interactiveResponseMessage ? JSON.parse(m.message.interactiveResponseMessage.nativeFlowResponseMessage.paramsJson).id : '') || ''
    } catch (e) { _text = '' }
    
    if (_text) m.text = _text

    if (!m || !m.key || !m.chat || !m.sender) return
    if (m.isBaileys) return

    if (!global.db.data) await global.loadDatabase()
    
    const normalizedSender = this.decodeJid(m.sender)
    const user = global.db.data.users[normalizedSender] || (global.db.data.users[normalizedSender] = { ...defuser, name: m.pushName || '?' })
    const chat = chatz(m.chat)
    const settings = global.db.data.settings?.[this.user.jid] || (global.db.data.settings[this.user.jid] = { anticall: true, status: 0 })
    
    // Applica il prefisso corretto
    applyPrefixFromSettings(settings)

    let isSam = global.owner.some(([num]) => num + '@s.whatsapp.net' === normalizedSender)
    let isOwner = isSam || m.fromMe
    let isAdmin = false, isBotAdmin = false
    
    if (m.isGroup) {
        let groupMetadata = global.groupCache.get(m.chat) || await fetchGroupMetadataWithRetry(this, m.chat)
        if (groupMetadata) {
            const participants = groupMetadata.participants
            isAdmin = participants.some(u => this.decodeJid(u.id) === normalizedSender && u.admin)
            isBotAdmin = participants.some(u => this.decodeJid(u.id) === this.decodeJid(this.user.jid) && u.admin)
        }
    }

    // BLOCCHI MODO ADMIN/CREATORE
    if (chat.modoadmin && !isOwner && !isAdmin) return 
    if (settings.soloCreatore && !isSam) return

    // ESECUZIONE PLUGIN
    let usedPrefix
    let _prefix = global.prefix
    let match = _prefix.exec(m.text)

    if (match) {
        usedPrefix = match[0]
        let noPrefix = m.text.replace(usedPrefix, '').trim()
        let [command, ...args] = noPrefix.split(/\s+/).filter(v => v)
        command = command?.toLowerCase() || ''
        let _args = noPrefix.split(/\s+/).slice(1)
        let text = _args.join(' ')

        for (let name in global.plugins) {
            let plugin = global.plugins[name]
            if (!plugin) continue
            
            let isAccept = Array.isArray(plugin.command) ? plugin.command.includes(command) : plugin.command === command
            
            if (isAccept) {
                m.isCommand = true
                
                // Check dei permessi con i tuoi messaggi personalizzati
                if (plugin.sam && !isSam) return global.dfail('sam', m, this)
                if (plugin.owner && !isOwner) return global.dfail('owner', m, this)
                if (plugin.group && !m.isGroup) return global.dfail('group', m, this)
                if (plugin.admin && !isAdmin) return global.dfail('admin', m, this)
                if (plugin.botAdmin && !isBotAdmin) return global.dfail('botAdmin', m, this)

                try {
                    await plugin.call(this, m, {
                        conn: this, args, text, command, usedPrefix,
                        isSam, isOwner, isAdmin, isBotAdmin
                    })
                    // Gestione economia
                    if (plugin.euro) user.euro -= plugin.euro
                } catch (e) {
                    console.error(e)
                    m.reply('『 ⚠️ 』 Errore interno nel comando.')
                }
                break
            }
        }
    } else {
        // Guadagno Exp per messaggi normali
        if (!m.fromMe && chat.autolevelup) {
            user.exp += 1
            if (canLevelUp(user.level, user.exp, global.multiplier)) user.level++
        }
    }

    // Stampa nel terminale (se abilitato)
    try {
        const printer = await getPrintModule()
        if (printer?.default) await printer.default(m, this)
    } catch {}
}

global.dfail = async (type, m, conn) => {
    const msg = {
        sam:      '⊹ ࣪ ˖ ✦ ━━ 𝐀𝐂𝐂𝐄𝐒𝐒𝐎 𝐍𝐄𝐆𝐀𝐓𝐎 ━━ ✦ ˖ ࣪ ⊹\n\n👑 *𝐂𝐎𝐌𝐀𝐍𝐃𝐎 𝐀𝐒𝐒𝐎𝐋𝐔𝐓𝐎*\n⟡ _Solo Giuse può impartire questo ordine._',
        owner:    '⊹ ࣪ ˖ ✦ ━━ 𝐀𝐂𝐂𝐄𝐒𝐒𝐎 𝐍𝐄𝐆𝐀𝐓𝐎 ━━ ✦ ˖ ࣪ ⊹\n\n🛡️ *𝐒𝐎𝐋𝐎 𝐎𝐖𝐍𝐄𝐑*\n⟡ _Non sei degno. Solo gli Owner possono procedere._',
        group:    '⊹ ࣪ ˖ ✦ ━━ 𝐀𝐂𝐂𝐄𝐒𝐒𝐎 𝐍𝐄𝐆𝐀𝐓𝐎 ━━ ✦ ˖ ࣪ ⊹\n\n👥 *𝐒𝐎𝐋𝐎 𝐆𝐑𝐔𝐏𝐏𝐈*\n⟡ _Questa magia può essere evocata solo nei gruppi._',
        admin:    '⊹ ࣪ ˖ ✦ ━━ 𝐀𝐂𝐂𝐄𝐒𝐒𝐎 𝐍𝐄𝐆𝐀𝐓𝐎 ━━ ✦ ˖ ࣪ ⊹\n\n🛠️ *𝐒𝐎𝐋𝐎 𝐀𝐃𝐌𝐈𝐍*\n⟡ _Comando riservato agli Amministratori._',
        botAdmin: '⊹ ࣪ ˖ ✦ ━━ 𝐄 𝐑 𝐑 𝐎 𝐑 𝐄 ━━ ✦ ˖ ࣪ ⊹\n\n🤖 *𝐁𝐎𝐓 𝐍𝐎𝐍 𝐀𝐃𝐌𝐈𝐍*\n⟡ _Devi prima farmi Admin per permettermi di agire._'
    }[type]
    if (msg) return conn.sendMessage(m.chat, { text: msg + '\n\n✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦' }, { quoted: m })
}

let file = fileURLToPath(import.meta.url)
watchFile(file, () => console.log(chalk.bgHex('#3b0d95')(chalk.white.bold("File: 'handler.js' Aggiornato"))))
