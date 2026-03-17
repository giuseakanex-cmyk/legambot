import { smsg } from './lib/simple.js'
import { format } from 'util'
import { fileURLToPath } from 'url'
import path, { join } from 'path'
import { watchFile, readdirSync } from 'fs'
import chalk from 'chalk'
import NodeCache from 'node-cache'

global.ignoredUsersGlobal = new Set()
global.ignoredUsersGroup = {}
global.groupSpam = {}

if (!global.groupCache) global.groupCache = new NodeCache({ stdTTL: 5 * 60, useClones: false })
if (!global.jidCache) global.jidCache = new NodeCache({ stdTTL: 900, useClones: false })
if (!global.nameCache) global.nameCache = new NodeCache({ stdTTL: 900, useClones: false });

let PRINT_MODULE = null
let PRINT_MODULE_PROMISE = null
async function getPrintModule() {
    if (PRINT_MODULE) return PRINT_MODULE
    if (!PRINT_MODULE_PROMISE) {
        PRINT_MODULE_PROMISE = import('./lib/print.js').then(m => (PRINT_MODULE = m)).catch(() => null).finally(() => { PRINT_MODULE_PROMISE = null })
    }
    return PRINT_MODULE_PROMISE
}

const fetchGroupMetadataWithRetry = async (conn, chatId, retries = 3, delay = 1000) => {
    const cached = global.groupCache.get(chatId);
    if (cached && Date.now() - (cached.fetchTime || 0) < 60000) return cached;
    for (let i = 0; i < retries; i++) {
        try {
            const metadata = await conn.groupMetadata(chatId);
            if (metadata) {
                metadata.fetchTime = Date.now();
                global.groupCache.set(chatId, metadata, { ttl: 300 });
                return metadata;
            }
        } catch (e) {
            if (i === retries - 1) return null;
            await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
        }
    }
    return null;
}

const defchat = { modoadmin: false, autolevelup: false, reaction: false, antispam: false }
const defuser = { exp: 0, euro: 10, muto: false, registered: false, name: '?', level: 0 }

function chatz(chatId) {
    if (!global.db?.data) return null
    if (!global.db.data.chats) global.db.data.chats = {}
    const existing = global.db.data.chats[chatId]
    global.db.data.chats[chatId] = Object.assign({}, defchat, existing || {})
    return global.db.data.chats[chatId]
}

const escapeRegex = (str) => String(str).replace(/[|\\{}()[\]^$+*?.\-\^]/g, '\\$&')

function applyPrefixFromSettings(settings) {
    try {
        const defaultPrefixChars = (global.prefisso || '.!') 
        const chars = (settings?.multiprefix === true && settings?.prefix) ? settings.prefix : defaultPrefixChars
        global.prefix = new RegExp('^[' + escapeRegex(chars) + ']')
    } catch {
        global.prefix = /^[.!]/
    }
}

// 🛡️ SCUDO NUMERICO (Per i permessi)
const cleanNum = (num) => String(num || '').replace(/[^0-9]/g, '')

