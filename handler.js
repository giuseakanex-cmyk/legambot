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
global.processedWelcome = new Set() 

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

// ==========================================
// LEGAM OS - MOTORE GRAFICO BENVENUTO
// ==========================================
export async function participantsUpdate({ id, participants, action }) {
    try {
        let eventKey = `${action}_${id}_${participants.join('')}`
        if (global.processedWelcome.has(eventKey)) return;
        global.processedWelcome.add(eventKey);
        setTimeout(() => global.processedWelcome.delete(eventKey), 10000);

        console.log(chalk.bgHex('#3b0d95').white.bold(' LEGAM OS ') + chalk.yellow(` 🚨 Azione attivata: ${action} in ${id.split('@')[0]}`));

        if (global.opts['self']) return;
        
        let chat = global.db.data.chats[id] || {};
        let nomeDelBot = global.db.data.nomedelbot || `𝐿𝛴𝐺𝛬𝑀 𝛩𝑆 𝚩𝚯𝐓`;

        if (!chat.welcome && (action === 'add' || action === 'remove' || action === 'promote' || action === 'demote')) {
            console.log(chalk.red(`[!] Welcome/Goodbye DISATTIVATO per questo gruppo.`));
            return;
        }

        let groupMetadata = global.groupCache.get(id) || await this.groupMetadata(id).catch(_ => null) || {};
        let groupName = groupMetadata.subject || 'Questo Gruppo';
        let groupDesc = groupMetadata.desc ? groupMetadata.desc.toString() : 'Nessuna descrizione disponibile.';

        for (let user of participants) {
            let pp = 'https://files.catbox.moe/57bmbv.jpg'; 
            try { pp = await this.profilePictureUrl(user, 'image'); } catch (e) {}

            try {
                let apii = await this.getFile(pp).catch(() => ({ data: '' }));
                let cleanUser = user.split('@')[0];
                let text = '';

                if (action === 'add') {
                    let customWelcome = chat.sWelcome || `「  *BENVENUTO* 」\n𝗔𝗼 𝗮𝘁𝘁𝗲𝗻𝘁𝗼 𝗰𝗵𝗲 𝗾𝘂𝗮 𝗱𝗲𝗻𝘁𝗿𝗼 𝗳𝗮𝗻𝗻𝗼 𝗮 𝗯𝗮𝗹𝗱𝗼𝗿𝗶𝗮 𝗳𝗿𝗮𝘁è\n👤 *Utente:* @user\n🎉 *Gruppo:* @group`;
                    text = customWelcome.replace(/@user/g, `@${cleanUser}`).replace(/@group/g, groupName).replace(/@desc/g, groupDesc);
                } else if (action === 'remove') {
                    let customBye = chat.sBye || `「  *BYE BYE* 」\n👤 *Utente:* @user\n👋🏻 *𝗛𝗮 𝗹𝗮𝘀𝗰𝗶𝗮𝘁𝗼 𝗹𝗮 𝗰𝗼𝗺𝗶𝘁𝗶𝘃𝗮:* @group`;
                    text = customBye.replace(/@user/g, `@${cleanUser}`).replace(/@group/g, groupName).replace(/@desc/g, groupDesc);
                } else if (action === 'promote') {
                    text = `@${cleanUser} \`\`\`è stato promosso Admin. Porta rispetto.\`\`\``;
                } else if (action === 'demote') {
                    text = `@${cleanUser} \`\`\`è stato degradato. Non è più Admin.\`\`\``;
                }

                if (!text) continue;

                await this.sendMessage(id, {
                    text: text,
                    mentions: [user],
                    contextInfo: {
                        mentionedJid: [user],
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: '120363233544482011@newsletter',
                            serverMessageId: 100,
                            newsletterName: nomeDelBot
                        },
                        externalAdReply: {
                            title: action === 'add' ? '𝐁𝐞𝐧𝐯𝐞𝐧𝐮𝐭𝐨 𝐧𝐞𝐥 𝐆𝐫𝐮𝐩𝐩𝐨 👑' : (action === 'remove' ? '𝐀𝐝𝐝𝐢𝐨 👋🏻' : '𝐀𝐠𝐠𝐢𝐨𝐫𝐧𝐚𝐦𝐞𝐧𝐭𝐨 👑'),
                            body: 'Legam OS System',
                            previewType: "PHOTO",
                            thumbnailUrl: pp,
                            thumbnail: apii.data,
                            mediaType: 1
                        }
                    }
                });
                console.log(chalk.green(`[✓] Messaggio (${action}) inviato con successo!`));
            } catch (err) {
                console.error(chalk.red("[X] Errore invio Welcome/Goodbye:"), err);
            }
        }
    } catch (criticalError) {
        console.error(chalk.red("[X] Errore Critico:"), criticalError);
    }
}
// ==========================================

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

    // 🔥 LEGAM OS: INTERCETTATORE DI STUB (INFALLIBILE) 🔥
    // Questo cattura i famosi eventi 27 e 28 che hai visto nel terminale!
    if (m.messageStubType && m.isGroup) {
        let actionTrigger = '';
        if (m.messageStubType === 27) actionTrigger = 'add';
        else if (m.messageStubType === 28 || m.messageStubType === 32) actionTrigger = 'remove';
        else if (m.messageStubType === 29) actionTrigger = 'promote';
        else if (m.messageStubType === 30) actionTrigger = 'demote';

        if (actionTrigger) {
            let who = m.messageStubParameters[0];
            if (who) {
                console.log(chalk.cyan(`[!] Intercettato StubType ${m.messageStubType}. Inoltro al motore grafico...`));
                // Passa il comando alla nostra funzione grafica
                participantsUpdate.call(this, {
                    id: m.chat,
                    participants: [who],
                    action: actionTrigger
                });
            }
        }
    }
    // ==================================================
    
    if (m.key.participant && m.key.participant.includes(':') && m.key.participant.split(':')[1]?.includes('@')) return

    if (m.key) {
        m.key.remoteJid = this.decodeJid(m.key.remoteJid)
        if (m.key.participant) m.key.participant = this.decodeJid(m.key.participant)
    }
    if (!m.key.remoteJid) return
    
    // FIX BOTTONI
    let extractedText = m.message?.conversation || m.message?.extendedTextMessage?.text || '';
    
    if (m.message?.interactiveResponseMessage?.nativeFlowResponseMessage?.paramsJson) {
        try {
            let params = JSON.parse(m.message.interactiveResponseMessage.nativeFlowResponseMessage.paramsJson);
            if (params.id) extractedText = params.id;
        } catch (e) {}
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
            reaction: false, antispam: false, expired: 0, users: {}, sWelcome: '', sBye: ''
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
        
        let isGiuse = global.owner.some(([num]) => num + '@s.whatsapp.net' === normalizedSender)
        let isROwner = isGiuse || global.owner.some(([num]) => num + '@s.whatsapp.net' === normalizedSender)
        let isOwner = isROwner || m.fromMe
        
        let isGlobalMod = global.mods?.map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(normalizedSender) || false
        let isGlobalPrem = global.prems?.map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(normalizedSender) || false

        let isGroupMod = m.isGroup && user && user.premium === true && user.premiumGroup === m.chat
        
        let isMods = isOwner || isGlobalMod || isGroupMod || false
        let isPrems = isROwner || isGlobalPrem || isGroupMod || false
        
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

        // ==========================================
        // LEGAM OS - TERMINAL LOGGER VIP
        // ==========================================
        if (m.text || m.mtype) {
            let testoLog = m.text || `[Media: ${m.mtype}]`;
            // Non stampare gli stub nel logger testuale per non sporcarlo
            if (!m.messageStubType) {
                let tipoChat = m.isGroup ? 'Gruppo' : 'Privato';
                let nomeUtente = m.pushName || 'Sconosciuto';
                let numero = normalizedSender ? normalizedSender.split('@')[0] : 'Sconosciuto';
                let orario = new Date().toLocaleTimeString('it-IT');
                
                let ruolo = chalk.gray('[👤 UTENTE]');
                if (isOwner) ruolo = chalk.magenta.bold('[👑 OWNER]');
                else if (isAdmin) ruolo = chalk.blue.bold('[🛡️ ADMIN]');
                else if (isPrems || isMods) ruolo = chalk.yellow.bold('[💎 VIP]');

                let isCmd = m.text && /^[.#!\\/]/.test(m.text.trim());
                let testoColorato = isCmd ? chalk.yellowBright.bold(testoLog) : chalk.white(testoLog);

                console.log(
                    chalk.bgHex('#3b0d95').white.bold(' LEGAM OS ') + ' ' +
                    chalk.gray(`[${orario}]`) + ' ' +
                    chalk.cyan(`[${tipoChat}]`) + ' ' +
                    ruolo + ' ' +
                    chalk.green(`${nomeUtente} `) + chalk.gray(`(${numero}) > `) +
                    testoColorato
                );
            }
        }
        // ==========================================

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
                
                if (m.isGroup && chat.modoadmin && !isAdmin && !isOwner && !isROwner && !isMods && !isPrems) continue;
                if (settings.soloCreatore && !isROwner && !isOwner) continue;
                if (chat.isBanned && !isROwner && !isOwner && !isMods) continue;

                if (user.banned && !isROwner && !isOwner) {
                    if (user.antispam < 2) {
                        await this.sendMessage(m.chat, { text: `🚫 *Sei stato bannato dall'utilizzo del Legam OS.*` }, { quoted: m });
                        user.antispam++;
                    }
                    continue;
                }

                if (user.muto && !isROwner && !isOwner) {
                    await this.sendMessage(m.chat, { text: `🚫 Non puoi usare i comandi se sei stato mutato!` }, { quoted: m });
                    continue; 
                }

                if (m.isGroup && !isOwner && !isROwner && !isAdmin && !isMods && chat.antispam) {
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

                if (plugin.disabled && !isOwner) { fail('disabled', m, this); continue }

                m.plugin = name
                m.isCommand = true

                let requiresCreator = plugin.giuse || plugin.sam;
                if (requiresCreator && !isGiuse) { fail('rowner', m, this); continue }
                
                if (plugin.owner && !isOwner) { fail('owner', m, this); continue }
                if (plugin.mods && !isMods) { fail('mods', m, this); continue } 
                if (plugin.premium && !isPrems) { fail('premium', m, this); continue } 
                if (plugin.group && !m.isGroup) { fail('group', m, this); continue }
                if (plugin.admin && !isAdmin) { fail('admin', m, this); continue }
                if (plugin.botAdmin && !isBotAdmin) { fail('botAdmin', m, this); continue }

                try {
                    await plugin.call(this, m, {
                        match, usedPrefix, noPrefix, args, command, text, conn: this, participants,
                        isGiuse, isOwner, isMods, isAdmin, isBotAdmin, isPrems 
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


