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
                if (!update || !update.id) {
                    continue;
                }
                try {
                    const metadata = await fetchGroupMetadataWithRetry(conn, update.id)
                    if (!metadata) {
                        continue
                    }
                    global.groupCache.set(update.id, metadata, { ttl: 300 })
                    if (!global.db.data) await global.loadDatabase()
                    const chatId = update.id
                    let chat = chatz(chatId)
                    chat.name = metadata.subject
                    try {
                        chat.pfp = await conn.profilePictureUrl(chatId, 'image')
                    } catch {
                        chat.pfp = null
                    }
                    chat.membersCount = metadata.participants.length
                } catch (e) {
                    if (!e.message?.includes('not authorized') && !e.message?.includes('chat not found') && !e.message?.includes('not in group')) {
                        console.error(`[ERRORE] Errore nell'aggiornamento cache su groups.update per ${update.id}:`, e)
                    }
                }
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
                        if (pollCreation) {
                            await getAggregateVotesInPollMessage({
                                message: pollCreation,
                                pollUpdates: update.pollUpdates,
                            })
                        }
                    } catch (e) {
                        console.error('[ERRORE] Errore nel gestire poll update:', e)
                    }
                }
            }
        })
        global.pollListenerSet = true
    }
}

const delay = ms => typeof ms === 'number' && !isNaN(ms) && new Promise(resolve => setTimeout(resolve, ms))
const responseHandlers = new Map()

const defchat = {
    isBanned: false, welcome: false, goodbye: false, ai: false,
    vocali: false, antiporno: false, antiBot: false, antitrava: false,
    antimedia: false, antioneview: false, antitagall: false, autotrascrizione: false,
    autotraduzione: false, autolevelup: false, antivoip: false, rileva: false,
    modoadmin: false, antiLink: false, antiLinkUni: false, antiLink2: false,
    antiLink2_tiktok: false, antiLink2_youtube: false, antiLink2_telegram: false,
    antiLink2_facebook: false, antiLink2_instagram: false, antiLink2_twitter: false,
    antiLink2_discord: false, antiLink2_snapchat: false, antiLink2_linkedin: false,
    antiLink2_twitch: false, antiLink2_reddit: false, antiLink2_onlyfans: false,
    antiLink2_github: false, reaction: false, antispam: false, antisondaggi: false,
    antiparolacce: false, expired: 0, users: {}
}

const defsettings = {
    autoread: false, antiprivato: false, soloCreatore: false, antispambot: false,
    anticall: true, multiprefix: false, registrazioni: false, status: 0
}

const defuser = {
    exp: 0, euro: 10, muto: false, registered: false, name: '?',
    age: -1, regTime: -1, banned: false, bank: 0, level: 0,
    firstTime: 0, spam: 0, messages: 0, callWarn: 0
}

function chatz(chatId) {
    if (!global.db?.data) return null
    if (!global.db.data.chats) global.db.data.chats = {}
    const existing = global.db.data.chats[chatId]
    const base = existing && typeof existing === 'object' ? existing : {}
    global.db.data.chats[chatId] = Object.assign({}, defchat, base)
    return global.db.data.chats[chatId]
}

function settingz(jid) {
    if (!global.db?.data) return null
    if (!global.db.data.settings) global.db.data.settings = {}
    const existing = global.db.data.settings[jid]
    const base = existing && typeof existing === 'object' ? existing : {}
    global.db.data.settings[jid] = Object.assign({}, defsettings, base)
    return global.db.data.settings[jid]
}

const str2Regex = str => str.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&')

function escapeRegex(str) {
    return String(str).replace(/[|\\{}()[\]^$+*?.\-\^]/g, '\\$&')
}

