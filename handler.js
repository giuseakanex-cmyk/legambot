import { smsg } from './lib/simple.js'
import { format } from 'util'
import { fileURLToPath } from 'url'
import path, { join } from 'path'
import { unwatchFile, watchFile } from 'fs'
import chalk from 'chalk'
import NodeCache from 'node-cache'
import { getAggregateVotesInPollMessage, toJid } from '@realvare/baileys'

global.ignoredUsersGlobal = new Set()
global.ignoredUsersGroup = {}
global.groupSpam = {}

if (!global.groupCache) global.groupCache = new NodeCache({ stdTTL: 5 * 60, useClones: false })
if (!global.jidCache) global.jidCache = new NodeCache({ stdTTL: 600, useClones: false })
if (!global.nameCache) global.nameCache = new NodeCache({ stdTTL: 600, useClones: false });

export const fetchMetadata = async (conn, chatId) => await conn.groupMetadata(chatId)

const fetchGroupMetadataWithRetry = async (conn, chatId, retries = 3, delay = 1000) => {
    for (let i = 0; i < retries; i++) {
        try { return await conn.groupMetadata(chatId); } 
        catch (e) {
            if (i === retries - 1) throw e;
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
}

if (!global.cacheListenersSet) {
    const conn = global.conn
    if (conn) {
        conn.ev.on('groups.update', async (updates) => {
            for (const update of updates) {
                if (!update || !update.id) continue;
                try {
                    const metadata = await fetchGroupMetadataWithRetry(conn, update.id)
                    if (!metadata) continue;
                    global.groupCache.set(update.id, metadata, { ttl: 300 })
                } catch (e) {}
            }
        })
        global.cacheListenersSet = true
    }
}

if (!global.pollListenerSet) {
    const conn = global.conn
    if (conn) {
        conn.ev.on('messages.update', async (chatUpdate) => {
            for (const { key, update } of chatUpdate) {
                if (update.pollUpdates) {
                    try {
                        const pollCreation = await global.store.getMessage(key)
                        if (pollCreation) await getAggregateVotesInPollMessage({ message: pollCreation, pollUpdates: update.pollUpdates })
                    } catch (e) {}
                }
            }
        })
        global.pollListenerSet = true
    }
}

const isNumber = x => typeof x === 'number' && !isNaN(x)
const delay = ms => isNumber(ms) && new Promise(resolve => setTimeout(resolve, ms))
const responseHandlers = new Map()

function initResponseHandler(conn) {
    if (!conn.waitForResponse) {
        conn.waitForResponse = async (chat, sender, options = {}) => {
            const { timeout = 30000, validResponses = null, onTimeout = null, filter = null } = options
            return new Promise((resolve) => {
                const key = chat + sender
                const timeoutId = setTimeout(() => {
                    responseHandlers.delete(key)
                    if (onTimeout) onTimeout()
                    resolve(null)
                }, timeout)
                responseHandlers.set(key, { resolve, timeoutId, validResponses, filter })
            })
        }
    }
}

global.processedCalls = global.processedCalls || new Map()

export async function participantsUpdate({ id, participants, action }) {
    if (global.db.data.chats[id]?.rileva === false) return
    try {
        let metadata = global.groupCache.get(id) || await fetchMetadata(this, id)
        if (!metadata) return
        global.groupCache.set(id, metadata, { ttl: 300 })
    } catch (e) {}
}

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
    }

    m = smsg(this, m, global.store)
    if (!m || !m.key || !m.chat || !m.sender) return
    
    if (m.key.participant && m.key.participant.includes(':') && m.key.participant.split(':')[1]?.includes('@')) return

    if (m.key) {
        m.key.remoteJid = this.decodeJid(m.key.remoteJid)
        if (m.key.participant) m.key.participant = this.decodeJid(m.key.participant)
    }
    if (!m.key.remoteJid) return
    
    // =======================================================
    // 🔥 FIX BOTTONI: Lettura infallibile dei bottoni e Native Flow
    // =======================================================
    let extractedText = m.message?.conversation || m.message?.extendedTextMessage?.text || '';
    
    if (m.message?.interactiveResponseMessage?.nativeFlowResponseMessage?.paramsJson) {
        try {
            let params = JSON.parse(m.message.interactiveResponseMessage.nativeFlowResponseMessage.paramsJson);
            if (params.id) extractedText = params.id;
        } catch (e) { console.error("Errore lettura JSON bottone", e) }
    } else if (m.message?.templateButtonReplyMessage?.selectedId) {
        extractedText = m.message.templateButtonReplyMessage.selectedId;
    } else if (m.message?.buttonsResponseMessage?.selectedButtonId) {
        extractedText = m.message.buttonsResponseMessage.selectedButtonId;
    } else if (m.message?.listResponseMessage?.singleSelectReply?.selectedRowId) {
        extractedText = m.message.listResponseMessage.singleSelectReply.selectedRowId;
    }

    if (extractedText) {
        m.text = extractedText;
    }
    // =======================================================

    initResponseHandler(this)

    let user = null
    let chat = null
    let usedPrefix = null
    let normalizedSender = null
    let normalizedBot = null

    try {
        if (!global.db.data) await global.loadDatabase()
        m.exp = 0
        m.euro = false
        m.isCommand = false

        normalizedSender = this.decodeJid(m.sender)
        normalizedBot = this.decodeJid(this.user.jid)
        if (!normalizedSender) return;
        
        user = global.db.data.users[normalizedSender] || (global.db.data.users[normalizedSender] = {
            exp: 0, euro: 10, muto: false, registered: false, name: m.pushName || '?',
            age: -1, regTime: -1, banned: false, bank: 0, level: 0, firstTime: Date.now(), spam: 0
        })
        chat = global.db.data.chats[m.chat] || (global.db.data.chats[m.chat] = {
            isBanned: false, welcome: false, goodbye: false, ai: false, vocali: false,
            antiporno: false, antioneview: false, autolevelup: false, antivoip: false,
            rileva: false, modoadmin: false, antiLink: false, antiLink2: false,
            reaction: false, antispam: false, expired: 0, users: {}
        })
        let settings = global.db.data.settings[this.user.jid] || (global.db.data.settings[this.user.jid] = {
            autoread: false, jadibotmd: false, antiPrivate: true, soloCreatore: false, status: 0
        })

        if (m.mtype === 'pollUpdateMessage') return
        if (m.mtype === 'reactionMessage') return
        
        let groupMetadata = m.isGroup ? global.groupCache.get(m.chat) : null
        let participants = null
        let normalizedParticipants = null
        let isBotAdmin = false
        let isAdmin = false
        let isSam = global.owner.some(([num]) => num + '@s.whatsapp.net' === normalizedSender)
        let isROwner = isSam || global.owner.some(([num]) => num + '@s.whatsapp.net' === normalizedSender)
        let isOwner = isROwner || m.fromMe
        let isMods = isOwner || global.mods?.map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(normalizedSender) || false
        let isPrems = isROwner || global.prems?.map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(normalizedSender) || false
        
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
                
                isAdmin = participants.some(u => {
                    const participantIds = [this.decodeJid(u.id), u.jid ? this.decodeJid(u.jid) : null, u.lid ? this.decodeJid(u.lid) : null].filter(Boolean)
                    return participantIds.includes(normalizedSender) && (u.admin === 'admin' || u.admin === 'superadmin' || u.isAdmin === true || u.admin === true)
                })

                isBotAdmin = participants.some(u => {
                    const participantIds = [this.decodeJid(u.id), u.jid ? this.decodeJid(u.jid) : null, u.lid ? this.decodeJid(u.lid) : null].filter(Boolean)
                    return participantIds.includes(normalizedBot) && (u.admin === 'admin' || u.admin === 'superadmin' || u.isAdmin === true || u.admin === true)
                })
            }
        }

        const ___dirname = join(path.dirname(fileURLToPath(import.meta.url)), './plugins')
        for (let name in global.plugins) {
            let plugin = global.plugins[name]
            if (!plugin) continue

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
                args = args || []
                let _args = noPrefix.trim().split` `.slice(1)
                let text = _args.join` `
                command = command?.toLowerCase() || ''
                let fail = plugin.fail || global.dfail
                let isAccept = plugin.command instanceof RegExp ? plugin.command.test(command) :
                    Array.isArray(plugin.command) ? plugin.command.some(cmd => cmd instanceof RegExp ? cmd.test(command) : cmd === command) :
                    typeof plugin.command === 'string' ? plugin.command === command : false

                if (!isAccept) continue

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

                // =======================================================
                // 🔥 IL CANCELLO: CONTROLLI GLOBALI RIPRISTINATI
                // =======================================================
                
                // 1. MODO ADMIN
                if (m.isGroup && chat.modoadmin && !isAdmin && !isOwner && !isROwner && !isPrems) {
                    continue; // Ignora silenziosamente l'utente
                }

                // 2. SOLO CREATORE
                if (settings.soloCreatore && !isROwner && !isOwner) continue;

                // 3. CHAT BANNATA
                if (chat.isBanned && !isROwner && !isOwner) continue;

                // 4. UTENTE BANNATO
                if (user.banned && !isROwner && !isOwner) {
                    if (user.antispam < 2) {
                        await this.sendMessage(m.chat, { text: `🚫 *Sei stato bannato dall'utilizzo del Legam OS.*` }, { quoted: m });
                        user.antispam++;
                    }
                    continue;
                }

                // 5. UTENTE MUTATO
                if (user.muto && !isROwner && !isOwner) {
                    await this.sendMessage(m.chat, { text: `🚫 Non puoi usare i comandi se sei stato mutato!` }, { quoted: m });
                    continue; // Cambiato da "return" a "continue" per chiudere elegantemente l'azione
                }

                // 6. ANTI SPAM
                if (m.isGroup && !isOwner && !isROwner && !isAdmin && chat.antispam) {
                    const groupData = global.groupSpam[m.chat] || (global.groupSpam[m.chat] = { count: 0, firstCommandTimestamp: 0, isSuspended: false });
                    const now = Date.now();
                    if (groupData.isSuspended) continue;

                    if (now - groupData.firstCommandTimestamp > 60000) {
                        groupData.count = 1;
                        groupData.firstCommandTimestamp = now;
                    } else {
                        groupData.count++;
                    }

                    if (groupData.count > 8) {
                        groupData.isSuspended = true;
                        await this.reply(m.chat, `⚠️  \`Anti-spam comandi\`\nRilevati troppi comandi. Attendi 15 secondi prima di riprovare.`, m);
                        setTimeout(() => { delete global.groupSpam[m.chat] }, 15000);
                        continue;
                    }
                }
                // =======================================================

                if (plugin.disabled && !isOwner) { fail('disabled', m, this); continue }

                m.plugin = name
                m.isCommand = true

                if (plugin.sam && !isSam) { fail('sam', m, this); continue }
                if (plugin.owner && !isOwner) { fail('owner', m, this); continue }
                if (plugin.mods && !isMods) { fail('mods', m, this); continue } 
                if (plugin.premium && !isPrems) { fail('premium', m, this); continue } 
                if (plugin.group && !m.isGroup) { fail('group', m, this); continue }
                if (plugin.admin && !isAdmin) { fail('admin', m, this); continue }
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
        console.error(`[ERRORE GLOBALE]`, e)
    } finally {
        if (m && user) {
            user.exp += m.exp || 0
            user.euro -= m.euro * 1 || 0
        }
        let settingsREAD = global.db.data.settings[this.user.jid] || {}
        if ((global.opts['autoread'] || settingsREAD.autoread2) && m) {
            await this.readMessages([m.key])
        }
    }
}

