import { makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion, makeCacheableSignalKeyStore, Browsers } from '@whiskeysockets/baileys'
import pino from 'pino'
import { Boom } from '@hapi/boom'
import fs from 'fs'
import readline from 'readline'
import path from 'path'

// 👑 CONFIGURAZIONI GLOBALI LEGAM BOT 👑
global.owner = [
  ['393330000000', 'Giuse - Creatore Supremo', true], // INSERISCI QUI IL TUO NUMERO VERO (Senza il +)
]
global.botName = 'Legam Bot'
global.ownerName = 'Giuse'
global.sessionName = 'varesession' // La cartella dove si salva la connessione (mantienila così non devi ricollegare)

// Sistema per chiedere input nel terminale (per il Pairing Code)
const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
const question = (text) => new Promise((resolve) => rl.question(text, resolve))

// 🛡️ ANTI-CRASH DI LUSSO (Impedisce al bot di spegnersi per piccoli errori)
process.on('uncaughtException', console.error)
process.on('unhandledRejection', console.error)

async function startLegamBot() {
    console.clear()
    console.log(`
    ⊹ ࣪ ˖ ✦ ━━ 𝐋𝐄𝐆𝐀𝐌 𝐂𝐎𝐑𝐄 𝐎𝐒 ━━ ✦ ˖ ࣪ ⊹
    👑 Inizializzazione Motore Principale...
    👤 Owner: ${global.ownerName}
    🛡️ Sistema Anti-Crash: [ATTIVO]
    `)

    // Gestione della cartella di sessione
    const { state, saveCreds } = await useMultiFileAuthState(global.sessionName)
    const { version, isLatest } = await fetchLatestBaileysVersion()

    console.log(`    📡 Versione WA: ${version.join('.')} (Aggiornata: ${isLatest})`)

    // CONNESSIONE PURA A WHATSAPP
    const conn = makeWASocket({
        version,
        logger: pino({ level: 'silent' }), // Spegne i log fastidiosi e inutili
        printQRInTerminal: false, // Disattiviamo il QR Code per usare il Pairing Code
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }).child({ level: "fatal" })),
        },
        browser: Browsers.ubuntu('Chrome'), // Simula un browser su Linux
        generateHighQualityLinkPreview: true,
        getMessage: async (key) => { return { conversation: 'Legam Bot Reconnect' } }
    })

    // ⚡ SISTEMA DI PAIRING CODE (Se non c'è una sessione salvata)
    if (!conn.authState.creds.registered) {
        console.log(`\n    [!] NESSUNA CONNESSIONE TROVATA. AVVIO PROTOCOLLO DI COLLEGAMENTO.`)
        let numero = await question('    📱 Inserisci il numero del Bot (es. 393471234567): ')
        numero = numero.replace(/[^0-9]/g, '')
        
        // Aspetta un secondo per stabilizzare
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        let codice = await conn.requestPairingCode(numero)
        codice = codice?.match(/.{1,4}/g)?.join("-") || codice
        
        console.log(`\n    🔑 IL TUO CODICE SEGRETO: \x1b[32m${codice}\x1b[0m`)
        console.log(`    Vai su WhatsApp -> Dispositivi Collegati -> Collega con numero di telefono.\n`)
    }

    // 🔄 GESTIONE CONNESSIONE E RIAVVII
    conn.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update

        if (connection === 'close') {
            const reason = new Boom(lastDisconnect?.error)?.output?.statusCode
            console.log(`\n    [⚠️] Connessione interrotta. Codice: ${reason}`)
            
            if (reason === DisconnectReason.badSession) {
                console.log(`    [❌] Sessione corrotta. Elimina la cartella "${global.sessionName}" e riavvia.`)
            } else if (reason === DisconnectReason.connectionClosed || reason === DisconnectReason.connectionLost || reason === DisconnectReason.timedOut) {
                console.log('    [🔄] Riconnessione al server in corso...')
                startLegamBot() // Riavvia in automatico
            } else if (reason === DisconnectReason.loggedOut) {
                console.log(`    [❌] Disconnesso dal telefono. Elimina "${global.sessionName}" e ricollega.`)
                process.exit(1)
            } else {
                console.log('    [🔄] Riavvio generico...')
                startLegamBot()
            }
        } else if (connection === 'open') {
            console.log(`\n    [✅] LEGAM BOT È ONLINE E CONNESSO AL SERVER WHATSAPP.\n    [👑] In attesa di comandi...`)
        }
    })

    // Salva le credenziali automaticamente quando cambiano
    conn.ev.on('creds.update', saveCreds)

    // ====================================================
    // 🧠 COLLEGAMENTO AL CERVELLO (handler.js)
    // ====================================================
    // Qui il based.js passa la palla al file handler.js che gestisce tutti i plugin
    
    // Assicurati che il file handler.js sia importato correttamente (se la tua repo usa handler.js)
    try {
        const handler = await import('./handler.js')
        
        // Intercetta i messaggi in arrivo e li manda all'handler
        conn.ev.on('messages.upsert', async (m) => {
            if (!m.messages) return
            const msg = m.messages[0]
            if (!msg.message) return
            
            // Passiamo il messaggio al file handler.js (che leggerà i plugin)
            if (handler.handler) await handler.handler(conn, m)
        })

        // Intercetta l'entrata e l'uscita delle persone nei gruppi (per plugin di benvenuto ecc)
        conn.ev.on('group-participants.update', async (update) => {
            if (handler.participantsUpdate) await handler.participantsUpdate(conn, update)
        })
        
    } catch (e) {
        console.log(`    [⚠️] Impossibile caricare handler.js: Verifica che esista nella directory principale.`)
        console.error(e)
    }

    return conn
}

// Lancia il sistema
startLegamBot()