function applyPrefixFromSettings(settings) {
    try {
        const defaultPrefixChars = (global.opts?.prefix || '*/!#$%+£¢€¥^°=¶∆×÷π√✓©®&.\\-.@')
        const defaultSinglePrefix = (typeof global.prefisso === 'string' && global.prefisso.trim()) ? global.prefisso.trim() : '.'
        const raw = typeof settings?.prefix === 'string' ? settings.prefix.trim() : ''

        if (settings?.multiprefix === true) {
            const chars = (raw && raw.length > 1) ? raw : defaultPrefixChars
            global.prefix = new RegExp('^[' + escapeRegex(chars) + ']')
        } else {
            const c = String(raw || defaultSinglePrefix)[0] || '.'
            global.prefix = new RegExp('^' + escapeRegex(c))
        }
    } catch {
    }
}

const ___dirname = join(path.dirname(fileURLToPath(import.meta.url)), './plugins')

function normalizeParticipants(conn, participants) {
    return participants.map(u => {
        const normalizedId = conn.decodeJid(u.id)
        return { ...u, id: normalizedId, jid: u.jid || normalizedId }
    })
}

// 🛡️ FIX ADMIN: Reso infallibile estrando solo i numeri puri
function checkAdminStatus(conn, participants, targetJid) {
    if (!targetJid) return false;
    const cleanTarget = String(targetJid).split('@')[0].split(':')[0].replace(/[^0-9]/g, '');
    return participants.some(u => {
        const cleanU = String(conn.decodeJid(u.id)).split('@')[0].split(':')[0].replace(/[^0-9]/g, '');
        return cleanU === cleanTarget && (u.admin === 'admin' || u.admin === 'superadmin' || u.isAdmin === true || u.admin === true);
    })
}

function computeAdminFlags(conn, participants, groupMetadata, normalizedSender, normalizedBot) {
    const normalizedOwner = groupMetadata.owner ? conn.decodeJid(groupMetadata.owner) : null
    const normalizedOwnerLid = groupMetadata.ownerLid ? conn.decodeJid(groupMetadata.ownerLid) : null
    const isAdmin = checkAdminStatus(conn, participants, normalizedSender)
    const isBotAdmin = checkAdminStatus(conn, participants, normalizedBot) || (normalizedBot === normalizedOwner || normalizedBot === normalizedOwnerLid)
    const isRAdmin = isAdmin && (normalizedSender === normalizedOwner || normalizedSender === normalizedOwnerLid)
    return { isAdmin, isBotAdmin, isRAdmin }
}