export async function handler(chatUpdate) {
    this.msgqueque = this.msgqueque || []
    this.uptime = this.uptime || Date.now()
    if (!chatUpdate) return

    let m = chatUpdate.messages[chatUpdate.messages.length - 1]
    if (!m) return
    
    try { m = smsg(this, m) } catch (e) { return }
    
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
    
    applyPrefixFromSettings(settings)

    // =======================================================
    // 👑 IL SISTEMA IBRIDO LEGAM OS (Permessi Owner/Mod)
    // =======================================================
    let pureSender = String(m.sender).split('@')[0].split(':')[0]
    
    let isSam = (global.sam || []).map(cleanNum).includes(pureSender)
    let isOwner = isSam || m.fromMe || (global.owner || []).map(o => cleanNum(o[0])).includes(pureSender)
    let isMods = isOwner || (global.mods || []).map(cleanNum).includes(pureSender)
    let isPrems = isOwner || (global.prems || []).map(cleanNum).includes(pureSender)

    let isAdmin = false, isBotAdmin = false
    let participants = []
    
    // =======================================================
    // 🤖 FIX DEFINITIVO BOT ADMIN
    // =======================================================
    // Estraggo l'ID puro del bot, senza @ e senza :
    const pureBotID = String(this.user?.id || this.user?.jid).split('@')[0].split(':')[0]

    if (m.isGroup) {
        let groupMetadata = global.groupCache.get(m.chat) || await fetchGroupMetadataWithRetry(this, m.chat)
        if (groupMetadata) {
            participants = groupMetadata.participants
            
            // Confronto INFALLIBILE: taglia via tutto e confronta solo i numeri puri per te e per il bot
            isAdmin = participants.some(u => String(u.id).split('@')[0].split(':')[0] === pureSender && (u.admin === 'admin' || u.admin === 'superadmin'))
            isBotAdmin = participants.some(u => String(u.id).split('@')[0].split(':')[0] === pureBotID && (u.admin === 'admin' || u.admin === 'superadmin'))
        }
    }

    if (chat.modoadmin && !isOwner && !isMods && !isAdmin) return 
    if (settings.soloCreatore && !isSam) return

    for (let name in global.plugins) {
        let plugin = global.plugins[name]
        if (!plugin || typeof plugin !== 'function') continue
        
        let _prefix = plugin.customPrefix || global.prefix || '.'
        let match = (_prefix instanceof RegExp ? [[_prefix.exec(m.text), _prefix]] :
            Array.isArray(_prefix) ? _prefix.map(p => [p instanceof RegExp ? p : new RegExp(escapeRegex(p)).exec(m.text), p]) :
            typeof _prefix === 'string' ? [[new RegExp(escapeRegex(_prefix)).exec(m.text), _prefix]] :
            [[[], new RegExp]]).find(p => p[1])

        if (!match || !match[0]) continue

        let usedPrefix = (match[0] || '')[0]
        let noPrefix = m.text.replace(usedPrefix, '').trim()
        let [command, ...args] = noPrefix.split(/\s+/).filter(v => v)
        command = command?.toLowerCase() || ''
        let text = args.join(' ')

        let fail = plugin.fail || global.dfail

        let isAccept = plugin.command instanceof RegExp ? plugin.command.test(command) :
                       Array.isArray(plugin.command) ? plugin.command.some(cmd => cmd instanceof RegExp ? cmd.test(command) : cmd === command) :
                       typeof plugin.command === 'string' ? plugin.command === command : false

        if (!isAccept) continue

        m.plugin = name
        m.isCommand = true

        // 🛡️ CONTROLLO PERMESSI DEL PLUGIN
        if (plugin.sam && !isSam) { fail('sam', m, this); continue }
        if (plugin.owner && !isOwner) { fail('owner', m, this); continue }
        if (plugin.mods && !isMods) { fail('mods', m, this); continue } 
        if (plugin.group && !m.isGroup) { fail('group', m, this); continue }
        if (plugin.admin && !isAdmin) { fail('admin', m, this); continue }
        
        // Questo non fallirà mai più se il bot ha la targhetta admin su WhatsApp!
        if (plugin.botAdmin && !isBotAdmin) { fail('botAdmin', m, this); continue }

        try {
            await plugin.call(this, m, {
                match, usedPrefix, noPrefix, args, command, text, conn: this, participants,
                isSam, isOwner, isMods, isAdmin, isBotAdmin, isPrems
            })
            if (plugin.euro) user.euro -= plugin.euro
        } catch (e) {
            console.error(`[ERRORE] Plugin ${name}:`, e)
            m.reply('『 ⚠️ 』 Errore interno nel comando.')
        }
        break 
    }

    try {
        const printer = await getPrintModule()
        if (printer?.default) await printer.default(m, this)
    } catch {}
}

