import { smsg } from './lib/simple.js'
import { format } from 'util'
import { fileURLToPath } from 'url'
import path, { join } from 'path'
import { watchFile, unwatchFile, readdirSync } from 'fs'
import chalk from 'chalk'
import NodeCache from 'node-cache'
import { getAggregateVotesInPollMessage } from '@realvare/baileys'

global.ignoredUsersGlobal = new Set()
global.ignoredUsersGroup = {}
global.groupSpam = {}

if (!global.groupCache) global.groupCache = new NodeCache({ stdTTL: 5 * 60, useClones: false })
if (!global.jidCache) global.jidCache = new NodeCache({ stdTTL: 900, useClones: false })
if (!global.nameCache) global.nameCache = new NodeCache({ stdTTL: 900, useClones: false });

export const fetchMetadata = async (conn, chatId) => await conn.groupMetadata(chatId)

const fetchGroupMetadataWithRetry = async (conn, chatId, retries = 3, delay = 1000) => {
    for (let i = 0; i < retries; i++) {
        try {
            return await conn.groupMetadata(chatId);
        } catch (e) {
            if (i === retries - 1) return null;
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
}

// 🛡️ SCUDO PER OWNER: Serve per capire sempre se sei tu (Ignorando il multi-dispositivo)
const getPureNum = (id) => String(id || '').split('@')[0].split(':')[0].replace(/[^0-9]/g, '');

export async function handler(chatUpdate) {
    this.msgqueque = this.msgqueque || []
    this.uptime = this.uptime || Date.now()
    if (!chatUpdate) return
    this.pushMessage(chatUpdate.messages).catch(console.error)
    
    let m = chatUpdate.messages[chatUpdate.messages.length - 1]
    if (!m) return

    if (m.message?.protocolMessage?.type === 'MESSAGE_EDIT') {
        const key = m.message.protocolMessage.key;
        const editedMessage = m.message.protocolMessage.editedMessage;
        m.key = key;
        m.message = editedMessage;
        m.text = editedMessage.conversation || editedMessage.extendedTextMessage?.text || '';
        m.mtype = Object.keys(editedMessage)[0];
    }

    m = smsg(this, m, global.store)
    if (!m || !m.key || !m.chat || !m.sender) return
    if (m.isBaileys) return

    if (m.key) {
        m.key.remoteJid = this.decodeJid(m.key.remoteJid)
        if (m.key.participant) m.key.participant = this.decodeJid(m.key.participant)
    }

    if (!global.db.data) await global.loadDatabase()

    let user = null
    let chat = null
    let usedPrefix = null
    let normalizedSender = null
    let normalizedBot = null

    try {
        normalizedSender = this.decodeJid(m.sender)
        normalizedBot = this.decodeJid(this.user.jid)
        if (!normalizedSender) return;

        user = global.db.data.users[normalizedSender] || (global.db.data.users[normalizedSender] = {
            exp: 0, euro: 10, muto: false, registered: false, name: m.pushName || '?', level: 0, messages: 0
        })
        chat = global.db.data.chats[m.chat] || (global.db.data.chats[m.chat] = {
            modoadmin: false, autolevelup: false, reaction: false, antispam: false, users: {}
        })
        let settings = global.db.data.settings[this.user.jid] || (global.db.data.settings[this.user.jid] = {
            anticall: true, soloCreatore: false, status: 0
        })

        // Prefix
        try {
            const defaultPrefixChars = (global.prefisso || '.!') 
            const chars = (settings?.multiprefix === true && settings?.prefix) ? settings.prefix : defaultPrefixChars
            global.prefix = new RegExp('^[' + String(chars).replace(/[|\\{}()[\]^$+*?.\-\^]/g, '\\$&') + ']')
        } catch { global.prefix = /^[.!]/ }

        // =======================================================
        // 👑 IDENTITÀ OWNER BLINDATE LEGAM OS
        // =======================================================
        let pureSender = getPureNum(normalizedSender);
        let isSam = (global.sam || []).map(getPureNum).includes(pureSender);
        let isOwner = isSam || m.fromMe || (global.owner || []).some(o => getPureNum(o[0]) === pureSender);
        let isMods = isOwner || (global.mods || []).map(getPureNum).includes(pureSender);
        let isPrems = isOwner || (global.prems || []).map(getPureNum).includes(pureSender);

        let groupMetadata = m.isGroup ? global.groupCache.get(m.chat) : null
        let participants = null
        let normalizedParticipants = null
        let isBotAdmin = false
        let isAdmin = false

        // =======================================================
        // 🤖 MOTORE INFALLIBILE LID/JID DEL TUO AMICO
        // =======================================================
        if (m.isGroup) {
            if (!groupMetadata) {
                groupMetadata = await fetchGroupMetadataWithRetry(this, m.chat)
                if (groupMetadata) {
                    groupMetadata.fetchTime = Date.now()
                    global.groupCache.set(m.chat, groupMetadata, { ttl: 300 })
                }
            }
            if (groupMetadata) {
                participants = groupMetadata.participants
                normalizedParticipants = participants.map(u => {
                    const normalizedId = this.decodeJid(u.id)
                    return { ...u, id: normalizedId, jid: u.jid || normalizedId }
                })

                // Capire se TU sei Admin (Controlla ID, JID e LID)
                isAdmin = participants.some(u => {
                    const participantIds = [
                        this.decodeJid(u.id),
                        u.jid ? this.decodeJid(u.jid) : null,
                        u.lid ? this.decodeJid(u.lid) : null
                    ].filter(Boolean)
                    const isMatch = participantIds.includes(normalizedSender)
                    return isMatch && (u.admin === 'admin' || u.admin === 'superadmin' || u.isAdmin === true || u.admin === true)
                })

                // Capire se IL BOT è Admin (Controlla ID, JID, LID e Owner del gruppo)
                const normalizedOwner = groupMetadata.owner ? this.decodeJid(groupMetadata.owner) : null
                const normalizedOwnerLid = groupMetadata.ownerLid ? this.decodeJid(groupMetadata.ownerLid) : null

                isBotAdmin = participants.some(u => {
                    const participantIds = [
                        this.decodeJid(u.id),
                        u.jid ? this.decodeJid(u.jid) : null,
                        u.lid ? this.decodeJid(u.lid) : null
                    ].filter(Boolean)
                    const isMatch = participantIds.includes(normalizedBot)
                    return isMatch && (u.admin === 'admin' || u.admin === 'superadmin' || u.isAdmin === true || u.admin === true)
                }) || (normalizedBot === normalizedOwner || normalizedBot === normalizedOwnerLid)
            }
        }

        // God Mode: Owner scavalca l'essere admin per alcuni comandi.
        if (isOwner) isAdmin = true;

        if (chat.modoadmin && !isOwner && !isMods && !isAdmin) return 
        if (settings.soloCreatore && !isSam) return

        const ___dirname = join(path.dirname(fileURLToPath(import.meta.url)), './plugins')
        for (let name in global.plugins) {
            let plugin = global.plugins[name]
            if (!plugin || typeof plugin !== 'function') continue
            
            const str2Regex = str => str.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&')
            let _prefix = plugin.customPrefix || global.prefix || '.'
            let match = (_prefix instanceof RegExp ? [[_prefix.exec(m.text), _prefix]] :
                Array.isArray(_prefix) ? _prefix.map(p => [p instanceof RegExp ? p : new RegExp(str2Regex(p)).exec(m.text), p]) :
                typeof _prefix === 'string' ? [[new RegExp(str2Regex(_prefix)).exec(m.text), _prefix]] :
                [[[], new RegExp]]).find(p => p[1])

            if (!match || !match[0]) continue

            usedPrefix = (match[0] || '')[0]
            if (usedPrefix) {
                let noPrefix = m.text.replace(usedPrefix, '').trim()
                let [command, ...args] = noPrefix.split(/\s+/).filter(v => v)
                command = command?.toLowerCase() || ''
                let text = args.join(' ')
                let fail = plugin.fail || global.dfail

                let isAccept = plugin.command instanceof RegExp ? plugin.command.test(command) :
                    Array.isArray(plugin.command) ? plugin.command.some(cmd => cmd instanceof RegExp ? cmd.test(command) : cmd === command) :
                    typeof plugin.command === 'string' ? plugin.command === command : false

                if (!isAccept) continue

                // CONTROLLO LIVE SE MANCA IL PERMESSO COME IL TUO AMICO
                if (m.isGroup && (plugin.admin || plugin.botAdmin)) {
                    const freshMetadata = global.groupCache.get(m.chat) || await fetchGroupMetadataWithRetry(this, m.chat)
                    if (freshMetadata) {
                        freshMetadata.fetchTime = Date.now()
                        global.groupCache.set(m.chat, freshMetadata, { ttl: 300 })
                        participants = freshMetadata.participants

                        isAdmin = participants.some(u => {
                            const participantIds = [this.decodeJid(u.id), u.jid ? this.decodeJid(u.jid) : null, u.lid ? this.decodeJid(u.lid) : null].filter(Boolean)
                            return participantIds.includes(normalizedSender) && (u.admin === 'admin' || u.admin === 'superadmin' || u.isAdmin || u.admin)
                        })
                        if (isOwner) isAdmin = true;

                        isBotAdmin = participants.some(u => {
                            const participantIds = [this.decodeJid(u.id), u.jid ? this.decodeJid(u.jid) : null, u.lid ? this.decodeJid(u.lid) : null].filter(Boolean)
                            return participantIds.includes(normalizedBot) && (u.admin === 'admin' || u.admin === 'superadmin' || u.isAdmin || u.admin)
                        })
                    }
                }

                m.plugin = name
                m.isCommand = true

                // 🛡️ CONTROLLO PERMESSI DEL PLUGIN
                if (plugin.sam && !isSam) { fail('sam', m, this); continue }
                if (plugin.owner && !isOwner) { fail('owner', m, this); continue }
                if (plugin.mods && !isMods) { fail('mods', m, this); continue } 
                if (plugin.premium && !isPrems) { fail('premium', m, this); continue } 
                if (plugin.group && !m.isGroup) { fail('group', m, this); continue }
                if (plugin.admin && !isAdmin) { fail('admin', m, this); continue }
                
                // Questo adesso funzionerà SEMPRE.
                if (plugin.botAdmin && !isBotAdmin) { fail('botAdmin', m, this); continue }

                try {
                    await plugin.call(this, m, {
                        match, usedPrefix, noPrefix, args, command, text, conn: this, participants,
                        isSam, isOwner, isMods, isAdmin, isBotAdmin, isPrems
                    })
                    if (plugin.euro) user.euro -= plugin.euro
                } catch (e) {
                    console.error(`[ERRORE] Plugin ${name}:`, e)
                    m.reply(`『 ⚠️ 』 \`Errore:\`\n${String(e)}`)
                }
                break 
            }
        }
    } catch (e) {
        console.error(`[ERRORE GLOBALE] handler.js:`, e)
    } finally {
        try {
            if (!global.opts['noprint'] && m) await (await import(`./lib/print.js`)).default(m, this)
        } catch (e) {}
    }
}

// MESSAGGI LEGAM OS UFFICIALI
global.dfail = async (type, m, conn) => {
    const nome = m.pushName || 'utente'
    const etarandom = Math.floor(Math.random() * 21) + 13
    const msg = {
        sam: '⊹ ࣪ ˖ ✦ ━━ 𝐀𝐂𝐂𝐄𝐒𝐒𝐎 𝐍𝐄𝐆𝐀𝐓𝐎 ━━ ✦ ˖ ࣪ ⊹\n\n👑 *𝐂𝐎𝐌𝐀𝐍𝐃𝐎 𝐀𝐒𝐒𝐎𝐋𝐔𝐓𝐎*\n⟡ _Solo Giuse può impartire questo ordine._',
        owner: '⊹ ࣪ ˖ ✦ ━━ 𝐀𝐂𝐂𝐄𝐒𝐒𝐎 𝐍𝐄𝐆𝐀𝐓𝐎 ━━ ✦ ˖ ࣪ ⊹\n\n🛡️ *𝐒𝐎𝐋𝐎 𝐎𝐖𝐍𝐄𝐑*\n⟡ _Non sei degno. Solo gli Owner possono procedere._',
        mods: '⊹ ࣪ ˖ ✦ ━━ 𝐀𝐂𝐂𝐄𝐒𝐒𝐎 𝐍𝐄𝐆𝐀𝐓𝐎 ━━ ✦ ˖ ࣪ ⊹\n\n⚙️ *𝐒𝐎𝐋𝐎 𝐌𝐎𝐃𝐄𝐑𝐀𝐓𝐎𝐑𝐈*\n⟡ _Comando riservato ai Moderatori di Legam OS._',
        premium: '⊹ ࣪ ˖ ✦ ━━ 𝐀𝐂𝐂𝐄𝐒𝐒𝐎 𝐍𝐄𝐆𝐀𝐓𝐎 ━━ ✦ ˖ ࣪ ⊹\n\n💎 *𝐔𝐓𝐄𝐍𝐓𝐄 𝐏𝐑𝐄𝐌𝐈𝐔𝐌*\n⟡ _Sistema bloccato. Richiesto lo status Premium._',
        group: '⊹ ࣪ ˖ ✦ ━━ 𝐄 𝐑 𝐑 𝐎 𝐑 𝐄 ━━ ✦ ˖ ࣪ ⊹\n\n👥 *𝐒𝐎𝐋𝐎 𝐆𝐑𝐔𝐏𝐏𝐈*\n⟡ _Questa magia può essere evocata solo nei gruppi._',
        private: '⊹ ࣪ ˖ ✦ ━━ 𝐄 𝐑 𝐑 𝐎 𝐑 𝐄 ━━ ✦ ˖ ࣪ ⊹\n\n📩 *𝐒𝐎𝐋𝐎 𝐏𝐑𝐈𝐕𝐀𝐓𝐎*\n⟡ _Comando eseguibile unicamente in chat privata._',
        admin: '⊹ ࣪ ˖ ✦ ━━ 𝐀𝐂𝐂𝐄𝐒𝐒𝐎 𝐍𝐄𝐆𝐀𝐓𝐎 ━━ ✦ ˖ ࣪ ⊹\n\n🛠️ *𝐒𝐎𝐋𝐎 𝐀𝐃𝐌𝐈𝐍*\n⟡ _Comando riservato agli Amministratori del gruppo._',
        botAdmin: '⊹ ࣪ ˖ ✦ ━━ 𝐄 𝐑 𝐑 𝐎 𝐑 𝐄 ━━ ✦ ˖ ࣪ ⊹\n\n🤖 *𝐁𝐎𝐓 𝐍𝐎𝐍 𝐀𝐃𝐌𝐈𝐍*\n⟡ _Devi prima farmi Admin per permettermi di agire._',
        unreg: `⊹ ࣪ ˖ ✦ ━━ 𝐒 𝐈 𝐒 𝐓 𝐄 𝐌 𝐀 ━━ ✦ ˖ ࣪ ⊹\n\n📛 *𝐍𝐎𝐍 𝐑𝐈𝐂𝐎𝐍𝐎𝐒𝐂𝐈𝐔𝐓𝐎*\n⟡ _Utente non presente nel database di Legam OS._\n⟡ _Effettua la registrazione per sbloccare il Core._\n\n> \`Formato:\` .reg nome età\n> \`Esempio:\` .reg ${nome} ${etarandom}`,
        disabled: '⊹ ࣪ ˖ ✦ ━━ 𝐄 𝐑 𝐑 𝐎 𝐑 𝐄 ━━ ✦ ˖ ࣪ ⊹\n\n🚫 *𝐃𝐈𝐒𝐀𝐁𝐈𝐋𝐈𝐓𝐀𝐓𝐎*\n⟡ _Questo comando è in manutenzione o disattivato._'
    }[type]
    if (msg) return conn.sendMessage(m.chat, { text: msg + '\n\n✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦' }, { quoted: m })
}

let file = fileURLToPath(import.meta.url)
watchFile(file, () => {
    console.log(chalk.bgHex('#3b0d95')(chalk.white.bold("File: 'handler.js' Aggiornato")))
})