export async function handler(chatUpdate) {
    this.msgqueque = this.msgqueque || []
    this.uptime = this.uptime || Date.now()
    if (!chatUpdate) return

    if (Array.isArray(chatUpdate.messages) && chatUpdate.messages.length > 1) {
        for (const msg of chatUpdate.messages) {
            try { await handler.call(this, { ...chatUpdate, messages: [msg] }) } catch (e) {}
        }
        return
    }

    let m = chatUpdate.messages[chatUpdate.messages.length - 1]
    if (!m) return
    try {
        const printer = await getPrintModule()
        if (typeof printer?.ensureMessageUpdateListener === 'function') printer.ensureMessageUpdateListener(this)
    } catch {}
    
    this.pushMessage(chatUpdate.messages).catch(console.error)
    m = smsg(this, m)
    if (!m || !m.key || !m.chat || !m.sender) return
    if (m.isBaileys) return
    if (m.key.participant && m.key.participant.includes(':') && m.key.participant.split(':')[1]?.includes('@')) return
    if (m.key) {
        m.key.remoteJid = this.decodeJid(m.key.remoteJid)
        if (m.key.participant) m.key.participant = this.decodeJid(m.key.participant)
    }
    if (!global.db.data) await global.loadDatabase()
    m.exp = 0
    m.euro = false
    m.isCommand = false

    try {
        const normalizedSenderEarly = this.decodeJid(m.sender)
        const pendingKey = m.chat + normalizedSenderEarly
        const pending = responseHandlers.get(pendingKey)
        if (pending) {
            const text = (m.text || '').trim()
            const passFilter = typeof pending.filter === 'function' ? await pending.filter(m) : true
            let passValid = true
            if (pending.validResponses) {
                if (pending.validResponses instanceof RegExp) passValid = pending.validResponses.test(text)
                else if (Array.isArray(pending.validResponses)) passValid = pending.validResponses.includes(text)
                else if (typeof pending.validResponses === 'function') passValid = await pending.validResponses(m)
            }
            if (passFilter && passValid) {
                if (pending.timeoutId) clearTimeout(pending.timeoutId)
                responseHandlers.delete(pendingKey)
                pending.resolve(m)
                return
            }
        }
    } catch {}

    let user = null
    let chat = null
    let usedPrefix = null
    let normalizedSender = null
    let normalizedBot = null

    try {
        if (m.message?.eventResponseMessage) {
            const { eventId, response } = m.message.eventResponseMessage
            const jid = this.decodeJid(m.key.remoteJid)
            const userId = this.decodeJid(m.key.participant || m.key.remoteJid)
            const action = response === 'going' ? 'join' : 'leave'
            try {
                if (!global.activeEvents) global.activeEvents = new Map()
                if (!global.activeGiveaways) global.activeGiveaways = new Map()
                let eventData = global.activeEvents.get(eventId) || global.activeGiveaways.get(jid)
                if (eventData) {
                    if (!eventData.participants) eventData.participants = new Set()
                    if (action === 'join') eventData.participants.add(userId)
                    else eventData.participants.delete(userId)
                }
            } catch (e) {}
        }

        if (m.message?.interactiveResponseMessage) {
            const interactiveResponse = m.message.interactiveResponseMessage
            if (interactiveResponse.nativeFlowResponseMessage?.paramsJson) {
                try {
                    const params = JSON.parse(interactiveResponse.nativeFlowResponseMessage.paramsJson)
                    if (params.id) {
                        const fakeMessage = { key: m.key, message: { conversation: params.id }, messageTimestamp: m.messageTimestamp, pushName: m.pushName, broadcast: m.broadcast }
                        const processedMsg = smsg(this, fakeMessage)
                        if (processedMsg) {
                            processedMsg.text = params.id
                            return handler.call(this, { messages: [processedMsg] })
                        }
                    }
                } catch (e) {}
            }
        }

        normalizedSender = this.decodeJid(m.sender)
        // 🔥 FIX BOT ADMIN: CERCA IL NUMERO DEL BOT NEL POSTO CORRETTO
        normalizedBot = this.decodeJid(this.user?.id || this.user?.jid)
        
        if (!normalizedSender || normalizedSender.endsWith('@lid')) return;
        user = global.db.data.users[normalizedSender] || (global.db.data.users[normalizedSender] = { ...defuser, name: m.pushName || '?', firstTime: Date.now() })
        chat = chatz(m.chat)
        
        // 🔥 FIX SETTINGS: Assicura che anche le impostazioni del bot vengano lette
        let settings = settingz(this.decodeJid(this.user?.id || this.user?.jid))
        applyPrefixFromSettings(settings)
        if (m.mtype === 'pollUpdateMessage') return
        if (m.mtype === 'reactionMessage') return
        
        let groupMetadata = m.isGroup ? global.groupCache.get(m.chat) : null
        let participants = null
        let normalizedParticipants = null
        let isBotAdmin = false
        let isAdmin = false
        let isRAdmin = false

        // 👑 SCUDO LEGAM OS: Controllo Numeri Blindato
        const cleanNum = (n) => String(n || '').replace(/[^0-9]/g, '');
        let pureSender = cleanNum(normalizedSender.split('@')[0].split(':')[0]);

        let isSam = (global.sam || []).map(cleanNum).includes(pureSender);
        let isOwner = isSam || m.fromMe || (global.owner || []).some(o => cleanNum(o[0]) === pureSender);
        let isMods = isOwner || (global.mods || []).map(cleanNum).includes(pureSender);
        let isPrems = isSam || (global.prems || []).map(cleanNum).includes(pureSender);
        // ===========================================

        if (m.isGroup) {
            if (!groupMetadata) {
                groupMetadata = await fetchGroupMetadataWithRetry(this, m.chat, 3, 1000)
                if (groupMetadata) {
                    groupMetadata.fetchTime = Date.now()
                    global.groupCache.set(m.chat, groupMetadata, { ttl: 300 })
                }
            }
            if (groupMetadata) {
                participants = groupMetadata.participants
                normalizedParticipants = normalizeParticipants(this, participants)
                const adminFlags = computeAdminFlags(this, participants, groupMetadata, normalizedSender, normalizedBot)
                isAdmin = adminFlags.isAdmin
                isBotAdmin = adminFlags.isBotAdmin
                isRAdmin = adminFlags.isRAdmin
            }
        }

        for (let name in global.plugins) {
            let plugin = global.plugins[name]
            if (!plugin) continue

            const __filename = join(___dirname, name)
            if (typeof plugin.all === 'function') {
                try { await plugin.all.call(this, m, { chatUpdate, __dirname: ___dirname, __filename }) } catch (e) {}
            }

            let _prefix = plugin.customPrefix || global.prefix || '.'
            let match = (_prefix instanceof RegExp ? [[_prefix.exec(m.text), _prefix]] :
                Array.isArray(_prefix) ? _prefix.map(p => [p instanceof RegExp ? p : new RegExp(str2Regex(p)).exec(m.text), p]) :
                typeof _prefix === 'string' ? [[new RegExp(str2Regex(_prefix)).exec(m.text), _prefix]] :
                [[[], new RegExp]]).find(p => p[1])

            if (typeof plugin.before === 'function') {
                if (await plugin.before.call(this, m, {
                    match, conn: this, participants: normalizedParticipants, groupMetadata,
                    user: { admin: isAdmin ? 'admin' : null }, bot: { admin: isBotAdmin ? 'admin' : null },
                    isSam, isOwner, isRAdmin, isAdmin, isBotAdmin, isPrems, chatUpdate, __dirname: ___dirname, __filename
                })) continue
            }

            if (typeof plugin !== 'function') continue
            if (!match || !match[0]) continue
            usedPrefix = (match[0] || '')[0]
            if (usedPrefix) {
                let noPrefix = m.text.replace(usedPrefix, '')
                let [command, ...args] = noPrefix.trim().split` `.filter(v => v)
                let _args = noPrefix.trim().split` `.slice(1)
                let text = _args.join` `
                command = command?.toLowerCase() || ''
                let fail = plugin.fail || global.dfail
                let isAccept = plugin.command instanceof RegExp ? plugin.command.test(command) :
                    Array.isArray(plugin.command) ? plugin.command.some(cmd => cmd instanceof RegExp ? cmd.test(command) : cmd === command) :
                    typeof plugin.command === 'string' ? plugin.command === command : false
                
                if (!isAccept) continue

                if (m.isGroup && (plugin.admin || plugin.botAdmin)) {
                    const cachedMeta = global.groupCache.get(m.chat)
                    const isFresh = cachedMeta && cachedMeta.fetchTime && (Date.now() - cachedMeta.fetchTime < 30000)
                    if (!isFresh) {
                        const freshMetadata = await this.groupMetadata(m.chat).catch(_ => null)
                        if (freshMetadata) {
                            groupMetadata = freshMetadata
                            groupMetadata.fetchTime = Date.now()
                            global.groupCache.set(m.chat, groupMetadata, { ttl: 300 })
                            participants = groupMetadata.participants
                            normalizedParticipants = normalizeParticipants(this, participants)
                            const adminFlags = computeAdminFlags(this, participants, groupMetadata, normalizedSender, normalizedBot)
                            isAdmin = adminFlags.isAdmin
                            isBotAdmin = adminFlags.isBotAdmin
                            isRAdmin = adminFlags.isRAdmin
                        }
                    } else {
                        groupMetadata = cachedMeta
                        participants = groupMetadata.participants
                        normalizedParticipants = normalizeParticipants(this, participants)
                        const adminFlags = computeAdminFlags(this, participants, groupMetadata, normalizedSender, normalizedBot)
                        isAdmin = adminFlags.isAdmin
                        isBotAdmin = adminFlags.isBotAdmin
                        isRAdmin = adminFlags.isRAdmin
                    }
                }

                if (plugin.disabled && !isOwner) { fail('disabled', m, this); continue }
                if (user.muto && !isSam && !isOwner) {
                    await this.sendMessage(m.chat, { text: `🚫 Sei stato mutato, non puoi usare i comandi.` }, { quoted: m })
                    return
                }

                if (chat.modoadmin && !isOwner && !isSam && m.isGroup && !isAdmin) return
                if (settings.soloCreatore && !isSam) return 
                
                // CONTROLLI PERMESSI BLINDATI LEGAM OS
                if (plugin.sam && !isSam) { fail('sam', m, this); continue }
                if (plugin.owner && !isOwner) { fail('owner', m, this); continue }
                if (plugin.mods && !isMods) { fail('mods', m, this); continue }
                if (plugin.premium && !isPrems) { fail('premium', m, this); continue }
                if (plugin.group && !m.isGroup) { fail('group', m, this); continue }
                if (plugin.botAdmin && !isBotAdmin) { fail('botAdmin', m, this); continue }
                if (plugin.admin && !isAdmin) { fail('admin', m, this); continue }
                if (plugin.private && m.isGroup) { fail('private', m, this); continue }
                if (plugin.register && settings.registrazioni && !user.registered) { fail('unreg', m, this); continue }

                m.isCommand = true

                // ANTI SPAM
                const COMMAND_SPAM_WINDOW_MS = 60000
                const COMMAND_SPAM_MAX = 8
                const COMMAND_SPAM_SUSPEND_MS = 15000

                if (m.isGroup && !isOwner && !isSam && !isMods && !isAdmin && ((settings.antispambot || chat.antispambot) || chat.antispam)) {
                    const groupData = global.groupSpam[m.chat] || (global.groupSpam[m.chat] = { count: 0, firstCommandTimestamp: 0, isSuspended: false })
                    const now = Date.now()
                    if (groupData.isSuspended) continue
                    if (now - groupData.firstCommandTimestamp > COMMAND_SPAM_WINDOW_MS) {
                        groupData.count = 1
                        groupData.firstCommandTimestamp = now
                    } else { groupData.count++ }
                    if (groupData.count > COMMAND_SPAM_MAX) {
                        groupData.isSuspended = true
                        this.reply(m.chat, `『 ⚠️ 』 \`Anti-spam comandi\`\n\n> Rilevati troppi comandi in un minuto, aspettate \`15 secondi\` prima di riutilizzare i comandi.\n\n*ℹ️ Gli admin del gruppo sono esenti da questo limite.*`, m).catch(() => {})
                        setTimeout(() => { delete global.groupSpam[m.chat] }, COMMAND_SPAM_SUSPEND_MS)
                        continue
                    }
                }

                let xp = 'exp' in plugin ? parseInt(plugin.exp) : 17
                if (xp > 200) { await this.reply(m.chat, 'bzzzzz', m).catch(() => {}) } 
                else { m.exp += xp }

                if (!isPrems && plugin.euro && user.euro < plugin.euro) {
                    await this.reply(m.chat, `Niente più soldini, stupido poraccio`, m).catch(() => {})
                    continue
                }

                let extra = {
                    match, usedPrefix, noPrefix, _args, args, command, text, conn: this,
                    participants: normalizedParticipants, groupMetadata,
                    user: { admin: isAdmin ? 'admin' : null }, bot: { admin: isBotAdmin ? 'admin' : null },
                    isSam, isOwner, isMods, isRAdmin, isAdmin, isBotAdmin, isPrems, chatUpdate, __dirname: ___dirname, __filename
                }

                try {
                    await plugin.call(this, m, extra)
                    if (!isPrems) m.euro = plugin.euro || false
                } catch (e) {
                    m.error = e
                    console.error(`[ERRORE] Errore nell'esecuzione del plugin per la chat ${m.chat}:`, e)
                    if (e?.message?.includes('rate-overlimit')) { await delay(2000) }
                    let errText = format(e)
                    await this.reply(m.chat, errText, m).catch(() => {})
                } finally {
                    if (typeof plugin.after === 'function') {
                        try { await plugin.after.call(this, m, extra) } catch (e) {}
                    }
                    if (m.euro) { await this.reply(m.chat, `\`Hai utilizzato *${+m.euro}*\``, m).catch(() => {}) }
                }
                break
            }
        }
    } catch (e) {
        console.error(`[ERRORE] Errore nel handler globale:`, e)
    } finally {
        if (m && user && user.muto && !m.fromMe) { await this.sendMessage(m.chat, { delete: m.key }).catch(() => {}) }
        if (m && user) {
            user.exp = Number(user.exp)
            if (!Number.isFinite(user.exp) || user.exp < 0) user.exp = 0
            user.euro = Number(user.euro)
            if (!Number.isFinite(user.euro)) user.euro = 0

            if (chat && chat.autolevelup && !m.fromMe && !m.isCommand) {
                const earned = 1 + Math.floor(Math.random() * 3)
                user.exp += earned
            }
            user.exp += Number(m.exp) || 0
            user.euro -= Number(m.euro) || 0
            if (!user.messages) user.messages = 0;
            user.messages++;

            user.level = Number(user.level)
            if (!Number.isFinite(user.level) || user.level < 0) user.level = 0
            while (chat && chat.autolevelup && canLevelUp(user.level, user.exp, global.multiplier)) { user.level++ }
            if (m.isGroup) {
                if (!chat.users) chat.users = {};
                const senderId = normalizedSender;
                if (!chat.users[senderId]) chat.users[senderId] = { messages: 0 };
                chat.users[senderId].messages++;
            }
        }
        try {
            if (!global.opts['noprint'] && m) {
                const printer = await getPrintModule()
                if (typeof printer?.default === 'function') await printer.default(m, this)
            }
        } catch (e) {}
        
        let settingsREAD = global.db.data.settings[this.decodeJid(this.user?.id || this.user?.jid)] || {}
        if ((global.opts['autoread'] || settingsREAD.autoread || settingsREAD.autoread2) && m) {
            await this.readMessages([m.key]).catch(() => {})
        }
        if (chat && chat.reaction && m?.text?.match(/(mente|zione|tà|ivo|osa|issimo|ma|però|eppure|anche|ma|no|se|ai|ciao|si)/gi) && !m.fromMe) {
            const emot = pickRandom(["🍟", "😃", "😄", "😁", "😆", "🍓", "😅", "😂", "🤣", "🥲", "☺️", "😊", "😇", "🙂", "🙃", "😉", "😌", "😍", "🥰"])
            await this.sendMessage(m.chat, { react: { text: emot, key: m.key } }).catch(() => {})
        }
    }
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
    
    if (msg) {
        conn.reply(m.chat, msg + '\n\n✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦', m).catch(e => console.error('[ERRORE] Errore in dfail:', e))
    }
}

function pickRandom(list) { return list[Math.floor(Math.random() * list.length)] }

let file = typeof global.__filename === 'function' ? global.__filename(import.meta.url, true) : fileURLToPath(import.meta.url)
watchFile(file, () => {
    console.log(chalk.bgHex('#3b0d95')(chalk.white.bold("File: 'handler.js' Aggiornato")))
})