global.dfail = async (type, m, conn) => {
    const nome = m.pushName || 'utente'
    const etarandom = Math.floor(Math.random() * 21) + 13
    const msg = {
        sam: '⊹ ࣪ ˖ ✦ ━━ 𝐀𝐂𝐂𝐄𝐒𝐒𝐎 𝐍𝐄𝐆𝐀𝐓𝐎 ━━ ✦ ˖ ࣪ ⊹\n\n👑 *𝐂𝐎𝐌𝐀𝐍𝐃𝐎 𝐀𝐒𝐒𝐎𝐋𝐔𝐓𝐎*\n⟡ _Solo il Creatore può impartire questo ordine._',
        owner: '⊹ ࣪ ˖ ✦ ━━ 𝐀𝐂𝐂𝐄𝐒𝐒𝐎 𝐍𝐄𝐆𝐀𝐓𝐎 ━━ ✦ ˖ ࣪ ⊹\n\n🛡️ *𝐒𝐎𝐋𝐎 𝐎𝐖𝐍𝐄𝐑*\n⟡ _Non sei degno. Solo gli Owner possono procedere._',
        mods: '⊹ ࣪ ˖ ✦ ━━ 𝐀𝐂𝐂𝐄𝐒𝐒𝐎 𝐍𝐄𝐆𝐀𝐓𝐎 ━━ ✦ ˖ ࣪ ⊹\n\n⚙️ *𝐒𝐎𝐋𝐎 𝐌𝐎𝐃𝐄𝐑𝐀𝐓𝐎𝐑𝐈*\n⟡ _Comando riservato ai Moderatori di Legam OS._',
        premium: '⊹ ࣪ ˖ ✦ ━━ 𝐀𝐂𝐂𝐄𝐒𝐒𝐎 𝐍𝐄𝐆𝐀𝐓𝐎 ━━ ✦ ˖ ࣪ ⊹\n\n💎 *𝐔𝐓𝐄𝐍𝐓𝐄 𝐏𝐑𝐄𝐌𝐈𝐔𝐌*\n⟡ _Sistema bloccato. Richiesto lo status Premium._',
        group: '⊹ ࣪ ˖ ✦ ━━ 𝐄 𝐑 𝐑 𝐎 𝐑 𝐄 ━━ ✦ ˖ ࣪ ⊹\n\n👥 *𝐒𝐎𝐋𝐎 𝐆𝐑𝐔𝐏𝐏𝐈*\n⟡ _Questa magia può essere evocata solo nei gruppi._',
        private: '⊹ ࣪ ˖ ✦ ━━ 𝐄 𝐑 𝐑 𝐎 𝐑 𝐄 ━━ ✦ ˖ ࣪ ⊹\n\n📩 *𝐒𝐎𝐋𝐎 𝐏𝐑𝐈𝐕𝐀𝐓𝐎*\n⟡ _Comando eseguibile unicamente in chat privata._',
        admin: '⊹ ࣪ ˖ ✦ ━━ 𝐀𝐂𝐂𝐄𝐒𝐒𝐎 𝐍𝐄𝐆𝐀𝐓𝐎 ━━ ✦ ˖ ࣪ ⊹\n\n🛠️ *𝐒𝐎𝐋𝐎 𝐀𝐃𝐌𝐈𝐍*\n⟡ _Comando riservato agli Amministratori del gruppo._',
        botAdmin: '⊹ ࣪ ˖ ✦ ━━ 𝐄 𝐑 𝐑 𝐎 𝐑 𝐄 ━━ ✦ ˖ ࣪ ⊹\n\n🤖 *𝐁𝐎𝐓 𝐍𝐎𝐍 𝐀𝐃𝐌𝐈𝐍*\n⟡ _Devi prima nominarmi Amministratore per agire._',
        unreg: `⊹ ࣪ ˖ ✦ ━━ 𝐒 𝐈 𝐒 𝐓 𝐄 𝐌 𝐀 ━━ ✦ ˖ ࣪ ⊹\n\n📛 *𝐍𝐎𝐍 𝐑𝐈𝐂𝐎𝐍𝐎𝐒𝐂𝐈𝐔𝐓𝐎*\n⟡ _Utente non presente nel database di Legam OS._\n⟡ _Effettua la registrazione per sbloccare il Core._\n\n> \`Formato:\` .reg nome età\n> \`Esempio:\` .reg ${nome} ${etarandom}`,
        disabled: '⊹ ࣪ ˖ ✦ ━━ 𝐄 𝐑 𝐑 𝐎 𝐑 𝐄 ━━ ✦ ˖ ࣪ ⊹\n\n🚫 *𝐃𝐈𝐒𝐀𝐁𝐈𝐋𝐈𝐓𝐀𝐓𝐎*\n⟡ _Questo comando è in manutenzione o disattivato._'
    }[type]
    
    if (msg) return conn.sendMessage(m.chat, { text: msg + '\n\n✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦' }, { quoted: m })
}

let file = fileURLToPath(import.meta.url)
watchFile(file, () => console.log(chalk.bgHex('#3b0d95')(chalk.white.bold("File: 'handler.js' Aggiornato"))))


