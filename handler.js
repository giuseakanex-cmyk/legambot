import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import util from 'util'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
global.plugins = {}

// 🧠 CARICAMENTO PLUGINS (Legge tutto quello che c'è nella cartella plugins)
const pluginFolder = path.join(__dirname, 'plugins')
const files = fs.readdirSync(pluginFolder).filter(file => file.endsWith('.js'))
for (let file of files) {
    try {
        let plugin = await import(`./plugins/${file}`)
        global.plugins[file] = plugin.default || plugin
    } catch (e) {
        console.error(`[❌ ERRORE] Impossibile caricare il plugin ${file}:`, e)
    }
}

// 👑 IL MOTORE PRINCIPALE DI RISPOSTA 👑
export async function handler(conn, m) {
    if (!m || !m.messages) return
    let msg = m.messages[0]
    if (!msg.message) return
    if (msg.key && msg.key.remoteJid === 'status@broadcast') return // Ignora gli stati di WhatsApp

    try {
        // 1. ESTRAZIONE DATI DEL MESSAGGIO
        const type = Object.keys(msg.message)[0]
        let text = msg.message.conversation || 
                   (msg.message.extendedTextMessage && msg.message.extendedTextMessage.text) || 
                   (msg.message.imageMessage && msg.message.imageMessage.caption) || 
                   (msg.message.videoMessage && msg.message.videoMessage.caption) || ''
                   
        let sender = msg.key.participant || msg.key.remoteJid
        let chat = msg.key.remoteJid
        let isGroup = chat.endsWith('@g.us')
        let fromMe = msg.key.fromMe

        // Costruiamo un finto oggetto "m" facile da usare per i tuoi plugin
        let fakeM = {
            ...msg,
            text,
            sender,
            chat,
            isGroup,
            fromMe,
            reply: (testo) => conn.sendMessage(chat, { text: testo }, { quoted: msg }),
            mentionedJid: msg.message[type]?.contextInfo?.mentionedJid || []
        }

        // Controllo Owner (Sei tu Giuse?)
        let isOwner = global.owner.some(o => sender.includes(o[0])) || fromMe

        // Controllo Admin (Se siamo in un gruppo)
        let isBotAdmin = false
        let isAdmin = false
        if (isGroup) {
            let metadata = await conn.groupMetadata(chat).catch(() => null)
            if (metadata) {
                let participants = metadata.participants
                let botId = conn.user.id.split(':')[0] + '@s.whatsapp.net'
                isAdmin = participants.some(p => p.id === sender && p.admin)
                isBotAdmin = participants.some(p => p.id === botId && p.admin)
            }
        }

        // --- ESECUZIONE PLUGIN PASSIVI (Es: Risposte arroganti alla parola "bot") ---
        for (let name in global.plugins) {
            let plugin = global.plugins[name]
            if (plugin.before && typeof plugin.before === 'function') {
                await plugin.before.call(conn, fakeM, { conn, isOwner, isAdmin, isBotAdmin })
            }
            if (plugin.all && typeof plugin.all === 'function') {
                await plugin.all.call(conn, fakeM, { conn, isOwner, isAdmin, isBotAdmin })
            }
        }

        // 2. RILEVAMENTO COMANDI (Usa i prefissi che hai messo in config.js)
        let prefixRegex = global.prefix || /^[.!]/i
        let isCommand = prefixRegex.test(text)
        if (!isCommand) return // Se non inizia con . o ! si ferma qui

        // Separa il prefisso, il comando e gli argomenti (es: ".promuovi @utente")
        let usedPrefix = text.match(prefixRegex)[0]
        let command = text.slice(usedPrefix.length).trim().split(' ')[0].toLowerCase()
        let args = text.trim().split(' ').slice(1)
        let stringArgs = args.join(' ')

        // 3. RICERCA DEL PLUGIN E CONTROLLO PERMESSI
        for (let name in global.plugins) {
            let plugin = global.plugins[name]
            if (!plugin.command) continue

            let isMatch = Array.isArray(plugin.command) ? plugin.command.includes(command) : plugin.command === command
            
            if (isMatch) {
                // 🛑 I BLOCCHI DI SICUREZZA LEGAM (ARROGANTI) 🛑

                // Se il comando è solo per gruppi
                if (plugin.group && !isGroup) {
                    return fakeM.reply('『 ❌ 』 `Ehi genio, questo comando funziona solo nei gruppi. Non in chat privata.`')
                }

                // Se il comando è solo per te (Owner)
                if (plugin.owner && !isOwner) {
                    return fakeM.reply('『 👑 』 `Accesso Negato. Solo Giuse può usare questo comando. Torna al tuo posto.`')
                }

                // Se il comando è solo per gli Admin del gruppo
                if (plugin.admin && !isAdmin && !isOwner) {
                    return fakeM.reply('『 🛑 』 `Chi ti credi di essere? Solo gli Admin possono darmi ordini qui dentro.`')
                }

                // Se il bot ha bisogno di essere Admin per farlo funzionare (es. promuovere/cacciare)
                if (plugin.botAdmin && !isBotAdmin) {
                    return fakeM.reply('『 🩼 』 `Per fare questa magia ho bisogno di essere Amministratore. Dammi i poteri e riprova.`')
                }

                // ESECUZIONE FINALE DEL COMANDO
                try {
                    await plugin.call(conn, fakeM, {
                        conn,
                        text: stringArgs,
                        args,
                        command,
                        usedPrefix,
                        isOwner,
                        isAdmin,
                        isBotAdmin
                    })
                } catch (e) {
                    console.error(`Errore nel plugin ${name}:`, e)
                    fakeM.reply(`『 ⚠️ 』 \`Errore nel sistema. Ho già segnalato a Giuse.\``)
                }
                break // Ferma la ricerca se ha trovato e avviato il comando
            }
        }

    } catch (e) {
        console.error('Errore generico in handler.js:', e)
    }
}

// 🚪 GESTIONE ENTRATE/USCITE DAI GRUPPI (Per i messaggi di Benvenuto/Addio)
export async function participantsUpdate(conn, update) {
    try {
        let { id, participants, action } = update
        // Se in futuro vuoi aggiungere un plugin di benvenuto, verrà letto da qui!
        // Al momento è silenzioso per non fare spam.
    } catch (e) {
        console.error('Errore in participantsUpdate:', e)
    }
}

