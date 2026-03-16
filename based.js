import { makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion, makeCacheableSignalKeyStore, Browsers } from '@whiskeysockets/baileys'
import pino from 'pino'
import readline from 'readline'
import fs from 'fs'

// ==========================================
// 👑 REGOLE UNIVERSALI DEL LEGAM BOT 👑
// ==========================================
global.owner = [['393330000000', 'Giuse - Creatore', true]] // METTI IL TUO NUMERO QUI (Senza il +)
global.prefix = /^[.!]/i // Il bot risponderà sia a "." che a "!"
global.sessionName = 'legam_session' // Nuova cartella di connessione

const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
const question = (text) => new Promise((resolve) => rl.question(text, resolve))

process.on('uncaughtException', console.error)
process.on('unhandledRejection', console.error)

async function startLegamBot() {
    console.clear()
    console.log(`
    ⊹ ࣪ ˖ ✦ ━━ 𝐋𝐄𝐆𝐀𝐌 𝐂𝐎𝐑𝐄 𝐎𝐒 ━━ ✦ ˖ ࣪ ⊹
    👑 Inizializzazione Motore Principale...
    `)

    const { state, saveCreds } = await useMultiFileAuthState(global.sessionName)
    const { version } = await fetchLatestBaileysVersion()

    const conn = makeWASocket({
        version,
        logger: pino({ level: 'silent' }), // Zero scritte inutili nel terminale
        printQRInTerminal: false, // Usiamo il Pairing Code da veri hacker
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }).child({ level: "fatal" })),
        },
        browser: Browsers.ubuntu('Chrome')
    })

    // ⚡ PAIRING CODE SEGRETO 
    if (!conn.authState.creds.registered) {
        console.log(`\n    [!] AVVIO PROTOCOLLO DI COLLEGAMENTO.`)
        let numero = await question('    📱 Inserisci il numero del Bot (es. 39347...): ')
        numero = numero.replace(/[^0-9]/g, '')
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        let codice = await conn.requestPairingCode(numero)
        codice = codice?.match(/.{1,4}/g)?.join("-") || codice
        console.log(`\n    🔑 IL TUO CODICE SEGRETO: \x1b[32m${codice}\x1b[0m`)
        console.log(`    Vai su WhatsApp -> Dispositivi Collegati -> Collega con numero di telefono.\n`)
    }

    // GESTIONE CONNESSIONE
    conn.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update
        if (connection === 'close') {
            const reason = lastDisconnect?.error?.output?.statusCode
            if (reason === DisconnectReason.loggedOut) {
                console.log(`    [❌] Disconnesso. Elimina la cartella "${global.sessionName}" e ricollega.`)
                process.exit(1)
            } else {
                console.log('    [🔄] Riconnessione in corso...')
                startLegamBot()
            }
        } else if (connection === 'open') {
            console.log(`\n    [✅] LEGAM BOT ONLINE. Pronti a dominare.`)
        }
    })

    conn.ev.on('creds.update', saveCreds)

    // 🧠 COLLEGAMENTO AL CERVELLO (handler.js)
    try {
        const { handler } = await import('./handler.js?update=' + Date.now())
        conn.ev.on('messages.upsert', async (m) => {
            if (handler) await handler(conn, m)
        })
    } catch (e) {
        console.log(`    [⚠️] Errore nel caricamento di handler.js`)
        console.error(e)
    }
}

startLegamBot()