// MESSAGGI LEGAM OS
global.dfail = async (type, m, conn) => {
    const msg = {
        rowner:   '『 𝐋𝐄𝐆𝐀𝐌 𝐎𝐒 — 𝐎𝐖𝐍𝐄𝐑 』\n\n👑 *RANGO INSUFFICIENTE*\n╰➤ *Richiesto:* Owner Fondatore\n\n⚡ _Solo chi ha dato vita al bot può evocare questo potere._',
        owner:    '『 𝐋𝐄𝐆𝐀𝐌 𝐎𝐒 — 𝐀𝐔𝐓𝐇 』\n\n🛡️ *MODALITÀ OWNER*\n╰➤ *Stato:* Accesso Riservato\n\n💎 _Comando sbloccabile solo dagli sviluppatori autorizzati._',
        premium:  '『 𝐋𝐄𝐆𝐀𝐌 𝐎𝐒 — 𝐏𝐑𝐄𝐌𝐈𝐔𝐌 』\n\n💎 *CONTENUTO ESCLUSIVO*\n╰➤ *Vantaggio:* Utente Elite\n\n✨ _Passa a Premium per sbloccare funzioni avanzate e limiti rimossi!_',
        group:    '『 𝐋𝐄𝐆𝐀𝐌 𝐎𝐒 — 𝐋𝐎𝐂𝐀𝐓𝐈𝐎𝐍 』\n\n👥 *RIVELATO ERRORE*\n╰➤ *Ambiente:* Solo Gruppi\n\n📍 _Per favore, esegui questo comando all\'interno di una Community._',
        admin:    '『 𝐋𝐄𝐆𝐀𝐌 𝐎𝐒 — 𝐆𝐑𝐎𝐔𝐏 』\n\n🛠️ *AZIONE ADMIN*\n╰➤ *Requisito:* Amministratore\n\n🚫 _Non hai i gradi necessari per gestire questa operazione._',
        botAdmin: '『 𝐋𝐄𝐆𝐀𝐌 𝐎𝐒 — 𝐏𝐄𝐑𝐌𝐈𝐒𝐒𝐈 』\n\n🤖 *ERRORE DI SISTEMA*\n╰➤ *Problema:* Bot non Admin\n\n💠 _Promuovimi ad Admin per permettermi di agire correttamente._'
    }[type]

    if (msg) {
        conn.reply(m.chat, msg + '\n\n✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦', m).catch(e => console.error('[ERRORE] Errore in dfail:', e))
    }
}

let file = global.__filename(import.meta.url, true)
watchFile(file, async () => { 
    unwatchFile(file)     
    console.log(chalk.bgHex('#3b0d95')(chalk.white.bold("File: 'handler.js' Aggiornato")))
})


